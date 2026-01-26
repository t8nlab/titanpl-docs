'use client';

import { Telescope } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useVersion } from '@/context/VersionContext';

// Components
import RadarVisualizer from '@/app/components/observatory/RadarVisualizer';
import ServerList from '@/app/components/observatory/ServerList';
import ObservatoryDeck from '@/app/components/observatory/ObservatoryDeck';
import { LogEntry, TitanServer, generateId } from '@/app/components/observatory/types';

export default function TitanObservatoryPage() {
    const { titanVersion } = useVersion();

    // State
    const [scannedServers, setScannedServers] = useState<TitanServer[]>([]);
    const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Route Tester State
    const [routePath, setRoutePath] = useState('/');
    const [routeResponse, setRouteResponse] = useState<string | null>(null);
    const [isFetchingRoute, setIsFetchingRoute] = useState(false);

    // 0. Safety: Clear logs on mount
    useEffect(() => {
        setLogs([]);
    }, []);

    // 1. Real Scan Effect (Server-Side Scan)
    useEffect(() => {
        let isMounted = true;

        const scanNetwork = async () => {
            if (!isMounted) return;

            try {
                const res = await fetch('/api/observatory/scan');
                const data = await res.json();

                if (isMounted) {
                    setScannedServers(prev => {
                        const prevIds = prev.map(s => s.id).sort().join(',');
                        const newIds = (data.orbits as TitanServer[]).map(s => s.id).sort().join(',');

                        // Detect changes
                        if (prevIds !== newIds) {
                            const newCount = data.orbits.length;
                            setLogs(p => [...p, {
                                id: generateId(),
                                timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                                message: `Sensors updated: ${newCount} active orbit${newCount === 1 ? '' : 's'} detected.`,
                                type: 'success'
                            }]);
                            return data.orbits;
                        }
                        return prev;
                    });
                    setIsScanning(false);
                }
            } catch (err) {
                if (isMounted) setIsScanning(false);
            }
        };

        const timer = setInterval(scanNetwork, 5000);
        scanNetwork();

        return () => {
            isMounted = false;
            clearInterval(timer);
        };
    }, []);

    // 2. Log Stream Effect
    useEffect(() => {
        if (!selectedServerId) return;

        const server = scannedServers.find(s => s.id === selectedServerId);
        const displayId = server ? `tpl-${server.pid}-${server.port}` : selectedServerId;

        setLogs(prev => [...prev, {
            id: generateId(),
            timestamp: new Date().toLocaleTimeString([], { hour12: false }),
            message: `Telemetry uplink established with ${displayId}`,
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

            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[linear-gradient(to_right,rgba(100,100,100,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,100,100,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] pointer-events-none -z-10" />

            <div className="max-w-[1600px] mx-auto px-6 pt-12 pb-4 w-full flex-1 flex flex-col min-h-0 relative z-10">

                {/* Header Section */}
                <div className="flex-none flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 border-b border-black/5 dark:border-white/5 pb-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-500/5 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-500/10 shadow-sm">
                            <Telescope size={14} className={isScanning ? "animate-pulse" : ""} />
                            Mesh Status: {isScanning ? 'SCANNING SYSTEM...' : `${scannedServers.length} ACTIVE ORBITS`}
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white leading-tight">
                            TitanPl Observatory
                        </h1>
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
