import Link from "next/link"
import { Rocket } from "lucide-react"
import { RiTwitterXFill, RiLinkedinFill } from "@remixicon/react"

export function FeedbackCard({
    author,
    handle,
    platform,
    quote,
    link,
    gradient,
}: {
    author: string
    handle: string
    platform: "Hacker News" | "Twitter" | "LinkedIn"
    quote: string
    link: string
    gradient: string
}) {
    return (
        <Link
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-background/40 p-8 backdrop-blur-sm transition-all hover:bg-background/60 hover:-translate-y-1 duration-300"
        >
            <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-linear-to-br ${gradient} to-transparent blur-3xl transition-opacity opacity-50 group-hover:opacity-100`} />

            <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border bg-background/50 shadow-sm ${platform === 'Hacker News' ? 'text-orange-500' : platform === 'LinkedIn' ? 'text-blue-700' : 'text-blue-500'}`}>
                            {platform === 'Hacker News' && <span className="font-bold text-lg">Y</span>}
                            {platform === 'Twitter' && <RiTwitterXFill size={18} />}
                            {platform === 'LinkedIn' && <RiLinkedinFill size={18} />}
                        </div>
                        <div>
                            <div className="font-semibold text-foreground text-sm">{author}</div>
                            <div className="text-xs text-muted-foreground">{handle}</div>
                        </div>
                    </div>
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <Rocket className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                <p className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                    "{quote}"
                </p>
            </div>

            <div className="relative z-10 mt-6 flex items-center gap-2 pt-6 border-t border-border/30">
                <span className="text-xs font-medium text-muted-foreground dark:text-white/70 text-black/70">Read on {platform}</span>
            </div>
        </Link>
    )
}
