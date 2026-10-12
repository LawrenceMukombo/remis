import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, Home, Lock } from 'lucide-react';
import { SplashScreen as CapacitorSplash } from '@capacitor/splash-screen';
import './SplashScreen.css';

interface SplashScreenProps {
    onComplete?: () => void;
    minDisplayTimeMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
    onComplete,
    minDisplayTimeMs = 2400
}) => {
    const [progress, setProgress] = useState(15);
    const [statusIndex, setStatusIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const statusSteps = [
        'Initializing REMIS Zero-Trust Vault...',
        'Verifying Zambia Rent Act Cap 206 Covenants...',
        'Loading Properties, Catchments & Leases...',
        'Secured Session Ready'
    ];

    useEffect(() => {
        // Hide the native Android splash screen as soon as the webview mounts
        try {
            CapacitorSplash.hide().catch(() => {});
        } catch {
            // Web fallback
        }

        const intervalTime = minDisplayTimeMs / 100;
        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev + 1;
                if (next >= 100) {
                    clearInterval(timer);
                    setTimeout(() => {
                        setIsVisible(false);
                        if (onComplete) onComplete();
                    }, 400);
                    return 100;
                }
                if (next > 75) setStatusIndex(3);
                else if (next > 45) setStatusIndex(2);
                else if (next > 20) setStatusIndex(1);
                return next;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [minDisplayTimeMs, onComplete]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="remis-splash-container"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Ambient dynamic glow */}
                <div className="splash-bg-glow" />

                <div className="splash-content">
                    {/* Emblem Icon */}
                    <motion.div 
                        className="splash-emblem-wrap"
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                    >
                        <div className="splash-emblem-ring" />
                        <div className="splash-icon-shield">
                            <Shield size={44} strokeWidth={2.2} />
                        </div>
                    </motion.div>

                    {/* App Title */}
                    <motion.h1 
                        className="splash-title"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        REMIS
                    </motion.h1>

                    <motion.div 
                        className="splash-tagline"
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        Property & Tenancy Hub
                    </motion.div>

                    <motion.div 
                        className="splash-jurisdiction-badge"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <ShieldCheck size={14} color="#10b981" />
                        <span>Republic of Zambia • Rent Act Cap 206</span>
                    </motion.div>

                    {/* Progress Bar */}
                    <div className="splash-progress-track">
                        <div 
                            className="splash-progress-fill" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>

                    <div className="splash-status-text">
                        {statusSteps[statusIndex]}
                    </div>
                </div>

                <div className="splash-footer-note">
                    REMIS v1.0 • Enterprise Android Edition
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SplashScreen;
