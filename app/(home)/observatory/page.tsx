'use client';

import { Telescope, RefreshCw, Play, Pause } from 'lucide-react';
import Image from 'next/image';

import { useState, useEffect } from 'react';
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
    const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isStreaming, setIsStreaming] = useState(true);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Route Tester State
    const [routePath, setRoutePath] = useState('/');
    const [routeResponse, setRouteResponse] = useState<string | null>(null);
    const [isFetchingRoute, setIsFetchingRoute] = useState(false);

    // 0. Safety: Clear logs on mount
    useEffect(() => {
        setLogs([]);
    }, []);

    // 1. Scan Function
    const scanNetwork = async () => {
        try {
            // Only set scanning state if manual refresh (not streaming update)
            // or if it's the first load
            if (!isStreaming) setIsScanning(true);

            const res = await fetch('/api/observatory/scan');
            const data = await res.json();

            setScannedServers(prev => {
                const prevIds = prev.map(s => s.id).sort().join(',');
                const newIds = (data.orbits as TitanServer[]).map(s => s.id).sort().join(',');

                if (prevIds !== newIds) {
                    const newCount = data.orbits.length;
                    setLogs(p => [...p, {
                        id: generateId(),
                        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                        message: `Scan complete: ${newCount} active instances detected.`,
                        type: 'success'
                    }]);
                    return data.orbits;
                }
                return prev;
            });
            setIsScanning(false);
        } catch (err) {
            setIsScanning(false);
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
            // Refresh on Enter if not in an input/textarea
            if (e.key === 'Enter' &&
                !(e.target instanceof HTMLInputElement) &&
                !(e.target instanceof HTMLTextAreaElement)
            ) {
                scanNetwork();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isStreaming]); // Re-bind if streaming changes, though not strictly necessary if scanNetwork is stable? 
    // Actually scanNetwork relies on isStreaming logic inside strict mode? No. 
    // simpler: just call scanNetwork. 


    // 2. Log Stream Effect
    useEffect(() => {
        if (!selectedServerId) return;

        const server = scannedServers.find(s => s.id === selectedServerId);
        const displayId = server ? `tpl-${server.pid}-${server.port}` : selectedServerId;

        setLogs(prev => [...prev, {
            id: generateId(),
            timestamp: new Date().toLocaleTimeString([], { hour12: false }),
            message: `Connection established with ${displayId}`,
            type: 'info'
        }]);
        setRouteResponse(null);
        setRoutePath('/');
    }, [selectedServerId]);

    // 3. Route Fetcher (Via Proxy)
    const fetchRoute = async () => {
        const server = scannedServers.find(s => s.id === selectedServerId);
        if (!server) return;

        setIsFetchingRoute(true);
        setRouteResponse(null);

        try {
            const titanUrl = `http://localhost:${server.port}${routePath.startsWith('/') ? '' : '/'}${routePath}`;

            setLogs(prev => [...prev, {
                id: generateId(),
                timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                message: `GET ${titanUrl}`,
                type: 'info'
            }]);

            const res = await fetch('/api/observatory/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: titanUrl, method: 'GET' })
            });

            const proxyResult = await res.json();

            if (!res.ok) {
                throw new Error(proxyResult.details || proxyResult.error || 'Proxy Error');
            }

            const { status, statusText, data } = proxyResult;
            const dataStr = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;

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
                <div className="flex-none flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 border-b border-black/5 dark:border-white/5 pb-6">
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
                                            className="animate-spin duration-[3s]"
                                        />
                                    </div>
                                    <span className="tracking-[0.2em]">TitanPl Observatory Scanning...</span>
                                </div>
                            ) : (
                                <>
                                    <Telescope size={14} />
                                    <span>Mesh Status: {scannedServers.length} ACTIVE ORBITS</span>
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
                            className="h-10 px-6 rounded-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 text-zinc-600 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                        >
                            <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} />
                            Refresh
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
                                scannedServers={scannedServers}
                                selectedServerId={selectedServerId}
                                onSelectServer={setSelectedServerId}
                            />
                        </div>

                        {/* 2. Detected Servers List */}
                        <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0">
                            <ServerList
                                scannedServers={scannedServers}
                                selectedServerId={selectedServerId}
                                isScanning={isScanning}
                                onSelectServer={setSelectedServerId}
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
