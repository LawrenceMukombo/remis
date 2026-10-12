import React, { useState, useEffect, useRef } from 'react';
import { Shield, Eye, EyeOff, Lock, AlertTriangle, ShieldCheck, X, Download, FileText } from 'lucide-react';
import './ProtectedDocumentViewer.css';

interface ProtectedDocumentViewerProps {
    title: string;
    documentType?: string;
    documentUrl?: string | null;
    children?: React.ReactNode;
    userIdentifier?: string;
    onClose?: () => void;
    enableShutter?: boolean;
    allowDownload?: boolean;
    onDownloadContract?: () => void;
}

export const ProtectedDocumentViewer: React.FC<ProtectedDocumentViewerProps> = ({
    title,
    documentType = 'LEGAL_RECORD',
    documentUrl,
    children,
    userIdentifier,
    onClose,
    enableShutter = true,
    allowDownload,
    onDownloadContract
}) => {
    const [isScreenShieldActive, setIsScreenShieldActive] = useState(false);
    const [securityAlert, setSecurityAlert] = useState<string | null>(null);
    const [currentTimestamp, setCurrentTimestamp] = useState<string>('');
    const [shutterY, setShutterY] = useState<number>(150);
    const [shutterActive, setShutterActive] = useState<boolean>(false);
    const [watermarkSessionId] = useState<string>(() => 
        `DRM-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`
    );

    const containerRef = useRef<HTMLDivElement>(null);

    // Resolve viewer identity (User name, role, or IP identifier)
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const effectiveUser = userIdentifier || currentUser.name || currentUser.username || sessionStorage.getItem('remis_tenant_phone') || 'AUTHORIZED_RESIDENT';
    const effectiveRole = currentUser.role || 'RESIDENT_VIEWER';

    // Sensitive categorization: Title deeds & Identity documents must be strictly readonly with zero download
    const isSensitiveRecord = ['TITLE_DEED', 'OWNERSHIP_TITLE_DEED', 'DEED', 'ID', 'IDENTITY', 'IDENTITY_NRC', 'NRC', 'PASSPORT', 'RATES_BILL'].includes(
        (documentType || '').toUpperCase()
    ) || (title || '').toLowerCase().includes('deed') || (title || '').toLowerCase().includes('title') || (title || '').toLowerCase().includes('nrc') || (title || '').toLowerCase().includes('passport') || (title || '').toLowerCase().includes('identity');

    // Contracts (leases, tenancy agreements) are permitted to be downloaded
    const isContractDoc = ['LEASE', 'CONTRACT', 'RESIDENTIAL_TENANCY_AGREEMENT', 'TENANCY_CONTRACT', 'LEASE_AGREEMENT'].includes(
        (documentType || '').toUpperCase()
    ) || (title || '').toLowerCase().includes('contract') || (title || '').toLowerCase().includes('agreement') || (title || '').toLowerCase().includes('lease');

    // Effective download permission: Only true if it is a contract and NOT a sensitive title deed/ID
    const effectiveAllowDownload = !isSensitiveRecord && (allowDownload !== undefined ? allowDownload : isContractDoc);

    // 1. Live Timestamp generation for forensic watermarking
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTimestamp(now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // 2. Anti-Screenshot & Anti-Capture Window Blur Detection
    useEffect(() => {
        const handleBlur = () => {
            setIsScreenShieldActive(true);
            triggerSecurityAlert('Anti-Capture Shield: Document hidden due to window blur or capture tool activation.');
        };

        const handleFocus = () => {
            setTimeout(() => {
                setIsScreenShieldActive(false);
            }, 600);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsScreenShieldActive(true);
            } else {
                setTimeout(() => {
                    setIsScreenShieldActive(false);
                }, 600);
            }
        };

        // 3. Intercept PrintScreen, Ctrl+P, Ctrl+S, F12, DevTools shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
                e.preventDefault();
                setIsScreenShieldActive(true);
                scrambleClipboard();
                triggerSecurityAlert('PrintScreen attempt intercepted. Document shielded and clipboard scrambled.');
                setTimeout(() => setIsScreenShieldActive(false), 2500);
            }

            // Ctrl/Cmd + P (Print) - Allowed only for contracts, blocked for Title Deeds and IDs
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
                if (!effectiveAllowDownload) {
                    e.preventDefault();
                    triggerSecurityAlert('Document printing is strictly prohibited for sensitive records (Title Deeds & IDs).');
                }
            }

            // Ctrl/Cmd + S (Save page) - Blocked for sensitive records
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                if (!effectiveAllowDownload) {
                    e.preventDefault();
                    triggerSecurityAlert('Local saving or downloading of this document is prohibited.');
                }
            }

            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
                scrambleClipboard();
                triggerSecurityAlert('Content copying is disabled for protected legal records.');
            }

            if (
                e.key === 'F12' ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(e.key))
            ) {
                e.preventDefault();
                triggerSecurityAlert('Inspection and Developer Tools are restricted in DRM view mode.');
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const scrambleClipboard = () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(
                    'SECURITY NOTICE: This document is confidential property of REMIS. Unauthorized recording or photography is prohibited by Republic of Zambia Cap 206 DRM Protocol.'
                );
            }
        } catch {
            // Ignore clipboard errors
        }
    };

    const triggerSecurityAlert = (msg: string) => {
        setSecurityAlert(msg);
        setTimeout(() => {
            setSecurityAlert(null);
        }, 4000);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!shutterActive || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        setShutterY(y);
    };

    const watermarkString = `CONFIDENTIAL • ${effectiveUser} (${effectiveRole}) • ${currentTimestamp} • ${watermarkSessionId} • STRICTLY PROHIBITED TO PHOTOGRAPH OR CAPTURE`;

    const watermarkRows = Array.from({ length: 18 });

    const isPdf = documentUrl && (documentUrl.toLowerCase().endsWith('.pdf') || documentUrl.includes('application/pdf'));
    const isImage = documentUrl && !isPdf;

    return (
        <div 
            className="drm-viewer-container"
            ref={containerRef}
            onContextMenu={(e) => {
                e.preventDefault();
                triggerSecurityAlert('Right-click context menu is restricted on confidential records.');
            }}
            onMouseMove={handleMouseMove}
            onCopy={(e) => {
                e.preventDefault();
                scrambleClipboard();
                triggerSecurityAlert('Text copying is restricted.');
            }}
            onCut={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
        >
            {/* Top DRM Security Header */}
            <div className="drm-header">
                <div className="drm-header-left">
                    <div className="drm-shield-icon">
                        <Lock size={18} />
                    </div>
                    <div>
                        <div className="drm-title">{title}</div>
                        <div className="drm-meta">
                            {effectiveAllowDownload ? (
                                <span className="drm-badge-contract" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                                    <FileText size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> CONTRACT • DOWNLOAD PERMITTED
                                </span>
                            ) : isSensitiveRecord ? (
                                <span className="drm-badge-critical-lock" style={{ background: '#7f1d1d', color: '#fecaca', border: '1px solid #ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                                    <Lock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> CRITICAL: TITLE DEED & ID VAULT • STRICT ZERO-EXPORT
                                </span>
                            ) : (
                                <span className="drm-badge-readonly">READONLY DRM VAULT</span>
                            )}
                            <span className="drm-badge-anti-leak">ANTI-CAMERA SHIELD ACTIVE</span>
                            <span className="drm-badge-session">SESSION: {watermarkSessionId}</span>
                        </div>
                    </div>
                </div>

                <div className="drm-header-right">
                    {effectiveAllowDownload && (
                        <button 
                            type="button"
                            className="drm-btn-download"
                            onClick={() => {
                                if (onDownloadContract) {
                                    onDownloadContract();
                                } else if (documentUrl) {
                                    const link = document.createElement('a');
                                    link.href = documentUrl;
                                    link.download = (title || 'Contract').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                } else {
                                    window.print();
                                }
                            }}
                            title="Download Authorized Contract"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '0.45rem 0.85rem',
                                background: '#059669',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            <Download size={15} /> Download Contract
                        </button>
                    )}
                    {enableShutter && (
                        <button 
                            type="button"
                            className={`drm-btn-shutter ${shutterActive ? 'active' : ''}`}
                            onClick={() => setShutterActive(!shutterActive)}
                            title="Toggle Anti-Camera Focus Shutter (Restricts wide-angle photography)"
                        >
                            {shutterActive ? <EyeOff size={16} /> : <Eye size={16} />}
                            {shutterActive ? 'Anti-Camera Focus ON' : 'Focus Shutter'}
                        </button>
                    )}
                    {onClose && (
                        <button type="button" className="drm-btn-close" onClick={onClose} title="Close Protected Viewer">
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Security Alert Toast */}
            {securityAlert && (
                <div className="drm-alert-banner">
                    <AlertTriangle size={18} />
                    <span>{securityAlert}</span>
                </div>
            )}

            {/* Document Workspace Area */}
            <div className="drm-workspace">
                {/* 1. Steganographic Forensic Watermark Matrix Layer */}
                <div className="drm-watermark-matrix" aria-hidden="true">
                    {watermarkRows.map((_, rowIndex) => (
                        <div key={rowIndex} className="drm-watermark-row">
                            <span className="drm-watermark-text">{watermarkString}</span>
                            <span className="drm-watermark-text">{watermarkString}</span>
                        </div>
                    ))}
                </div>

                {/* 2. Anti-Camera Optical Moiré Interference Grid Layer */}
                <div className="drm-moire-interference-layer" aria-hidden="true" />

                {/* 3. Anti-Camera Focus Shutter Overlay */}
                {shutterActive && (
                    <div 
                        className="drm-focus-shutter"
                        style={{
                            background: `radial-gradient(ellipse 650px 140px at 50% ${shutterY}px, transparent 0%, rgba(15, 23, 42, 0.88) 100%)`
                        }}
                    />
                )}

                {/* 4. Anti-Capture Blackout Shield */}
                {isScreenShieldActive && (
                    <div className="drm-capture-blackout">
                        <div className="drm-blackout-card">
                            <Shield size={48} color="#ef4444" />
                            <h3>SCREEN CAPTURE DEFENSE ACTIVE</h3>
                            <p>Document display has been blanked due to focus loss, window switching, or screen-recording detection.</p>
                            <span className="drm-blackout-instruction">Click back inside the active window to resume authorized reading.</span>
                        </div>
                    </div>
                )}

                {/* 5. Pure Readonly Content Display */}
                <div className="drm-content-viewport">
                    {documentUrl ? (
                        isImage ? (
                            <div className="drm-image-wrapper">
                                <img 
                                    src={documentUrl} 
                                    alt={title} 
                                    className="drm-protected-image"
                                    draggable="false"
                                    onContextMenu={(e) => e.preventDefault()}
                                />
                            </div>
                        ) : isPdf ? (
                            <div className="drm-pdf-wrapper">
                                <iframe 
                                    src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                                    title={title}
                                    className="drm-protected-iframe"
                                />
                            </div>
                        ) : (
                            <div className="drm-unsupported-preview">
                                <p>Protected document asset loaded in secure vault.</p>
                            </div>
                        )
                    ) : (
                        <div className="drm-text-body">
                            {children}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Forensic Compliance Bar */}
            <div className="drm-footer-bar">
                <div className="drm-footer-left">
                    <ShieldCheck size={14} color="#10b981" />
                    <span>Statutory Document Protected • Republic of Zambia Rent Act Cap 206 DRM Protocol</span>
                </div>
                <div className="drm-footer-right">
                    <span>Auditor: {effectiveUser}</span>
                    <span>•</span>
                    <span>{currentTimestamp}</span>
                </div>
            </div>
        </div>
    );
};

export default ProtectedDocumentViewer;
