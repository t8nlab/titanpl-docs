'use client';
import { showToast } from '@/lib/toast';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
    user: any;
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated, user }: CreatePostModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [link, setLink] = useState('');

    // Mention state
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionResults, setMentionResults] = useState<any[]>([]);
    const [showMentions, setShowMentions] = useState(false);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    // Handle Mention Search
    useEffect(() => {
        if (mentionQuery.length > 0) {
            fetch(`/api/users/search?q=${mentionQuery}`)
                .then(res => res.json())
                .then(data => setMentionResults(Array.isArray(data) ? data : []));
        } else {
            setMentionResults([]);
        }
    }, [mentionQuery]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        if (val.length > 800) return; // Hard limit at input
        setContent(val);

        const lastChar = val[val.length - 1];
        if (lastChar === '@') {
            setShowMentions(true);
            setMentionQuery('');
        } else if (showMentions) {
            const match = val.match(/@(\w*)$/);
            if (match) {
                setMentionQuery(match[1]);
            } else {
                setShowMentions(false);
            }
        }
    };

    const addMention = (username: string) => {
        const newContent = content.replace(/@(\w*)$/, `@${username} `);
        setContent(newContent);
        setShowMentions(false);
        contentRef.current?.focus();
    };

    const createPost = async () => {
        if (!title || !content || !user) return;
        try {
            await fetch('/api/posts', {
                method: 'POST',
                body: JSON.stringify({ title, content, link }),
                headers: { 'Content-Type': 'application/json' }
            });
            setTitle('');
            setContent('');
            setLink('');
            onPostCreated();
            onClose();
            showToast.success('Post Created', 'Your post is now live.');
        } catch (e) {
            showToast.error('Error', 'Failed to create post.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-white/10 p-6 rounded-2xl w-full max-w-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-900/10 scale-100 animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <X size={20} />
                </button>
                <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    Share your thought
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block ml-1">Post Title</label>
                        <input
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500/50 dark:focus:border-white/30 focus:bg-white dark:focus:bg-white/10 outline-none transition-all text-lg font-medium"
                            placeholder="e.g. Titan UI Kit"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block ml-1">Project URL <span className="text-gray-400 dark:text-gray-600">(Optional)</span></label>
                        <input
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500/50 dark:focus:border-white/30 focus:bg-white dark:focus:bg-white/10 outline-none transition-all text-sm font-mono"
                            placeholder="https://..."
                            value={link}
                            onChange={e => setLink(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block ml-1">Description <span className={cn("ml-2", content.length > 700 ? "text-red-500" : "text-gray-400 dark:text-gray-500")}>{content.length}/800</span></label>
                        <textarea
                            ref={contentRef}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500/50 dark:focus:border-white/30 focus:bg-white dark:focus:bg-white/10 outline-none transition-all resize-none min-h-[120px] leading-relaxed"
                            placeholder="Tell us about your project... Use @ to mention collaborators"
                            value={content}
                            onChange={handleContentChange}
                            maxLength={800}
                        />
                        {/* Mention Dropdown */}
                        {showMentions && mentionResults.length > 0 && (
                            <div className="absolute top-full left-0 z-10 w-64 bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden mt-1">
                                {mentionResults.map(u => (
                                    <button
                                        key={u.uid}
                                        onClick={() => addMention(u.username)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-3 border-b border-gray-100 dark:border-white/5 last:border-0 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-black dark:text-white border border-transparent dark:border-white/10 overflow-hidden">
                                            {u.avatarUrl ? (
                                                <Image height={32} width={32} src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                                            ) : (
                                                u.username[0].toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-black dark:text-white">{u.username}</span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Collaborator</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-6 mt-2">
                    <button
                        onClick={createPost}
                        disabled={!title || !content}
                        className="flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-black/5 dark:shadow-white/5"
                    >
                        {link ? 'Publish Project' : 'Share Thought'}
                    </button>
                </div>
            </div>
        </div>
    );
}
