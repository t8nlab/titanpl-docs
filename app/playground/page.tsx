"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import {
    ArrowLeft, Play, Square, Plus, Trash2, FileJson, FileCode,
    Terminal, Globe, Loader2, CheckCircle2, XCircle, RotateCcw, Code2
} from "lucide-react"
import { Orbitron } from "next/font/google"
import dynamic from "next/dynamic"

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false })
const orbitron = Orbitron({ subsets: ["latin"] })

type FileNode = { name: string; content: string }
type Files = Record<string, FileNode>

// ─── Starter files ───────────────────────────────────────────────────────────
const INIT_APP_JS = `import t from "@titanpl/route";

// Define your routes here (max 6)
t.get("/hello").action("hello");
t.post("/echo").action("echo");

t.start(5100, "Titan Playground 🚀");
`

const INIT_HELLO = `// app/actions/hello.js
// GET /hello?name=world

export default function hello (req) {
    t.log("hello action called!");

    const name = req.query?.name ?? "World";

    return {
        status: 200,
        body: {
            message: \`Hello, \${name}! from Titan Engine\`,
            runtime: "Gravity Runtime",
            timestamp: t.time.now(),
        }
    };
}
`

const INIT_ECHO = `// app/actions/echo.js
// POST /echo  { "message": "hi" }

export default function echo (req) {
    const payload = req.body;

    if (!payload) {
        return { status: 400, body: { error: "No body provided" } };
    }

    t.log("echo: " + JSON.stringify(payload));

    return {
        status: 200,
        body: { echo: payload },
    };
}
`

const INITIAL_FILES: Files = {
    "app/app.js": { name: "app.js", content: INIT_APP_JS },
    "app/actions/hello.js": { name: "hello.js", content: INIT_HELLO },
    "app/actions/echo.js": { name: "echo.js", content: INIT_ECHO },
}

type RunStatus = "idle" | "running" | "success" | "error"

// ─── Monaco theme ─────────────────────────────────────────────────────────────
const TITAN_THEME = {
    base: "vs-dark" as const,
    inherit: true,
    rules: [
        { token: "comment", foreground: "505a70", fontStyle: "italic" },
        { token: "keyword", foreground: "c792ea" },
        { token: "string", foreground: "c3e88d" },
        { token: "number", foreground: "f78c6c" },
        { token: "type", foreground: "82aaff" },
        { token: "identifier", foreground: "eeffff" },
        { token: "delimiter", foreground: "89ddff" },
        { token: "function", foreground: "82aaff" },
    ],
    colors: {
        "editor.background": "#0d1117",
        "editor.foreground": "#cdd9e5",
        "editor.lineHighlightBackground": "#161b22",
        "editor.selectionBackground": "#264f78aa",
        "editorCursor.foreground": "#58a6ff",
        "editorGutter.background": "#0d1117",
        "editorLineNumber.foreground": "#3d444d",
        "editorLineNumber.activeForeground": "#7d8590",
        "scrollbar.shadow": "#00000000",
        "scrollbarSlider.background": "#ffffff12",
        "scrollbarSlider.hoverBackground": "#ffffff20",
        "scrollbarSlider.activeBackground": "#ffffff30",
        "editor.inactiveSelectionBackground": "#264f7844",
    }
}

