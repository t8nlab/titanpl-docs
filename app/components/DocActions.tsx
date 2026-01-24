'use client';

import { useState } from 'react';
import { RiFileCopyLine, RiCheckLine, RiOpenaiFill, RiClaudeFill, RiGeminiFill } from '@remixicon/react';

interface DocActionsProps {
    markdown: string;
    title: string;
}

export function DocActions({ markdown, title }: DocActionsProps) {
    const [copied, setCopied] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openWithChatGPT = () => {
        const docUrl = window.location.href; 
        let prompt = `Read ${docUrl}. I'm reading TitanPL docs about "${title}". I want to ask questions about it.`;

        prompt = prompt.replace(/\n+/g, ' ');

        const encoded = encodeURIComponent(prompt);

        window.open(`https://chatgpt.com/?prompt=${encoded}`, "_blank");
    };



    const openWithClaude = () => {
        const docUrl = window.location.href; 
        let prompt = `Read ${docUrl}. I'm reading TitanPL docs about "${title}". I want to ask questions about it.`;

        const encoded = encodeURIComponent(prompt);

        window.open(`https://claude.ai/new?q=${encoded}`, "_blank");
    };





    return (
        <div className="flex items-center gap-2 not-prose mb-6">
            {/* Copy Markdown Button */}
            <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-3 py-1.5 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
                {copied ? (
                    <>
                        <RiCheckLine className="h-4 w-4" />
                        <span>Copied!</span>
                    </>
                ) : (
                    <>
                        <RiFileCopyLine className="h-4 w-4" />
                        <span>Copy Markdown</span>
                    </>
                )}
            </button>

            {/* Open Dropdown Button */}
            <div className="relative">
                <button
                    onClick={() => setOpenDropdown(!openDropdown)}
                    className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-3 py-1.5 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
                >
                    <span>Open</span>
                    <svg
                        className={`h-4 w-4 transition-transform ${openDropdown ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {openDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdown(false)}
                        />
                        <div className="absolute left-0 top-full z-20 mt-1 min-w-60 rounded-lg border border-fd-border bg-fd-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
                            <button
                                onClick={() => {
                                    openWithClaude();
                                    setOpenDropdown(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-fd-popover-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
                            >
                                <RiClaudeFill className="h-4 w-4" />
                                <span>Open with Claude</span>
                            </button>
                            <button
                                onClick={() => {
                                    openWithChatGPT();
                                    setOpenDropdown(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-fd-popover-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
                            >
                                <RiOpenaiFill className="h-4 w-4" />
                                <span>Open with ChatGPT</span>
                            </button>

                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
