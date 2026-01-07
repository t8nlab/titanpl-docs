'use client';
import { User, ArrowUpRight, Users } from 'lucide-react';
import { RiHeart3Fill, RiHeart3Line, RiChat1Line } from '@remixicon/react';
import Image from 'next/image';
import { forwardRef } from 'react';

interface PostCardProps {
    post: any;
    onLike: (pid: string) => void;
    onCommentClick: (post: any) => void;
    innerRef?: React.Ref<HTMLDivElement>;
}

import { formatDistanceToNow } from 'date-fns';

const PostCard = forwardRef<HTMLDivElement, PostCardProps>(({ post, onLike, onCommentClick }, ref) => {
    return (
        <div
            ref={ref}
            onDoubleClick={() => onLike(post.pid)}
            className="group rounded-3xl overflow-hidden bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-900/10 select-none shadow-sm break-inside-avoid mb-6"
        >
            {/* Card Image - Only show if there is an image or link */}
            {(post.imageUrl || post.link) && (
                <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
                    {post.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-700 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                            {post.link ? (
                                <a
                                    href={post.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#15151A] hover:bg-gray-200 dark:hover:bg-[#1A1A1F] transition-colors p-4 group/link"
                                >
                                    <div className="p-4 rounded-full bg-white dark:bg-white/5 group-hover/link:bg-blue-50 dark:group-hover/link:bg-blue-600/10 group-hover/link:text-blue-500 dark:group-hover/link:text-blue-400 transition-colors mb-2 shadow-sm dark:shadow-none">
                                        <ArrowUpRight className="opacity-50 group-hover/link:opacity-100" size={28} />
                                    </div>
                                    <span className="text-[10px] font-mono opacity-50 truncate max-w-[80%] text-center border-b border-gray-200 dark:border-white/5 pb-0.5 group-hover/link:border-blue-500/30 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-300">
                                        {(() => {
                                            try { return new URL(post.link).hostname.replace('www.', ''); }
                                            catch { return 'Visit Link'; }
                                        })()}
                                    </span>
                                </a>
                            ) : null}
                        </div>
                    )}
                    <div className="absolute top-4 left-4 pointer-events-none">
                        <span className="px-3 py-1 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold border border-gray-200 dark:border-white/10 uppercase tracking-wider text-black dark:text-white shadow-sm">Project</span>
                    </div>
                </div>
            )}

            {/* Card Content */}
            <div className="p-6 flex flex-col flex-grow relative">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col gap-1">
                        {!(post.imageUrl || post.link) && (
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Thought</span>
                        )}
                        <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{post.title}</h4>
                    </div>
                    {post.link && (
                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                            <ArrowUpRight size={18} />
                        </a>
                    )}
                </div>

                <div
                    className="cursor-pointer"
                    onClick={() => onCommentClick(post)}
                >
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                        {post.content.split(' ').map((word: string, i: number) =>
                            word.startsWith('@') ? <span key={i} className="text-blue-500 dark:text-blue-400 font-medium">{word} </span> : word + ' '
                        )}
                    </p>
                </div>

                {/* Collaborators */}
                {post.collaborators && post.collaborators.length > 0 && (
                    <div className="flex items-center gap-1 mb-4">
                        <Users size={12} className="text-gray-500 mr-1" />
                        {post.collaborators.map((c: any) => (
                            <div key={c.uid} className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 border border-white dark:border-black" title={c.username} />
                        ))}
                    </div>
                )}

                {/* Author & Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-transparent overflow-hidden">
                            {/* Author Display */}
                            {post.author?.avatarUrl ? (
                                <Image height={40} width={40} src={post.author.avatarUrl} alt={post.author.username} className="w-full h-full object-cover" />
                            ) : (
                                post.author?.username ? post.author.username[0].toUpperCase() : <User size={14} />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-300">{post.author?.username || 'Unknown'}</span>
                            <span className="text-[10px] text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onLike(post.pid)}
                            className="flex items-center gap-1.5 group/like transition-all"
                        >
                            {post.isLiked ? (
                                <RiHeart3Fill size={20} className="text-red-500 fill-red-500 scale-110" />
                            ) : (
                                <RiHeart3Line size={20} className="text-gray-500 group-hover/like:text-red-500 transition-colors" />
                            )}
                            <span className="text-xs font-bold text-gray-500 group-hover/like:text-gray-700 dark:group-hover/like:text-gray-300">{post.likes}</span>
                        </button>
                        <button
                            onClick={() => onCommentClick(post)}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-black dark:hover:text-white transition-colors group/comment"
                        >
                            <RiChat1Line size={20} className="group-hover/comment:text-blue-500 dark:group-hover/comment:text-blue-400 transition-colors" />
                            <span className="text-xs font-bold">0</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

PostCard.displayName = 'PostCard';

export default PostCard;
