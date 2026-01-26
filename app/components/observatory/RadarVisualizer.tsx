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
        <div className="flex-none h-96 rounded-[48px] border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-[#050505] relative overflow-hidden shadow-2xl group border-l-[4px] border-l-blue-500/30">
            {/* Radar Grid Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="absolute w-full h-[1px] bg-blue-500/30" />
                <div className="absolute h-full w-[1px] bg-blue-500/30" />
                {/* Base concentric rings for depth */}
                <div className="absolute w-[100px] h-[100px] rounded-full border border-blue-500/20" />
                <div className="absolute w-[200px] h-[200px] rounded-full border border-blue-500/20" />
                <div className="absolute w-[300px] h-[300px] rounded-full border border-blue-500/20" />
            </div>

            {/* Scanning Beam (Central) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] animate-[spin_4s_linear_infinite] origin-center">
                    <div className="w-full h-1/2 bg-gradient-to-t from-transparent via-blue-500/10 to-transparent blur-sm" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
                </div>
            </div>

            {/* Individual Concentric Orbits */}
            <div className="absolute inset-0 flex items-center justify-center">
                {scannedServers.map((srv, i) => {
                    // Calculate unique orbit size for each server
                    // Start at 160px diameter, add 90px per server
                    const size = 160 + (i * 90);
                    const duration = 15 + (i * 5); // Outer orbits move slower
                    const isReverse = i % 2 === 1; // Alternate directions

                    return (
                        <div
                            key={srv.id}
                            className="absolute rounded-full border border-dashed border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center transition-all duration-1000"
                            style={{
                                width: size,
                                height: size,
                                animation: `spin ${duration}s linear infinite ${isReverse ? 'reverse' : 'normal'}`
                            }}
                        >
                            {/* The Titan Satellite Probe */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <motion.button
                                    onClick={() => onSelectServer(srv.id)}
                                    whileHover={{ scale: 1.2 }}
                                    style={{ animation: `spin ${duration}s linear infinite ${isReverse ? 'normal' : 'reverse'}` }} // Counter-rotate to keep upright
                                    className="relative cursor-pointer group/planet"
                                >
                                    {/* Custom "Circular Satellite" Design */}
                                    <div className="relative w-8 h-8 flex items-center justify-center scale-90 md:scale-100">
                                        {/* Solar Wings Effect */}
                                        <div className="absolute inset-x-[-8px] h-[2px] bg-blue-500/40 rounded-full" />

                                        {/* Core Body */}
                                        <div className="relative w-6 h-6 bg-zinc-100 dark:bg-black rounded-full border-[2px] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center justify-center overflow-hidden z-10">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                            {/* Tech lines */}
                                            <div className="absolute inset-0 border-t border-blue-500/20 rotate-45" />
                                            <div className="absolute inset-0 border-b border-blue-500/20 -rotate-45" />
                                        </div>

                                        {/* Antenna */}
                                        <div className="absolute -top-1 w-px h-3 bg-blue-500/50" />
                                    </div>

                                    {/* Label Tag */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-white/90 dark:bg-black/80 backdrop-blur rounded-lg border border-black/5 dark:border-white/10 shadow-xl whitespace-nowrap z-20 pointer-events-none opacity-0 group-hover/planet:opacity-100 transition-opacity">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-[8px] font-black uppercase tracking-wider text-blue-600">Orbit {i + 1}</span>
                                            <span className="text-[10px] font-bold font-mono text-zinc-900 dark:text-white leading-none">Port {srv.port}</span>
                                        </div>
                                    </div>
                                </motion.button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Central Hub (Localhost) */}
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Sector</span>
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-200">LOCALHOST</span>
                </div>
                <div className="w-px h-6 bg-black/5 dark:bg-white/5" />
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${scannedServers.length > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                    <span className="text-[9px] font-mono text-zinc-400">{scannedServers.length} Apps</span>
                </div>
            </div>
        </div>
    );
}
