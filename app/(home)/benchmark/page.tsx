'use client';

import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import VideoLoader from '@/app/components/VideoLoader';

const BenchmarkPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-[#030303] text-black dark:text-white flex items-center justify-center overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50 dark:opacity-100">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 text-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center max-w-2xl mx-auto"
                >
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 mb-8 backdrop-blur-sm"
                    >
                        <Construction size={48} className="text-blue-600 dark:text-blue-400" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-black to-black/60 dark:from-white dark:to-white/60"
                    >
                        Benchmarks In Progress
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-10 leading-relaxed"
                    >
                        We are currently running comprehensive performance tests against the latest version of Titan Planet.
                        Detailed charts, comparisons, and methodology will be published here shortly.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-2 px-8 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold hover:scale-105 transition-all shadow-lg"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Return Home
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default BenchmarkPage;
