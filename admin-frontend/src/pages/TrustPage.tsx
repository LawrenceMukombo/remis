import React, { useState } from 'react';
import {
    ShieldCheck, FileSignature, Lock, Fingerprint,
    Search, Filter, CheckCircle, Clock, AlertTriangle,
    User, MoreVertical, FileText, ArrowRight
} from 'lucide-react';
import './TrustPage.css';
import TrustRequestModal from '../components/TrustRequestModal';

const TrustPage: React.FC = () => {
    const [view, setView] = useState<'OVERVIEW' | 'SIGNATURES' | 'IDENTITIES' | 'AUDIT' | 'WORKFLOWS'>('OVERVIEW');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Mock Data
    const signatures = [
        { id: '1', docName: 'Lease Agreement - Unit 101', signer: 'John Doe', status: 'COMPLETED', date: '2026-01-12', method: 'Biometric' },
        { id: '2', docName: 'Vendor Contract - CleanCo', signer: 'Jane Smith', status: 'PENDING', date: '2026-01-13', method: 'Email Link' },
        { id: '3', docName: 'NDA - TechCorp', signer: 'Robert Brown', status: 'EXPIRED', date: '2025-12-20', method: 'Email Link' },
    ];

    const identities = [
        { id: '1', name: 'John Doe', role: 'Tenant', status: 'VERIFIED', type: 'Government ID', verifiedAt: '2025-11-01' },
        { id: '2', name: 'Jane Smith', role: 'Vendor', status: 'VERIFIED', type: 'Company Reg', verifiedAt: '2025-10-15' },
        { id: '3', name: 'Mike Ross', role: 'Agent', status: 'PENDING', type: 'License', verifiedAt: '-' },
    ];

    const auditLogs = [
        { id: '1', action: 'LOGIN_SUCCESS', user: 'Admin User', ip: '192.168.1.1', time: '10:00 AM' },
        { id: '2', action: 'DOC_SIGNED', user: 'John Doe', ip: '203.0.113.45', time: '09:45 AM' },
        { id: '3', action: 'PERMISSION_CHANGE', user: 'Super Admin', ip: '10.0.0.5', time: 'Yesterday' },
    ];

    const workflowRules = [
        {
            id: '101',
            name: 'Lease Signed',
            status: 'ACTIVE',
            type: 'EVENT',
            icon: 'FileText',
            trigger: 'Valid Signature Detected',
            action: 'Create Onboarding Task & Notify Property Manager',
            color: 'blue'
        },
        {
            id: '102',
            name: 'Identity Verified',
            status: 'ACTIVE',
            type: 'EVENT',
            icon: 'ShieldCheck',
            trigger: "KYC Status = 'VERIFIED'",
            action: 'Grant Portal Access & Send Welcome Email',
            color: 'blue'
        },
        {
            id: '103',
            name: 'Trust Score Drop',
            status: 'CRITICAL',
            type: 'ALERT',
            icon: 'AlertTriangle',
            trigger: 'Score < 50',
            action: 'Lock Account & Page Security Admin',
            color: 'red'
        }
    ];

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    // Interactivity Handlers
    const handleStatClick = (section: 'SIGNATURES' | 'IDENTITIES') => {
        setView(section);
    };

    const handleNewRequest = () => {
        setIsRequestModalOpen(true);
    };

    const handleRequestSubmit = (data: any) => {
        console.log("New Trust Request Data:", data);
    };

    const handleInvestigate = (ip: string) => {
        alert(`Investigating IP: ${ip}. Security protocols activated.`);
    };

    const handleViewDocument = (docName: string) => {
        alert(`Opening document viewer for: ${docName}`);
    };

    const handleViewProfile = (name: string) => {
        alert(`Opening User Profile: ${name}\n\nGovernment ID: Verified\nBiometrics: Registered\nTrust Score: 95/100`);
    };

    const handleAuditExport = () => {
        alert("Exporting Audit Logs to CSV...");
    };

    return (
        <div className="trust-page">
            <TrustRequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSubmit={handleRequestSubmit}
            />

            <div className="trust-header">
                <div>
                    <h1>Digital Trust & Security</h1>
                    <p>Manage digital signatures, verified identities, and security audits.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setView('AUDIT')}>
                        <Lock size={16} /> Audit Logs
                    </button>
                    <button className="btn-primary" onClick={handleNewRequest}>
                        <FileSignature size={16} /> New Request
                    </button>
                </div>
            </div>

            <div className="trust-tabs">
                <button className={`tab-btn ${view === 'OVERVIEW' ? 'active' : ''}`} onClick={() => setView('OVERVIEW')}>Overview</button>
                <button className={`tab-btn ${view === 'SIGNATURES' ? 'active' : ''}`} onClick={() => setView('SIGNATURES')}>Signatures</button>
                <button className={`tab-btn ${view === 'IDENTITIES' ? 'active' : ''}`} onClick={() => setView('IDENTITIES')}>Identities</button>
                <button className={`tab-btn ${view === 'AUDIT' ? 'active' : ''}`} onClick={() => setView('AUDIT')}>Audit Trail</button>
                <button className={`tab-btn ${view === 'WORKFLOWS' ? 'active' : ''}`} onClick={() => setView('WORKFLOWS')}>Automations</button>
            </div>

            <div className="trust-content">
                {view === 'OVERVIEW' && (
                    <div className="overview-grid">
                        <div className="stats-card interactive-card" onClick={() => alert("System Health: 98% (Excellent). No critical vulnerabilities detected.")}>
                            <div className="stats-icon bg-green-100 text-green-600"><ShieldCheck size={24} /></div>
                            <div>
                                <h3>Trust Score</h3>
                                <p className="stats-value">98/100</p>
                                <p className="stats-sub">System Integrity Good</p>
                            </div>
                        </div>
                        <div className="stats-card interactive-card" onClick={() => handleStatClick('SIGNATURES')}>
                            <div className="stats-icon bg-blue-100 text-blue-600"><FileSignature size={24} /></div>
                            <div>
                                <h3>Pending Signatures</h3>
                                <p className="stats-value">5</p>
                                <p className="stats-sub">Needs attention</p>
                            </div>
                        </div>
                        <div className="stats-card interactive-card" onClick={() => handleStatClick('IDENTITIES')}>
                            <div className="stats-icon bg-purple-100 text-purple-600"><Fingerprint size={24} /></div>
                            <div>
                                <h3>Verified Identities</h3>
                                <p className="stats-value">142</p>
                                <p className="stats-sub">+12 this week</p>
                            </div>
                        </div>

                        <div className="trust-alert-card full-width-card">
                            <div className="alert-header">
                                <AlertTriangle size={20} className="text-yellow-600" />
                                <h3>Security Alerts</h3>
                            </div>
                            <div className="alert-list">
                                <div className="alert-item">
                                    <span>New login from unknown device (IP: 45.2.1.99)</span>
                                    <button className="btn-xs" onClick={() => handleInvestigate('45.2.1.99')}>Investigate</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'SIGNATURES' && (
                    <div className="list-view">
                        <div className="filters-bar">
                            <div className="search-input">
                                <Search size={16} />
                                <input type="text" placeholder="Search documents..." />
                            </div>
                            <button className="btn-icon"><Filter size={16} /></button>
                        </div>
                        <table className="trust-table">
                            <thead>
                                <tr>
                                    <th>Document</th>
                                    <th>Signer</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {signatures.map(sig => (
                                    <tr key={sig.id} className="interactive-row" onClick={() => handleViewDocument(sig.docName)}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FileText size={16} className="text-gray-400" />
                                                <strong>{sig.docName}</strong>
                                            </div>
                                        </td>
                                        <td>{sig.signer}</td>
                                        <td>{sig.method}</td>
                                        <td><span className={`status-badge status-${sig.status}`}>{sig.status}</span></td>
                                        <td>{sig.date}</td>
                                        <td>
                                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); alert("Options: Remind, Cancel, View History"); }}>
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'IDENTITIES' && (
                    <div className="list-view">
                        <div className="filters-bar">
                            <div className="search-input">
                                <Search size={16} />
                                <input type="text" placeholder="Search users..." />
                            </div>
                        </div>
                        <div className="identity-grid">
                            {identities.map(id => (
                                <div key={id.id} className="identity-card interactive-card" onClick={() => handleViewProfile(id.name)}>
                                    <div className="id-header">
                                        <div className="avatar-circle">{id.name.charAt(0)}</div>
                                        <div>
                                            <h4>{id.name}</h4>
                                            <p>{id.role}</p>
                                        </div>
                                        {id.status === 'VERIFIED' ? <ShieldCheck size={20} className="text-green-500" /> : <Clock size={20} className="text-yellow-500" />}
                                    </div>
                                    <div className="id-details">
                                        <p><strong>Proof:</strong> {id.type}</p>
                                        <p><strong>Verified:</strong> {id.verifiedAt}</p>
                                    </div>
                                    <div className="id-actions">
                                        <button className="btn-secondary small" onClick={(e) => { e.stopPropagation(); handleViewProfile(id.name); }}>View Profile</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'AUDIT' && (
                    <div className="list-view">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button className="btn-secondary small" onClick={handleAuditExport}>Export CSV</button>
                        </div>
                        <table className="trust-table">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>User</th>
                                    <th>IP Address</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map(log => (
                                    <tr key={log.id} className="interactive-row">
                                        <td><strong>{log.action}</strong></td>
                                        <td>{log.user}</td>
                                        <td><code className="ip-badge">{log.ip}</code></td>
                                        <td>{log.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'WORKFLOWS' && (
                    <div className="list-view">
                        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: '#1e293b' }}>Active Workflow Triggers</h3>
                            <p style={{ margin: '0.5rem 0', color: '#64748b' }}>
                                Automatic actions triggered by digital trust events.
                            </p>
                        </div>

                        <div className="workflow-triggers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                            {workflowRules.map(rule => (
                                <div key={rule.id} className="trigger-card interactive-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} onClick={() => alert(`Redirecting to Workflow Builder: Rule #${rule.id}`)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: rule.status === 'CRITICAL' ? '#dc2626' : '#2563eb',
                                            background: rule.status === 'CRITICAL' ? '#fef2f2' : '#eff6ff',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '99px'
                                        }}>
                                            {rule.status}
                                        </span>
                                        {rule.icon === 'FileText' && <FileText size={16} className="text-gray-400" />}
                                        {rule.icon === 'ShieldCheck' && <ShieldCheck size={16} className="text-gray-400" />}
                                        {rule.icon === 'AlertTriangle' && <AlertTriangle size={16} className="text-gray-400" />}
                                    </div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{rule.name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                        <span>Trust Event</span>
                                        <ArrowRight size={14} />
                                        <span>Execute Action</span>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                                            <strong>Trigger:</strong> {rule.trigger}<br />
                                            <strong>Action:</strong> {rule.action}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default TrustPage;