// ─── Inject Titan type defs into Monaco ──────────────────────────────────────
function injectTypes(monaco: any, data: { globalsDts: string; routeDts: string }) {
    const jsDefs = monaco.languages.typescript.javascriptDefaults

    jsDefs.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        allowNonTsExtensions: true,
        checkJs: false,
        noEmit: true,
        allowJs: true,
    })
    jsDefs.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false })

    jsDefs.setExtraLibs([])

    // ── 1. Pure ambient globals from declare global { } block ────────────────
    // globalsDts has NO top-level `export` statements — Monaco treats it as an
    // ambient declaration so `t`, `Titan`, `drift`, `TitanRuntimeUtils`,
    // `TitanCore`, `DbConnection` are ALL globally visible with full JSDoc.
    jsDefs.addExtraLib(data.globalsDts, 'ts:titan-globals.d.ts')

    // ── 2. @titanpl/route module ──────────────────────────────────────────────
    jsDefs.addExtraLib(
        `declare module "@titanpl/route" {\n${data.routeDts}\n}`,
        'ts:titanpl-route.d.ts'
    )

    // @titanpl/native module — re-export all named exports from the globals file
    // The globals file also exports: defineAction, fetch, log, jwt, password, db, fs, path…
    jsDefs.addExtraLib(`
declare module "@titanpl/native" {
    export interface TitanRequest {
        body: any;
        method: "GET"|"POST"|"PUT"|"DELETE"|"PATCH";
        path: string;
        headers: Record<string, string | undefined>;
        params: Record<string, string>;
        query: Record<string, string>;
    }
    export function defineAction<T>(handler: (req: TitanRequest) => T): (req: TitanRequest) => T;
    export const log: TitanRuntimeUtils["log"];
    export const read: TitanRuntimeUtils["read"];
    export const fetch: TitanRuntimeUtils["fetch"];
    export const jwt: TitanRuntimeUtils["jwt"];
    export const password: TitanRuntimeUtils["password"];
    export const db: TitanRuntimeUtils["db"];
    export const fs: TitanRuntimeUtils["fs"];
    export const path: TitanRuntimeUtils["path"];
    export const crypto: TitanRuntimeUtils["crypto"];
    export const buffer: TitanRuntimeUtils["buffer"];
    export const ls: TitanRuntimeUtils["ls"];
    export const localStorage: TitanRuntimeUtils["localStorage"];
    export const session: TitanRuntimeUtils["session"];
    export const cookies: TitanRuntimeUtils["cookies"];
    export const os: TitanRuntimeUtils["os"];
    export const net: TitanRuntimeUtils["net"];
    export const proc: TitanRuntimeUtils["proc"];
    export const time: TitanRuntimeUtils["time"];
    export const url: TitanRuntimeUtils["url"];
}
`, 'ts:titanpl-native.d.ts')
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PlaygroundPage() {
    const [files, setFiles] = useState<Files>(INITIAL_FILES)
    const [activeFile, setActiveFile] = useState("app/app.js")
    const [method, setMethod] = useState("GET")
    const [urlPath, setUrlPath] = useState("/hello?name=Titan")
    const [reqBody, setReqBody] = useState('{\n  "message": "hello"\n}')

    const [status, setStatus] = useState<RunStatus>("idle")
    const [logs, setLogs] = useState<string[]>([])
    const [response, setResponse] = useState<any>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [activePanel, setActivePanel] = useState<"response" | "terminal">("response")
    const [viewMode, setViewMode] = useState<"json" | "html">("json")

    const panelRef = useRef<HTMLDivElement>(null)
    const monacoRef = useRef<any>(null)
    const abortRef = useRef<AbortController | null>(null)

    // ── Load Titan type defs ─────────────────────────────────────────────────
    useEffect(() => {
        fetch("/api/playground/types")
            .then(r => r.json())
            .then(data => {
                if (data.globalsDts && monacoRef.current) {
                    injectTypes(monacoRef.current, data)
                }
                // store for when editor mounts after fetch
                if (data.globalsDts) {
                    (window as any).__titanDts = data
                }
            })
            .catch(() => { })
    }, [])

    // ── Auto-scroll terminal ─────────────────────────────────────────────────
    useEffect(() => {
        if (activePanel === "terminal" && panelRef.current) {
            panelRef.current.scrollTop = panelRef.current.scrollHeight
        }
    }, [logs, activePanel])

    const actionCount = Object.keys(files).filter(k => k.startsWith("app/actions/")).length

    const addActionFile = () => {
        if (actionCount >= 5) { alert("Max 5 action files in the playground"); return }
        const raw = prompt("Action name (without .js):", `action${actionCount + 1}`)
        if (!raw?.trim()) return
        const name = raw.trim().replace(/[^a-zA-Z0-9_-]/g, "_")
        const key = `app/actions/${name}.js`
        if (files[key]) { alert("File already exists!"); return }
        setFiles(p => ({
            ...p,
            [key]: {
                name: `${name}.js`,
                content: `// app/actions/${name}.js\n\nexport default function(req) {\n    return { status: 200, body: { ok: true } };\n}\n`
            }
        }))
        setActiveFile(key)
    }

    const deleteFile = (key: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (key === "app/app.js") { alert("app.js cannot be deleted"); return }
        setFiles(p => { const n = { ...p }; delete n[key]; return n })
        if (activeFile === key) setActiveFile("app/app.js")
    }

    const updateContent = useCallback((value: string | undefined) => {
        if (value === undefined) return
        setFiles(p => ({ ...p, [activeFile]: { ...p[activeFile], content: value } }))
    }, [activeFile])

    const reset = () => {
        handleStop()
        setFiles(INITIAL_FILES)
        setActiveFile("app/app.js")
        setLogs([])
        setResponse(null)
        setErrorMsg(null)
        setStatus("idle")
    }

    const handleStop = () => {
        if (abortRef.current) {
            abortRef.current.abort()
            abortRef.current = null
        }
        setStatus("idle")
    }

    const handleRun = async () => {
        if (status === "running") return
        handleStop()

        const controller = new AbortController()
        abortRef.current = controller

        setStatus("running")
        setLogs([])
        setResponse(null)
        setErrorMsg(null)
        setViewMode("json")

        const payload: Record<string, string> = {}
        for (const [k, v] of Object.entries(files)) payload[k] = v.content

        try {
            const res = await fetch("/api/playground/run", {
                method: "POST",
                signal: controller.signal,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    files: payload,
                    request: {
                        method,
                        route: urlPath,
                        body: method !== "GET" && method !== "DELETE" ? reqBody : null
                    }
                })
            })
            const data = await res.json()
            setLogs(data.logs ?? [])

            if (data.success) {
                setStatus("success")
                setResponse(data.response)
                setActivePanel("response")
                // Auto-switch to HTML view if response looks like HTML
                const body = data.response?.data
                if (typeof body === "string" && body.trimStart().startsWith("<")) {
                    setViewMode("html")
                }
            } else {
                setStatus("error")
                setErrorMsg(data.error ?? "Server error")
                setActivePanel("terminal")
            }
        } catch (err: any) {
            if (err.name === "AbortError") {
                setStatus("idle")
                return
            }
            setStatus("error")
            setErrorMsg(`Request failed: ${err.message}`)
        }
    }

    const handleBeforeMount = (monaco: any) => {
        monacoRef.current = monaco
        monaco.editor.defineTheme("titan-dark", TITAN_THEME)
        monaco.editor.setTheme("titan-dark")
    }

    const handleMount = (_editor: any, monaco: any) => {
        monacoRef.current = monaco
        const cached = (window as any).__titanDts
        if (cached?.globalsDts) {
            injectTypes(monaco, cached)
        }
    }

    const onUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleRun()
    }

    const btnStyle = {
        idle: "bg-[#1f6feb] hover:bg-[#388bfd] text-white",
        running: "bg-[#da3633] hover:bg-[#f85149] text-white",
        success: "bg-[#238636] hover:bg-[#2ea043] text-white",
        error: "bg-[#da3633] hover:bg-[#f85149] text-white",
    }[status]

    const isHtmlResponse = viewMode === "html" && typeof response?.data === "string"

    return (
        <div className="h-screen flex flex-col bg-[#010409] text-[#cdd9e5] overflow-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

            {/* ══════════ UNDER DEV OVERLAY ══════════ */}
            <div className="fixed inset-0 z-50 bg-[#010409]/90 backdrop-blur-sm flex flex-col items-center justify-center">
                <Loader2 size={40} className="animate-spin text-[#1f6feb] mb-6" />
                <h1 className={`${orbitron.className} text-3xl md:text-4xl text-[#79c0ff] tracking-[.2em] uppercase mb-4 text-center px-4`}>
                    Under Development
                </h1>
                <p className="text-[#7d8590] text-base md:text-lg mb-8 max-w-md text-center px-4">
                    The Titan Playground is currently under construction. Coming soon!
                </p>
                <Link href="/" className="px-5 py-2.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded-md transition-colors flex items-center gap-2 font-medium text-sm">
                    <ArrowLeft size={16} /> Return to Home
                </Link>
            </div>

            {/* ══════════ TOPBAR ══════════ */}
            <header className="h-11 shrink-0 flex items-center justify-between px-4 border-b border-[#30363d] bg-[#0d1117]">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-[#7d8590] hover:text-[#cdd9e5] transition-colors">
                        <ArrowLeft size={16} />
                    </Link>
                    <div className="h-3.5 w-px bg-[#30363d]" />
                    <span className={`${orbitron.className} text-[11px] font-medium tracking-[.25em] text-[#79c0ff] uppercase`}>
                        Titan Playground
                    </span>
                    <span className="text-[10px] text-[#3d444d] font-mono">v2.0.1</span>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={reset} title="Reset" className="text-[#7d8590] hover:text-[#cdd9e5] p-1.5 rounded hover:bg-white/5 transition-colors">
                        <RotateCcw size={14} />
                    </button>
                    <span className="text-[10px] text-[#3d444d] font-mono">{actionCount}/5 actions</span>

                    {/* Run / Stop button */}
                    <button
                        onClick={status === "running" ? handleStop : handleRun}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${btnStyle}`}
                    >
                        {status === "running" ? (
                            <><Square size={12} className="fill-current" /> Stop</>
                        ) : status === "success" ? (
                            <><CheckCircle2 size={13} /> Ran!</>
                        ) : status === "error" ? (
                            <><XCircle size={13} /> Error</>
                        ) : (
                            <><Play size={13} /> Run</>
                        )}
                    </button>
                </div>
            </header>

            {/* ══════════ BODY ══════════ */}
            <div className="flex flex-1 min-h-0">

                {/* ── SIDEBAR ── */}
                <aside className="w-52 shrink-0 border-r border-[#30363d] bg-[#0d1117] flex flex-col">
                    <div className="h-9 shrink-0 flex items-center justify-between px-3 border-b border-[#30363d]">
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-[#7d8590]">Explorer</span>
                        <button onClick={addActionFile} title="New action" className="text-[#7d8590] hover:text-[#79c0ff] transition-colors">
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
                        <div className="mb-1">
                            <p className="text-[9px] uppercase tracking-widest text-[#3d444d] px-2 mb-1 font-semibold">APP</p>
                            {Object.entries(files).filter(([k]) => k === "app/app.js").map(([key, f]) => (
                                <SidebarFile key={key} fileKey={key} file={f}
                                    active={activeFile === key}
                                    onSelect={() => setActiveFile(key)}
                                    onDelete={null} />
                            ))}
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-[#3d444d] px-2 mb-1 font-semibold">ACTIONS</p>
                            {Object.entries(files).filter(([k]) => k.startsWith("app/actions/")).map(([key, f]) => (
                                <SidebarFile key={key} fileKey={key} file={f}
                                    active={activeFile === key}
                                    onSelect={() => setActiveFile(key)}
                                    onDelete={(e) => deleteFile(key, e)} />
                            ))}
                        </div>
                    </div>

                    <div className="shrink-0 border-t border-[#30363d] px-3 py-3 space-y-1">
                        <p className="text-[10px] text-[#3d444d]">Max 5 action files</p>
                        <p className="text-[10px] text-[#3d444d]">Max 6 routes in app.js</p>
                        <p className="text-[10px] text-[#3d444d]">Use <code className="text-[#79c0ff]">t.log()</code> → Terminal</p>
                    </div>
                </aside>

                {/* ── EDITOR ── */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0d1117]">
                    {/* Tabs */}
                    <div className="h-9 shrink-0 flex items-end overflow-x-auto bg-[#010409] border-b border-[#30363d]">
                        {Object.entries(files).map(([key, f]) => {
                            const active = activeFile === key
                            const isApp = key === "app/app.js"
                            return (
                                <button key={key} onClick={() => setActiveFile(key)}
                                    className={`relative shrink-0 flex items-center gap-1.5 px-3.5 h-9 text-[12px] transition-colors whitespace-nowrap border-r border-[#30363d] ${active ? "bg-[#0d1117] text-[#cdd9e5]"
                                        : "bg-[#010409] text-[#7d8590] hover:text-[#cdd9e5] hover:bg-[#0d1117]/60"
                                        }`}
                                >
                                    {active && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#1f6feb]" />}
                                    {isApp ? <FileJson size={11} className="text-[#e3b341]" />
                                        : <FileCode size={11} className="text-[#79c0ff]" />}
                                    <span>{f.name}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Monaco */}
                    <div className="flex-1 min-h-0">
                        <Editor
                            height="100%"
                            path={activeFile}
                            language="javascript"
                            theme="titan-dark"
                            value={files[activeFile]?.content}
                            onChange={updateContent}
                            beforeMount={handleBeforeMount}
                            onMount={handleMount}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13.5,
                                fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', Menlo, monospace",
                                fontLigatures: true,
                                lineHeight: 1.7,
                                padding: { top: 20, bottom: 20 },
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                cursorBlinking: "smooth",
                                cursorSmoothCaretAnimation: "on",
                                bracketPairColorization: { enabled: true },
                                renderLineHighlight: "gutter",
                                overviewRulerLanes: 0,
                                hideCursorInOverviewRuler: true,
                                lineNumbers: "on",
                                tabSize: 4,
                                wordWrap: "off",
                                scrollbar: {
                                    vertical: "auto",
                                    horizontal: "auto",
                                    verticalScrollbarSize: 5,
                                    horizontalScrollbarSize: 5,
                                    useShadows: false,
                                },
                                quickSuggestions: { other: true, comments: false, strings: true },
                                suggestOnTriggerCharacters: true,
                                acceptSuggestionOnEnter: "smart",
                                parameterHints: { enabled: true },
                            }}
                        />
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="w-[380px] shrink-0 border-l border-[#30363d] bg-[#0d1117] flex flex-col min-h-0">

                    {/* ── Request Builder ── */}
                    <div className="shrink-0 border-b border-[#30363d]">
                        <div className="flex items-center gap-2 px-3 h-9 border-b border-[#30363d]">
                            <Globe size={11} className="text-[#7d8590]" />
                            <span className="text-[9px] uppercase tracking-widest text-[#7d8590] font-semibold">Request</span>
                        </div>
                        <div className="p-3 space-y-2">
                            <div className="flex gap-2">
                                <select
                                    value={method}
                                    onChange={e => setMethod(e.target.value)}
                                    className="bg-[#161b22] border border-[#30363d] text-[#cdd9e5] text-[12px] font-mono rounded px-2 py-1.5 focus:outline-none focus:border-[#388bfd] w-[72px] appearance-none"
                                >
                                    <option>GET</option>
                                    <option>POST</option>
                                    <option>PUT</option>
                                    <option>DELETE</option>
                                    <option>PATCH</option>
                                </select>
                                <input
                                    type="text"
                                    value={urlPath}
                                    onChange={e => setUrlPath(e.target.value)}
                                    onKeyDown={onUrlKeyDown}
                                    placeholder="/route"
                                    className="flex-1 bg-[#161b22] border border-[#30363d] text-[#cdd9e5] text-[12px] font-mono rounded px-3 py-1.5 focus:outline-none focus:border-[#388bfd] placeholder:text-[#3d444d]"
                                />
                            </div>
                            {method !== "GET" && method !== "DELETE" && (
                                <textarea
                                    value={reqBody}
                                    onChange={e => setReqBody(e.target.value)}
                                    spellCheck={false}
                                    rows={3}
                                    className="w-full bg-[#161b22] border border-[#30363d] text-[#cdd9e5] text-[12px] font-mono rounded px-3 py-2 focus:outline-none focus:border-[#388bfd] placeholder:text-[#3d444d] resize-none"
                                />
                            )}
                        </div>
                    </div>

                    {/* ── Panel Tabs ── */}
                    <div className="shrink-0 flex border-b border-[#30363d]">
                        {(["response", "terminal"] as const).map(p => (
                            <button key={p} onClick={() => setActivePanel(p)}
                                className={`flex-1 text-[10px] uppercase tracking-widest font-semibold h-9 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${activePanel === p
                                    ? "text-[#79c0ff] border-[#1f6feb]"
                                    : "text-[#7d8590] border-transparent hover:text-[#cdd9e5]"
                                    }`}
                            >
                                {p === "response" ? <Globe size={11} /> : <Terminal size={11} />}
                                {p === "response" ? "Response" : "Terminal"}
                                {p === "terminal" && logs.length > 0 && (
                                    <span className="w-4 h-4 bg-[#1f6feb]/20 text-[#79c0ff] rounded-full text-[9px] flex items-center justify-center">
                                        {Math.min(logs.length, 99)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── Panel Content ── */}
                    <div ref={panelRef} className="flex-1 min-h-0 overflow-y-auto">

                        {/* RESPONSE PANEL */}
                        {activePanel === "response" && (
                            <div className="h-full flex flex-col">
                                {status === "idle" && (
                                    <div className="flex flex-col items-center justify-center gap-3 h-full text-[#3d444d]">
                                        <Globe size={40} strokeWidth={1} />
                                        <p className="text-[13px]">Press Run or ↵ Enter to execute</p>
                                    </div>
                                )}
                                {status === "running" && (
                                    <div className="flex flex-col items-center justify-center gap-3 h-full text-[#7d8590]">
                                        <Loader2 size={32} className="animate-spin text-[#1f6feb]" />
                                        <p className="text-[13px]">Spinning up Titan Engine…</p>
                                        <button onClick={handleStop} className="text-[11px] text-[#da3633] hover:text-[#f85149] flex items-center gap-1 mt-1">
                                            <Square size={11} className="fill-current" /> Stop
                                        </button>
                                    </div>
                                )}
                                {status === "error" && errorMsg && (
                                    <div className="p-4">
                                        <div className="rounded-md bg-[#da3633]/10 border border-[#da3633]/30 p-4">
                                            <p className="text-[11px] font-semibold text-[#f85149] uppercase tracking-wide mb-2">Error</p>
                                            <pre className="text-[12px] font-mono text-[#f85149]/80 whitespace-pre-wrap break-words leading-relaxed">{errorMsg}</pre>
                                        </div>
                                    </div>
                                )}
                                {status === "success" && response && (
                                    <div className="flex flex-col h-full">
                                        {/* Status bar + view toggle */}
                                        <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${response.status >= 200 && response.status < 300 ? "bg-[#238636]/20 text-[#3fb950]" :
                                                    response.status >= 400 ? "bg-[#da3633]/15 text-[#f85149]" :
                                                        "bg-[#9e6a03]/20 text-[#d29922]"
                                                    }`}>{response.status}</span>
                                                <span className="text-[11px] text-[#7d8590]">Gravity Engine</span>
                                            </div>

                                            {/* JSON / HTML toggle */}
                                            {typeof response.data === "string" && response.data.trimStart().startsWith("<") && (
                                                <div className="flex rounded-md overflow-hidden border border-[#30363d]">
                                                    {(["json", "html"] as const).map(v => (
                                                        <button key={v} onClick={() => setViewMode(v)}
                                                            className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide transition-colors ${viewMode === v ? "bg-[#1f6feb]/20 text-[#79c0ff]" : "text-[#7d8590] hover:text-[#cdd9e5]"
                                                                }`}
                                                        >
                                                            {v === "json" ? <Code2 size={11} /> : <Globe size={11} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {response.error && (
                                            <div className="mx-4 mb-2 p-2 bg-[#da3633]/10 border border-[#da3633]/25 rounded text-[11px] font-mono text-[#f85149]">
                                                {response.error}
                                            </div>
                                        )}

                                        {/* HTML preview (iframe) */}
                                        {isHtmlResponse ? (
                                            <div className="flex-1 min-h-0 mx-4 mb-4 rounded-md overflow-hidden border border-[#30363d]">
                                                <iframe
                                                    srcDoc={response.data}
                                                    sandbox="allow-scripts allow-same-origin"
                                                    className="w-full h-full bg-white"
                                                    title="Response preview"
                                                />
                                            </div>
                                        ) : (
                                            /* JSON / text response */
                                            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                                                <pre className="p-4 bg-[#010409] rounded-md border border-[#30363d] text-[12px] font-mono text-[#3fb950] break-words whitespace-pre-wrap leading-relaxed">
                                                    {typeof response.data === "object"
                                                        ? JSON.stringify(response.data, null, 2)
                                                        : String(response.data ?? "(empty)")}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TERMINAL PANEL */}
                        {activePanel === "terminal" && (
                            <div className="p-3 font-mono text-[12px] leading-relaxed">
                                {logs.length === 0 ? (
                                    <div className="flex items-center justify-center py-16">
                                        <p className="text-[#3d444d]">No output yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-0.5">
                                        {logs.map((line, i) => {
                                            const isEngine = /⏣|Titan Planet|TitanPL|Extension loaded/.test(line)
                                            const isReady = /server running|Ready/.test(line)
                                            const isError = /❌|Error|Failed|ERR_/.test(line)
                                            const isWarn = /Warn|warn|⚠/.test(line)
                                            const isLog = /\[Titan\]/.test(line)
                                            return (
                                                <div key={i} className={`break-words ${isEngine ? "text-[#79c0ff] font-semibold" :
                                                    isReady ? "text-[#3fb950]" :
                                                        isError ? "text-[#f85149]" :
                                                            isWarn ? "text-[#d29922]" :
                                                                isLog ? "text-[#a5d6ff]" :
                                                                    "text-[#7d8590]"
                                                    }`}>{line || " "}</div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

// ─── Sidebar file item ─────────────────────────────────────────────────────────
function SidebarFile({ fileKey, file, active, onSelect, onDelete }: {
    fileKey: string; file: FileNode; active: boolean
    onSelect: () => void; onDelete: ((e: React.MouseEvent) => void) | null
}) {
    const isApp = fileKey === "app/app.js"
    return (
        <div onClick={onSelect}
            className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-[12px] transition-all ${active ? "bg-[#1f6feb]/12 text-[#79c0ff]" : "text-[#7d8590] hover:bg-white/3 hover:text-[#cdd9e5]"
                }`}
        >
            <div className="flex items-center gap-2 min-w-0">
                {isApp ? <FileJson size={12} className="text-[#e3b341] shrink-0" />
                    : <FileCode size={12} className="text-[#79c0ff] shrink-0" />}
                <span className="truncate">{file.name}</span>
            </div>
            {onDelete && (
                <button onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 text-[#3d444d] hover:text-[#f85149] transition-all shrink-0 ml-1 p-0.5">
                    <Trash2 size={11} />
                </button>
            )}
        </div>
    )
}
