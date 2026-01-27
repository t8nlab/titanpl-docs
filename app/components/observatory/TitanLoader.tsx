'use client';

import { motion } from 'framer-motion';

export default function TitanLoader({ size = 20, className = '' }: { size?: number; className?: string }) {
    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            {/* Core Planet */}
            <motion.div
                className="absolute inset-0 m-auto rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: '40%', height: '40%' }}
            />

            {/* Inner Fast Orbit */}
            <motion.div
                className="absolute inset-0 rounded-full border-[1.5px] border-blue-400/80 border-t-transparent border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />

            {/* Middle Orbit */}
            <motion.div
                className="absolute inset-[-30%] rounded-full border border-indigo-500/30 border-b-transparent border-r-transparent"
                animate={{ rotate: -180 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                style={{ width: '160%', height: '160%', left: '-30%', top: '-30%' }}
            />

            {/* Outer Slow Orbit  */}
            {/* <motion.div
                className="absolute rounded-full border border-zinc-500/10 border-t-zinc-400/20"
                style={{ width: '220%', height: '220%', left: '-60%', top: '-60%' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            /> */}
        </div>
    );
}
