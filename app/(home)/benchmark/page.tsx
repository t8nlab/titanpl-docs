'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    Layers,
    Activity,
    ArrowRight,
    CheckCircle2,
    Gauge,
    Cpu,
    MousePointer2,
    TrendingUp,
    Clock,
    ZapOff
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
} from 'recharts';
import { useVersion } from '@/context/VersionContext';
import Link from 'next/link';
import VideoLoader from '@/app/components/VideoLoader';

const throughputData = [
    { name: 'Express', value: 102380, color: '#666' },
    { name: 'Titan Planet', value: 144370, color: '#3b82f6' },
];

const scaleData = [
    { name: '10 Routes', titan: 12, express: 20 },
    { name: '500 Routes', titan: 22, express: 120 },
    { name: '1k Routes', titan: 35, express: 280 },
    { name: '2k Routes', titan: 35, express: 546 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md transition-colors">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm font-bold flex items-center gap-2" style={{ color: entry.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.name}: {entry.value.toLocaleString()} {entry.unit || ''}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const BenchmarkPage = () => {
    const { titanVersion, expressVersion } = useVersion();
    const [animationsEnabled, setAnimationsEnabled] = useState(false);

    useEffect(() => {
        // Wait for VideoLoader (2200ms) + small buffer
        const timer = setTimeout(() => {
            setAnimationsEnabled(true);
        }, 2400);
        return () => clearTimeout(timer);
    }, []);

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#030303] text-black dark:text-white selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300">
            <VideoLoader text="Analyzing Performance" />
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50 dark:opacity-100">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
                {/* Hero Section */}
                <motion.div
                    initial="initial"
                    animate={animationsEnabled ? "animate" : "initial"}
                    variants={staggerContainer}
                    className="text-center mb-24"
                >
                    <motion.div
                        variants={fadeIn}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] md:text-sm font-medium mb-6"
                    >
                        <Activity size={12} />
                        <span>Updated Jan 16, 2026</span>
                    </motion.div>

                    <motion.h1
                        variants={fadeIn}
                        className="text-4xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-black to-black/60 dark:from-white dark:to-white/60"
                    >
                        Titan Planet vs Express
                    </motion.h1>

                    <motion.p
                        variants={fadeIn}
                        className="text-base md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Performance testing conducted to compare Titan Planet ({titanVersion}) against Express ({expressVersion}) under realistic high-pressure scenarios.
                    </motion.p>

                    <motion.div
                        variants={fadeIn}
                        className="mt-8 flex flex-wrap justify-center gap-3"
                    >
                        {['Windows', '16GB RAM', 'Autocannon', '500 Connections'].map((spec, i) => (
                            <span key={i} className="px-3 py-1 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                {spec}
                            </span>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Test 1: Concurrency */}
                <motion.section
                    initial="initial"
                    animate={animationsEnabled ? "animate" : "initial"}
                    variants={fadeIn}
                    className="mb-32"
                >
                    <div className="flex flex-col lg:flex-row gap-12 items-start transition-all">
                        <div className="flex-1 w-full space-y-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <Zap className="text-blue-600 dark:text-blue-400" size={20} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold transition-colors">High Pressure Concurrency</h2>
                                </div>
                                <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                                    Measuring raw throughput and latency with 500 concurrent connections using a minimal "Hello World" payload.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.05] backdrop-blur-sm">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-[10px] md:text-sm text-neutral-500 mb-1">Total Requests</p>
                                            <h3 className="text-xl md:text-2xl font-bold transition-colors">144,370</h3>
                                        </div>
                                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xs md:text-base">+41%</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '100%' }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                                        />
                                    </div>
                                    <p className="mt-2 text-[10px] text-neutral-500 uppercase tracking-widest">Titan Planet</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.05] backdrop-blur-sm">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-[10px] md:text-sm text-neutral-500 mb-1">Total Requests</p>
                                            <h3 className="text-xl md:text-2xl font-bold text-neutral-700 dark:text-neutral-500 transition-colors">102,380</h3>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '70.9%' }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                            className="h-full bg-neutral-600"
                                        />
                                    </div>
                                    <p className="mt-2 text-[10px] text-neutral-500 uppercase tracking-widest">Express</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 w-full pt-1">
                            {[
                                { label: 'Req/Sec', value: '14,437', sub: 'Titan', icon: Gauge, color: 'text-blue-600 dark:text-blue-400' },
                                { label: 'Latency', value: '14.9ms', sub: 'Titan', icon: Clock, color: 'text-blue-600 dark:text-blue-400' },
                                { label: 'Memory', value: '≈ 60.5MB', sub: 'Titan', icon: Cpu, color: 'text-blue-600 dark:text-blue-400' },
                                { label: 'Req/Sec', value: '10,238', sub: 'Express', icon: ZapOff, color: 'text-neutral-500 uppercase text-[10px] font-bold' },
                                { label: 'Latency', value: '21.1ms', sub: 'Express', icon: Clock, color: 'text-neutral-500 uppercase text-[10px] font-bold' },
                                { label: 'Memory', value: '≈ 65.2 MB', sub: 'Express', icon: Cpu, color: 'text-neutral-500 uppercase text-[10px] font-bold' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="p-4 md:p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.05] transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                                >
                                    <stat.icon className={`${stat.color} mb-4`} size={18} />
                                    <p className="text-xl md:text-3xl font-bold mb-1 transition-colors">{stat.value}</p>
                                    <p className="text-[10px] md:text-sm text-neutral-500 transition-colors">{stat.label} · {stat.sub}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>


                </motion.section>

                {/* Test 2: Deep Routing */}
                <motion.section
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    className="mb-32"
                >
                    <div className="relative p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-blue-600/[0.1] via-transparent to-purple-600/[0.1] border border-black/5 dark:border-white/10 overflow-hidden shadow-sm transition-colors">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Layers size={200} />
                        </div>

                        <div className="relative z-10 max-w-3xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                    <Layers className="text-purple-600 dark:text-purple-400" size={20} />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold transition-colors">Deep Routing Scale</h2>
                            </div>
                            <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300 mb-10 leading-relaxed transition-colors">
                                Testing the last route in a large 2,000-route application with 500 concurrent connections.
                            </p>

                            <div className="flex flex-col gap-8">
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg md:text-xl font-medium transition-colors">Titan Planet</span>
                                        <span className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 transition-colors">16x Faster</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <p className="text-[10px] md:text-sm text-neutral-500 mb-1 font-mono uppercase transition-colors">Throughput</p>
                                            <p className="text-xl md:text-2xl font-bold transition-colors">144,000</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-sm text-neutral-500 mb-1 font-mono uppercase transition-colors">Avg Speed</p>
                                            <p className="text-xl md:text-2xl font-bold transition-colors">14,400 Req/s</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-sm text-neutral-500 mb-1 font-mono uppercase transition-colors">Latency</p>
                                            <p className="text-xl md:text-2xl font-bold transition-colors">35ms</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-sm text-neutral-500 mb-1 font-mono uppercase transition-colors">Memory</p>
                                            <p className="text-xl md:text-2xl font-bold transition-colors">≈ 60.5MB</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-black/10 dark:bg-white/10 transition-colors" />

                                <div className="opacity-60">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg md:text-xl font-medium transition-colors">Express</span>
                                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-mono uppercase transition-colors">Slowest</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-neutral-600 dark:text-neutral-400 transition-colors">
                                        <div>
                                            <p className="text-[10px] md:text-sm text-neutral-700 dark:text-neutral-500 mb-1 font-mono uppercase">Throughput</p>
                                            <p className="text-xl md:text-2xl font-bold">8,995</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-sm text-neutral-700 dark:text-neutral-500 mb-1 font-mono uppercase">Avg Speed</p>
                                            <p className="text-xl md:text-2xl font-bold">899.5 Req/s</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-sm text-neutral-700 dark:text-neutral-500 mb-1 font-mono uppercase">Latency</p>
                                            <p className="text-xl md:text-2xl font-bold">546ms</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-sm text-neutral-700 dark:text-neutral-500 mb-1 font-mono uppercase">Memory</p>
                                            <p className="text-xl md:text-2xl font-bold">≈ 65.2MB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart 2: Latency Spline */}
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="mt-12 min-h-[300px] md:min-h-[400px] bg-black/[0.03] dark:bg-white/[0.03] rounded-3xl p-4 md:p-8 border border-black/5 dark:border-white/[0.05] transition-colors"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Latency Growth vs. Scale (ms)</p>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Titan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Express</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full min-h-0 min-w-0" style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <AreaChart data={scaleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTitan" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpress" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#888" fontSize={8} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888" fontSize={8} tickLine={false} axisLine={false} unit="ms" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="express" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpress)" name="Express" />
                                    <Area type="monotone" dataKey="titan" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTitan)" name="Titan Planet" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </motion.section>

                {/* Detailed Analysis */}
                <div className="grid md:grid-cols-3 gap-8 mb-32">
                    {[
                        {
                            title: "Smart Routing",
                            desc: "Express uses linear routing. TitanPL’s Orbit System delivers constant-time routing, 10 or 10,000 routes – it doesn't matter.",
                            icon: MousePointer2
                        },
                        {
                            title: "No Event-Loop Blocking",
                            desc: "Titan's core orchestration is in Rust. No overhead from heavy JS metadata on the event loop.",
                            icon: Cpu
                        },
                        {
                            title: "Native Performance",
                            desc: "Compiles to binary. Multi-threaded core handles heavy tasks that choke traditional Node.js servers.",
                            icon: TrendingUp
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            variants={fadeIn}
                            className="p-6 md:p-8 rounded-3xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/[0.04] flex flex-col items-center text-center transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                                <item.icon size={20} className="text-blue-600 dark:text-blue-400 transition-colors" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold mb-4 transition-colors">{item.title}</h3>
                            <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed transition-colors">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Final Verdict */}
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    className="relative rounded-[2rem] md:rounded-[3rem] bg-black dark:bg-white text-white dark:text-black p-8 md:p-20 overflow-hidden shadow-2xl transition-all"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none">
                        <CheckCircle2 size={300} />
                    </div>

                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-bold mb-8 italic tracking-tighter transition-colors">The Winner.</h2>
                        <p className="text-xl md:text-2xl font-medium mb-12 leading-tight opacity-90 transition-colors">
                            For large-scale applications with many routes and high concurrency, Titan Planet is the clear winner.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <Link
                                href="/docs"
                                className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-white dark:bg-black text-black dark:text-white rounded-full font-bold hover:scale-105 transition-all shadow-lg text-sm md:text-base"
                            >
                                Start Building <ArrowRight size={18} /> <span className="lg:flex hidden">{titanVersion} STABLE</span>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                .glass-card {
                  background: rgba(255, 255, 255, 0.03);
                  backdrop-filter: blur(10px);
                  border: 1px solid rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </div>
    );
};

export default BenchmarkPage;
