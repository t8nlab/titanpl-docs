'use client';
import useSWR from 'swr';
import { showToast } from '@/lib/toast';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Plus, Bell, ChevronDown } from 'lucide-react';

import PostCard from './PostCard';
import AuthModal from './AuthModal';
import CreatePostModal from './CreatePostModal';
import CommentsModal from './CommentsModal';
import CollaboratorsModal from './CollaboratorsModal';
import NotificationsModal from './NotificationsModal';
import Image from 'next/image';

export default function Community() {
    const { user, logout, loading } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);


    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeCommentPost, setActiveCommentPost] = useState<any | null>(null);
    const [activeCollaboratorPost, setActiveCollaboratorPost] = useState<any | null>(null);


    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [postLoading, setPostLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);


    const observer = useRef<IntersectionObserver | null>(null);
    const lastPostElementRef = useRef<HTMLDivElement>(null);


    const [columns, setColumns] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setColumns(3);
            else if (window.innerWidth >= 768) setColumns(2);
            else setColumns(1);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadPosts = async (pageNum: number) => {
        if (postLoading) return;
        setPostLoading(true);
        try {

            const res = await fetch(`/api/posts?page=${pageNum}&limit=30`);
            const data = await res.json();
            if (Array.isArray(data)) {

                if (data.length === 0) setHasMore(false);

                setPosts(prev => {

                    if (pageNum === 1) return data;


                    const existingIds = new Set(prev.map(p => p.pid));
                    const newPosts = data.filter(p => !existingIds.has(p.pid));
                    return [...prev, ...newPosts];
                });
            } else {
                setHasMore(false);
                if (pageNum === 1) setPosts([]);
            }
        } finally {
            setPostLoading(false);
            setIsInitialLoading(false);
        }
    };


    useEffect(() => {

        setPage(1);
        setPosts([]);
        setHasMore(true);
        setIsInitialLoading(true);
        loadPosts(1);
    }, [user?.uid]);


    useEffect(() => {
        if (postLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => {
                    const next = prev + 1;
                    loadPosts(next);
                    return next;
                });
            }
        });

        if (lastPostElementRef.current) observer.current.observe(lastPostElementRef.current);
    }, [postLoading, hasMore]);



    const getColumns = () => {
        const cols: any[][] = Array.from({ length: columns }, () => []);
        posts.forEach((post, i) => {
            cols[i % columns].push(post);
        });
        return cols;
    };

    const distributedPosts = getColumns();

    const toggleLike = async (pid: string) => {
        if (!user) { setIsAuthOpen(true); return; }

        setPosts(posts.map(p => {
            if (p.pid === pid) {
                return { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked };
            }
            return p;
        }));

        const res = await fetch(`/api/posts/${pid}/like`, { method: 'POST' });
        if (!res.ok) {
            showToast.error("Error", "Failed to like post");
        }
    };

    const fetcher = (url: string) => fetch(url).then(res => res.json());
    const { data: notificationsData } = useSWR(user ? '/api/notifications' : null, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000
    });

    const [unseenNotifications, setUnseenNotifications] = useState<any[]>([]);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        if (notificationsData && Array.isArray(notificationsData)) {
            const lastCheck = localStorage.getItem('titan_last_check');
            const lastDate = lastCheck ? new Date(lastCheck) : new Date(0);
            const newOnes = notificationsData.filter((n: any) => new Date(n.createdAt) > lastDate);
            setUnseenNotifications(newOnes);

            if (newOnes.length > 0) {
                setShowTooltip(true);
                setTimeout(() => setShowTooltip(false), 3000);
            }
        }
    }, [notificationsData]);


    const handleBellClick = () => {
        setIsNotificationsOpen(true);
        setUnseenNotifications([]);
        localStorage.setItem('titan_last_check', new Date().toISOString());
    };

    const handleCreatePostSuccess = async () => {
        loadPosts(1);
    };

    const handleNotificationClick = async (pid: string) => {

        const existing = posts.find(p => p.pid === pid);
        if (existing) {
            setActiveCommentPost(existing);
        } else {

            try {
                const res = await fetch(`/api/posts/${pid}`);
                if (res.ok) {
                    const post = await res.json();
                    setActiveCommentPost(post);
                }
            } catch (e) {
                console.error("Failed to fetch notification post", e);
            }
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 relative font-sans overflow-x-hidden transition-colors duration-300">

            <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-black/80 transition-colors duration-300">
                <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Titan Atmosphere
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsCreatePostOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm"
                            >
                                <Plus size={18} className="sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Create Post</span>
                            </button>

                            <button
                                onClick={handleBellClick}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white relative group/bell"
                            >
                                <Bell size={20} className={unseenNotifications.length > 0 ? "animate-pulse" : ""} />
                                {unseenNotifications.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-black animate-pulse" />
                                )}


                                {showTooltip && unseenNotifications.length > 0 && (
                                    <div className="absolute top-full right-0 mt-4 w-60 bg-white dark:bg-[#151518] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-500 cursor-default">
                                        <div className="absolute -top-1 right-3 w-2 h-2 bg-white dark:bg-[#151518] border-l border-t border-gray-200 dark:border-white/10 rotate-45" />
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-black dark:text-white">{unseenNotifications.length} New Interaction{unseenNotifications.length > 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="flex -space-x-1.5 overflow-hidden mb-2 pl-1">
                                            {unseenNotifications.slice(0, 5).map((n, i) => (
                                                <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#151518] bg-gray-200 dark:bg-gray-700 overflow-hidden relative z-0 hover:z-10 transition-all">
                                                    {n.actorAvatar ? (
                                                        <img src={n.actorAvatar} alt={n.actorName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-500">{n.actorName?.[0]}</div>
                                                    )}
                                                </div>
                                            ))}
                                            {unseenNotifications.length > 5 && (
                                                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#151518] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[8px] text-gray-500 font-bold z-0">
                                                    +{unseenNotifications.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/10 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white text-black flex items-center justify-center font-bold text-sm overflow-hidden">
                                        {user.avatarUrl ? (
                                            <Image height={40} width={40} src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            user.username[0].toUpperCase()
                                        )}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">{user.username}</span>
                                    <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-40 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 mb-1 bg-gray-50 dark:bg-white/5">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Signed in as</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                                            </div>
                                            <button
                                                onClick={() => { logout(); setIsProfileOpen(false); }}
                                                className="w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors text-sm font-medium"
                                            >
                                                <LogOut size={16} />
                                                <span>Log out</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <a href="/login" className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                                Login
                            </a>
                            <button
                                onClick={() => { setIsAuthOpen(true); }}
                                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
                            >
                                Join Community
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8 pb-20">
                <div className="flex flex-col items-center justify-center mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-500 bg-clip-text text-transparent">
                        Discover Thoughts & Projects
                    </h1>
                </div>


                {isInitialLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 bg-white/5 rounded-3xl border border-white/5" />
                        ))}
                    </div>
                )}

                {!isInitialLoading && (
                    <div className="flex gap-6 items-start">
                        {distributedPosts.map((col, colIndex) => (
                            <div key={colIndex} className="flex flex-col gap-6 flex-1 min-w-0">
                                {col.map((post) => (
                                    <PostCard
                                        key={post.pid}
                                        post={post}
                                        onLike={toggleLike}
                                        onCommentClick={setActiveCommentPost}
                                        onCollaboratorClick={setActiveCollaboratorPost}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )}


                <div ref={lastPostElementRef} className="h-10 w-full mt-8" />

                {!isInitialLoading && posts.length === 0 && (
                    <div className="text-center text-gray-500 py-32 animate-in fade-in duration-500">
                        <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">It's quiet here...</div>
                        <p>Be the first to launch a project into the atmosphere.</p>
                    </div>
                )}
            </main>


            <CreatePostModal
                isOpen={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
                onPostCreated={handleCreatePostSuccess}
                user={user}
            />

            {activeCommentPost && (
                <CommentsModal
                    post={activeCommentPost}
                    onClose={() => setActiveCommentPost(null)}
                    user={user}
                    onCollaboratorClick={setActiveCollaboratorPost}
                />
            )}

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onSuccess={(user) => {
                    setIsAuthOpen(false);
                    setIsAuthOpen(false);
                }}
            />

            {activeCollaboratorPost && (
                <CollaboratorsModal
                    collaborators={activeCollaboratorPost.collaborators}
                    onClose={() => setActiveCollaboratorPost(null)}
                />
            )}

            {isNotificationsOpen && (
                <NotificationsModal
                    onClose={() => setIsNotificationsOpen(false)}
                    onNotificationClick={handleNotificationClick}
                />
            )}
        </div>
    );
}
