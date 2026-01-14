"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Status = "ALPHA" | "BETA" | "STABLE"

interface StatusBadgeProps {
    status: Status
    className?: string
}

const statusConfig = {
    ALPHA: {
        color: "purple",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        text: "text-purple-500",
        shadow: "shadow-[0_0_10px_-3px_rgba(168,85,247,0.3)]",
        dot: "bg-purple-500",
        explanation: "Early preview. APIs may change drastically. Use with caution.",
    },
    BETA: {
        color: "blue",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-500",
        shadow: "shadow-[0_0_10px_-3px_rgba(59,130,246,0.3)]",
        dot: "bg-blue-500",
        explanation: "Feature complete. Stable enough for testing, but bugs may exist.",
    },
    STABLE: {
        color: "emerald",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-500",
        shadow: "shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]",
        dot: "bg-emerald-500",
        explanation: "Production ready. Reliable, tested, and fully supported.",
    },
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const config = statusConfig[status]

    // Close popup when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <span className="relative inline-flex" ref={containerRef}>
            <motion.span
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`cursor-pointer inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-colors ${config.bg} ${config.border} ${config.text} ${config.shadow} ${className}`}
            >
                <span className="mr-1.5 flex h-1.5 w-1.5 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`}></span>
                </span>
                {status}
            </motion.span>

            <AnimatePresence>
                {isOpen && (
                    <motion.span
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 w-48 -translate-x-1/2 left-1/2 p-3 rounded-lg border bg-popover text-popover-foreground shadow-lg backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800"
                        style={{ left: "50%", transform: "translateX(-50%)" }}
                    >
                        <span className="text-xs font-medium leading-relaxed text-center block">
                            {config.explanation}
                        </span>
                        {/* Arrow/Triangle */}
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-l border-t bg-inherit border-zinc-200 dark:border-zinc-800" />
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    )
}
