import Link from "next/link"

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="mt-2 max-w-3xl text-center">
        <span className="inline-block rounded-full border px-4 py-1 text-sm font-medium text-muted-foreground">
          JavaScript Simplicity · Rust Performance
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Titan Planet
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-black/70 dark:text-white/70">
          A JavaScript-first backend framework that lets you write your backend
          logic in JavaScript and ship a single native Rust server — powered by
          the v8 JavaScript engine and Titan’s CLI.
        </p>

        {/* Feature highlights */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Feature
            title="v8 JavaScript Engine"
            description="Run JavaScript inside a native Rust runtime with predictable execution."
          />
          <Feature
            title="Single Native Binary"
            description="No Node.js in production. Compile and ship one Rust binary."
          />
          <Feature
            title="Titan CLI"
            description="Scaffold, bundle, develop, and build with simple CLI commands."
          />
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/docs"
            className="rounded-lg border px-6 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            Quick Start
          </Link>

          <Link
            href="https://x.com/TitanPl"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-dashed px-6 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
          >
            Follow on X
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-10 text-xs text-muted-foreground">
          Built with Rust · Executed by v8 · Designed for production
        </p>
      </div>
    </main>
  )
}

function Feature({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border bg-background/60 p-4 text-left backdrop-blur">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
