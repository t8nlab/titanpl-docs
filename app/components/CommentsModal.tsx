'use client';
import { formatDistanceToNow } from 'date-fns';
import { showToast } from '@/lib/toast';
import { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { RiChat1Line } from '@remixicon/react';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}



const CommentItem = ({ comment, depth = 0, postAuthorId, onReply, onLoadReplies, onLike, isLast, innerRef }: { comment: any, depth?: number, postAuthorId: string, onReply: (username: string, id: string) => void, onLoadReplies: (parentId: string) => void, onLike: (id: string) => void, isLast?: boolean, innerRef?: React.Ref<HTMLDivElement> }) => {
    const [visibleCount, setVisibleCount] = useState(10);

    const loadedReplies = comment.children?.length || 0;
    const totalReplies = Math.max(Number(comment.replyCount) || 0, loadedReplies);

    const showingCount = Math.min(visibleCount, loadedReplies);
    const hasMore = showingCount < totalReplies;

    return (
        <div ref={innerRef} className={cn("relative flex gap-2 sm:gap-3 animate-in fade-in zoom-in-95 duration-200", depth > 0 && "ml-2 sm:ml-4 mt-3")}>
            {/* Connector Lines */}
            {depth > 0 && (
                <>
                    {/* Curved connector to this item */}
                    <div className="absolute -left-2 sm:-left-4 top-0 w-2 sm:w-4 h-6 border-l-2 border-b-2 border-gray-200 dark:border-white/10 rounded-bl-xl" />
                    {/* Vertical rail continuing down if not last */}
                    {!isLast && (
                        <div className="absolute -left-2 sm:-left-4 top-0 bottom-0 w-[2px] bg-gray-200 dark:bg-white/10" />
                    )}
                </>
            )}

            <div className="flex-shrink-0 mt-1 relative z-10">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden ring-2 ring-white dark:ring-[#0F0F12]">
                    {comment.avatarUrl ? (
                        <Image height={40} width={40} src={comment.avatarUrl} alt={comment.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-xs font-bold text-gray-700 dark:text-gray-300">
                            {comment.username[0].toUpperCase()}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-grow min-w-0">
                <div className="bg-gray-50 dark:bg-[#1A1A1D] rounded-xl px-3 sm:px-4 py-2 border border-gray-100 dark:border-white/5 relative group">
                    {postAuthorId === comment.userId && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-blue-600 rounded-full text-[9px] font-bold text-white border border-white dark:border-[#0F0F12]">
                            AUTHOR
                        </div>
                    )}
                    <div className="items-center gap-2 mb-1 sm:mb-2 leading-none">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-200">{comment.username}</span>
                        <span className="text-gray-500 text-[10px] sm:text-xs ml-2">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                        {depth < 3 && (
                            <button
                                onClick={() => onReply(comment.username, comment.id)}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                                <div className="p-1 rounded-full bg-gray-200 dark:bg-white/10">
                                    <RiChat1Line size={12} />
                                </div>
                                Reply
                            </button>
                        )}

                        <button
                            onClick={() => onLike(comment.id)}
                            className={cn("flex items-center gap-1.5 text-[10px] font-bold transition-colors",
                                comment.isLiked ? "text-pink-500" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            )}
                        >
                            <div className={cn("p-1 rounded-full transition-colors", comment.isLiked ? "bg-pink-100 dark:bg-pink-900/30" : "bg-gray-200 dark:bg-white/10")}>
                                <Heart size={12} className={cn(comment.isLiked && "fill-current")} />
                            </div>
                            {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                        </button>
                    </div>
                </div>

                {/* Replies Container */}
                {(loadedReplies > 0 || hasMore) && (
                    <div className="mt-2 pl-0 relative ml-2">

                        {comment.children?.slice(0, visibleCount).map((child: any, index: number, arr: any[]) => (
                            <MemoizedCommentItem
                                key={child.id}
                                comment={child}
                                depth={depth + 1}
                                postAuthorId={postAuthorId}
                                onReply={onReply}
                                onLoadReplies={onLoadReplies}
                                onLike={onLike}
                                isLast={index === arr.length - 1 && !hasMore}
                            />
                        ))}

                        {/* Button logic */}
                        {hasMore && (
                            <div className="relative flex gap-3 ml-2 sm:ml-4 mt-3">
                                {/* Connector for button */}
                                <div className="absolute -left-2 sm:-left-4 top-0 w-2 sm:w-4 h-4 border-l-2 border-b-2 border-gray-200 dark:border-white/10 rounded-bl-xl" />

                                <button
                                    onClick={() => {
                                        if (visibleCount >= loadedReplies) {
                                            onLoadReplies(comment.id);
                                        }
                                        setVisibleCount(prev => prev + 10);
                                    }}
                                    className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 font-medium transition-colors relative group h-8"
                                >
                                    <span className="group-hover:underline">
                                        {`Show ${Math.max(0, totalReplies - showingCount)} more replies`}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Optimized Tree Builder (No deep signature calculation)
const buildCommentTree = (comments: any[]) => {
    const map = new Map();
    const roots: any[] = [];

    // 1. Create nodes and map
    const nodes = comments.map(c => ({
        ...c,
        children: []
    }));

    nodes.forEach(c => {
        map.set(c.id, c);
    });

    // 2. Build Tree Structure
    nodes.forEach(c => {
        if (c.parentId && map.has(c.parentId)) {
            map.get(c.parentId).children.push(c);
        } else {
            roots.push(c);
        }
    });

    return roots;
};

// ... (CommentItem)

const arePropsEqual = (prev: any, next: any) => {
    // 1. Identity
    if (prev.comment.id !== next.comment.id) return false;

    // 2. Props Check
    if (prev.isLast !== next.isLast) return false;
    if (prev.depth !== next.depth) return false;

   
    return prev.comment === next.comment;
};

const MemoizedCommentItem = memo(CommentItem, arePropsEqual);

const CommentInput = memo(({ replyTo, onCancelReply, onSubmit, disabled }: { replyTo: any, onCancelReply: () => void, onSubmit: (text: string) => Promise<void>, disabled: boolean }) => {
    const [text, setText] = useState('');

    const handleSubmit = async () => {
        if (!text.trim()) return;
        await onSubmit(text);
        setText('');
    };

    return (
        <div className="p-4 bg-white dark:bg-[#0F0F12] border-t border-gray-200 dark:border-white/10 rounded-b-2xl transition-colors">
            {replyTo && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-3 py-2 rounded-lg mb-2 text-xs border border-blue-100 dark:border-transparent">
                    <span>Replying to <b>@{replyTo.username}</b></span>
                    <button onClick={onCancelReply} className="hover:text-black dark:hover:text-white"><X size={16} /></button>
                </div>
            )}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="flex-grow relative">
                        <input
                            className="w-full bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3 text-sm text-black dark:text-white outline-none border border-gray-200 dark:border-white/10 focus:border-blue-500/50 dark:focus:border-white/30 transition-colors placeholder-gray-400 dark:placeholder-gray-600 pr-12"
                            placeholder={replyTo ? `Reply to ${replyTo.username}...` : "Write a comment..."}
                            value={text}
                            onChange={e => {
                                if (e.target.value.length <= 300) {
                                    setText(e.target.value);
                                } else {
                                    showToast.error("Character limit reached", "Comments cannot exceed 300 characters.");
                                }
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            autoFocus
                        />
                        <div className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold transition-colors",
                            text.length >= 300 ? "text-red-500" :
                                text.length > 250 ? "text-orange-500" : "text-gray-400"
                        )}>
                            {300 - text.length}
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={disabled || !text.trim()}
                        className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/10 dark:shadow-blue-900/20"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
});

interface CommentsModalProps {
    post: any;
    onClose: () => void;
    user: any;
    onCollaboratorClick?: (post: any) => void;
}

export default function CommentsModal({ post, onClose, user, onCollaboratorClick }: CommentsModalProps) {
    const [comments, setComments] = useState<any[]>([]); // Flat list
    const commentsRef = useRef<any[]>([]);

    // Keep ref in sync
    useEffect(() => {
        commentsRef.current = comments;
    }, [comments]);

    const [commenting, setCommenting] = useState(false);
    const [replyTo, setReplyTo] = useState<{ id: string, username: string } | null>(null);

    // Comments Infinite Scroll State
    const [commentPage, setCommentPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(false);

    const commentObserver = useRef<IntersectionObserver | null>(null);
    const lastCommentElementRef = useRef<HTMLDivElement>(null);

    // Stable handler for replies
    const onReply = useMemo(() => (username: string, id: string) => {
        setReplyTo({ id, username });
    }, []);

    const loadComments = async (pid: string, pageNum: number) => {
        if (commentsLoading) return;
        setCommentsLoading(true);
        try {
            const res = await fetch(`/api/comments?postId=${pid}&page=${pageNum}&limit=10`);
            const data = await res.json();
            if (Array.isArray(data)) {
                if (data.length === 0) setHasMoreComments(false);
                setComments(prev => pageNum === 1 ? data : [...prev, ...data]);
            }
        } finally {
            setCommentsLoading(false);
        }
    };

    const loadReplies = useMemo(() => async (parentId: string) => {
        try {
            // Use ref to get current state without triggering re-render of this function
            const currentChildren = commentsRef.current.filter(c => c.parentId === parentId);
            const limit = 10; // Load 10 at a time
            const nextPage = Math.floor(currentChildren.length / limit) + 1;

            const res = await fetch(`/api/comments?postId=${post.pid}&parentId=${parentId}&page=${nextPage}&limit=${limit}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();

            if (Array.isArray(data)) {
                if (data.length === 0) {
                    // Update the comment to know it has no more replies?
                    // For now just ignore
                } else {
                    setComments(prev => {
                        const existingIds = new Set(prev.map(c => c.id));
                        const newOnes = data.filter(c => !existingIds.has(c.id));
                        if (newOnes.length === 0) return prev;
                        return [...prev, ...newOnes];
                    });
                }
            }
        } catch (e) {
            console.error("Failed to load replies", e);
            showToast.error("Error", "Could not load replies");
        }
    }, [post.pid]);

    // Fetch comments when opening modal
    useEffect(() => {
        setComments([]);
        setCommentPage(1);
        setHasMoreComments(true);
        loadComments(post.pid, 1);
    }, [post]);

    // Infinite Scroll Observer for Comments
    useEffect(() => {
        if (commentsLoading) return;
        if (commentObserver.current) commentObserver.current.disconnect();

        commentObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreComments) {
                setCommentPage(prev => {
                    const next = prev + 1;
                    loadComments(post.pid, next);
                    return next;
                });
            }
        });

        if (lastCommentElementRef.current) commentObserver.current.observe(lastCommentElementRef.current);
    }, [commentsLoading, hasMoreComments, comments.length, post.pid]);


    const handleComment = async (text: string) => {
        if (!post || !text.trim() || !user) return;
        setCommenting(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                body: JSON.stringify({
                    postId: post.pid,
                    content: text,
                    parentId: replyTo?.id
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                const { cid } = await res.json();

                const newComment = {
                    id: cid,
                    postId: post.pid,
                    userId: user.uid,
                    content: text,
                    parentId: replyTo?.id || null,
                    createdAt: new Date().toISOString(),
                    username: user.username || user.name || 'User',
                    avatarUrl: user.avatarUrl || user.image,
                    children: [],
                    replyCount: 0,
                    likeCount: 0,
                    isLiked: false
                };

                setComments(prev => {
                    let updated = [...prev, newComment];
                    if (replyTo?.id) {
                        updated = updated.map(c =>
                            c.id === replyTo.id
                                ? { ...c, replyCount: (Number(c.replyCount) || 0) + 1 }
                                : c
                        );
                    }
                    return updated;
                });

                setReplyTo(null);
                showToast.success('Comment Posted', 'Your thought has been shared.');
                // We rely on optimistic update. Background refresh could happen but might disrupt UI state.
            }
        } finally {
            setCommenting(false);
        }
    };

    const handleLike = useCallback(async (commentId: string) => {
        // Optimistic Update
        const previousComments = [...commentsRef.current];
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                const isLiked = !c.isLiked;
                const currentCount = Number(c.likeCount) || 0;
                return {
                    ...c,
                    isLiked,
                    likeCount: isLiked ? currentCount + 1 : Math.max(0, currentCount - 1)
                };
            }
            return c;
        }));

        try {
            const res = await fetch('/api/comments/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId })
            });

            if (!res.ok) {
                throw new Error("Failed to like");
            }
        } catch (e) {
            // Revert on failure
            setComments(previousComments);
            showToast.error("Error", "Failed to update like");
        }
    }, [/* No dependencies needed as we use ref and functional updates */]);

    const tree = useMemo(() => buildCommentTree(comments), [comments]);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-white dark:bg-[#0F0F12] border-t sm:border border-gray-200 dark:border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#0F0F12] rounded-t-2xl z-10 transition-colors">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                        Discussion
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 content-scrollbar relative">
                    {/* Original Post Recap */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                {post.author?.avatarUrl ? (
                                    <Image height={40} width={40} src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs font-bold text-gray-700 dark:text-gray-300">{post.author?.username?.[0] || 'U'}</div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{post.title}</div>
                                <div className="text-xs text-gray-500">Posted by {post.author?.username}</div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{post.content}</p>

                        {post.collaborators && post.collaborators.length > 0 && (
                            <div
                                className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5 cursor-pointer hover:opacity-80 transition-opacity w-fit"
                                onClick={() => onCollaboratorClick && onCollaboratorClick(post)}
                            >
                                <span className="text-xs text-gray-500 font-medium">Collaborators:</span>
                                <div className="flex items-center gap-1">
                                    {post.collaborators.slice(0, 5).map((c: any) => (
                                        <div key={c.uid} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border border-white dark:border-black overflow-hidden flex items-center justify-center text-[10px] font-bold text-gray-500" title={c.username}>
                                            {c.avatarUrl ? (
                                                <Image height={24} width={24} src={c.avatarUrl} alt={c.username} className="w-full h-full object-cover" />
                                            ) : (
                                                c.username?.[0]?.toUpperCase()
                                            )}
                                        </div>
                                    ))}
                                    {post.collaborators.length > 5 && (
                                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-white dark:border-black">
                                            +{post.collaborators.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Comments Tree */}
                    <div className="space-y-6 pb-20">
                        {tree.map((c: any, index: number) => {
                            const isLast = index === tree.length - 1;
                            return (
                                <MemoizedCommentItem
                                    key={c.id}
                                    innerRef={isLast ? lastCommentElementRef : undefined}
                                    comment={c}
                                    postAuthorId={post.authorId}
                                    onReply={onReply}
                                    onLoadReplies={loadReplies}
                                    onLike={handleLike}
                                    isLast={isLast}
                                />
                            );
                        })}
                        {comments.length === 0 && (
                            <div className="text-center text-gray-500 py-10 text-sm">No comments yet. Be the first!</div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <CommentInput
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                    onSubmit={handleComment}
                    disabled={commenting}
                />
            </div>
        </div>
    );
}
