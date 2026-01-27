'use client';

import { motion, useScroll } from 'framer-motion';
import { Download, Activity, Layers, Search, Telescope } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import VideoLoader from '@/app/components/VideoLoader';

export default function ObservatoryDownloadPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });
    const [activeTab, setActiveTab] = useState<'scan' | 'active'>('active');

    return (
        <div ref={containerRef} className="min-h-screen w-full bg-[#050505] text-zinc-100 font-sans tracking-tight overflow-x-hidden selection:bg-indigo-500/30">
            <VideoLoader text="TitanPl Observatory" />

            {/* Premium Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />

                {/* Sharp Technical Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Navigation - Glass Strip */}
            <nav className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 backdrop-blur-xl border-b border-white/5 bg-[#050505]/60 z-[100]">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
                        <Telescope size={16} strokeWidth={2} />
                    </div>
                    <span className="text-sm font-bold tracking-wider uppercase text-white">Titan<span className="text-indigo-400">PL</span></span>
                </Link>
                <div className="flex items-center gap-6">
                    <Link href="/docs" className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Docs</Link>
                    <Link href="/observatory" className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Web App</Link>
                </div>
            </nav>

            <main className="relative z-10 pt-32 pb-32">
                {/* Hero Section */}
                <section className="px-6 md:px-12 max-w-[1200px] mx-auto mb-32">
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20">
                        {/* Pill Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 mb-8"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse box-shadow-glow" />
                            Titan Development Suite
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-semibold tracking-tighter mb-6 leading-[1.1] text-white"
                        >
                            Craft Perfect <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300">Servers With TitanPl.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-zinc-400 max-w-xl leading-relaxed mb-10 font-light"
                        >
                            The professional environment for validating Titan servers. <br />
                            Establish local orbits, probe routes, and debug with zero overhead.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col items-center"
                        >
                            <Link
                                href="https://drive.google.com/file/d/1Vq2z6NYh0qSQr9XWO2fXqlBtqAzDJImH/view?usp=drive_link"
                                download={true}
                                className="group relative inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold tracking-wide transition-all overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <Download size={18} className="text-indigo-600" />
                                <span>DOWNLOAD OBSERVATORY</span>
                                <span className="text-[10px] font-medium text-zinc-500 ml-2 pt-0.5 border-l border-zinc-300 pl-3">v1.2.4</span>
                            </Link>

                            <div className="mt-6 flex flex-col items-center justify-center gap-2 text-[10px] font-mono text-zinc-500">
                                <span className="flex items-center gap-2 uppercase tracking-wider"><div className="w-1 h-1 bg-emerald-500 rounded-full box-shadow-glow" /> Stable Release</span>
                                <span className="opacity-50">Auto-updates enabled</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* App Preview - Glass Window */}
                    <div className="mt-16 relative max-w-5xl mx-auto group">
                        {/* Ambient Glow behind window */}
                        <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000" />

                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="relative rounded-2xl border border-white/10 bg-[#0B1120]/60 backdrop-blur-3xl shadow-2xl overflow-hidden ring-1 ring-black/20"
                        >
                            {/* Window Header - Frosted Glass */}
                            <div className="h-12 bg-white/[0.03] border-b border-white/5 flex items-center px-5 gap-4 select-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                                {/* Traffic Lights */}
                                <div className="flex gap-2 group/lights">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]/50 shadow-sm" />
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]/50 shadow-sm" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]/50 shadow-sm" />
                                </div>

                                {/* Separator */}
                                <div className="h-4 w-[1px] bg-white/5 mx-2" />

                                {/* Tabs - Glass Pill */}
                                <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                                    <button
                                        onClick={() => setActiveTab('active')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'active' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Live
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('scan')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'scan' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Scan
                                    </button>
                                </div>
                                <div className="ml-auto text-[10px] font-mono font-medium text-white/20 uppercase tracking-[0.2em] hidden md:block text-shadow-sm">Titan // Observatory</div>
                            </div>

                            <div className="relative bg-black/80">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative w-full"
                                >
                                    <Image
                                        src={activeTab === 'active' ? "/observatory_preview_active.png" : "/observatory_preview_empty.png"}
                                        alt="Interface Preview"
                                        width={1920}
                                        height={1080}
                                        quality={100}
                                        priority={true}
                                        unoptimized={true}
                                        className="w-full h-auto shadow-2xl opacity-100"
                                    />
                                </motion.div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-10 pointer-events-none" />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features - Glass Cards */}
                <section className="px-6 md:px-12 max-w-[1200px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Layers,
                                title: "Multi-Orbit Control",
                                desc: "Centralize your infrastructure. Manage multiple Titan server instances from a single, unified command deck."
                            },
                            {
                                icon: Search,
                                title: "Route Probing",
                                desc: "Zero-latency testing. Fire browser-like GET requests and inspect responses instantly with raw socket access."
                            },
                            {
                                icon: Activity,
                                title: "Precision Testing",
                                desc: "A pristine environment for validation. Monitor heartbeats and system stability without browser overhead."
                            }
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/[0.02] backdrop-blur-md border border-white/5 p-8 rounded-xl hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group"
                            >
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]">
                                    <f.icon size={20} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">{f.title}</h3>
                                <p className="text-zinc-500 leading-relaxed text-sm">
                                    {f.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <section className="mt-32 border-t border-white/5 pt-12 pb-12 text-center">
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">TitanPl Protocol // Professional Edition</p>
                    <div className="flex justify-center gap-8">
                        <Link href="/" className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors uppercase tracking-wider">Home</Link>
                        <Link href="https://github.com/ezet-galaxy/titanpl" className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors uppercase tracking-wider">GitHub</Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
