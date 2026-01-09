"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface VideoLoaderProps {
    text?: string
    duration?: number
    className?: string
}

export default function VideoLoader({
    text = "Titan Planet",
    duration = 2200,
    className = ""
}: VideoLoaderProps) {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Disable scrolling while loading
        document.body.style.overflow = "hidden"

        const timer = setTimeout(() => {
            setLoading(false)
            // Re-enable scrolling
            document.body.style.overflow = ""
        }, duration)

        return () => {
            clearTimeout(timer)
            document.body.style.overflow = ""
        }
    }, [duration])

    return (
        <AnimatePresence mode="wait">
            {loading && (
                <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(10px)" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black ${className}`}
                >
                    <div className="relative h-full w-full overflow-hidden">
                        <video
                            src="/titan-anime.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 h-full w-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center w-full">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            >
                                <h1 className="text-4xl font-bold tracking-[0.2em] text-white sm:text-6xl uppercase">
                                    {text}
                                </h1>
                                <div className="mt-4 h-1 w-24 mx-auto bg-blue-500 rounded-full" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
