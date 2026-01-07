'use client';
import { X } from 'lucide-react';
import Image from 'next/image';

interface CollaboratorsModalProps {
    collaborators: any[];
    onClose: () => void;
}

export default function CollaboratorsModal({ collaborators, onClose }: CollaboratorsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Click backdrop to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-sm flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 z-10">
                <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Collaborators
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-full text-xs font-normal text-gray-500 dark:text-gray-400">
                            {collaborators.length}
                        </span>
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-2 max-h-[60vh] overflow-y-auto space-y-1 content-scrollbar">
                    {collaborators.map((user: any) => (
                        <div key={user.uid || user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                {user.avatarUrl ? (
                                    <Image height={40} width={40} src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-sm font-bold text-gray-700 dark:text-gray-300">
                                        {user.username?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white text-sm">{user.username}</div>
                                {user.fullName && <div className="text-xs text-gray-500">{user.fullName}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
