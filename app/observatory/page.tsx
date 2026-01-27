'use client';

import { Telescope, RefreshCw, Play, Pause, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
    const [isStreaming, setIsStreaming] = useState(true);
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
            // Only set scanning state if manual refresh (not streaming update)
            if (!isStreaming) setIsScanning(true);

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
            // Critical for deployed environments where the server cannot see localhost.
            // We scan a commonly used range (5100-5110) in parallel.
            const commonPorts = Array.from({ length: 11 }, (_, i) => 5100 + i);
            
            const checkPort = async (port: number): Promise<TitanServer | null> => {
                try {
                    const controller = new AbortController();
                    // Short timeout for the auto-check to maintain UI responsiveness
                    const timeoutId = setTimeout(() => controller.abort(), 800);

                    await fetch(`http://localhost:${port}`, {
                        mode: 'no-cors',
                        method: 'GET',
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    // If request succeeds (even opaque), something is listening
                    return {
                        id: `local-client-${port}`,
                        name: port === 5100 ? 'Titan Primary (5100)' : `Local Instance (${port})`,
                        port: port,
                        pid: 'LOCAL',
                        status: 'active',
                        uptime: 'LIVE'
                    };
                } catch (e) {
                    return null;
                }
            };

            const clientResults = await Promise.all(commonPorts.map(checkPort));
            const clientOrbits = clientResults.filter((s): s is TitanServer => s !== null);

            // 3. Merge Results (Deduplicate by Port)
            // Client-side detection takes precedence for localhost attributes in cloud mode,
            // but Server-side often has better PID/Process info if available.
            const mergedOrbits = [...serverOrbits];
            
            clientOrbits.forEach(clientOrbit => {
                if (!mergedOrbits.some(s => s.port === clientOrbit.port)) {
                    mergedOrbits.push(clientOrbit);
                }
            });

            setScannedServers(prev => {
                // Create unique IDs string for comparison
                const prevSig = prev.map(s => `${s.port}`).sort().join(',');
                const newSig = mergedOrbits.map(s => `${s.port}`).sort().join(',');

                if (prevSig !== newSig) {
                    // Only log if we found something new or lost something
                    const newCount = mergedOrbits.length;
                    
                    // Simple log logic: only log if count changed meaningfully to reduce noise
                    if (prev.length !== newCount && !isStreaming) {
                        setLogs(p => [...p, {
                            id: generateId(),
                            timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                            message: `Scan complete: ${newCount} active instances detected.`,
                            type: 'success'
                        }]);
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

    // 2. Stream Effect
    useEffect(() => {
        // Initial scan
        scanNetwork();

        if (!isStreaming) return;

        const timer = setInterval(scanNetwork, 5000);
        return () => clearInterval(timer);
    }, [isStreaming]);

    // 3. Global Keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' &&
                !(e.target instanceof HTMLInputElement) &&
                !(e.target instanceof HTMLTextAreaElement)
            ) {
                scanNetwork();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isStreaming]);


    // 2. Log Stream Effect
    useEffect(() => {
        if (!selectedServerId) return;
        if (selectedServerId === lastConnectedId.current) return;

        lastConnectedId.current = selectedServerId; // Update tracking ref

        const server = allServers.find(s => s.id === selectedServerId);
        const displayId = server ? `tpl-${server.pid}-${server.port}` : selectedServerId;

        setLogs(prev => [...prev, {
            id: generateId(),
            timestamp: new Date().toLocaleTimeString([], { hour12: false }),
            message: `Connection established with ${displayId}`,
            type: 'info'
        }]);
        setRouteResponse(null);
        setRoutePath('/');
    }, [selectedServerId, allServers]); // Added allServers to dependency array

    // 3. Route Fetcher (Via Proxy OR Direct)
    const fetchRoute = async () => {
        const server = allServers.find(s => s.id === selectedServerId); // Use allServers
        if (!server) return;

        setIsFetchingRoute(true);
        setRouteResponse(null);

        // Check if this is a client-detected server (format: local-client-HOST-PORT or legacy local-client-PORT)
        // We support both for safety, but new code uses host.
        let targetHost = 'localhost';
        let isClientDetected = false;

        if (server.id.startsWith('local-client-')) {
            isClientDetected = true;
            const parts = server.id.split('-');
            if (parts.length >= 4) {
                // local-client-127.0.0.1-3000
                targetHost = parts[2];
            }
        }
        // Also treat manual servers as client detected (direct fetch) but strictly localhost for safety unless we want to parse something else.
        // For manual, we assume localhost.
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
                // DIRECT BROWSER FETCH
                // Note: accurate status requires CORS. Without CORS, we might fail or get opaque.
                // We assume user is trying to test a real API so we hope for CORS.

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
                    // Likely CORS or Mixed Content error
                    throw new Error(`Direct Fetch Failed. Possible causes:\n1. CORS not enabled on Titan server.\n2. Mixed Content (Using HTTP localhost from HTTPS site).\nError: ${fetchErr.message}`);
                }

            } else {
                // PROXY FETCH (Original Logic)
                const res = await fetch('/api/observatory/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: titanUrl, method: 'GET' })
                });

                const proxyResult = await res.json();

                if (!res.ok) {
                    throw new Error(proxyResult.details || proxyResult.error || 'Proxy Error');
                }

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

    return (
        <div className="min-h-screen bg-[#020202] text-[#abb2bf] dark:bg-[#020202] dark:text-[#abb2bf] bg-white text-zinc-800 transition-colors duration-500 flex flex-col">
            <VideoLoader text="Observatory" />

            {/* Professional Studio Background */}
            <div className="fixed inset-0 bg-[#050505] -z-20" />
            <div className="fixed inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-zinc-900/20 pointer-events-none -z-10" />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-500/5 blur-[120px] pointer-events-none -z-10" />

            <div className="w-full mx-auto px-6 pt-16 pb-24 flex-1 flex flex-col min-h-0 relative z-10 max-w-[1800px]">

                {/* Header Section */}
                <div className="flex-none flex flex-col md:flex-row justify-between gap-6 mb-6 border-b border-black/5 dark:border-white/5 pb-6">
                    <div className="space-y-3">
                        <Link
                            href="/"
                            className="group flex items-center gap-2 mb-6 px-4 py-2 w-fit rounded-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 transition-all shadow-sm active:scale-95"
                        >
                            <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
                                <ArrowLeft size={10} className="text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">Return to Base</span>
                        </Link>
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
                            TitanPl Observatory
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono mt-2 max-w-xl">
                            Real-time development & testing utility. Scan for local TitanPl servers, inspect output, and debug routes instantly.
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

                        {/* Stream Toggle Button */}
                        <button
                            onClick={() => setIsStreaming(!isStreaming)}
                            className={`h-10 px-6 rounded-full border font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-sm ${isStreaming
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-white dark:bg-zinc-900 border-black/5 dark:border-white/10 text-zinc-400'
                                }`}
                        >
                            {isStreaming ? (
                                <>
                                    <Pause size={14} className="fill-current" />
                                    Stream On
                                </>
                            ) : (
                                <>
                                    <Play size={14} className="fill-current" />
                                    Stream Off
                                </>
                            )}
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
