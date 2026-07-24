import React, { useState, useEffect } from 'react';
import { Globe, Save, Layout } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './PortalPage.css';

const PortalPage: React.FC = () => {
    const [config, setConfig] = useState<any>({
        subdomain: '',
        primaryColor: '#4f46e5',
        secondaryColor: '#10b981',
        welcomeMessage: 'Welcome to our resident portal.'
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;
    const { showToast } = useToast();

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/portal?tenantId=${tenantId}`);
            const data = await res.json();
            if (data && data.id) setConfig(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...config, tenantId })
            });
            if (res.ok) showToast('Portal settings saved!', 'success');
            else showToast('Failed to save settings', 'error');
        } catch (error) {
            console.error(error);
            showToast('Error saving settings', 'error');
        }
    };

    return (
        <div className="portal-page">
            <div className="portal-header">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Tenant Portal Configuration</h1>
                <p style={{ color: '#6b7280' }}>Customize the look and feel of your resident web portal.</p>
            </div>

            <div className="portal-section">
                <h2>Branding & Theme</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <div className="form-group">
                            <label>Portal Subdomain</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    className="form-input"
                                    value={config.subdomain}
                                    onChange={e => setConfig({ ...config, subdomain: e.target.value })}
                                    placeholder="my-property"
                                />
                                <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>.remis.app</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Welcome Message</label>
                            <textarea
                                className="form-input"
                                style={{ minHeight: '100px' }}
                                value={config.welcomeMessage}
                                onChange={e => setConfig({ ...config, welcomeMessage: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Theme Colors</label>
                            <div className="color-picker-wrapper">
                                <input
                                    type="color"
                                    className="color-input"
                                    value={config.primaryColor || '#4f46e5'}
                                    onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                                />
                                <input
                                    type="color"
                                    className="color-input"
                                    value={config.secondaryColor || '#10b981'}
                                    onChange={e => setConfig({ ...config, secondaryColor: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 500 }}>Live Preview</label>
                        <div className="preview-card" style={{ borderColor: config.primaryColor }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: config.primaryColor, marginBottom: '1rem' }}>
                                {config.subdomain ? config.subdomain.toUpperCase() : 'YOUR LOGO'}
                            </div>
                            <h3 style={{ marginBottom: '1rem' }}>{config.welcomeMessage}</h3>
                            <button style={{ background: config.primaryColor, color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                                Login to Portal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <button className="save-btn" onClick={handleSave}>
                <Save size={18} style={{ marginRight: '0.5rem', display: 'inline', verticalAlign: 'text-bottom' }} />
                Save Changes
            </button>
        </div>
    );
};

export default PortalPage;
