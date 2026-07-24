import { useState, useCallback } from 'react';

interface ToastState {
    message: string;
    type: 'success' | 'error' | 'info';
    id: number;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastState[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { message, type, id }]);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, showToast, removeToast };
};
