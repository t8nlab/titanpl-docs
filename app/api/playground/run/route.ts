import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn, execSync } from 'child_process';
import crypto from 'crypto';

export const maxDuration = 30;

function getRandomPort(): number {
    // Wide spread across ephemeral range to minimise collision
    return Math.floor(Math.random() * 35000) + 30000;
}

function stripAnsi(str: string) {
    return str.replace(/\x1B\[[0-9;]*m/g, '').replace(/\x1B\[[0-9]*[A-Z]/gi, '');
}

// Kill any lingering titan dev processes from previous playground runs (Windows)
function killStaleTitanProcesses() {
    try {
        execSync('taskkill /F /IM titan-server.exe /T 2>nul || exit 0', { shell: 'cmd.exe', timeout: 3000 });
        execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq titan*" /T 2>nul || exit 0', { shell: 'cmd.exe', timeout: 3000 });
    } catch (_) { /* ignore — process may not exist */ }
}

/**
 * Kill a process AND its entire child tree.
 * On Windows, `child.kill()` only kills the shell (cmd.exe), not the
 * Node process titan spawns inside it — which keeps holding the port.
 */
function killTree(child: ReturnType<typeof spawn>) {
    // 1) General safety
    killStaleTitanProcesses();

    // 2) Try standard root kill
    if (!child) return;
    try {
        if (process.platform === 'win32' && child.pid) {
            execSync(`taskkill /F /T /PID ${child.pid} 2>nul || exit 0`, {
                shell: 'cmd.exe',
                stdio: 'ignore',
                timeout: 3000,
            });
        } else {
            child.kill('SIGKILL');
        }
    } catch (_) {
        // fallback
        try { child.kill(); } catch (_) { }
    }
}

function writeUserFiles(playgroundDir: string, files: Record<string, string>, port: number) {
    for (const [filePath, content] of Object.entries(files)) {
        const absPath = path.join(playgroundDir, filePath);
        if (!absPath.startsWith(playgroundDir)) continue;
        fs.mkdirSync(path.dirname(absPath), { recursive: true });

        let finalContent = content;
        if (filePath === 'app/app.js') {
            // Unconditionally strip ANY t.start call the user might have written
            finalContent = content.replace(/t\.start\s*\([^)]*\);?/g, "");
            finalContent += `\nt.start(${port}, "Titan Playground");\n`;
        }
        fs.writeFileSync(absPath, finalContent, 'utf-8');
    }
}

async function spawnTitan(playgroundDir: string, port: number): Promise<{
    ok: boolean;
    portInUse?: boolean;
    error?: string;
    logs: string[];
    child: ReturnType<typeof spawn>;
}> {
    const logs: string[] = [];
    let isReady = false;

    const child = spawn('titan', ['dev'], {
        cwd: playgroundDir,
        shell: true,          // needed for .cmd on Windows
        env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });

    // Absolute safety net at 22s
    const hardKill = setTimeout(() => killTree(child), 22000);

    const result = await new Promise<{ ok: boolean; portInUse?: boolean; error?: string }>((resolve) => {
        const onData = (data: Buffer) => {
            const raw = stripAnsi(data.toString());
            raw.split('\n').map(l => l.trim()).filter(Boolean).forEach(l => logs.push(l));

            if (isReady) return;

            if (raw.includes('Titan server running') || raw.includes(`localhost:${port}`)) {
                isReady = true;
                resolve({ ok: true });
                return;
            }
            // Port already in use — Windows error 10048
            if (raw.includes('10048') || raw.includes('EADDRINUSE') || raw.includes('Address already in use')) {
                resolve({ ok: false, portInUse: true, error: 'Port in use' });
                return;
            }
            if (raw.includes('❌') || raw.includes('Failed to parse') ||
                raw.includes('SyntaxError') || raw.includes('ERR_MODULE_NOT_FOUND')) {
                resolve({ ok: false, error: raw.slice(0, 600) });
            }
        };
        child.stdout?.on('data', onData);
        child.stderr?.on('data', onData);
        child.on('exit', code => { if (!isReady) resolve({ ok: false, error: `Process exited (code ${code})` }); });
        child.on('error', err => { if (!isReady) resolve({ ok: false, error: err.message }); });
    });

    clearTimeout(hardKill);
    return { ...result, logs, child };
}

function cleanup(dir: string) {
    if (!dir) return;
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) { }
}

