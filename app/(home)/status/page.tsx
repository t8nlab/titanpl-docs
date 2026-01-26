'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    Activity,
    Globe,
    Cpu,
    Box,
    Layers,
    Puzzle,
    RefreshCw,
    Shield,
    CheckCircle2,
    Info
} from 'lucide-react';
import { useState, useEffect } from 'react';

const StatusPage = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleTimeString());
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            setLastUpdated(new Date().toLocaleTimeString());
        }, 1200);
    };

    const systems = [
        {
            name: "Orbit System",
            description: "Core routing & orchestration",
            status: "operational",
            uptime: "99.99%",
            icon: Layers
        },
        {
            name: "Gravity Runtime",
            description: "V8 execution engine",
            status: "operational",
            uptime: "100%",
            icon: Cpu
        },
        {
            name: "Titan SDK",
            description: "Development toolkit",
            status: "operational",
            uptime: "100%",
            icon: Box
        },
        {
            name: "Extensions Registry",
            description: "Package distribution",
            status: "operational",
            uptime: "99.95%",
            icon: Puzzle
        },
        {
            name: "Documentation",
            description: "https://titan-docs-ez.vercel.app/docs",
            status: "operational",
            uptime: "100%",
            icon: Globe
        },
        {
            name: "Auth Services",
            description: "Authentication & Security",
            status: "operational",
            uptime: "100%",
            icon: Shield
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-24 relative overflow-hidden">
            {/* Background glow - Persistent matching landing page */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[100px] opacity-80 mix-blend-screen dark:opacity-20 dark:bg-blue-500/10 dark:blur-[120px]" />
                <div className="absolute left-0 top-[40%] h-[500px] w-[500px] -translate-x-1/3 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px] opacity-50 mix-blend-screen dark:opacity-10 dark:bg-cyan-400/5" />
                <div className="absolute right-0 top-[60%] h-[500px] w-[500px] translate-x-1/3 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px] opacity-50 mix-blend-screen dark:opacity-10 dark:bg-purple-500/5" />
            </div>


            <div className="relative z-10 max-w-5xl mx-auto px-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 mb-4"
                        >
                            <div className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </div>
                            <span className="text-emerald-600 dark:text-emerald-500 font-semibold tracking-wide text-xs uppercase">All Systems Operational</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                        >
                            System Status
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-muted-foreground max-w-xl leading-relaxed"
                        >
                            Real-time status updates for Titan Planet services, APIs, and infrastructure.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-end gap-2"
                    >
                        <button
                            onClick={handleRefresh}
                            className="group flex items-center gap-2 px-5 py-2 rounded-md bg-background border hover:bg-muted transition-all"
                        >
                            <RefreshCw size={14} className={cn("text-muted-foreground transition-transform duration-700", isRefreshing && "animate-spin")} />
                            <span className="text-sm font-medium">Refresh</span>
                        </button>
                        <span className="text-xs text-muted-foreground font-mono">
                            Last updated: {lastUpdated}
                        </span>
                    </motion.div>
                </div>

                {/* Overall Status Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12 relative overflow-hidden rounded-xl border bg-background/50 backdrop-blur-md p-8 sm:p-10"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <Activity className="text-emerald-500" size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Operational</h2>
                            <p className="text-muted-foreground text-base">
                                All Titan Planet systems are currently running within normal operating parameters.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Systems Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-24"
                >
                    {systems.map((system, i) => (
                        <motion.div
                            key={i}
                            variants={item}
                            className="group relative p-6 rounded-xl border bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 rounded-lg bg-secondary/50 group-hover:bg-secondary transition-colors">
                                    <system.icon size={20} className="text-foreground" />
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active</span>
                                </div>
                            </div>

                            <h3 className="text-base font-semibold mb-1">{system.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{system.description}</p>

                            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                                <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Uptime</span>
                                <span className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400">{system.uptime}</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Maintenance Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 p-6 rounded-lg border border-blue-500/20 bg-blue-500/5"
                >
                    <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground">No Active Maintenance</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Builds and deployments are functioning normally. No scheduled downtime for the next 7 days.
                        </p>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default StatusPage;
