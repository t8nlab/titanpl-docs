'use client';
import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Simple Tree Builder
const buildCommentTree = (comments: any[]) => {
    const map = new Map();
    const roots: any[] = [];
    comments.forEach(c => {
        c.children = [];
        map.set(c.id, c);
    });
    comments.forEach(c => {
        if (c.parentId && map.has(c.parentId)) {
            map.get(c.parentId).children.push(c);
        } else {
            roots.push(c);
        }
    });
    return roots;
};

const CommentItem = ({ comment, depth = 0, postAuthorId, onReply, innerRef }: { comment: any, depth?: number, postAuthorId: string, onReply: (username: string, id: string) => void, innerRef?: React.Ref<HTMLDivElement> }) => {
    return (
        <div ref={innerRef} className={cn("relative flex gap-3", depth > 0 && "ml-4 mt-3")}>
            {depth > 0 && (
                <div className="absolute -left-4 top-0 w-4 h-4 border-l-2 border-b-2 border-gray-200 dark:border-white/10 rounded-bl-xl -translate-y-2" />
            )}
            <div className="flex-shrink-0 mt-1 relative">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-white dark:border-white/10">
                    {comment.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={comment.avatarUrl} alt={comment.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-xs font-bold text-gray-700 dark:text-gray-300">
                            {comment.username[0].toUpperCase()}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-grow min-w-0">
                <div className="bg-gray-50 dark:bg-[#1A1A1D] rounded-xl px-4 py-2 border border-gray-100 dark:border-white/5 relative group">
                    {postAuthorId === comment.userId && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-blue-600 rounded-full text-[9px] font-bold text-white shadow-lg border border-white dark:border-[#0F0F12]">
                            AUTHOR
                        </div>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-200">{comment.username}</span>
                        <span className="text-[10px] text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    <button
                        onClick={() => onReply(comment.username, comment.id)}
                        className="text-[10px] text-gray-500 font-medium mt-2 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        Reply
                    </button>
                </div>
                {comment.children && comment.children.length > 0 && (
                    <div className="mt-2 border-l-2 border-gray-200 dark:border-white/5 pl-0 relative">
                        {comment.children.map((child: any) => (
                            <CommentItem key={child.id} comment={child} depth={depth + 1} postAuthorId={postAuthorId} onReply={onReply} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

interface CommentsModalProps {
    post: any;
    onClose: () => void;
    user: any;
}

export default function CommentsModal({ post, onClose, user }: CommentsModalProps) {
    const [comments, setComments] = useState<any[]>([]); // Flat list
    const [commentText, setCommentText] = useState('');
    const [commenting, setCommenting] = useState(false);
    const [replyTo, setReplyTo] = useState<{ id: string, username: string } | null>(null);

    // Comments Infinite Scroll State
    const [commentPage, setCommentPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(false);

    const commentObserver = useRef<IntersectionObserver | null>(null);
    const lastCommentElementRef = useRef<HTMLDivElement>(null);

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


    const handleComment = async () => {
        if (!post || !commentText.trim() || !user) return;
        setCommenting(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                body: JSON.stringify({
                    postId: post.pid,
                    content: commentText,
                    parentId: replyTo?.id
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setCommentText('');
                setReplyTo(null);
                // Refresh comments
                // Reset everything to fetch fresh
                setCommentPage(1);
                setHasMoreComments(true);
                setComments([]);
                loadComments(post.pid, 1);
            }
        } finally {
            setCommenting(false);
        }
    };

    const tree = buildCommentTree(comments);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-white dark:bg-[#0F0F12] border-t sm:border border-gray-200 dark:border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
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
                                    <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs font-bold text-gray-700 dark:text-gray-300">{post.author?.username?.[0] || 'U'}</div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{post.title}</div>
                                <div className="text-xs text-gray-500">Posted by {post.author?.username}</div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{post.content}</p>
                    </div>

                    {/* Comments Tree */}
                    <div className="space-y-6 pb-20">
                        {tree.map((c: any, index: number) => {
                            const isLast = index === tree.length - 1;
                            return (
                                <CommentItem
                                    key={c.id}
                                    innerRef={isLast ? lastCommentElementRef : undefined}
                                    comment={c}
                                    postAuthorId={post.authorId}
                                    onReply={(username, id) => {
                                        setReplyTo({ id, username });
                                    }}
                                />
                            );
                        })}
                        {comments.length === 0 && (
                            <div className="text-center text-gray-500 py-10 text-sm">No comments yet. Be the first!</div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-[#0F0F12] border-t border-gray-200 dark:border-white/10 rounded-b-2xl transition-colors">
                    {replyTo && (
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-lg mb-2 text-xs border border-blue-100 dark:border-transparent">
                            <span>Replying to <b>@{replyTo.username}</b></span>
                            <button onClick={() => setReplyTo(null)} className="hover:text-black dark:hover:text-white"><X size={12} /></button>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <div className="flex-grow relative">
                            <input
                                className="w-full bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3 text-sm text-black dark:text-white outline-none border border-gray-200 dark:border-white/10 focus:border-blue-500/50 dark:focus:border-white/30 transition-colors placeholder-gray-400 dark:placeholder-gray-600"
                                placeholder={replyTo ? `Reply to ${replyTo.username}...` : "Write a comment..."}
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleComment();
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleComment}
                            disabled={commenting || !commentText.trim()}
                            className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/10 dark:shadow-blue-900/20"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
