"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, FlaskConical } from "lucide-react"
import { Orbitron } from "next/font/google"
import Image from "next/image"

const orbitron = Orbitron({ subsets: ["latin"] })

export default function PlanetPage() {
    return (
        <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-white">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/orbit-system.png"
                    alt="Titan Playground Background"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4">
                {/* Japanese Text (Decoration) */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mb-2 text-blue-300 font-mono tracking-[0.5em] text-sm md:text-base"
                >
                    タイタン実験
                </motion.div>

                {/* Main Title */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className={`${orbitron.className} mb-6 text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-2xl`}
                >
                    TITAN EXPERIMENTS
                </motion.h1>

                {/* Coming Soon */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="flex items-center gap-4"
                >
                    <div className="h-[1px] w-12 bg-blue-500/50" />
                    <p className="text-xl md:text-2xl font-light tracking-widest text-blue-200 uppercase">
                        Playground
                    </p>
                    <div className="h-[1px] w-12 bg-blue-500/50" />
                </motion.div>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="mt-8 max-w-lg text-sm md:text-base text-gray-300/80 leading-relaxed font-light"
                >
                    This will be a playground for users to test minimal code of the Titan Planet framework.
                    Experiment with the raw power of the Gravity Runtime.
                </motion.p>

                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    className="mt-12"
                >
                    <Link
                        href="/"
                        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Return to Earth
                    </Link>
                </motion.div>
            </div>

            {/* Decorative Lines */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-30" />

        </main>
    )
}
