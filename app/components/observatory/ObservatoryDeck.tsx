'use client';

import {
    Radio,
    Zap,
    Terminal as TerminalIcon,
    Activity,
    Code,
    Eye,
    ChevronRight,
    Telescope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { LogEntry, TitanServer } from './types';
import TitanLoader from './TitanLoader';

interface ObservatoryDeckProps {
    selectedServerId: string | null;
    scannedServers: TitanServer[];
    logs: LogEntry[];
    routePath: string;
    routeResponse: string | null;
    isFetchingRoute: boolean;
    onRoutePathChange: (path: string) => void;
    onFetchRoute: () => void;
}

// ... imports ...
export default function ObservatoryDeck({
    selectedServerId,
    scannedServers,
    logs,
    routePath,
    routeResponse,
    isFetchingRoute,
    onRoutePathChange,
    onFetchRoute
}: ObservatoryDeckProps) {
    const outputRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
    const [isBooting, setIsBooting] = useState(true);

    // Initial boot sequence feel
    useEffect(() => {
        const timer = setTimeout(() => setIsBooting(false), 800);
        return () => clearTimeout(timer);
    }, [selectedServerId]);

    // Auto-scroll logs
    useEffect(() => {
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, [logs]);

    // Auto-detect HTML and switch to preview
    useEffect(() => {
        if (routeResponse && (routeResponse.trim().startsWith('<') || routeResponse.includes('<!DOCTYPE html>'))) {
            setViewMode('preview');
        } else {
            setViewMode('code');
        }
    }, [routeResponse]);

    const selectedServer = scannedServers.find(s => s.id === selectedServerId);

    if (!selectedServerId) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full rounded-[48px] border border-black/5 dark:border-white/5 bg-zinc-50/80 dark:bg-[#030303]/80 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center relative overflow-hidden group min-h-[500px]"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)]" />
                <div className="z-10 flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full bg-black/5 dark:bg-white/[0.02] flex items-center justify-center mb-10 border border-black/5 dark:border-white/5 relative shadow-inner">
                        <div className="absolute inset-4 border border-blue-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
                        <Activity size={40} className="text-zinc-300 dark:text-zinc-800" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-400 uppercase tracking-[0.3em] mb-4">Awaiting Uplink</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-600 font-medium max-w-sm leading-relaxed">
                        Orbit mesh scan complete. <br />
                        <span className="text-blue-600 dark:text-blue-500 font-bold block mt-3 uppercase tracking-widest text-[10px]">Select a satellite to initiate sync</span>
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="h-full rounded-[48px] border border-black/5 dark:border-white/10 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-3xl overflow-hidden flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative min-h-[600px]">
            {/* Deck Header - Studio Pro UI */}
            <div className="h-20 border-b border-black/5 dark:border-white/5 px-8 flex items-center justify-between shrink-0 bg-white dark:bg-[#0A0A0A] relative">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-blue-500/20 rounded-xl blur-md animate-pulse" />
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-lg">
                            <Telescope size={20} strokeWidth={3} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                                {selectedServer?.name || 'Local Orbit'}
                            </h2>
                            <span className="flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-black border border-emerald-500/20 uppercase tracking-widest">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 opacity-70">
                            <span>PID_{selectedServer?.pid || '0000'}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-800" />
                            <span>PORT_{selectedServer?.port || '3000'}</span>
                        </div>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Protocol</div>
                        <div className="text-[11px] font-black text-zinc-900 dark:text-zinc-300 uppercase">HTTP/1.1 (V8)</div>
                    </div>
                    <div className="w-px h-8 bg-zinc-100 dark:bg-white/10" />
                    <div className="text-right">
                        <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Latency</div>
                        <div className="text-[11px] font-black text-emerald-500 uppercase">0.4ms</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-10 gap-8 overflow-hidden bg-zinc-50/20 dark:bg-white/[0.01]">
                {/* Route Tester - Modified with "Deep Link" focus */}
                <div className="group relative">
                    <div className="absolute -inset-1 bg-blue-500/10 rounded-[36px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative p-2 rounded-[36px] bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 shadow-sm transition-all focus-within:border-blue-500/50">
                        <div className="flex items-center pl-6 pr-2 py-2">
                            <div className="flex items-center gap-3 mr-6 shrink-0">
                                <Zap size={16} className="text-blue-500" strokeWidth={3} />
                                <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-400 uppercase tracking-[0.2em] hidden md:block">Endpoint</span>
                            </div>

                            <div className="h-8 w-px bg-zinc-100 dark:bg-white/10 mr-6" />

                            <input
                                type="text"
                                value={routePath}
                                onChange={(e) => onRoutePathChange(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onFetchRoute()}
                                className="flex-1 bg-transparent border-0 outline-none text-zinc-900 dark:text-white font-mono text-base font-bold placeholder:text-zinc-300 dark:placeholder:text-zinc-800 w-full"
                                placeholder="/v1/orbit/debug..."
                                spellCheck={false}
                            />

                            <button
                                onClick={onFetchRoute}
                                disabled={isFetchingRoute}
                                className="shrink-0 px-8 py-4 rounded-[28px] bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
                            >
                                {isFetchingRoute ? <TitanLoader size={30} /> : <>Execute <ChevronRight size={14} strokeWidth={3} /></>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Response / Telemetry Split View */}
                <div className="flex-1 grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 gap-8 min-h-0">

                    {/* Response Area */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="rounded-[40px] bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 overflow-hidden shadow-sm flex flex-col relative max-h-[600px]"
                        >
                            <div className="px-8 py-5 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-400">Response Payload</span>
                                </div>

                                <div className="flex items-center gap-2 bg-zinc-200/50 dark:bg-white/5 p-1 rounded-xl">
                                    <button onClick={() => setViewMode('code')} className={`p-2 rounded-lg transition-all ${viewMode === 'code' ? 'bg-white dark:bg-zinc-800 shadow-md text-blue-500' : 'text-zinc-400'}`}><Code size={14} /></button>
                                    <button onClick={() => setViewMode('preview')} className={`p-2 rounded-lg transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-zinc-800 shadow-md text-blue-500' : 'text-zinc-400'}`}><Eye size={14} /></button>
                                </div>
                            </div>

                            <div className="flex-1 relative bg-zinc-50 dark:bg-black/20 overflow-hidden group/view">
                                {!routeResponse ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                                        <Radio size={48} className="text-zinc-400 mb-4 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Passive Mode</span>
                                    </div>
                                ) : viewMode === 'preview' ? (
                                    <iframe srcDoc={routeResponse} className="w-full h-full bg-white transition-opacity duration-500" sandbox="allow-scripts" />
                                ) : (
                                    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                                        <pre className="font-mono text-[13px] font-medium leading-relaxed text-zinc-800 dark:text-zinc-400 whitespace-pre-wrap">
                                            {routeResponse}
                                        </pre>
                                    </div>
                                )}
                                {/* Meta overlay */}
                                {routeResponse && (
                                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/80 backdrop-blur rounded-full border border-white/10 text-[9px] font-black text-zinc-400 uppercase tracking-widest opacity-0 group-hover/view:opacity-100 transition-opacity">
                                        SIZE: {(routeResponse.length / 1024).toFixed(2)} KB
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Telemetry Console */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-[40px] bg-zinc-950 border border-white/5 flex flex-col relative overflow-hidden shadow-2xl min-h-0 max-h-[600px]"
                    >
                        {/* Terminal Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] z-20 opacity-30" />

                        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.03] shrink-0">
                            <div className="flex items-center gap-3">
                                <TerminalIcon size={14} className="text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">SYSTEM LOGS</span>
                            </div>
                            <div className="flex items-center gap-3 group/clear">
                                <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest hidden sm:block">UPSTREAM_SYNCING</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                        </div>

                        <div
                            ref={outputRef}
                            className="flex-1 overflow-y-auto font-mono text-[12px] p-8 space-y-4 custom-scrollbar bg-black/40 relative z-10 scroll-smooth h-0"
                        >
                            {isBooting ? (
                                <div className="text-blue-500/50 animate-pulse font-bold tracking-[0.2em] text-[10px]">INITIALIZING_KERNEL_BRIDGE...</div>
                            ) : logs.length === 0 ? (
                                <div className="text-zinc-800 text-[10px] tracking-widest font-black uppercase h-full flex items-center justify-center italic">Ready to receive transmissions</div>
                            ) : logs.map((log) => (
                                <div key={log.id} className="flex gap-5 group/line border-l border-white/5 pl-4 hover:border-blue-500/30 transition-colors">
                                    <span className="text-zinc-700 shrink-0 select-none text-[9px] w-14 mt-1 font-bold">[{log.timestamp}]</span>
                                    <span className={`block flex-1 leading-relaxed break-all font-bold ${log.type === 'error' ? 'text-rose-500' :
                                        log.type === 'success' ? 'text-emerald-400' :
                                            log.type === 'info' ? 'text-blue-400/80 shadow-[0_0_10px_rgba(59,130,246,0.1)]' :
                                                'text-zinc-500'
                                        }`}>
                                        <span className="opacity-40 mr-2">❱</span>{log.message}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
