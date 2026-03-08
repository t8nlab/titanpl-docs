"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Search, Boxes, ShieldCheck, Github, ExternalLink,
    PlusCircle, Info, ChevronRight, Package, Loader2,
    ShieldAlert, Globe, ArrowRight, Lock, Rocket,
    CheckCircle2, AlertCircle, Download, User
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/lib/toast";
import AuthModal from "@/app/components/AuthModal";

interface Extension {
    id: string;
    name: string;
    npmPackage: string;
    githubRepo: string;
    docsLink: string;
    description: string;
    publisherId: string | null;
    isOfficial: boolean;
    createdAt: string;
    publisher?: {
        username: string;
        avatarUrl: string | null;
    };
}

export default function ExtensionsMarket() {
    const { user } = useAuth();
    const [extensions, setExtensions] = useState<Extension[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "official" | "community">("all");
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [npmPackage, setNpmPackage] = useState("");
    const [githubRepo, setGithubRepo] = useState("");
    const [docsLink, setDocsLink] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchExtensions = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/extensions");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch extensions");
            setExtensions(data);
        } catch (err: any) {
            console.error(err);
            setExtensions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExtensions();
    }, []);

    const filteredExtensions = extensions.filter(ext => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = ext.name.toLowerCase().includes(query) ||
            ext.npmPackage.toLowerCase().includes(query) ||
            ext.description.toLowerCase().includes(query);

        const matchesFilter = filter === "all" ? true :
            filter === "official" ? ext.isOfficial :
                !ext.isOfficial;
        return matchesSearch && matchesFilter;
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/extensions", {
                method: "POST",
                body: JSON.stringify({ name, npmPackage, githubRepo, docsLink, description }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            showToast.success("Extension Registered", `${name} is now available in the market.`);
            setIsRegisterModalOpen(false);
            fetchExtensions();
            // Reset form
            setName("");
            setNpmPackage("");
            setGithubRepo("");
            setDocsLink("");
            setDescription("");
        } catch (err: any) {
            showToast.error("Failed to Register", err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#010101] text-white pt-24 pb-20 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6">
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md mb-6 transform hover:scale-105 transition-transform cursor-default">
                        {isMounted && <Boxes size={14} className="text-blue-400" />}
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">Titan Planet Ecosystem</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-b from-white via-white/90 to-white/40">
                        Extension Market
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-10 leading-relaxed font-medium">
                        Boost your Titan architectures with modular features. Discover verified expansions and community contributions for the Gravity Runtime.
                    </p>

                    <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search extensions or keywords..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/3 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-blue-500/40 outline-none transition-all focus:ring-4 focus:ring-blue-500/5 group-hover:bg-white/8"
                            />
                        </div>
                        <button
                            onClick={() => user ? setIsRegisterModalOpen(true) : setIsAuthModalOpen(true)}
                            className="bg-white text-black font-black rounded-2xl px-8 py-4 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5"
                        >
                            <PlusCircle size={20} />
                            Publish Extension
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
                        {[
                            { id: "all", label: "All Packages", icon: Package },
                            { id: "official", label: "Verified", icon: ShieldCheck },
                            { id: "community", label: "Community", icon: Globe },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setFilter(item.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === item.id
                                    ? "bg-white text-black shadow-xl"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon size={16} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="text-sm font-medium">
                        <span className="text-gray-500 tracking-wider">FOUND </span>
                        <span className="text-blue-400 font-black">{filteredExtensions.length}</span>
                        <span className="text-gray-500 tracking-wider"> EXTENSIONS</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="relative">
                            <Loader2 size={48} className="animate-spin text-blue-500" />
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                        </div>
                        <span className="text-gray-500 font-bold tracking-widest text-[10px] animate-pulse">SYNCHRONIZING ORBIT...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredExtensions.map((ext) => (
                            <ExtensionCard key={ext.id} ext={ext} />
                        ))}

                        {filteredExtensions.length === 0 && (
                            <div className="col-span-full py-32 bg-white/3 border border-dashed border-white/10 rounded-[40px] flex flex-col items-center gap-6">
                                <div className="p-6 bg-white/5 rounded-3xl">
                                    <Search size={40} className="text-gray-600" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-black">No matches found</h3>
                                    <p className="text-gray-500 max-w-sm">We couldn't find any extensions matching your current search parameters.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isRegisterModalOpen && (
                <div className="fixed inset-0 z-60 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsRegisterModalOpen(false)} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl p-4">
                        <div className="bg-[#0A0A0C] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_-20px_rgba(59,130,246,0.2)]">
                            <div className="p-10 pb-6 border-b border-white/5 relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                    <Rocket size={120} />
                                </div>
                                <div className="flex justify-between items-center mb-8">
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                        <PlusCircle className="text-blue-400" size={24} />
                                    </div>
                                    <button onClick={() => setIsRegisterModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                        <PlusCircle className="rotate-45 text-gray-500" size={20} />
                                    </button>
                                </div>
                                <h2 className="text-3xl font-black mb-2 tracking-tight">Register Extension</h2>
                                <p className="text-gray-500 text-sm font-medium">
                                    Official tags are <span className="text-blue-400">Verified</span> automatically using advanced heuristics.
                                </p>
                            </div>

                            <form onSubmit={handleRegister} className="p-10 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Extension Name</label>
                                        <input
                                            type="text" value={name} onChange={e => setName(e.target.value)} required
                                            placeholder="Titan UI"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">NPM Package</label>
                                        <input
                                            type="text" value={npmPackage} onChange={e => setNpmPackage(e.target.value)} required
                                            placeholder="@titanpl/ui"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500/50 outline-none transition-all font-mono placeholder:text-gray-700"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</label>
                                    <textarea
                                        value={description} onChange={e => setDescription(e.target.value)} required
                                        rows={3} placeholder="What does this extension do?"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500/50 outline-none transition-all resize-none placeholder:text-gray-700"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">GitHub Repo</label>
                                        <input
                                            type="url" value={githubRepo} onChange={e => setGithubRepo(e.target.value)} required
                                            placeholder="https://github.com/..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Docs (Optional)</label>
                                        <input
                                            type="url" value={docsLink} onChange={e => setDocsLink(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit" disabled={submitting}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/20"
                                >
                                    {submitting ? <Loader2 size={20} className="animate-spin" /> : <Rocket size={20} />}
                                    PUBLISH TO MARKET
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => {
                    setIsAuthModalOpen(false);
                    setIsRegisterModalOpen(true);
                }}
            />
        </div>
    );
}

function ExtensionCard({ ext }: { ext: Extension }) {
    const [downloads, setDownloads] = useState<number | null>(null);

    useEffect(() => {
        fetch(`https://api.npmjs.org/downloads/point/last-month/${ext.npmPackage}`)
            .then(res => res.json())
            .then(data => setDownloads(data.downloads))
            .catch(() => setDownloads(0));
    }, [ext.npmPackage]);

    return (
        <div className="group relative flex flex-col bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/4 hover:border-white/15 transition-all duration-500 transform hover:-translate-y-2 shadow-2xl">
            {/* Visual Header */}
            <div className="h-32 bg-linear-to-br from-white/5 to-transparent relative overflow-hidden">
                <div className={`absolute inset-0 opacity-10 blur-3xl ${ext.isOfficial ? 'bg-blue-600' : 'bg-emerald-600'}`} />
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    {ext.isOfficial ? <Boxes size={80} /> : <Package size={80} />}
                </div>

                {/* Icon Circle */}
                <div className="absolute -bottom-6 left-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#0A0A0C] border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                        <Image
                            src="/images/titanpl-ext.png"
                            alt={ext.name}
                            width={48}
                            height={48}
                            className="object-contain p-2"
                        />
                    </div>
                </div>
            </div>

            <div className="p-8 pt-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 opacity-5 pointer-events-none absolute top-4 right-4">
                        {ext.isOfficial ? <Boxes size={40} /> : <Package size={40} />}
                    </div>
                    {ext.isOfficial && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 tracking-widest">
                            <ShieldCheck size={12} />
                            VERIFIED
                        </div>
                    )}
                </div>

                <Link href={`/extensions/${ext.npmPackage.replace('@', '')}`} className="block group/title">
                    <h3 className="text-2xl font-black mb-1 group-hover/title:text-blue-400 transition-colors tracking-tight">{ext.name}</h3>
                </Link>
                <code className="block text-[10px] text-gray-600 font-mono mb-6 tracking-tighter opacity-80">
                    {ext.npmPackage}
                </code>

                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-8 flex-1">
                    {ext.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Downloads</span>
                        <div className="flex items-center gap-1.5 text-white font-black text-sm">
                            <Download size={12} className="text-blue-500" />
                            {downloads !== null ? downloads.toLocaleString() : '---'}
                        </div>
                    </div>

                    <Link
                        href={`/extensions/${ext.npmPackage.replace('@', '')}`}
                        className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group/arrow"
                    >
                        <ArrowRight size={18} className="group-hover/arrow:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Publisher Badge */}
            <div className="px-8 py-5 bg-white/3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-500 overflow-hidden">
                        {ext.publisher?.avatarUrl ? (
                            <Image src={ext.publisher.avatarUrl} alt={ext.publisher.username} width={24} height={24} />
                        ) : (
                            ext.publisher?.username?.charAt(0) || 'T'
                        )}
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{ext.publisher?.username || 'Titan'}</span>
                </div>
                <div className="flex gap-3">
                    {ext.githubRepo && (
                        <Link href={ext.githubRepo} target="_blank" className="text-gray-600 hover:text-white transition-colors">
                            <Github size={14} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
