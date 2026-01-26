export interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'system' | 'output' | 'console';
}

export interface TitanServer {
    id: string;
    name: string;
    port: number;
    status: 'active' | 'standby' | 'scanning';
    pid: number | string;
    uptime: string;
}

export const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
