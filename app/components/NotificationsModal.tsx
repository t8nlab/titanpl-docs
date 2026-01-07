'use client';
import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';

interface NotificationsModalProps {
    onClose: () => void;
    onNotificationClick: (postId: string) => void;
}

import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

export default function NotificationsModal({ onClose, onNotificationClick }: NotificationsModalProps) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/notifications')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setNotifications(data);
            })
            .finally(() => setLoading(false));
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart size={12} className="text-red-500 fill-red-500" />;
            case 'comment': return <MessageCircle size={12} className="text-blue-500 fill-blue-500" />;
            case 'mention': return <UserPlus size={12} className="text-green-500" />;
            default: return <Bell size={12} />;
        }
    };

    const getText = (n: any) => {
        switch (n.type) {
            case 'like': return `liked your post "${n.postTitle}"`;
            case 'comment': return `commented on "${n.postTitle}"`;
            case 'mention': return `mentioned you in "${n.postTitle}"`;
            default: return 'interacted with you';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-transparent animate-in fade-in duration-200 pointer-events-none">
            {/* Click backdrop to close */}
            <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={onClose} />

            <div className="relative bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-sm shadow-2xl mt-16 pointer-events-auto flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Notifications</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto p-2 space-y-2">
                    {loading && <div className="text-center p-4 text-gray-500 text-sm">Loading...</div>}
                    {!loading && notifications.length === 0 && (
                        <div className="text-center p-8 text-gray-500 text-sm">No notifications yet.</div>
                    )}
                    {notifications.map((n, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                onNotificationClick(n.postId);
                                onClose();
                            }}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                        >
                            <div className="mt-1 relative">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    {n.actorAvatar ? (
                                        <Image height={40} width={40} src={n.actorAvatar} alt={n.actorName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-xs font-bold text-gray-700 dark:text-gray-300">
                                            {n.actorName?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#0F0F12] rounded-full p-0.5 border border-gray-100 dark:border-white/10">
                                    {getIcon(n.type)}
                                </div>
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="text-sm text-gray-800 dark:text-gray-200">
                                    <span className="font-bold hover:underline">{n.actorName}</span>{' '}
                                    <span className="text-gray-500 dark:text-gray-400">{getText(n)}</span>
                                </div>
                                {n.content && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2 border-l-2 border-gray-200 dark:border-white/10 pl-2">
                                        "{n.content}"
                                    </p>
                                )}
                                <div className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">
                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
