'use client';

import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { RiGithubFill, RiNpmjsFill, RiTwitterXLine } from "@remixicon/react";
import Image from "next/image";
import { useStatus } from "@/context/StatusContext";

export default function Footer() {
    const { status } = useStatus();

    const getStatusInfo = () => {
        switch (status) {
            case 'operational':
                return { text: 'All Systems Operational', color: 'bg-emerald-500', ping: 'bg-emerald-400' };
            case 'degraded':
                return { text: 'Performance Degraded', color: 'bg-amber-500', ping: 'bg-amber-400' };
            case 'maintenance':
                return { text: 'Systems Maintenance', color: 'bg-blue-500', ping: 'bg-blue-400' };
            default:
                return { text: 'Unknown Status', color: 'bg-gray-500', ping: 'bg-gray-400' };
        }
    };

    const { text, color, ping } = getStatusInfo();

    return (
        <footer className="w-full mt-30 border-t bg-background/50 backdrop-blur-xl">
            <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
                    {/* Brand/CTA Section */}
                    <div className="flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 overflow-hidden rounded-lg bg-black">
                                    <Image
                                        alt="titan-logo"
                                        src="/favicon.ico"
                                        width={200}
                                        height={200}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <span className="text-xl font-bold tracking-tight">Titan Planet</span>
                            </div>

                            <p className="max-w-md text-sm leading-6 text-muted-foreground">
                                The modern backend framework for JavaScript developers who demand performance, type safety, and simplicity.
                            </p>

                            <Link
                                href="/community"
                                target="_blank"
                                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-foreground px-6 py-1.5 text-sm font-semibold border border-dashed border-black/70 dark:border-white/70 text-background transition-all hover:bg-foreground/90 active:scale-95"
                            >
                                Join the Community
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                <div className="absolute inset-0 -z-10 bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:animate-shimmer" />
                            </Link>
                            <div className="mt-6 flex flex-wrap gap-4">
                                <Link
                                    href="https://x.com/TitanPl"
                                    target="_blank"
                                    className="group flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 transition-colors hover:bg-black/10 dark:hover:bg-white/20"
                                    aria-label="Twitter"
                                >
                                    <RiTwitterXLine className="h-5 w-5 text-foreground/70 transition-colors group-hover:text-foreground" />
                                </Link>
                                <Link
                                    href="https://github.com/ezet-galaxy"
                                    target="_blank"
                                    className="group flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 transition-colors hover:bg-black/10 dark:hover:bg-white/20"
                                    aria-label="GitHub"
                                >
                                    <RiGithubFill className="h-5 w-5 text-foreground/70 transition-colors group-hover:text-foreground" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-semibold text-foreground">Product</h3>
                            <Link href="/docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Documentation
                            </Link>
                            <Link href="/changelog" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Changelog
                            </Link>
                            <Link href="/space-station" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Space Station
                            </Link>
                            <Link href="/benchmark" className="flex gap-2 items-center text-sm text-muted-foreground font-medium transition-colors hover:text-foreground">
                                <Activity size={14} />
                                Benchmark
                            </Link>
                            <Link href="/docs/how-titan-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                How Titan Works
                            </Link>
                            <Link href="/docs/runtime-architecture" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Gravity Runtime
                            </Link>
                            <Link href="https://github.com/topics/titanpl-ext" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Extensions
                            </Link>
                        </div>

                        <div className="flex flex-col gap-6">
                            <h3 className="text-sm font-semibold text-foreground">Resources</h3>

                            {/* GitHub Group */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                    <RiGithubFill className="h-4 w-4" />
                                    <span>Source Code</span>
                                </div>
                                <ul className="space-y-2 pl-3 border-l border-border border-dashed dark:border-white/50 border-black/50">
                                    <li>
                                        <Link href="https://github.com/ezet-galaxy/titanpl" target="_blank" className="block text-sm text-black/90 dark:text-white/90 transition-colors hover:text-foreground">
                                            titanpl
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="https://github.com/ezet-galaxy/titanpl/tree/main/titanpl-sdk" target="_blank" className="block text-sm text-black/90 dark:text-white/90 transition-colors hover:text-foreground">
                                            titanpl-sdk
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="https://github.com/shoya-129/-titanpl-valid" target="_blank" className="block text-sm text-black/90 dark:text-white/90 transition-colors hover:text-foreground">
                                            -titanpl-valid
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="https://github.com/shoya-129/-titanpl-valid" target="_blank" className="block text-sm text-black/90 dark:text-white/90 transition-colors hover:text-foreground">
                                            -titanpl-core
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="https://github.com/David200197/eslint-plugin-titanpl" target="_blank" className="block text-sm text-black/90 dark:text-white/90 transition-colors hover:text-foreground">
                                            eslint-plugin-titanpl
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="https://github.com/ezet-galaxy/titanpl/tree/main/templates/extension" target="_blank" className="block text-sm text-black/90 dark:text-white/90 transition-colors hover:text-foreground">
                                            titanpl-ext-template
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* NPM Group */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                    <RiNpmjsFill className="h-4 w-4" />
                                    <span>Packages</span>
                                </div>
                                <ul className="space-y-2 pl-3 border-l border-border border-dashed dark:border-white/50 border-black/50">
                                    <li>
                                        <Link href="https://www.npmjs.com/package/@ezetgalaxy/titan" target="_blank" className="block text-sm text-black/90 dark:text-white/90 transition-colors hover:text-foreground">
                                            @ezetgalaxy/titan
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="https://www.npmjs.com/package/titanpl-sdk" target="_blank" className="block text-sm text-black/90 dark:text-white/90 transition-colors hover:text-foreground">
                                            titanpl-sdk
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="https://www.npmjs.com/package/@titanpl/valid" target="_blank" className="block text-sm text-black/90 dark:text-white/90 transition-colors hover:text-foreground">
                                            @titanpl/valid
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="https://www.npmjs.com/package/@titanpl/core" target="_blank" className="block text-sm text-black/90 dark:text-white/90 transition-colors hover:text-foreground">
                                            @titanpl/core
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="https://www.npmjs.com/package/eslint-plugin-titanpl" target="_blank" className="block text-sm text-black/90 dark:text-white/90 transition-colors hover:text-foreground">
                                            eslint-plugin-titanpl
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 border-t border-border/40 pt-8 sm:mt-20 lg:mt-24">
                    <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
                        <p className="text-xs leading-5 text-muted-foreground">
                            &copy; {new Date().getFullYear()} Titan Planet. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="/status" className="flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ping}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`}></span>
                                </span>
                                {text}
                            </Link>
                            <Link href="https://petalite-stew-867.notion.site/Ezet-privacy-vault-2742b05812ae802da69ef20c3ef491d8" target="_blank" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
