import React, { useState, useEffect } from 'react';
import { Link2, Power, Settings, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './IntegrationsPage.css';

interface Integration {
    id: string;
    provider: string;
    status: string;
    apiKey?: string;
}

const PROVIDERS = [
    { key: 'XERO', name: 'Xero Accounting', desc: 'Sync invoices and payments automatically.', icon: 'X' },
    { key: 'QUICKBOOKS', name: 'QuickBooks', desc: 'Seamless accounting integration for your properties.', icon: 'QB' },
    { key: 'SENDGRID', name: 'SendGrid', desc: 'Reliable email delivery specifically for transactional emails.', icon: 'SG' },
    { key: 'TWILIO', name: 'Twilio', desc: 'SMS notifications for rent reminders and alerts.', icon: 'Tw' },
    { key: 'DOCUSIGN', name: 'DocuSign', desc: 'Digital signatures for leases and contracts.', icon: 'DS' },
];

const IntegrationsPage: React.FC = () => {
    const [connected, setConnected] = useState<Integration[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<any>(null);
    const [apiKey, setApiKey] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;
    const { showToast } = useToast();

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/integrations?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setConnected(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleConnectClick = (provider: any) => {
        setSelectedProvider(provider);
        setApiKey('');
        setModalOpen(true);
    };

    const handleConnectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/integrations/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    provider: selectedProvider.key,
                    apiKey
                })
            });
            if (res.ok) {
                showToast(`Connected to ${selectedProvider.name}`, 'success');
                setModalOpen(false);
                fetchIntegrations();
            } else {
                showToast('Connection failed', 'error');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDisconnect = async (id: string) => {
        if (!confirm('Are you sure you want to disconnect?')) return;
        try {
            await fetch(`http://localhost:4000/api/integrations/${id}`, { method: 'DELETE' });
            fetchIntegrations();
            showToast('Disconnected successfully', 'success');
        } catch (error) {
            console.error(error);
        }
    };

    const getStatus = (key: string) => {
        const conn = connected.find(c => c.provider === key);
        return conn ? { status: conn.status, id: conn.id } : { status: 'DISCONNECTED', id: null };
    };

    return (
        <div className="integrations-page">
            <div className="integrations-header">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>App Store & Integrations</h1>
                <p style={{ color: '#6b7280' }}>Supercharge your workflow with third-party integrations.</p>
            </div>

            <div className="integrations-grid">
                {PROVIDERS.map(p => {
                    const { status, id } = getStatus(p.key);
                    return (
                        <div key={p.key} className="integration-card">
                            <div className="integration-logo">{p.icon}</div>
                            <h3 className="integration-name">{p.name}</h3>
                            <p className="integration-desc">{p.desc}</p>
                            <div className="integration-footer">
                                <div className={`status-badge status-${status}`}>
                                    {status === 'CONNECTED' ? <CheckCircle size={14} /> : <Link2 size={14} />}
                                    {status}
                                </div>
                                {status === 'CONNECTED' ? (
                                    <button className="btn-disconnect" onClick={() => handleDisconnect(id!)}>
                                        Disconnect
                                    </button>
                                ) : (
                                    <button className="btn-connect" onClick={() => handleConnectClick(p)}>
                                        Connect
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Connect Modal */}
            {modalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '450px',
                        padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            Connect {selectedProvider?.name}
                        </h2>
                        <form onSubmit={handleConnectSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>API Key / Token</label>
                                <input
                                    required
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your API Key..."
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer' }}>Connect App</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegrationsPage;
