import { Activity, AlertCircle, Wifi, Plus } from 'lucide-react';
import { TitanServer } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import TitanLoader from './TitanLoader';
import { useState } from 'react';

interface ServerListProps {
    scannedServers: TitanServer[];
    selectedServerId: string | null;
    isScanning: boolean;
    onSelectServer: (id: string) => void;
    onAddManualOrbit?: (port: number) => void;
}

export default function ServerList({ scannedServers, selectedServerId, isScanning, onSelectServer, onAddManualOrbit }: ServerListProps) {
    const [manualPort, setManualPort] = useState('');
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        if (!inputValue || !onAddManualOrbit) return;

        // Smart parse: extract port from input (whether it's "3000", "localhost:3000", "http://localhost:3000")
        let portToTry = parseInt(inputValue);

        if (isNaN(portToTry)) {
            // Try to parse as URL
            try {
                // Prepend http if missing to make URL constructor happy
                const urlStr = inputValue.startsWith('http') ? inputValue : `http://${inputValue}`;
                const url = new URL(urlStr);
                portToTry = parseInt(url.port);
                if (isNaN(portToTry)) {
                    // Default ports if not specified but valid URL
                    if (url.protocol === 'http:') portToTry = 80;
                    if (url.protocol === 'https:') portToTry = 443;
                }
            } catch (e) {
                // Failed to parse
            }
        }

        if (portToTry > 0 && portToTry < 65536) {
            onAddManualOrbit(portToTry);
            setInputValue(''); // Clear input on success
        }
    };

    return (
        <div className="flex-1 rounded-[48px] border border-black/5 dark:border-white/5 bg-zinc-50/80 dark:bg-[#050505]/80 backdrop-blur-xl p-8 overflow-hidden flex flex-col shadow-2xl relative min-h-[400px]">

            {/* Ambient Signal Wavefront (Decorative) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />

            {/* Cool Header */}
            <div className="flex items-center justify-between mb-8 px-2 pt-2 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-30 animate-pulse" />
                        <div className="relative w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                            <Wifi size={18} strokeWidth={3} />
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500">Signal Relay</span>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Active Orbits</h3>
                    </div>
                </div>
                {isScanning && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full border border-white/5">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-[9px] font-black text-blue-500 uppercase">Probing</span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-1 mb-6">
                {isScanning && scannedServers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-8 opacity-60">
                        <TitanLoader size={56} />
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-600 font-black tracking-[0.3em] uppercase animate-pulse">Scanning Quadrant...</div>
                    </div>
                ) : scannedServers.length > 0 ? (
                    <div className="space-y-5">
                        <AnimatePresence>
                            {scannedServers.map((srv, i) => (
                                <motion.button
                                    key={srv.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
                                    onClick={() => onSelectServer(srv.id)}
                                    className={`w-full group relative overflow-hidden rounded-[28px] border text-left transition-all duration-500 outline-none
                                    ${selectedServerId === srv.id
                                            ? 'border-blue-500/30 bg-white dark:bg-white/[0.04] shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)] scale-[1.02]'
                                            : 'border-transparent bg-zinc-100/50 dark:bg-white/[0.01] hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:border-black/5 dark:hover:border-white/5'
                                        }`}
                                >
                                    {/* Selected Indicator Glow */}
                                    {selectedServerId === srv.id && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] -mr-16 -mt-16 pointer-events-none" />
                                    )}

                                    <div className="p-5 pl-7 relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedServerId === srv.id ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                                                    <Activity size={18} strokeWidth={selectedServerId === srv.id ? 3 : 2} />
                                                </div>
                                                <div>
                                                    <h4 className={`text-base font-black tracking-tight mb-0.5 transition-colors ${selectedServerId === srv.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-400'}`}>
                                                        {srv.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black font-mono text-zinc-400 dark:text-zinc-600">ID_{srv.pid}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 transition-all ${selectedServerId === srv.id ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-transparent text-zinc-600'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${selectedServerId === srv.id ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                            </div>
                                        </div>

                                        {/* Status Bar */}
                                        <div className="flex items-center gap-4 py-3 px-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                                            <div className="flex-1">
                                                <span className="text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-600 block mb-1 tracking-[0.2em]">Uplink Node</span>
                                                <span className={`text-sm font-black font-mono ${selectedServerId === srv.id ? 'text-blue-500' : 'text-zinc-500'}`}>localhost:{srv.port}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-600 block mb-1 tracking-[0.2em]">Signal</span>
                                                <div className="flex items-end gap-0.5 pb-0.5">
                                                    {[1, 2, 3, 4].map(bar => (
                                                        <div key={bar} className={`w-1 rounded-full ${bar <= 3 ? (selectedServerId === srv.id ? 'bg-emerald-500' : 'bg-zinc-500') : 'bg-zinc-800'}`} style={{ height: bar * 3 + 2 }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selection Underline Glint */}
                                    <div className={`absolute bottom-0 left-8 right-8 h-[2px] transition-all duration-700 ${selectedServerId === srv.id ? 'bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-100 opacity-100' : 'bg-transparent scale-x-0 opacity-0'}`} />
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-5">
                        <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-inner">
                            <AlertCircle size={32} className="text-zinc-300 dark:text-zinc-700" strokeWidth={1.5} />
                        </div>
                        <div className="text-[11px] text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-[0.3em] leading-relaxed text-center">
                            No Active Signal Detected
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium text-center max-w-[220px] leading-relaxed opacity-50 italic">
                            Scanning local workspace for active TitanPl orbits...
                        </p>
                    </div>
                )}
            </div>

            {/* Manual Add Input - Upgraded to 'Deep Scan' input */}
            <div className="relative z-10 pt-6 border-t border-black/5 dark:border-white/5">
                <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 pl-2">Manual Signal Link</div>
                <div className="flex items-center gap-3 bg-white dark:bg-black/20 rounded-[20px] border border-zinc-200 dark:border-white/5 p-2 pr-2 transition-all focus-within:ring-4 ring-blue-500/10 focus-within:border-blue-500/30">
                    <div className="flex items-center gap-2 pl-4 text-xs font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest bg-zinc-100 dark:bg-white/[0.03] py-2 px-3 rounded-xl border border-black/5 dark:border-white/5">
                        <Wifi size={12} />
                        <span>Link</span>
                    </div>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        placeholder="PORT (e.g. 8080) or URL..."
                        className="flex-1 bg-transparent border-none outline-none text-base font-black font-mono text-zinc-900 dark:text-white placeholder:text-zinc-200 dark:placeholder:text-zinc-800 w-full min-w-0"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!inputValue}
                        className="px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-blue-600 text-white font-black text-[12px] uppercase tracking-widest hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl disabled:opacity-20 disabled:scale-100 disabled:shadow-none"
                    >
                        Connect
                    </button>
                </div>
            </div>

        </div>
    );
}
