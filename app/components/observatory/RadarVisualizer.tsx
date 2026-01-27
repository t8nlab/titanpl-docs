'use client';

import { motion } from 'framer-motion';
import { TitanServer } from './types';

interface RadarVisualizerProps {
    scannedServers: TitanServer[];
    selectedServerId: string | null;
    onSelectServer: (id: string) => void;
}

export default function RadarVisualizer({ scannedServers, selectedServerId, onSelectServer }: RadarVisualizerProps) {
    return (
        <div className="flex-none h-96 rounded-[48px] border border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-[#050505]/50 backdrop-blur-xl relative overflow-hidden shadow-2xl group border-l-[4px] border-l-blue-500/20 perspective-[1000px]">
            {/* 3D Depth Grid */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] dark:opacity-[0.1]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)_translateZ(-50px)]" />
            </div>

            {/* Radar Grid Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 dark:opacity-20">
                <div className="absolute w-full h-[1px] bg-black/5 dark:bg-white/5" />
                <div className="absolute h-full w-[1px] bg-black/5 dark:bg-white/5" />
                {/* Base concentric rings for depth */}
                <div className="absolute w-[100px] h-[100px] rounded-full border border-black/5 dark:border-white/5" />
                <div className="absolute w-[200px] h-[200px] rounded-full border border-black/5 dark:border-white/5 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]" />
                <div className="absolute w-[300px] h-[300px] rounded-full border border-black/5 dark:border-white/5" />
            </div>

            {/* Scanning Beam (Central) - Improved trailing effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] animate-[spin_6s_linear_infinite] origin-center relative">
                    {/* Main Beam */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-t from-transparent via-blue-500/10 to-transparent blur-sm" style={{ clipPath: 'polygon(50% 100%, 45% 0, 55% 0)' }} />
                    {/* Ghost Trailing Wave */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-t from-transparent via-blue-500/5 to-transparent blur-[15px] opacity-60" style={{ clipPath: 'polygon(50% 100%, 30% 0, 70% 0)' }} />
                </div>
            </div>

            {/* Individual Concentric Orbits */}
            <div className="absolute inset-0 flex items-center justify-center">
                {scannedServers.map((srv, i) => {
                    const size = 180 + (i * 70);
                    const duration = 20 + (i * 8);
                    const isReverse = i % 2 === 1;

                    return (
                        <div
                            key={srv.id}
                            className="absolute rounded-full border border-dashed border-black/5 dark:border-white/10 flex items-center justify-center transition-all duration-1000 pointer-events-none"
                            style={{
                                width: size,
                                height: size,
                                animation: `spin ${duration}s linear infinite ${isReverse ? 'reverse' : 'normal'}`
                            }}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <motion.button
                                    onClick={() => onSelectServer(srv.id)}
                                    whileHover={{ scale: 1.15 }}
                                    style={{ animation: `spin ${duration}s linear infinite ${isReverse ? 'normal' : 'reverse'}` }}
                                    className="relative cursor-pointer group/planet pointer-events-auto"
                                >
                                    {/* Advanced Satellite Design */}
                                    <div className="relative w-10 h-10 flex items-center justify-center">
                                        {/* Signal Strength Rings */}
                                        <div className="absolute inset-0 rounded-full border border-blue-500/20 group-hover/planet:animate-ping" />

                                        {/* Solar Wings */}
                                        <div className="absolute inset-x-[-12px] h-[3px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent rounded-full" />

                                        {/* Core Body */}
                                        <div className={`relative w-7 h-7 bg-zinc-100 dark:bg-black rounded-full border-[2px] ${selectedServerId === srv.id ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'} flex items-center justify-center overflow-hidden z-10 transition-colors`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedServerId === srv.id ? 'bg-emerald-400' : 'bg-blue-400'} animate-pulse`} />
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
                                        </div>

                                        {/* Dynamic Antenna Beams */}
                                        <div className="absolute -top-2 w-[1px] h-4 bg-gradient-to-t from-blue-500 to-transparent" />
                                    </div>

                                    {/* Enhanced Label Tag */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 bg-white/95 dark:bg-[#0a0a0c]/90 border border-black/5 dark:border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] whitespace-nowrap z-20 pointer-events-none opacity-0 group-hover/planet:opacity-100 transition-all scale-90 group-hover/planet:scale-100 backdrop-blur-md">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1 h-1 rounded-full bg-blue-500" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-400">TitanPl Orbit</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] font-black font-mono text-zinc-900 dark:text-white">PORT {srv.port}</span>
                                                <span className="text-[10px] text-zinc-400">|</span>
                                                <span className="text-[10px] font-bold text-blue-500">RSSI -4{i}dBm</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Status Panel (Bottom Left) */}
            <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-black/10 dark:bg-white/5 p-2 pr-4 rounded-2xl backdrop-blur-md border border-white/5">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Scanning Network</span>
                    <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-200 tracking-tighter">LOCAL_SYSTEM_GRID</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-2">
                    <div className="relative w-2 h-2">
                        <div className={`absolute inset-0 rounded-full animate-ping ${scannedServers.length > 0 ? 'bg-emerald-500/40' : 'bg-rose-500/40'}`} />
                        <div className={`relative w-2 h-2 rounded-full ${scannedServers.length > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </div>
                    <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">{scannedServers.length} ACTIVE</span>
                </div>
            </div>
        </div>
    );
}
