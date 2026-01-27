'use client';

import { Telescope, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useVersion } from '@/context/VersionContext';

// Components
import RadarVisualizer from '@/app/components/observatory/RadarVisualizer';
import ServerList from '@/app/components/observatory/ServerList';
import ObservatoryDeck from '@/app/components/observatory/ObservatoryDeck';
import { LogEntry, TitanServer, generateId } from '@/app/components/observatory/types';
import VideoLoader from '@/app/components/VideoLoader';

export default function TitanObservatoryPage() {
    const { titanVersion } = useVersion();

    // State
    const [scannedServers, setScannedServers] = useState<TitanServer[]>([]);
    const [manualServers, setManualServers] = useState<TitanServer[]>([]); // User-added ports
    const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Route Tester State
    const [routePath, setRoutePath] = useState('/');
    const [routeResponse, setRouteResponse] = useState<string | null>(null);
    const [isFetchingRoute, setIsFetchingRoute] = useState(false);

    // Track last logged ID to prevent duplicate logs
    const lastConnectedId = useRef<string | null>(null);

    // Derived State: Combine scanned and manual servers (Memoized to prevent re-renders)
    const allServers = useMemo(() => {
        const combined = [...scannedServers];
        manualServers.forEach(ms => {
            if (!combined.some(s => s.port === ms.port)) {
                combined.push(ms);
            }
        });
        return combined;
    }, [scannedServers, manualServers]);

    // Helper: Add Manual Orbit
    const addManualOrbit = async (port: number) => {
        if (allServers.some(s => s.port === port)) {
            const existing = allServers.find(s => s.port === port);
            if (existing) setSelectedServerId(existing.id);
            return;
        }

        setLogs(p => [...p, {
            id: generateId(),
            timestamp: new Date().toLocaleTimeString([], { hour12: false }),
            message: `Probing localhost:${port} for Titan signal...`,
            type: 'system'
        }]);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

            // "no-cors" mode allows us to detect if a server is running at all (Opaque response).
            // Usually Titan servers won't have CORS setup for localhost docs, so this is necessary.
            await fetch(`http://localhost:${port}`, {
                mode: 'no-cors',
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            // If we didn't throw, something is listening
            const id = `manual-${port}`;
            const newServer: TitanServer = {
                id,
                name: `Manual Orbit (${port})`,
                port,
                pid: 'MANUAL',
                status: 'active',
                uptime: 'user-added'
            };

            setManualServers(prev => [...prev, newServer]);
            setSelectedServerId(id);

            setLogs(p => [...p, {
                id: generateId(),
                timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                message: `Signal Verified: Uplink established on Port ${port}`,
                type: 'success'
            }]);

        } catch (e) {
            setLogs(p => [...p, {
                id: generateId(),
                timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                message: `Connection Failed: No active Titan signal on port ${port}.`,
                type: 'error'
            }]);
        }
    };

    // 0. Safety: Clear logs on mount
    useEffect(() => {
        setLogs([]);
    }, []);

    // 1. Scan Function
    const scanNetwork = async () => {
        try {
            setIsScanning(true);

            // ELECTRON NATIVE CHECK
            if (typeof window !== 'undefined' && (window as any).titanNative) {
                console.log("Using TPL Electron Scan");
                const nativeOrbits = await (window as any).titanNative.scan();
                setScannedServers(prev => {
                    // Update if changed
                    const prevIds = prev.map(s => s.id).sort().join(',');
                    const newIds = nativeOrbits.map((s: TitanServer) => s.id).sort().join(',');
                    if (prevIds !== newIds) {
                        if (prev.length !== nativeOrbits.length) {
                            setLogs(p => [...p, { id: generateId(), timestamp: new Date().toLocaleTimeString(), message: `TPL Scan: ${nativeOrbits.length} active instances.`, type: 'success' }]);
                        }
                        return nativeOrbits;
                    }
                    return prev;
                });
                setIsScanning(false);
                return;
            }

            // ... Fallback to Web ...

            // 1. Try Server-Side Scan (Works for local dev via Node.js)
            // In Cloud/Vercel, this returns [] which is fine.
            let serverOrbits: TitanServer[] = [];
            try {
                const res = await fetch('/api/observatory/scan');
                const data = await res.json();
                serverOrbits = data.orbits || [];
            } catch (e) {
                console.warn("Server scan failed (likely cloud env):", e);
            }

            // 2. Client-Side Scan (Browser Probing)
            const commonPorts = Array.from({ length: 11 }, (_, i) => 5100 + i);

            const checkPort = async (port: number): Promise<TitanServer | null> => {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 800);
                    await fetch(`http://localhost:${port}`, { mode: 'no-cors', method: 'GET', signal: controller.signal });
                    clearTimeout(timeoutId);
                    return {
                        id: `local-client-${port}`,
                        name: port === 5100 ? 'Titan Primary (5100)' : `Local Instance (${port})`,
                        port: port,
                        pid: 'LOCAL',
                        status: 'active',
                        uptime: 'LIVE'
                    };
                } catch (e) { return null; }
            };

            const clientResults = await Promise.all(commonPorts.map(checkPort));
            const clientOrbits = clientResults.filter((s): s is TitanServer => s !== null);

            // 3. Merge Results
            const mergedOrbits = [...serverOrbits];
            clientOrbits.forEach(clientOrbit => {
                if (!mergedOrbits.some(s => s.port === clientOrbit.port)) mergedOrbits.push(clientOrbit);
            });

            setScannedServers(prev => {
                const prevSig = prev.map(s => `${s.port}`).sort().join(',');
                const newSig = mergedOrbits.map(s => `${s.port}`).sort().join(',');
                if (prevSig !== newSig) {
                    if (prev.length !== mergedOrbits.length) {
                        setLogs(p => [...p, { id: generateId(), timestamp: new Date().toLocaleTimeString(), message: `Scan complete: ${mergedOrbits.length} active instances.`, type: 'success' }]);
                    }
                    return mergedOrbits;
                }
                return prev;
            });

            setIsScanning(false);
        } catch (err) {
            setIsScanning(false);
            console.error(err);
        }
    };

    // ... Stream Effect ...

    // ...

    // 3. Route Fetcher (Via Proxy OR Direct)
    const fetchRoute = async () => {
        const server = allServers.find(s => s.id === selectedServerId);
        if (!server) return;

        setIsFetchingRoute(true);
        setRouteResponse(null);

        // ELECTRON CHECK
        if (typeof window !== 'undefined' && (window as any).titanNative) {
            try {
                const targetHost = 'localhost'; // Native can always reach localhost
                const titanUrl = `http://${targetHost}:${server.port}${routePath.startsWith('/') ? '' : '/'}${routePath}`;

                setLogs(prev => [...prev, {
                    id: generateId(),
                    timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                    message: `TPL GET ${titanUrl}`,
                    type: 'info'
                }]);

                const res = await (window as any).titanNative.fetch(titanUrl, { method: 'GET' });

                // Response format from IPC: { status, statusText, data }
                setRouteResponse(res.data);

                setLogs(prev => [...prev, {
                    id: generateId(),
                    timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                    message: `✔ Response (${res.status} ${res.statusText})`,
                    type: 'success'
                }]);
            } catch (e: any) {
                setRouteResponse(`TPL Error: ${e}`);
                setLogs(prev => [...prev, {
                    id: generateId(),
                    timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                    message: `TPL Failed: ${e}`,
                    type: 'error'
                }]);
            } finally {
                setIsFetchingRoute(false);
            }
            return;
        }


        // WEB LOGIC (Existing)
        let targetHost = 'localhost';
        let isClientDetected = false;

        if (server.id.startsWith('local-client-')) {
            isClientDetected = true;
            const parts = server.id.split('-');
            if (parts.length >= 4) targetHost = parts[2];
        }
        if (server.pid === 'MANUAL') {
            isClientDetected = true;
            targetHost = 'localhost';
        }

        try {
            const titanUrl = `http://${targetHost}:${server.port}${routePath.startsWith('/') ? '' : '/'}${routePath}`;

            setLogs(prev => [...prev, {
                id: generateId(),
                timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                message: `GET ${titanUrl}`,
                type: 'info'
            }]);

            let dataStr = '';
            let status = 0;
            let statusText = '';

            if (isClientDetected) {
                try {
                    const res = await fetch(titanUrl);
                    status = res.status;
                    statusText = res.statusText;
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const json = await res.json();
                        dataStr = JSON.stringify(json, null, 2);
                    } else {
                        dataStr = await res.text();
                    }
                } catch (fetchErr: any) {
                    throw new Error(`Direct Fetch Failed. CORS/Mixed Content.\n${fetchErr.message}`);
                }

            } else {
                const res = await fetch('/api/observatory/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: titanUrl, method: 'GET' })
                });

                const proxyResult = await res.json();
                if (!res.ok) throw new Error(proxyResult.details || proxyResult.error || 'Proxy Error');

                status = proxyResult.status;
                statusText = proxyResult.statusText;
                const data = proxyResult.data;
                dataStr = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
            }

            setRouteResponse(dataStr);

            setLogs(prev => [...prev, {
                id: generateId(),
                timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                message: `✔ Response (${status} ${statusText})`,
                type: 'success'
            }]);

        } catch (e: any) {
            setRouteResponse(`Error: ${e.message}`);
            setLogs(prev => [...prev, {
                id: generateId(),
                timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                message: `Connection Failed: ${e.message}`,
                type: 'error'
            }]);
        } finally {
            setIsFetchingRoute(false);
        }
    };

    // Environment Check
    const [isVercelWeb, setIsVercelWeb] = useState(false);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const isNative = !!(window as any).titanNative;
            if (!isLocal && !isNative) {
                setIsVercelWeb(true);
            }
        }
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500/30 relative overflow-y-auto">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-500/5 to-transparent blur-3xl" />
            </div>

            <VideoLoader text="TitanPl Observatory" />

            {/* Vercel Environment Warning - Prototype Mode */}
            <AnimatePresence>
                {isVercelWeb && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="relative z-[100] bg-blue-600 dark:bg-blue-600/20 border-b border-blue-500/20 text-white px-6 py-3 text-center flex flex-col md:flex-row items-center justify-center gap-4 shadow-xl backdrop-blur-md"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-[0.15em]">Web Prototype Mode Active</span>
                        </div>
                        <span className="hidden md:inline text-blue-100/50 text-xs">|</span>
                        <span className="text-xs text-blue-100 font-medium tracking-wide">
                            Native sockets & CORS bypass not available. Download the desktop client for full orbital control.
                        </span>
                        <Link href="/observatory/download" className="bg-white text-blue-600 hover:bg-blue-50 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 shadow-lg">
                            Get Native Client
                        </Link>
                        {/* <button onClick={() => setIsVercelWeb(false)} className="opacity-50 hover:opacity-100 text-xs font-mono ml-4">[DISMISS]</button> */}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col p-6 relative z-10 max-w-[1920px] mx-auto w-full">


                {/* Header Section */}
                <div className="flex-none flex flex-col md:flex-row justify-between gap-6 mb-6 border-b border-black/5 dark:border-white/5 pb-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-500/5 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-500/10 shadow-sm min-h-[32px]">
                            {isScanning ? (
                                <div className="flex items-center gap-3">
                                    <div className="relative w-4 h-4">
                                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                                        <Image
                                            src="/favicon.ico"
                                            alt="TitanPl"
                                            width={16}
                                            height={16}
                                            className="animate-spin duration-[3s] rounded-full"
                                        />
                                    </div>
                                    <span className="tracking-[0.2em]">TitanPl Observatory Scanning...</span>
                                </div>
                            ) : (
                                <>
                                    <Telescope size={14} />
                                    <span>Mesh Status: {allServers.length} ACTIVE ORBITS</span>
                                </>
                            )}
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white leading-tight">
                            {isVercelWeb ? "Observatory (Web Prototype)" : "TitanPl Observatory"}
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono mt-2 max-w-xl">
                            {isVercelWeb
                                ? "Limited preview environment. For raw socket access and multi-orbit control, please use the Native Desktop Client."
                                : "Real-time development & testing utility. Scan for local TitanPl servers, inspect output, and debug routes instantly."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Manual Refresh Button */}
                        <button
                            onClick={() => scanNetwork()}
                            disabled={isScanning}
                            className="h-10 px-6 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/10 backdrop-blur-sm"
                        >
                            <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} />
                            Refresh Sector
                        </button>



                    </div>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

                    {/* LEFT COLUMN: SCANNER & LIST */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-auto lg:h-full lg:min-h-0">

                        {/* 1. Radar Visualizer (Advanced Multi-Orbit) */}
                        <div className="flex-none">
                            <RadarVisualizer
                                scannedServers={allServers}
                                selectedServerId={selectedServerId}
                                onSelectServer={setSelectedServerId}
                            />
                        </div>

                        {/* 2. Detected Servers List */}
                        <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0">
                            <ServerList
                                scannedServers={allServers}
                                selectedServerId={selectedServerId}
                                isScanning={isScanning}
                                onSelectServer={setSelectedServerId}
                                onAddManualOrbit={addManualOrbit}
                            />
                        </div>

                    </div>

                    {/* RIGHT COLUMN: OBSERVATORY DECK */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-auto lg:h-full lg:min-h-0 min-h-[600px] lg:min-h-[auto]">
                        <ObservatoryDeck
                            selectedServerId={selectedServerId}
                            scannedServers={scannedServers}
                            logs={logs}
                            routePath={routePath}
                            routeResponse={routeResponse}
                            isFetchingRoute={isFetchingRoute}
                            onRoutePathChange={setRoutePath}
                            onFetchRoute={fetchRoute}
                        />
                    </div>

                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                }
                @media (prefers-color-scheme: dark) {
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                         background: rgba(255, 255, 255, 0.1);
                    }
                }
            `}</style>
        </div>
    );
}
