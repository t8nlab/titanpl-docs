'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
        const body = isRegister ? { username, email, password } : { email, password };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed');

            if (isRegister) {
                setIsRegister(false);
                // Optionally auto-login or ask to login
            } else {
                login(data.user);
                router.push('/community');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-sm border border-white/10 rounded-xl p-8 bg-[#0A0A0A]">
                <h1 className="text-2xl font-bold mb-2 text-center">
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-gray-500 text-center mb-6 text-sm">
                    {isRegister ? 'Join the Titan Community' : 'Login to access your account'}
                </p>

                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-3 rounded mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <input
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    )}
                    <input
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button className="w-full bg-white text-black font-medium py-3 rounded hover:bg-gray-200 transition-colors">
                        {isRegister ? 'Sign Up' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="hover:text-white transition-colors underline"
                    >
                        {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
}
