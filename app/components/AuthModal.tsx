'use client';
import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/lib/toast';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const { login: setAuthUser } = useAuth();
    const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [authError, setAuthError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        if (!email || !password) return;
        if (authTab === 'register' && !username) return;

        const endpoint = authTab === 'login' ? '/api/auth/login' : '/api/auth/register';
        const body = authTab === 'login' ? { email, password } : { username, email, password };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            if (authTab === 'login') {
                setAuthUser(data.user);
                onSuccess(data.user);
                showToast.success('Welcome Back', `Signed in as ${data.user.username}`);
            } else {
                setAuthTab('login');
                showToast.success('Account Created', 'You can now login with your credentials.');
            }
        } catch (err: any) {
            setAuthError(err.message);
            showToast.error('Authentication Failed', err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-white/10 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <X size={20} />
                </button>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white text-center">
                    {authTab === 'login' ? 'Welcome Back' : 'Join Atmosphere'}
                </h2>
                <p className="text-gray-500 mb-8 text-center text-sm">
                    {authTab === 'login' ? 'Login to continue your journey.' : 'Create an account to start sharing.'}
                </p>

                {authError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs rounded text-center">
                        {authError}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {authTab === 'register' && (
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-black dark:text-white focus:border-blue-500/50 dark:focus:border-white/30 outline-none transition-colors text-sm placeholder-gray-400 dark:placeholder-gray-500"
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-black dark:text-white focus:border-blue-500/50 dark:focus:border-white/30 outline-none transition-colors text-sm placeholder-gray-400 dark:placeholder-gray-500"
                        required
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-black dark:text-white focus:border-blue-500/50 dark:focus:border-white/30 outline-none transition-colors text-sm placeholder-gray-400 dark:placeholder-gray-500 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <button className="w-full py-3 mt-4 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-sm shadow-lg shadow-black/5 dark:shadow-white/5">
                        {authTab === 'login' ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-500">
                    {authTab === 'login' ? "New here? " : "Already existing? "}
                    <button
                        onClick={() => {
                            setAuthTab(authTab === 'login' ? 'register' : 'login');
                            setAuthError('');
                        }}
                        className="text-black dark:text-white hover:underline ml-1 outline-none font-medium"
                    >
                        {authTab === 'login' ? 'Create Account' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}
