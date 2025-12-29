import Link from "next/link"

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="max-w-3xl text-center">
        <span className="inline-block rounded-full border px-4 py-1 text-sm font-medium text-muted-foreground">
          JavaScript Simplicity · Rust Performance
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Titan Planet
        </h1>

        <p className="mt-4 text-lg text-gray-400 text-muted-foreground">
          A JavaScript-first backend framework that compiles your code into a
          native Rust server — powered by the Boa JavaScript engine and Titan’s
          own CLI.
        </p>

        {/* Feature highlights */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Feature
            title="Boa Engine"
            description="Execute JavaScript inside a native Rust runtime with predictable performance."
          />
          <Feature
            title="Native Rust Output"
            description="No Node.js in production. Ship a single compiled binary."
          />
          <Feature
            title="Titan CLI"
            description="Build, bundle, and run your backend with one command."
          />
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">

          <Link
            href="/docs"
            className="rounded-lg border px-6 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            Quick Start
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-10 text-xs text-muted-foreground">
          Built with Rust · Executed by Boa · Designed for production
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
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
