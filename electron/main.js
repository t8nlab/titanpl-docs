const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const http = require('http');
const https = require('https');

// Promisify exec for async/await
const execAsync = util.promisify(exec);

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        title: 'TitanPl Observatory',
        frame: true, // Keep standard frame for reliability on Windows, but we'll style inner
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false // Needed for some system interactions if strictly secure, but simplified here
        },
        backgroundColor: '#050505',
        icon: path.join(__dirname, '../public/icon.png'),
        show: false,
        titleBarStyle: 'default' // Standard Windows pro look
    });

    // Remove default menu for a clean "software" look
    mainWindow.setMenu(null);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // --- SMART UPLINK SEQUENCE ---
    const isDev = !app.isPackaged;
    const prodUrl = 'https://titan-docs-ez.vercel.app/observatory';
    const devUrl = 'http://localhost:3000/observatory';

    // Bootloader: Try local, fallback to cloud
    // Bootloader: Try local, fallback to cloud
    async function initiateDownlink() {
        console.log('Initiating Downlink Sequence...');

        // 1. Try Localhost Check (Retry up to 5 times)
        const maxRetries = 5;
        for (let i = 0; i < maxRetries; i++) {
            try {
                console.log(`Probe attempt ${i + 1}/${maxRetries}...`);
                const isLocalActive = await new Promise((resolve) => {
                    const req = http.get('http://localhost:3000/observatory', { timeout: 1500 }, (res) => {
                        // resolve true only if 200 OK
                        if (res.statusCode === 200) resolve(true);
                        else resolve(false); // 404 or compiling
                    });
                    req.on('error', () => resolve(false));
                    req.on('timeout', () => { req.destroy(); resolve(false); });
                    req.end();
                });

                if (isLocalActive) {
                    console.log('SUCCESS: Local Orbit Detected.');
                    mainWindow.loadURL(devUrl);
                    return;
                }
            } catch (e) {
                // Ignore and retry
            }
            // Wait 1s before next retry (except last)
            if (i < maxRetries - 1) await new Promise(r => setTimeout(r, 1000));
        }

        console.log('Local Orbit Offline after retries.');

        // 2. Try Cloud Fallback
        console.log('Attempting Cloud Link...');
        mainWindow.loadURL(prodUrl).catch(err => {
            console.error('Cloud Link Failure:', err);
            handleFailure('Initial Uplink Failed');
        });
    }

    // Monitor for 404 statuses or network failures
    const handleFailure = (details) => {
        console.log('SIGNAL LOST:', details);
        mainWindow.loadFile(path.join(__dirname, 'error.html')).catch(e => {
            console.error('CRITICAL: Error page failed to load', e);
        });
    };

    // Robust 404 Detection (Next.js emits 404s as HTML pages with status codes)
    mainWindow.webContents.on('did-receive-http-error', (event, request, response) => {
        // We only care about main frame errors (page loads)
        if (request.isMainFrame && response.statusCode >= 400) {
            console.log(`NETWORK ALERT: HTTP ${response.statusCode} on ${request.url}`);
            handleFailure(`HTTP ERROR ${response.statusCode}`);
        }
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
        if (isMainFrame && errorCode !== -3) { // Ignore 'abort'
            console.log(`DOWNLINK FAILURE: ${errorDescription} (${errorCode})`);
            handleFailure(`${errorDescription} (${errorCode})`);
        }
    });

    // Start Boot Sequence
    initiateDownlink();

    // Handle retry from error page
    ipcMain.on('retry-connection', (event, url) => {
        if (mainWindow) {
            mainWindow.loadURL(url).catch(() => handleFailure('Retry Failed'));
        }
    });

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// --- IPC HANDLERS ---

