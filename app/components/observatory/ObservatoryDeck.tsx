'use client';

import {
    Radio,
    Zap,
    RefreshCcw,
    Terminal as TerminalIcon,
    Rocket,
    Code,
    Eye,
    Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { LogEntry, TitanServer } from './types';

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
            <div className="h-full rounded-[48px] border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-[#030303] flex flex-col items-center justify-center p-12 text-center opacity-80 dark:opacity-60 relative overflow-hidden group min-h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="z-10 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-black/5 dark:bg-zinc-900/50 flex items-center justify-center mb-8 border border-black/5 dark:border-white/5 relative">
                        <div className="absolute inset-0 border border-black/5 dark:border-white/5 rounded-full animate-ping opacity-20" />
                        <Rocket size={32} className="text-zinc-400 dark:text-zinc-700 -rotate-45" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">No Signals Yet</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-700 font-mono max-w-sm leading-relaxed">
                        Your local galaxy is quiet.
                        <br />
                        <span className="text-blue-600 dark:text-blue-600 block mt-2">Fire up TitanPl to connect.</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full rounded-[48px] border border-black/5 dark:border-white/10 bg-white dark:bg-[#050505] overflow-hidden flex flex-col shadow-2xl relative min-h-[600px]">
            {/* Deck Header - Enhanced UI */}
            <div className="h-24 border-b border-black/5 dark:border-white/5 px-8 flex items-center justify-between shrink-0 bg-zinc-50/80 dark:bg-zinc-900/20 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-white dark:from-zinc-800 dark:to-black text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-lg">
                            <Radio size={20} className="animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            Signal Locked
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">LIVE</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                UPLINK ESTABLISHED
                            </span>
                            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                                {selectedServer?.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">
                                :{selectedServer?.port}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-8 gap-6 overflow-y-auto bg-zinc-50/30 dark:bg-black/20">
                {/* Route Tester Card */}
                <div className="p-2 rounded-[32px] bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500/20">
                    <div className="flex items-center pl-4 pr-1.5 py-1.5">
                        <div className="flex items-center gap-2 mr-4 opacity-50 shrink-0">
                            <Zap size={14} className="text-zinc-400" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:block">Request</span>
                        </div>

                        <div className="h-6 w-px bg-black/5 dark:bg-white/10 mr-4" />

                        <input
                            type="text"
                            value={routePath}
                            onChange={(e) => onRoutePathChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onFetchRoute()}
                            className="flex-1 bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 font-mono text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-700 w-full min-w-0"
                            placeholder="/path..."
                            spellCheck={false}
                        />
                        <button
                            onClick={onFetchRoute}
                            disabled={isFetchingRoute}
                            className="shrink-0 px-6 py-2.5 rounded-[22px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-md flex items-center gap-2"
                        >
                            {isFetchingRoute ? <RefreshCcw size={14} className="animate-spin" /> : <>FETCH <span className="hidden sm:inline">DATA</span></>}
                        </button>
                    </div>
                </div>

                {/* Response Area */}
                <AnimatePresence mode="wait">
                    {routeResponse && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="rounded-[32px] bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm flex flex-col"
                        >
                            <div className="px-6 py-3 border-b border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Response Body</span>

                                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('code')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'code' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600' : 'text-zinc-400 hover:text-zinc-600'}`}
                                        title="Raw Code"
                                    >
                                        <Code size={14} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('preview')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600' : 'text-zinc-400 hover:text-zinc-600'}`}
                                        title="Web Preview"
                                    >
                                        <Eye size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative bg-zinc-50 dark:bg-[#0a0a0a] min-h-[200px]">
                                {viewMode === 'preview' ? (
                                    <div className="w-full h-[400px] border-none">
                                        <iframe
                                            srcDoc={routeResponse}
                                            className="w-full h-full bg-white block"
                                            sandbox="allow-scripts"
                                            title="Response Preview"
                                        />
                                    </div>
                                ) : (
                                    <div className="p-6">
                                        <pre className="font-mono text-[12px] leading-relaxed text-zinc-700 dark:text-zinc-400 whitespace-pre-wrap overflow-x-auto max-h-[400px] custom-scrollbar">
                                            {routeResponse}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Telemetry Console */}
                <div className="flex-1 min-h-[300px] rounded-[32px] bg-zinc-900 dark:bg-[#030303] border border-black/5 dark:border-white/5 flex flex-col relative overflow-hidden shadow-xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                            <TerminalIcon size={12} /> Live Telemetry
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-mono text-zinc-600">ONLINE</span>
                        </div>
                    </div>

                    <div
                        ref={outputRef}
                        className="flex-1 overflow-y-auto font-mono text-[12px] p-6 space-y-3 custom-scrollbar"
                    >
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-4 opacity-90 hover:opacity-100 transition-opacity">
                                <span className="text-zinc-600 shrink-0 select-none text-[10px] w-14 mt-0.5">[{log.timestamp}]</span>
                                <span className={`block flex-1 leading-relaxed break-all ${log.type === 'error' ? 'text-rose-400' :
                                    log.type === 'success' ? 'text-emerald-400' :
                                        log.type === 'info' ? 'text-blue-200/70' :
                                            'text-zinc-400'
                                    }`}>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
