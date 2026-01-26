
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
    try {
        // 1. Find PIDs of titan-server.exe (or titan.exe)
        // tasklist /FI "IMAGENAME eq titan-server.exe" /FO CSV /NH
        // Output example: "titan-server.exe","1234","Console","1","12,345 K"

        let pids: string[] = [];

        try {
            const { stdout: taskOut } = await execAsync('tasklist /FI "IMAGENAME eq titan-server.exe" /FO CSV /NH');
            const lines = taskOut.trim().split('\r\n');
            pids = lines
                .map(line => {
                    const parts = line.split(',');
                    if (parts.length < 2) return null;
                    // Remove quotes and get PID (2nd column usually)
                    const pid = parts[1].replace(/"/g, '');
                    return pid;
                })
                .filter((pid): pid is string => !!pid && !isNaN(Number(pid)));
        } catch (e) {
            // Ignore if tasklist fails (maybe no process found)
        }

        // Also check "node.exe" potentially if they are running via node (less likely for titan-server.exe binary, but safe to skip for now to avoid noise)
        // Check "titan.exe" as well?
        try {
            const { stdout: taskOutTitan } = await execAsync('tasklist /FI "IMAGENAME eq titan.exe" /FO CSV /NH');
            const lines = taskOutTitan.trim().split('\r\n');
            const titanPids = lines
                .map(line => {
                    const parts = line.split(',');
                    if (parts.length < 2) return null;
                    const pid = parts[1].replace(/"/g, '');
                    return pid;
                })
                .filter((pid): pid is string => !!pid && !isNaN(Number(pid)));
            pids = [...pids, ...titanPids];
        } catch (e) { }


        // 2. If no PIDs, maybe fallback or return empty
        if (pids.length === 0) {
            return NextResponse.json({ orbits: [] });
        }

        const { stdout: netstatOut } = await execAsync('netstat -ano');
        const netstatLines = netstatOut.trim().split('\r\n');

        const foundOrbits = [];
        const seenPorts = new Set();

        for (const line of netstatLines) {
            // Parse line. Simple whitespace split
            const parts = line.trim().split(/\s+/);
            // Expected parts: Proto, Local Address, Foreign Address, State, PID
            // TCP 0.0.0.0:80 ... LISTENING 1234
            if (parts.length < 5) continue;

            const protocol = parts[0];
            const localAddr = parts[1];
            const state = parts[3]; // State is usually 4th elem for TCP
            const pid = parts[parts.length - 1]; // PID is last

            // Filter for TCP and LISTENING
            if (protocol !== 'TCP' && protocol !== 'tcp') continue;
            // Windows netstat state column might be different index if no state? usually standard.
            // "LISTENING"
            if (state !== 'LISTENING') continue;

            if (pids.includes(pid)) {
                // Extract port from 0.0.0.0:5100 or [::]:5100
                const portMatch = localAddr.match(/:(\d+)$/);
                if (portMatch) {
                    const port = parseInt(portMatch[1]);
                    if (!seenPorts.has(port)) {
                        seenPorts.add(port);
                        foundOrbits.push({
                            id: `srv-${pid}-${port}`,
                            name: `New App (Orbit ${port})`,
                            port: port,
                            pid: pid,
                            uptime: 'LIVE',
                            status: 'active'
                        });
                    }
                }
            }
        }

        return NextResponse.json({ orbits: foundOrbits });

    } catch (error) {
        console.error('Scan failed:', error);
        return NextResponse.json({ orbits: [] }, { status: 500 });
    }
}
