
"use client"

import React, { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import {
    Globe, Cpu, Database, Cog, Zap, Server, Activity,
    FileCode, FileJson, Package, ArrowRight, Layers,
    Play, Repeat, Users, TerminalSquare, Box, Binary
} from "lucide-react"
import { motion, AnimatePresence, useInView } from "framer-motion"

gsap.registerPlugin(MotionPathPlugin)

// --- Configuration ---
const COLORS = {
    js: "#facc15",      // Yellow (JS Files)
    json: "#a3e635",    // Lime (JSON)
    cli: "#fff",        // White (CLI)
    orbit: "#10b981",   // Emerald (Routing)
    gravity: "#3b82f6", // Blue (V8 Worker)
    rust: "#f97316",    // Orange (Rust Core)
    drift: "#ec4899",   // Pink (Suspension)
    user: "#ffffff",
}

const TABS = [
    { id: "build", label: "1. Build Phase", icon: Package },
    { id: "runtime", label: "2. Runtime Architecture", icon: Layers },
    { id: "traffic", label: "3. Live Traffic", icon: Activity },
]

export default function WorkflowSection() {
    const [activeTab, setActiveTab] = useState("build")
    const [hoveredFile, setHoveredFile] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(containerRef, { once: true, amount: 0.2 })
    const svgRef = useRef<SVGSVGElement>(null)

    // Generic Refs (re-used across modes to simplify)
    const group1Ref = useRef<SVGGElement>(null)
    const group2Ref = useRef<SVGGElement>(null)
    const group3Ref = useRef<SVGGElement>(null)
    const group4Ref = useRef<SVGGElement>(null)
    const particlesRef = useRef<SVGGElement>(null)

    useEffect(() => {
        if (!isInView) return

        const ctx = gsap.context(() => {
            gsap.killTweensOf("*")
            const tl = gsap.timeline()

            // --- SCENE 1: BUILD ---
            if (activeTab === "build") {
                // Setup initial positions
                gsap.set(".file-input", { opacity: 0, x: -50 })
                gsap.set(".cli-box", { scale: 0.8, opacity: 0 })
                // Important: Hydrate GSAP with the initial transform from SVG attribute to ensure absolute animating works correctly
                gsap.set(".artifact-group", { opacity: 0, scale: 0.8, x: 620, y: 100 })

                // 1. Inputs appear
                tl.to(".file-input", { opacity: 1, x: 0, stagger: 0.1, duration: 0.5 })

                // 2. CLI appears
                tl.to(".cli-box", { opacity: 1, scale: 1, duration: 0.5 }, "-=0.2")

                // 3. Process (Files move to CLI)
                tl.to(".file-input", { x: 300, y: 150, opacity: 0, scale: 0.5, duration: 0.8, ease: "back.in(1.7)" })

                // 4. CLI Pulse (Compiling)
                tl.to(".cli-inner", { rotation: 360, duration: 1, ease: "power2.inOut" })
                tl.to(".cli-box", { borderColor: COLORS.rust, duration: 0.2, yoyo: true, repeat: 3 }, "<")

                // 5. Artifacts Explode Out
                // Just Reveal it in place
                tl.to(".artifact-group", { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.2)" })

                // 6. CLEANUP & CENTER
                // Fade out everything except the artifact
                tl.to([".build-stage-inputs", ".build-stage-cli", ".build-arrow"], { opacity: 0, duration: 0.5 }, "+=0.5")

                // Move Artifacts to DEAD CENTER
                // Canvas: 900x600. Box: 240x320.
                // Center X = (900 - 240) / 2 = 330.
                // Center Y = (600 - 320) / 2 = 140.
                tl.to(".artifact-group", { x: 330, y: 140, duration: 1, ease: "power3.inOut" }, "<")
            }

            // --- SCENE 2: RUNTIME INIT ---
            if (activeTab === "runtime") {
                gsap.set(".metadata-file", { opacity: 0, y: -20 })
                gsap.set(".orbit-system", { opacity: 0, scale: 0.8 })
                // Important: Animate the inner content to preserve layout transforms
                gsap.set(".worker-inner", { opacity: 0, scale: 0 })

                // 1. Orbit System inits
                tl.to(".orbit-system", { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.75)" })

                // 2. Metadata loads (ActionMap & Routes)
                tl.to(".metadata-file", { opacity: 1, y: 0, stagger: 0.2, duration: 0.5 })

                // Files absorb into Orbit
                tl.to(".metadata-file", { y: 150, opacity: 0, scale: 0.5, duration: 0.6 })
                tl.to(".orbit-inner", { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1, borderColor: COLORS.orbit }, "-=0.2")

                // 3. Spawning Workers (Threads)
                tl.to(".worker-inner", {
                    opacity: 1,
                    scale: 1,
                    stagger: 0.1,
                    duration: 0.6,
                    ease: "back.out(1.5)",
                    onStart: () => {
                        // Flash Orbit as it spawns
                        gsap.to(".orbit-connection", { strokeDashoffset: 0, duration: 0.5 })
                    }
                })
            }


            // --- SCENE 3: LIVE TRAFFIC (The "Perfect Drift" Demo) ---
            // --- SCENE 3: LIVE TRAFFIC (The "Perfect Drift" Demo) ---
            if (activeTab === "traffic") {
                const reqGroups = gsap.utils.toArray(".user-req") as SVGElement[];
                const reqDots = gsap.utils.toArray(".req-dot") as SVGElement[];
                const reqSquares = gsap.utils.toArray(".req-square") as SVGElement[];

                // Reset Visuals
                gsap.set(reqGroups, { opacity: 0, x: 50, y: 300, scale: 0 })
                gsap.set(reqDots, { fill: "#ffffff", opacity: 1, scale: 1 })
                gsap.set(reqSquares, { fill: "#ffffff", opacity: 0, scale: 0 })
                gsap.set(".worker-status-text", { textContent: "IDLE", fill: "#94a3b8" })
                gsap.set(".worker-bg", { stroke: COLORS.gravity })
                gsap.set(".rust-core-layer", { opacity: 0.2 })

                // Create a master timeline for the traffic simulation
                const demoTl = gsap.timeline({ repeat: -1, repeatDelay: 1 })

                // SIMULATION: 3 Concurrent Requests
                // Request A: Goes to Worker 0 (Standard)
                // Request B: Goes to Worker 1 (Drifts -> Shows Worker Freeing Up)
                // Request C: Goes to Worker 2 (Standard)

                // Light up Rust Core
                demoTl.to(".rust-core-layer", { opacity: 1, duration: 0.5 })

                // --- PHASE 1: INGEST ---
                // Spawn 3 requests
                demoTl.to(reqGroups, {
                    opacity: 1, scale: 1,
                    x: 250, y: 300,
                    stagger: 0.2,
                    duration: 0.6,
                    ease: "back.out"
                }, "start")

                // Orbit Processing
                demoTl.to(reqGroups, {
                    x: 400,
                    duration: 0.4,
                    ease: "power2.inOut"
                }, "orbit")

                // --- PHASE 2: DISTRIBUTION ---
                // Req 0 -> Worker 0
                demoTl.to(reqGroups[0], { x: 600, y: 100, duration: 0.5, ease: "power2.inOut" }, "distribute")
                // Req 1 -> Worker 1
                demoTl.to(reqGroups[1], { x: 600, y: 250, duration: 0.5, ease: "power2.inOut" }, "distribute+=0.1")
                // Req 2 -> Worker 2
                demoTl.to(reqGroups[2], { x: 600, y: 400, duration: 0.5, ease: "power2.inOut" }, "distribute+=0.2")

                // Workers turn BUSY
                demoTl.to("#worker-0 .worker-bg", { stroke: COLORS.js, duration: 0.1 }, "distribute+=0.4")
                demoTl.to("#worker-0 .worker-status-text", { textContent: "BUSY", fill: COLORS.js, duration: 0.1 }, "distribute+=0.4")

                demoTl.to("#worker-1 .worker-bg", { stroke: COLORS.drift, duration: 0.1 }, "distribute+=0.5") // Worker 1 gets drift color briefly
                demoTl.to("#worker-1 .worker-status-text", { textContent: "STARTING", fill: COLORS.drift, duration: 0.1 }, "distribute+=0.5")

                demoTl.to("#worker-2 .worker-bg", { stroke: COLORS.js, duration: 0.1 }, "distribute+=0.6")
                demoTl.to("#worker-2 .worker-status-text", { textContent: "BUSY", fill: COLORS.js, duration: 0.1 }, "distribute+=0.6")


                // --- PHASE 3: THE DRIFT (Worker 1) ---
                // Req 1 (Worker 1) hits "drift" and drops down
                demoTl.addLabel("drift_start")

                // 1. CAR DRIFT ANIMATION
                // Rotate and slide out to simulate loss of traction/drifting into async mode
                demoTl.to(reqGroups[1], {
                    rotation: 360,
                    x: "+=50",
                    scale: 1.2,
                    duration: 0.4,
                    ease: "back.in(2)"
                }, "drift_start")

                demoTl.to(reqDots[1], { fill: COLORS.drift, duration: 0.2 }, "drift_start+=0.1")

                // 2. Drop to Rust Core (Async)
                demoTl.to(reqGroups[1], {
                    y: 520, // Bottom Rust Layer
                    x: 600, // Center on Rust lane
                    rotation: 0,
                    duration: 0.4,
                    ease: "bounce.out"
                }, "drift_start+=0.4")

                demoTl.to(reqGroups[1], { scale: 1, duration: 0.2 }, "drift_start+=0.6")


                // 3. FREE UP WORKER 1
                demoTl.to("#worker-1 .worker-bg", { stroke: COLORS.gravity, duration: 0.2 }, "drift_start+=0.5")
                demoTl.to("#worker-1 .worker-status-text", { textContent: "IDLE (FREE)", fill: "#4ade80", duration: 0.1 }, "drift_start+=0.5")


                // --- PHASE 4: CONCURRENT NEW REQUEST (Req 3) ---
                // While Req 1 is in Rust, Spawn Req 3 and send to now-free Worker 1
                demoTl.to(reqGroups[3], { opacity: 1, scale: 1, x: 250, y: 300, duration: 0.4, ease: "back.out" }, "drift_start+=0.6")
                demoTl.to(reqGroups[3], { x: 400, duration: 0.3, ease: "power2.inOut" }, ">") // Orbit

                // Send Req 3 to Worker 1 (Re-using the drifted worker!)
                demoTl.to(reqGroups[3], { x: 600, y: 250, duration: 0.5, ease: "power2.inOut" }, ">")

                // Worker 1 becomes BUSY again
                demoTl.to("#worker-1 .worker-bg", { stroke: COLORS.js, duration: 0.1 }, ">")
                demoTl.to("#worker-1 .worker-status-text", { textContent: "BUSY (NEW REQ)", fill: COLORS.js, duration: 0.1 }, "<")


                // Move Req 1 across Rust (Slow Async) - Happening in parallel
                demoTl.to(reqGroups[1], { x: 800, duration: 1.5, ease: "none" }, "drift_start+=0.8")


                // --- PHASE 5: COMPLETION ---
                // 1. Worker 0 & 2 Finish (Standard)
                demoTl.addLabel("completion")
                demoTl.to([reqDots[0], reqDots[2]], { opacity: 0, scale: 0, duration: 0.2 }, "completion")
                demoTl.to([reqSquares[0], reqSquares[2]], { opacity: 1, scale: 1, fill: "#10b981", duration: 0.2 }, "completion")
                demoTl.to([reqGroups[0], reqGroups[2]], { x: 50, y: 300, scale: 0.5, opacity: 0, duration: 0.6, ease: "power2.in" }, "completion+=0.2")

                // Free Worker 0 & 2
                demoTl.to(["#worker-0 .worker-bg", "#worker-2 .worker-bg"], { stroke: COLORS.gravity, duration: 0.2 }, "completion")
                demoTl.to(["#worker-0 .worker-status-text", "#worker-2 .worker-status-text"], { textContent: "IDLE", fill: "#94a3b8", duration: 0.1 }, "completion")


                // 2. Worker 1 Finishes Req 3 (The new one)
                demoTl.to(reqDots[3], { opacity: 0, scale: 0, duration: 0.2 }, "completion+=0.5")
                demoTl.to(reqSquares[3], { opacity: 1, scale: 1, fill: "#10b981", duration: 0.2 }, "completion+=0.5")
                demoTl.to(reqGroups[3], { x: 50, y: 300, scale: 0.5, opacity: 0, duration: 0.6, ease: "power2.in" }, "completion+=0.7")

                // Free Worker 1 again
                demoTl.to("#worker-1 .worker-bg", { stroke: COLORS.gravity, duration: 0.2 }, "completion+=0.7")
                demoTl.to("#worker-1 .worker-status-text", { textContent: "IDLE", fill: "#94a3b8", duration: 0.1 }, "completion+=0.7")


                // 3. ASYNC COMPLETE (Req 1 returns from Rust)
                // It should find a free worker. Worker 0 is free!
                demoTl.to("#worker-0 .worker-bg", { stroke: COLORS.orbit, duration: 0.1 }, "completion+=1.5")
                demoTl.to("#worker-0 .worker-status-text", { textContent: "RESUMING", fill: COLORS.orbit, duration: 0.1 }, "completion+=1.5")

                // Move Req 1 from Rust UP to Worker 0
                demoTl.to(reqGroups[1], { x: 600, y: 100, duration: 0.5, ease: "back.out" }, "completion+=1.5")
                demoTl.to(reqDots[1], { fill: "#fff", duration: 0.2 }, "completion+=1.5") // Reset color

                // Finish Req 1
                demoTl.to(reqDots[1], { opacity: 0, scale: 0, duration: 0.2 }, "+=0.2")
                demoTl.to(reqSquares[1], { opacity: 1, scale: 1, fill: "#10b981", duration: 0.2 }, "<")
                demoTl.to(reqGroups[1], { x: 50, y: 300, scale: 0.5, opacity: 0, duration: 0.6, ease: "power2.in" }, "+=0.1")

                demoTl.to("#worker-0 .worker-bg", { stroke: COLORS.gravity, duration: 0.2 }, "<")
                demoTl.to("#worker-0 .worker-status-text", { textContent: "IDLE", fill: "#94a3b8" }, "<")

                // Reset Req 3 for loop
                demoTl.set(reqGroups[3], { opacity: 0, x: 50, y: 300, scale: 0 })
                demoTl.set(reqSquares[3], { opacity: 0, scale: 0 })
                demoTl.set(reqDots[3], { opacity: 1, scale: 1, fill: "white" })
            }

        }, svgRef)

        return () => ctx.revert()
    }, [activeTab, isInView])

    return (
        <div ref={containerRef} className="group relative flex flex-col items-center overflow-hidden rounded-2xl border bg-background/40 p-6 backdrop-blur-sm transition-all hover:bg-background/60 md:p-10">

            <div className="relative z-10 w-full flex flex-col items-center">

                <div className="flex flex-col items-center mb-8 text-center max-w-3xl">


                    {/* TABS */}
                    <div className="mt-8 flex flex-wrap justify-center gap-2 p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                        {TABS.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* --- MAIN STAGE --- */}
                <div className="relative w-full aspect-[16/9] md:aspect-[2.2/1] rounded-xl border border-slate-800 shadow-2xl overflow-hidden group">

                    {/* Dynamic Glows */}
                    <div className={`absolute pointer-events-none transition-all duration-1000 blur-[100px] opacity-40
                    ${activeTab === 'build' ? 'bg-yellow-500/30 w-96 h-96 top-0 left-0' : ''}
                    ${activeTab === 'runtime' ? 'bg-emerald-500/30 w-96 h-96 bottom-0 center' : ''}
                    ${activeTab === 'traffic' ? 'bg-blue-500/30 w-full h-64 top-1/4' : ''}
                `} />

                    <svg ref={svgRef} viewBox="0 0 900 600" className="w-full h-full relative z-10 selection:bg-transparent bg-background/20" preserveAspectRatio="xMidYMid meet">

                        {/* ==================== TAB 1: BUILD PHASE ==================== */}
                        {activeTab === 'build' && (
                            <g>
                                {/* INPUT FILES */}
                                <g className="build-stage-inputs" transform="translate(100, 150)">
                                    <text x="0" y="-30" fill={COLORS.js} fontSize="14" fontWeight="bold">SOURCE CODE</text>
                                    {[0, 1, 2].map(i => (
                                        <g key={i} className="file-input" transform={`translate(${i * 10}, ${i * 30})`}>
                                            <rect width="140" height="40" rx="8" fill="#1e293b" stroke={COLORS.js} strokeWidth="1" />
                                            <text x="40" y="25" fill="white" fontSize="12" fontFamily="monospace">app/actions/{i === 0 ? 'user' : i === 1 ? 'auth' : 'post'}.js</text>
                                            <FileCode x="10" y="10" size={20} color={COLORS.js} />
                                        </g>
                                    ))}
                                </g>

                                {/* CLI PROCESS */}
                                <g className="build-stage-cli" transform="translate(400, 200)">
                                    <rect className="cli-box" width="120" height="120" rx="20" fill="#0f172a" stroke="white" strokeWidth="2" strokeDasharray="5 5" />
                                    <g className="cli-inner" transform="translate(60, 60)">
                                        <Cog size={50} color="white" x="-25" y="-25" />
                                    </g>
                                    <text x="60" y="150" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">TITAN CLI</text>
                                    <text x="60" y="170" textAnchor="middle" fill="#94a3b8" fontSize="10">Bundling & Compiling...</text>
                                </g>

                                {/* ARROWS */}
                                <path d="M 260 200 L 380 250" stroke="white" strokeWidth="2" strokeDasharray="4 4" className="build-arrow opacity-30" />
                                <path d="M 540 250 L 640 200" stroke="white" strokeWidth="2" strokeDasharray="4 4" className="build-arrow opacity-30" />


                                {/* OUTPUT ARTIFACTS */}
                                <g className="artifact-group cursor-pointer" transform="translate(620, 100)">
                                    {/* 1. Production Binary */}
                                    <g transform="translate(0, 0)">
                                        <rect width="240" height="320" rx="15" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                                        <text x="20" y="30" fill="#94a3b8" fontSize="12" fontWeight="bold">APP</text>

                                        {/* Main Binary */}
                                        <g
                                            transform="translate(20, 50)"
                                            onMouseEnter={() => setHoveredFile("bin")}
                                            onMouseLeave={() => setHoveredFile(null)}
                                        >
                                            <rect width="200" height="60" rx="8"
                                                fill={hoveredFile === "bin" ? COLORS.rust : "#f97316"}
                                                fillOpacity={hoveredFile === "bin" ? 0.3 : 0.1}
                                                stroke={COLORS.rust} strokeWidth="2"
                                                className="transition-all duration-300"
                                            />
                                            <text x="50" y="35" fill="white" fontSize="14" fontWeight="bold">titan-server</text>
                                            <Binary x="15" y="18" size={24} color={COLORS.rust} />
                                        </g>
                                    </g>

                                    {/* 2. Assets (Routes & Action Map) */}
                                    <g transform="translate(20, 130)">
                                        <g
                                            transform="translate(0, 0)"
                                            onMouseEnter={() => setHoveredFile("routes")}
                                            onMouseLeave={() => setHoveredFile(null)}
                                        >
                                            <rect width="180" height="40" rx="6" fill="#0f172a"
                                                stroke={COLORS.json}
                                                fillOpacity={hoveredFile === "routes" ? 0.5 : 0}
                                                className="transition-all"
                                            />
                                            <text x="40" y="25" fill="white" fontSize="12" fontFamily="monospace">routes.json</text>
                                            <FileJson x="10" y="10" size={18} color={COLORS.json} />
                                        </g>
                                        <g
                                            transform="translate(0, 50)"
                                            onMouseEnter={() => setHoveredFile("map")}
                                            onMouseLeave={() => setHoveredFile(null)}
                                        >
                                            <rect width="180" height="40" rx="6" fill="#0f172a"
                                                stroke={COLORS.json}
                                                fillOpacity={hoveredFile === "map" ? 0.5 : 0}
                                                className="transition-all"
                                            />
                                            <text x="40" y="25" fill="white" fontSize="12" fontFamily="monospace">actionmap.json</text>
                                            <FileJson x="10" y="10" size={18} color={COLORS.json} />
                                        </g>
                                    </g>

                                    {/* 3. Actions Folder (Bundles) */}
                                    <g
                                        transform="translate(20, 240)"
                                        onMouseEnter={() => setHoveredFile("bundle")}
                                        onMouseLeave={() => setHoveredFile(null)}
                                    >
                                        <rect width="90" height="60" rx="6" fill="#0f172a" stroke={COLORS.js} strokeDasharray="4 4"
                                            fillOpacity={hoveredFile === "bundle" ? 0.5 : 0}
                                            className="transition-all"
                                        />
                                        <text x="10" y="25" fill="#94a3b8" fontSize="10" fontWeight="bold">actions/</text>
                                        <Box x="10" y="35" size={16} color={COLORS.js} />
                                        <text x="32" y="48" fill="white" fontSize="10" fontFamily="monospace">.jsbundle</text>
                                    </g>

                                    {/* 4. Ext Folder */}
                                    <g
                                        transform="translate(120, 240)"
                                        onMouseEnter={() => setHoveredFile("ext")}
                                        onMouseLeave={() => setHoveredFile(null)}
                                    >
                                        <rect width="80" height="60" rx="6" fill="#0f172a" stroke="#a855f7" strokeDasharray="4 4"
                                            fillOpacity={hoveredFile === "ext" ? 0.5 : 0}
                                            className="transition-all"
                                        />
                                        <text x="10" y="25" fill="#94a3b8" fontSize="10" fontWeight="bold">.ext/</text>
                                        <Package x="10" y="35" size={16} color="#a855f7" />
                                    </g>

                                    {/* HOVER DESCRIPTION BOX (Absolute positioning adjacent to the artifact group) */}
                                    <foreignObject x="260" y="0" width="200" height="300" className="pointer-events-none">
                                        <AnimatePresence>
                                            {hoveredFile && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    className="bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-xl text-sm"
                                                >
                                                    {hoveredFile === "bin" && (
                                                        <>
                                                            <h4 className="font-bold text-orange-400 mb-1">Single Binary</h4>
                                                            <p className="text-slate-300 leading-snug">Zero-dependency Rust executable. Contains the Gravity (V8) runtime, web server, and routing logics.</p>
                                                        </>
                                                    )}
                                                    {hoveredFile === "routes" && (
                                                        <>
                                                            <h4 className="font-bold text-lime-400 mb-1">Static Routes</h4>
                                                            <p className="text-slate-300 leading-snug">Pre-calculated Radix Tree for O(1) request routing.</p>
                                                        </>
                                                    )}
                                                    {hoveredFile === "map" && (
                                                        <>
                                                            <h4 className="font-bold text-lime-400 mb-1">Action Map</h4>
                                                            <p className="text-slate-300 leading-snug">Links HTTP Routes to V8 Function Pointers.</p>
                                                        </>
                                                    )}
                                                    {hoveredFile === "bundle" && (
                                                        <>
                                                            <h4 className="font-bold text-yellow-400 mb-1">Bytecode Bundles</h4>
                                                            <p className="text-slate-300 leading-snug">Pre-compiled JS Bytecode for instant isolate startup.</p>
                                                        </>
                                                    )}
                                                    {hoveredFile === "ext" && (
                                                        <>
                                                            <h4 className="font-bold text-purple-400 mb-1">Native Extensions</h4>
                                                            <p className="text-slate-300 leading-snug">Dynamic Libraries (.dll/.so) loaded into V8 snapshots.</p>
                                                        </>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </foreignObject>
                                </g>

                            </g>
                        )}

                        {/* ==================== TAB 2: RUNTIME INIT ==================== */}
                        {activeTab === 'runtime' && (
                            <g>
                                {/* LEFT: METADATA */}
                                <g transform="translate(100, 250)">
                                    <text x="0" y="-80" fill="#94a3b8" fontSize="10" fontWeight="bold">LOADING CONFIG...</text>
                                    <g className="metadata-file">
                                        <rect width="140" height="40" rx="6" fill="#0f172a" stroke={COLORS.json} />
                                        <text x="40" y="25" fill="white" fontSize="12" fontFamily="monospace">routes.json</text>
                                        <FileJson x="10" y="10" size={20} color={COLORS.json} />
                                    </g>
                                    <g className="metadata-file" transform="translate(0, 50)">
                                        <rect width="140" height="40" rx="6" fill="#0f172a" stroke={COLORS.json} />
                                        <text x="40" y="25" fill="white" fontSize="12" fontFamily="monospace">actionmap.json</text>
                                        <FileJson x="10" y="10" size={20} color={COLORS.json} />
                                    </g>
                                </g>

                                {/* CENTER: ORBIT SYSTEM */}
                                <g className="orbit-system" transform="translate(350, 200)">
                                    <circle className="orbit-inner" cx="50" cy="80" r="50" fill="#0f172a" stroke={COLORS.orbit} strokeWidth="3" />
                                    <Globe x="26" y="56" size={48} color={COLORS.orbit} />
                                    <text x="50" y="-20" textAnchor="middle" fill={COLORS.orbit} fontWeight="bold" fontSize="16">ORBIT SYSTEM</text>
                                    <text x="50" y="0" textAnchor="middle" fill="#94a3b8" fontSize="10">O(1) ROUTING ENGINE</text>
                                </g>

                                {/* RIGHT: WORKER POOL */}
                                <g transform="translate(600, 100)">
                                    <text x="0" y="-30" fill={COLORS.gravity} fontWeight="bold" fontSize="16">WORKER POOL</text>
                                    <text x="0" y="-10" fill="#94a3b8" fontSize="10">GRAVITY RUNTIME THREADS</text>

                                    {[0, 1, 2].map(i => (
                                        <g key={i} className="worker-box" transform={`translate(0, ${i * 120})`}>
                                            <rect width="200" height="100" rx="10" fill="#1e293b" stroke={COLORS.gravity} strokeWidth="2" />
                                            <g transform="translate(15, 15)">
                                                <Cpu color={COLORS.gravity} size={24} />
                                                <text x="35" y="18" fill="white" fontWeight="bold" fontSize="14">Worker #{i + 1}</text>
                                                <rect y="35" width="80" height="20" rx="4" fill={COLORS.js} fillOpacity="0.2" />
                                                <text x="10" y="48" fill={COLORS.js} fontSize="10" fontWeight="bold">V8 ISOLATE</text>
                                                <text x="120" y="80" fill="#64748b" fontSize="10" fontFamily="monospace">IDLE</text>
                                            </g>
                                        </g>
                                    ))}
                                </g>

                                {/* CONNECTION RAYS */}
                                <g transform="translate(410, 280)">
                                    {[0, 1, 2].map(i => (
                                        <path
                                            key={i}
                                            className="orbit-connection"
                                            d={`M 0 0 L 190 ${-130 + (i * 120)}`}
                                            stroke={COLORS.orbit}
                                            strokeWidth="2"
                                            strokeDasharray="5 5"
                                            opacity="0.3"
                                        />
                                    ))}
                                </g>
                            </g>
                        )}

                        {/* ==================== TAB 3: LIVE TRAFFIC ==================== */}
                        {activeTab === 'traffic' && (
                            <g>
                                {/* 1. USERS */}
                                <g transform="translate(50, 300)">
                                    <text x="0" y="-40" fill="white" fontWeight="bold" fontSize="14">USERS</text>
                                    <g transform="translate(0, 0)"> <Users size={32} color="white" /> </g>
                                    <g transform="translate(-15, 25)" opacity="0.6"> <Users size={24} color="white" /> </g>
                                    <g transform="translate(20, 25)" opacity="0.6"> <Users size={24} color="white" /> </g>

                                    {/* Incoming Requests Label */}
                                    <text x="0" y="70" fill="#94a3b8" fontSize="10">INCOMING TRAFFIC</text>
                                </g>

                                {/* 2. ORBIT */}
                                <g transform="translate(250, 250)">
                                    <rect width="150" height="100" rx="20" fill="#064e3b" stroke={COLORS.orbit} strokeWidth="2" />
                                    <text x="75" y="40" textAnchor="middle" fill="white" fontWeight="bold">ORBIT</text>
                                    <text x="75" y="60" textAnchor="middle" fill="#6ee7b7" fontSize="10">ROUTER</text>
                                </g>

                                {/* 3. WORKERS (Rows) */}
                                <g transform="translate(550, 50)">
                                    {[0, 1, 2].map(i => (
                                        <g key={i} id={`worker-${i}`} transform={`translate(0, ${i * 150})`}>
                                            {/* Worker Box */}
                                            <rect className="worker-bg" width="200" height="100" rx="10" fill="#1e293b" stroke={COLORS.gravity} strokeWidth="2" />
                                            <g transform="translate(15, 15)">
                                                <text x="0" y="20" fill="white" fontSize="14" fontWeight="bold">Worker {i + 1}</text>
                                                <rect y="35" width="80" height="20" rx="4" fill={COLORS.js} fillOpacity="0.1" />
                                                <text x="10" y="48" fill={COLORS.js} fontSize="10" fontWeight="bold">V8 ISOLATE</text>

                                                {/* Dynamic Status Text */}
                                                <text className="worker-status-text" x="180" y="80" textAnchor="end" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold">IDLE</text>
                                            </g>
                                        </g>
                                    ))}
                                </g>

                                {/* 4. RUST CORE (Bottom Layer) */}
                                <g className="rust-core-layer" transform="translate(500, 500)" opacity="0">
                                    <rect width="350" height="60" rx="12" fill="#1e1e20" stroke={COLORS.rust} strokeWidth="1" strokeDasharray="4 4" />
                                    <text x="175" y="35" textAnchor="middle" fill={COLORS.rust} fontSize="12" fontWeight="bold" fontFamily="monospace">TITAN ASYNC RUNTIME (RUST)</text>
                                </g>

                                {/* PARTICLES */}
                                {[0, 1, 2, 3].map(i => (
                                    <g key={i} className="user-req">
                                        {/* REQ = Ball */}
                                        <circle className="req-dot" r="8" fill="white" />
                                        {/* RES = Square */}
                                        <rect className="req-square" x="-8" y="-8" width="16" height="16" rx="3" fill="white" />
                                    </g>
                                ))}

                            </g>
                        )}
                    </svg>

                    {/* Footer Legend */}
                    <div className="absolute bottom-4 right-6 flex gap-4 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full ring-2 ring-white/20 bg-white" />
                            Req
                            <div className="w-2 h-2 rounded-sm ring-2 ring-emerald-500/20 bg-emerald-500 ml-1" />
                            Res
                        </div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" />Orbit</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" />Gravity</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500" />Drift</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" />Rust</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