// 1. Scan Network (Native System Scan)
ipcMain.handle('titan:scan-network', async () => {
    const isWin = process.platform === 'win32';
    let pids = [];

    try {
        if (isWin) {
            // Windows: tasklist
            try {
                const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq titan-server.exe" /FO CSV /NH');
                pids.push(...parseTasklist(stdout));
            } catch (e) { }
            try {
                const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq titan.exe" /FO CSV /NH');
                pids.push(...parseTasklist(stdout));
            } catch (e) { }
        } else {
            // Unix: ps
            try {
                const { stdout } = await execAsync('ps -e -o pid,comm');
                const lines = stdout.trim().split('\n');
                lines.forEach(line => {
                    const match = line.trim().match(/^(\d+)\s+(.+)$/);
                    if (match) {
                        const [_, pid, comm] = match;
                        if (comm.includes('titan-server') || comm.includes('titan')) {
                            pids.push(pid);
                        }
                    }
                });
            } catch (e) { }
        }

        pids = [...new Set(pids)];
        if (pids.length === 0) return [];

        const foundOrbits = [];
        const seenPorts = new Set();

        if (isWin) {
            // Windows: netstat
            const { stdout } = await execAsync('netstat -ano');
            const lines = stdout.trim().split('\r\n');
            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                // TCP local remote state pid
                // netstat -ano output columns vary slightly, usually:
                // Proto Local Address Foreign Address State PID
                if (parts.length < 5) continue;

                const pid = parts[parts.length - 1];
                if (pids.includes(pid) && parts[0].startsWith('TCP')) {
                    const localAddr = parts[1];
                    const portMatch = localAddr.match(/:(\d+)$/);
                    if (portMatch) {
                        const port = parseInt(portMatch[1]);
                        if (!seenPorts.has(port)) {
                            seenPorts.add(port);
                            foundOrbits.push({
                                id: `tpl-${pid}-${port}`,
                                name: `TitanPl Server (${port})`,
                                port,
                                pid,
                                status: 'active',
                                uptime: 'LIVE'
                            });
                        }
                    }
                }
            }
        } else {
            // Unix: ss or netstat
            try {
                const { stdout } = await execAsync('ss -lntp');
                const lines = stdout.trim().split('\n');
                // state recv send local peer process
                for (const line of lines) {
                    const hasPid = pids.some(pid => line.includes(`pid=${pid},`) || line.includes(`pid=${pid})`));
                    if (hasPid) {
                        const parts = line.trim().split(/\s+/);
                        const localAddr = parts[3] || '';
                        const lastColon = localAddr.lastIndexOf(':');
                        if (lastColon !== -1) {
                            const port = parseInt(localAddr.substring(lastColon + 1));
                            if (!isNaN(port) && !seenPorts.has(port)) {
                                seenPorts.add(port);
                                const matchedPid = pids.find(pid => line.includes(`pid=${pid}`)) || 'UNK';
                                foundOrbits.push({
                                    id: `tpl-${matchedPid}-${port}`,
                                    name: `TitanPl Server (${port})`,
                                    port,
                                    pid: matchedPid,
                                    status: 'active',
                                    uptime: 'LIVE'
                                });
                            }
                        }
                    }
                }
            } catch (e) { console.error(e); }
        }

        return foundOrbits;

    } catch (error) {
        console.error('Scan Error:', error);
        return [];
    }
});

// 2. Proxy Request (Bypass CORS)
ipcMain.handle('tpl:proxy-req', async (_, { url, method = 'GET', headers = {} }) => {
    return new Promise((resolve, reject) => {
        const fetchUrl = new URL(url);
        const lib = fetchUrl.protocol === 'https:' ? https : http;

        const req = lib.request(url, {
            method,
            headers: {
                ...headers,
                'User-Agent': 'TitanPl-Desktop/1.0'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    headers: res.headers,
                    data
                });
            });
        });

        req.on('error', (e) => {
            reject(e.message);
        });

        req.end();
    });
});


// Helpers
function parseTasklist(output) {
    const lines = output.trim().split('\r\n');
    return lines.map(line => {
        const parts = line.split(',');
        if (parts.length < 2) return null;
        return parts[1].replace(/"/g, '');
    }).filter(p => !!p);
}
