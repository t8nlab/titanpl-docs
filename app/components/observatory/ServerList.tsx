'use client';

import { Activity, Search, Server, AlertCircle, Wifi } from 'lucide-react';
import { TitanServer } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface ServerListProps {
    scannedServers: TitanServer[];
    selectedServerId: string | null;
    isScanning: boolean;
    onSelectServer: (id: string) => void;
}

export default function ServerList({ scannedServers, selectedServerId, isScanning, onSelectServer }: ServerListProps) {
    return (
        <div className="flex-1 rounded-[48px] border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-[#050505] p-6 overflow-hidden flex flex-col border-b-[3px] border-b-blue-500/20 shadow-sm dark:shadow-none min-h-[300px] relative">

            {/* Cool Header */}
            <div className="flex items-center justify-between mb-6 px-2 pt-2 relative z-10">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500">Detected Signals</span>
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-sm opacity-50 animate-pulse"></div>
                        <Activity size={12} className="text-blue-600 dark:text-blue-400 relative z-10" />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-1">
                {isScanning && scannedServers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse"></div>
                            <Search size={24} className="animate-spin text-blue-600 dark:text-blue-400 relative z-10" />
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-600 font-mono tracking-widest uppercase">Scanning Sector...</div>
                    </div>
                ) : scannedServers.length > 0 ? (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {scannedServers.map((srv, i) => (
                                <motion.button
                                    key={srv.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
                                    onClick={() => onSelectServer(srv.id)}
                                    className={`w-full group relative overflow-hidden rounded-[24px] border text-left transition-all duration-300 outline-none
                                    ${selectedServerId === srv.id
                                            ? 'border-blue-500/50 bg-gradient-to-br from-zinc-900 to-black dark:from-zinc-900 dark:to-[#0a0a0a] shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]'
                                            : 'border-transparent bg-white/50 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.08] hover:border-black/5 dark:hover:border-white/10'
                                        }`}
                                >
                                    {/* Selection Glow (Background) */}
                                    {selectedServerId === srv.id && (
                                        <div className="absolute inset-0 bg-blue-500/5 opacity-100 dark:opacity-20 pointer-events-none" />
                                    )}

                                    {/* Active Indicator Strip */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-colors duration-300 ${selectedServerId === srv.id ? 'bg-blue-500' : 'bg-transparent group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800'}`} />

                                    <div className="p-4 pl-6 relative z-10">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className={`text-xs font-black uppercase tracking-wider mb-1 transition-colors ${selectedServerId === srv.id ? 'text-blue-500 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                    {srv.name}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${selectedServerId === srv.id ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                                                    <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">ORBIT {srv.pid}</span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`px-2 py-1 rounded-md border flex items-center gap-1.5 transition-colors ${selectedServerId === srv.id ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-400'}`}>
                                                <Wifi size={10} className={selectedServerId === srv.id ? 'animate-pulse' : ''} />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">Live</span>
                                            </div>
                                        </div>

                                        {/* Grid Info */}
                                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                                            <div>
                                                <span className="text-[8px] uppercase font-bold text-zinc-400 dark:text-zinc-600 block mb-0.5 tracking-wider">Port</span>
                                                <span className={`text-xs font-mono font-medium ${selectedServerId === srv.id ? 'text-white dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>:{srv.port}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[8px] uppercase font-bold text-zinc-400 dark:text-zinc-600 block mb-0.5 tracking-wider">Signature</span>
                                                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500">TPL-{srv.pid}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-70">
                        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                            <AlertCircle size={24} className="text-zinc-300 dark:text-zinc-700" />
                        </div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-widest leading-relaxed text-center">
                            No Active Orbits found<br />in local sector
                        </div>
                    </div>
                )}
            </div>

            {/* Decorative bottom fade */}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-zinc-50 dark:from-[#050505] to-transparent pointer-events-none z-20" />
        </div>
    );
}
