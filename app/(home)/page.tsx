"use client"

import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { Terminal, Zap, Cpu, Rocket, Binary } from "lucide-react"
import VideoLoader from "@/app/components/VideoLoader"
import Footer from "@/app/components/Footer"
import StatusBadge from "@/app/components/StatusBadge"
import { RiJavascriptFill } from "@remixicon/react"

export default function HomePage() {
  const videoContainerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: videoContainerRef,
    offset: ["start end", "center center"],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1])

  return (
    <>
      <VideoLoader text="Titan Planet" />

      <main className="relative flex min-h-[200vh] flex-col items-center overflow-x-hidden bg-background pt-24 pb-20">

        {/* Background glow - Persistent */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">

          {/* Hero Top Glow - Blue/Indigo */}
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[100px] opacity-80 mix-blend-screen dark:opacity-20 dark:bg-blue-500/10 dark:blur-[120px]" />

          {/* Dynamic ambient orbs */}
          <div className="absolute left-0 top-[40%] h-[500px] w-[500px] -translate-x-1/3 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px] opacity-50 mix-blend-screen dark:opacity-10 dark:bg-cyan-400/5" />
          <div className="absolute right-0 top-[60%] h-[500px] w-[500px] translate-x-1/3 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px] opacity-50 mix-blend-screen dark:opacity-10 dark:bg-purple-500/5" />
        </div>

        {/* Hero Content - Centered properly */}
        <div className="max-w-4xl text-center px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.2 }}
            className="flex flex-col items-center"
          >
            {/* Premium Minimal Badge */}
            <div className="group relative inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 pl-3 pr-4 py-1.5 text-xs font-medium text-primary backdrop-blur-md transition-colors hover:bg-primary/10 hover:border-primary/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <div className="flex items-center gap-2 tracking-wide uppercase text-[10px]">
                <span className="flex items-center gap-1">
                  JavaScript <RiJavascriptFill className="h-3.5 w-3.5" />
                </span>
                <span className="text-primary/40">•</span>
                <span className="flex items-center gap-1">
                  Native Rust <Binary size={12} strokeWidth={2.5} />
                </span>
              </div>
            </div>

            <h1 className="mt-8 text-5xl font-bold tracking-tight sm:text-7xl">
              Titan Planet
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              The high-performance JavaScript framework for the modern backend.
              <br className="hidden sm:block" />
              Write in JavaScript Ship Native Powered by V8.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.4 }}
            className="mt-12 grid gap-6 sm:grid-cols-3 text-left"
          >
            <Feature
              icon={<Cpu className="h-5 w-5" />}
              title="V8 Engine"
              description="Raw JavaScript performance with direct bindings."
            />
            <Feature
              icon={<Zap className="h-5 w-5" />}
              title="Native Binary"
              description="Compiles to a single, standalone executable."
            />
            <Feature
              icon={<Terminal className="h-5 w-5" />}
              title="Toolchain"
              description="Integrated CLI for bundling and deployment."
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/docs"
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-md px-8 text-sm font-medium text-primary-foreground border border-dashed border-black/70 dark:border-white/70 transition-all hover:scale-105 active:scale-95"
            >
              Quick Start
              <Rocket className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/community"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-dashed border-blue-500/30 bg-background px-8 text-sm font-medium text-blue-600 shadow-sm transition-colors hover:bg-blue-500/5 hover:border-blue-500/60 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
            >
              Community
            </Link>
          </motion.div>
        </div>


        <div ref={videoContainerRef} className="relative w-full min-h-[40vh] flex items-center justify-center py-10">
          <motion.div
            style={{ scale, opacity, borderRadius: "1.5rem" }}
            className="relative w-full max-w-4xl aspect-video overflow-hidden shadow-2xl backdrop-blur border bg-background/40"
          >
            <video
              src="/titan-anime.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/20 to-transparent pointer-events-none" />
          </motion.div>
        </div>

        {/* Ecosystem Section */}
        <div className="mt-32 w-full max-w-5xl space-y-16 px-6">

          {/* SDK Section */}
          <div className="group relative grid gap-8 overflow-hidden rounded-2xl border bg-background/40 p-6 backdrop-blur-sm transition-all hover:bg-background/60 md:grid-cols-2 md:items-center md:gap-12 md:p-10">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border shadow-2xl">
              <Image
                src="/images/titanpl-sdk.png"
                alt="TitanPL SDK Visualization"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="text-left">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center rounded-full border bg-blue-500/10 border-blue-500/20 px-3 py-1 text-xs font-medium text-blue-500">
                  Core Toolkit
                </div>
                <StatusBadge status="BETA" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">TitanPL SDK</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-black/70 dark:text-white/70">
                The TitanPL SDK lets you scaffold, test, and publish extensions with a single workflow. Generate new modules, run a local Titan-like environment, and ship npm packages that auto-load in the runtime.
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href="https://github.com/ezet-galaxy/titanpl/tree/main/titanpl-sdk"
                  target="_blank"
                  className="inline-flex items-center rounded-lg border bg-background px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
                >
                  View SDK on GitHub
                </Link>
              </div>
            </div>
          </div>

          {/* Extensions Section */}
          <div className="group relative grid gap-8 overflow-hidden rounded-2xl border bg-background/40 p-6 backdrop-blur-sm transition-all hover:bg-background/60 md:grid-cols-2 md:items-center md:gap-12 md:p-10">
            <div className="order-last md:order-first text-left">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center rounded-full border bg-purple-500/10 border-purple-500/20 px-3 py-1 text-xs font-medium text-purple-500">
                  Modular Architecture
                </div>
                <StatusBadge status="ALPHA" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">TitanPL Extensions</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-black/70 dark:text-white/70">
                TitanPL Extensions let you add modular features to any Titan project. Build reusable plugins, integrate external services, or ship custom logic, and the runtime auto-loads them instantly via t.extensionName.
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href="https://github.com/topics/titanpl-ext"
                  target="_blank"
                  className="inline-flex items-center rounded-lg border bg-background px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
                >
                  Explore Extensions
                </Link>
              </div>
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border shadow-2xl">
              <Image
                src="/images/titanpl-ext.png"
                alt="TitanPL Extensions Visualization"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

        </div>

        <Footer />
      </main>
    </>
  )
}

function Feature({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon?: React.ReactNode
}) {
  return (
    <div className="group rounded-lg border bg-card p-5 text-left transition-all hover:bg-accent/50 hover:border-foreground/20">
      <div className="mb-3 inline-flex text-foreground/80 group-hover:text-foreground transition-colors">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
        {description}
      </p>
    </div>
  )
}
