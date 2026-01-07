import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// Custom Toast Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomToast = ({ t, type, title, message }: { t: any, type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string }) => {
    const icons = {
        success: <CheckCircle2 className="w-6 h-6 text-blue-500 animate-in zoom-in spin-in-90 duration-300" />,
        error: <XCircle className="w-6 h-6 text-red-500 animate-in zoom-in duration-300" />,
        info: <Info className="w-6 h-6 text-blue-500 animate-in zoom-in duration-300" />,
        warning: <AlertTriangle className="w-6 h-6 text-yellow-500 animate-in zoom-in duration-300" />
    };

    const bgColors = {
        success: 'bg-white/90 dark:bg-[#0F0F12]/90 border-l-4 border-blue-500 backdrop-blur-md',
        error: 'bg-white/90 dark:bg-[#0F0F12]/90 border-l-4 border-red-500 backdrop-blur-md',
        info: 'bg-white/90 dark:bg-[#0F0F12]/90 border-l-4 border-blue-500 backdrop-blur-md',
        warning: 'bg-white/90 dark:bg-[#0F0F12]/90 border-l-4 border-yellow-500 backdrop-blur-md'
    };

    return (
        <div
            className={`${t.visible ? 'animate-in slide-in-from-top-full fade-in duration-300' : 'animate-out slide-out-to-top-full fade-out duration-200'
                } max-w-md w-full ${bgColors[type]} shadow-2xl rounded-xl pointer-events-auto flex items-start ring-1 ring-black/5 dark:ring-white/10 overflow-hidden backdrop-blur-3xl`}
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        {icons[type]}
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {title}
                        </p>
                        {message && (
                            <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                                {message}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex border-l border-gray-100 dark:border-white/5 self-stretch">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export const showToast = {
    success: (title: string, message?: string) =>
        toast.custom((t) => <CustomToast t={t} type="success" title={title} message={message} />),
    error: (title: string, message?: string) =>
        toast.custom((t) => <CustomToast t={t} type="error" title={title} message={message} />),
    info: (title: string, message?: string) =>
        toast.custom((t) => <CustomToast t={t} type="info" title={title} message={message} />),
    warning: (title: string, message?: string) =>
        toast.custom((t) => <CustomToast t={t} type="warning" title={title} message={message} />),
};
