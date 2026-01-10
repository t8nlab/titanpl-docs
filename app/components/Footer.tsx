import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RiGithubFill, RiNpmjsFill, RiTwitterXLine } from "@remixicon/react";
import Image from "next/image";

export default function Footer() {
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
                                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold border border-dashed border-black/70 dark:border-white/70 text-background transition-all hover:bg-foreground/90 active:scale-95"
                            >
                                Join the Community
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                <div className="absolute inset-0 -z-10 bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:animate-shimmer" />
                            </Link>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-semibold text-foreground">Product</h3>
                            <Link href="/docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Documentation
                            </Link>
                            <Link href="/docs/how-titan-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                How Titan Works
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
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-semibold text-foreground">Socials</h3>
                            <Link href="https://x.com/TitanPl" target="_blank" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                                <RiTwitterXLine className="h-4 w-4" />
                                X (Twitter)
                            </Link>
                            <Link href="https://github.com/ezet-galaxy" target="_blank" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                                <RiGithubFill className="h-4 w-4" />
                                Ezet Galaxy
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-16 border-t border-border/40 pt-8 sm:mt-20 lg:mt-24">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-xs leading-5 text-muted-foreground">
                            &copy; {new Date().getFullYear()} Titan Planet. All rights reserved.
                        </p>
                        <p className="text-xs leading-5 text-black/80 dark:text-white/80">
                            <Link href="https://github.com/ezet-galaxy/titanpl" target="_blank" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
