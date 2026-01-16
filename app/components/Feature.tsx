import { Terminal, Zap, Cpu, Rocket, Binary } from "lucide-react"

export function Feature({
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