export async function POST(req: Request) {
    let playgroundDir = '';
    let finalChild: ReturnType<typeof spawn> | null = null;

    try {
        const body = await req.json();
        const { files, request } = body;

        // Create sandbox directory
        const tempId = crypto.randomUUID();
        playgroundDir = path.join(os.tmpdir(), `titan-pg-${tempId}`);
        fs.mkdirSync(path.join(playgroundDir, 'app', 'actions'), { recursive: true });

        // Kill any stale instances first
        killStaleTitanProcesses();

        // Write package.json
        fs.writeFileSync(path.join(playgroundDir, 'package.json'), JSON.stringify({
            name: 'titan-playground',
            version: '6.0.0',
            type: 'module',
            titan: { template: 'js' }
        }, null, 2));

        // Symlink node_modules (junction = Windows-compatible)
        try {
            fs.symlinkSync(
                path.join(process.cwd(), 'node_modules'),
                path.join(playgroundDir, 'node_modules'),
                'junction'
            );
        } catch (_) { }

        // Try up to 5 different random ports — on EADDRINUSE kill entire tree then retry
        let allLogs: string[] = [];
        let spawnResult: Awaited<ReturnType<typeof spawnTitan>> | null = null;
        let currentPort = 0;

        for (let attempt = 0; attempt < 5; attempt++) {
            currentPort = getRandomPort();
            writeUserFiles(playgroundDir, files, currentPort);

            spawnResult = await spawnTitan(playgroundDir, currentPort);
            allLogs = spawnResult.logs;
            finalChild = spawnResult.child;

            if (spawnResult.ok) break;

            // Kill the entire process tree before retrying
            killTree(spawnResult.child);

            if (!spawnResult.portInUse) break; // real error (syntax etc.), don't retry

            // Wait for the OS to release the port fully before picking a new one
            await new Promise(r => setTimeout(r, 800));
        }

        if (!spawnResult?.ok) {
            if (finalChild) killTree(finalChild);
            cleanup(playgroundDir);
            return NextResponse.json({
                success: false,
                logs: allLogs,
                error: spawnResult?.error || 'Server failed to start.'
            });
        }

        // Engine is live — give it a moment to fully settle
        await new Promise(r => setTimeout(r, 600));

        // Make the HTTP request to the playground server
        let responseStatus = 0;
        let responseData: any = null;
        let fetchError: string | null = null;

        try {
            const method = (request.method || 'GET').toUpperCase();
            const targetUrl = `http://127.0.0.1:${currentPort}${request.route || '/'}`;
            const fetchInit: RequestInit = {
                method,
                headers: { 'Content-Type': 'application/json', 'Accept': '*/*' },
            };
            if (method !== 'GET' && method !== 'HEAD' && request.body) {
                fetchInit.body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
            }
            const res = await fetch(targetUrl, fetchInit);
            responseStatus = res.status;
            const ct = res.headers.get('content-type') || '';
            responseData = ct.includes('application/json') ? await res.json() : await res.text();
        } catch (err: any) {
            fetchError = err.message;
        }

        // Collect trailing logs then clean up
        await new Promise(r => setTimeout(r, 300));
        if (finalChild) killTree(finalChild);
        cleanup(playgroundDir);

        return NextResponse.json({
            success: true,
            logs: allLogs,
            response: { status: responseStatus, data: responseData, error: fetchError }
        });

    } catch (e: any) {
        if (finalChild) killTree(finalChild);
        cleanup(playgroundDir);
        return NextResponse.json({ success: false, error: e.message, logs: [] }, { status: 500 });
    }
}
