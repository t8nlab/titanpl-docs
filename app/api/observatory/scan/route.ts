
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
    try {
        // Vercel / Cloud Environment Check
        if (process.env.VERCEL) {
            return NextResponse.json({
                orbits: [{
                    id: 'vercel-cloud',
                    name: 'Cloud Environment Detected',
                    port: 0,
                    pid: 'CLOUD',
                    uptime: 'N/A',
                    status: 'standby',
                    description: 'Localhost scanning is not available in cloud deployments. Run the docs locally to scan your machine.'
                }]
            });
        }

        const isWin = process.platform === 'win32';
        let pids: string[] = [];

        if (isWin) {
            // --- Windows Scan (tasklist) ---
            try {
                // Check titan-server.exe
                const { stdout: taskOut } = await execAsync('tasklist /FI "IMAGENAME eq titan-server.exe" /FO CSV /NH');
                pids.push(...parseTasklist(taskOut));
            } catch (e) { }

            try {
                // Check titan.exe (common alias)
                const { stdout: taskOut } = await execAsync('tasklist /FI "IMAGENAME eq titan.exe" /FO CSV /NH');
                pids.push(...parseTasklist(taskOut));
            } catch (e) { }

        } else {
            // --- Linux / macOS / WSL Scan (ps) ---
            try {
                // ps -e -o pid,comm
                const { stdout: psOut } = await execAsync('ps -e -o pid,comm');
                const lines = psOut.trim().split('\n');
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;
                    // PID COMM
                    const match = trimmed.match(/^(\d+)\s+(.+)$/);
                    if (match) {
                        const pid = match[1];
                        const comm = match[2];
                        if (comm.includes('titan-server') || comm.includes('titan')) {
                            pids.push(pid);
                        }
                    }
                }
            } catch (e) {
                console.error('Linux ps scan failed', e);
            }
        }

        // remove duplicates
        pids = [...new Set(pids)];

        if (pids.length === 0) {
            return NextResponse.json({ orbits: [] });
        }

        const foundOrbits = [];
        const seenPorts = new Set();

        if (isWin) {
            // --- Windows Port Scan (netstat) ---
            const { stdout: netstatOut } = await execAsync('netstat -ano');
            const netstatLines = netstatOut.trim().split('\r\n');

            for (const line of netstatLines) {
                const parts = line.trim().split(/\s+/);
                if (parts.length < 5) continue;

                const protocol = parts[0];
                const localAddr = parts[1];
                const state = parts[3];
                const pid = parts[parts.length - 1];

                if ((protocol === 'TCP' || protocol === 'tcp') && state === 'LISTENING' && pids.includes(pid)) {
                    const portMatch = localAddr.match(/:(\d+)$/);
                    if (portMatch) {
                        const port = parseInt(portMatch[1]);
                        if (!seenPorts.has(port)) {
                            seenPorts.add(port);
                            foundOrbits.push(createOrbit(pid, port));
                        }
                    }
                }
            }
        } else {
            // --- Linux Port Scan (ss or netstat) ---
            // Try 'ss -lntp' first (faster, modern)
            try {
                const { stdout: ssOut } = await execAsync('ss -lntp');
                // State Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
                // LISTEN 0      4096   *:3000              *:*               users:(("node",pid=123,fd=18))

                const lines = ssOut.trim().split('\n');
                for (const line of lines) {
                    // Check if line contains any of our PIDs
                    const hasPid = pids.some(pid => line.includes(`pid=${pid},`) || line.includes(`pid=${pid})`));
                    if (hasPid) {
                        // Extract port
                        // Address format might be [::]:port or *:port or 127.0.0.1:port
                        const parts = line.trim().split(/\s+/);
                        // usually 4th column is Local Address:Port
                        const localAddr = parts[3] || '';
                        const lastColon = localAddr.lastIndexOf(':');
                        if (lastColon !== -1) {
                            const portStr = localAddr.substring(lastColon + 1);
                            const port = parseInt(portStr);

                            // Find which pid it matched
                            const matchedPid = pids.find(pid => line.includes(`pid=${pid}`)) || pids[0]; // fallback

                            if (!isNaN(port) && !seenPorts.has(port)) {
                                seenPorts.add(port);
                                foundOrbits.push(createOrbit(matchedPid, port));
                            }
                        }
                    }
                }
            } catch (e) {
                // Fallback to netstat if ss fails
                // netstat -tlpn
                console.error('SS failed, falling back to netstat', e);
            }
        }

        return NextResponse.json({ orbits: foundOrbits });

    } catch (error) {
        console.error('Scan failed:', error);
        return NextResponse.json({ orbits: [] }, { status: 500 });
    }
}

// Helpers
function parseTasklist(output: string): string[] {
    const lines = output.trim().split('\r\n');
    return lines
        .map(line => {
            const parts = line.split(',');
            if (parts.length < 2) return null;
            return parts[1].replace(/"/g, '');
        })
        .filter((pid): pid is string => !!pid && !isNaN(Number(pid)));
}

function createOrbit(pid: string, port: number) {
    return {
        id: `tpl-${pid}-${port}`,
        name: `Local TitanPl (Orbit ${port})`, // Better name
        port: port,
        pid: pid,
        uptime: 'LIVE',
        status: 'active'
    };
}
