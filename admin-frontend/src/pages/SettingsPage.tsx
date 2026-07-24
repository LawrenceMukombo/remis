import React, { useState, useEffect } from 'react';
import { Save, Store, Grid, CheckCircle2, RotateCcw, Map, Upload, Type, MapPin, Mail, Phone, Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { MODULE_GROUPS } from '../constants/appModules';
import './SettingsPage.css';

interface TenantSettings {
    name: string;
    config: {
        branding: {
            logoUrl: string;
            primaryColor: string;
            secondaryColor: string;
            fontFamily?: string;
        };
        contact: {
            email: string;
            phone: string;
            address?: string;
        };
        locationLabels?: Record<number, string>;
        locale: {
            currency: string;
            dateFormat: string;
            timeFormat: string;
        };
    };
    features: Record<string, boolean>;
}

const FONTS = [
    { name: 'Ubuntu', value: 'Ubuntu, sans-serif' },
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Lato', value: 'Lato, sans-serif' },
];

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'modules' | 'locations'>('general');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;
    const { refreshSettings } = useSettings();
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (title: string) => {
        setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const [settings, setSettings] = useState<TenantSettings>({
        name: '',
        config: {
            branding: {
                logoUrl: '',
                primaryColor: '#4f46e5',
                secondaryColor: '#10b981',
                fontFamily: 'Ubuntu, sans-serif'
            },
            contact: { email: '', phone: '', address: '' },
            locationLabels: { 1: 'Region', 2: 'Province', 3: 'District', 4: 'LLG' },
            locale: { currency: 'USD', dateFormat: 'MM/DD/YYYY', timeFormat: '12h' }
        },
        features: {
            properties: true, leases: false, sales: false, landlords: false,
            maintenance: false, vendors: false, inventory: false, hr: false, pos: false, field: false,
            finance: false,
            crm: false, portal: false,
            strategy: false, compliance: false, documents: false, contracts: false, trust: false,
            analytics: true, reports: false, map: false, locations: true, workflows: false, communications: false, security: false, integrations: false
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/tenant/settings');
            const data = await res.json();

            if (data) {
                setSettings({
                    name: data.name,
                    config: {
                        branding: {
                            logoUrl: data.config?.branding?.logoUrl || '',
                            primaryColor: data.config?.branding?.primaryColor || '#4f46e5',
                            secondaryColor: data.config?.branding?.secondaryColor || '#10b981',
                            fontFamily: data.config?.branding?.fontFamily || 'Ubuntu, sans-serif'
                        },
                        contact: {
                            email: data.config?.contact?.email || '',
                            phone: data.config?.contact?.phone || '',
                            address: data.config?.contact?.address || ''
                        },
                        locationLabels: data.config?.locationLabels || { 1: 'Region', 2: 'Province', 3: 'District', 4: 'LLG' },
                        locale: {
                            currency: data.config?.locale?.currency || 'USD',
                            dateFormat: data.config?.locale?.dateFormat || 'MM/DD/YYYY',
                            timeFormat: data.config?.locale?.timeFormat || '12h'
                        }
                    },
                    features: { ...data.features }
                });

                if (data.config?.branding?.primaryColor) {
                    document.documentElement.style.setProperty('--primary-color', data.config.branding.primaryColor);
                }
                if (data.config?.branding?.fontFamily) {
                    document.body.style.fontFamily = data.config.branding.fontFamily;
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        if (!tenantId) {
            setMsg({ type: 'error', text: 'Tenant ID not found. Please relogin.' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/tenant/settings/${tenantId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setMsg({ type: 'success', text: 'Settings saved successfully!' });
                await refreshSettings();
            } else {
                throw new Error('Failed to save');
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Error saving settings' });
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(null), 3000);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            const res = await fetch('http://localhost:4000/api/upload/logo', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.url) {
                setSettings(prev => ({
                    ...prev,
                    config: {
                        ...prev.config,
                        branding: { ...prev.config.branding, logoUrl: data.url }
                    }
                }));
            } else {
                alert('Upload failed: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('Upload error');
        }
    };

    const handleColorChange = (type: 'primaryColor' | 'secondaryColor', value: string) => {
        setSettings(prev => ({
            ...prev,
            config: {
                ...prev.config,
                branding: { ...prev.config.branding, [type]: value }
            }
        }));

        if (type === 'primaryColor') {
            document.documentElement.style.setProperty('--primary-color', value);
        }
    };

    const handleFontChange = (value: string) => {
        setSettings(prev => ({
            ...prev,
            config: {
                ...prev.config,
                branding: { ...prev.config.branding, fontFamily: value }
            }
        }));
        document.body.style.fontFamily = value;
    };

    const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            title={`Switch to ${label} settings`}
            aria-pressed={activeTab === id ? "true" : "false"}
        >
            <Icon size={18} /> {label}
        </button>
    );

    return (
        <div className="settings-container">
            <div className="settings-header">
                <div>
                    <h1>System Configuration</h1>
                    <p>Customize your REMIS experience to match your brand.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="save-btn"
                    title="Save all changes"
                >
                    {loading ? <RotateCcw className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                </button>
            </div>

            {msg && (
                <div className={`message-banner ${msg.type}`}>
                    {msg.type === 'success' ? <CheckCircle2 size={18} /> : null}
                    {msg.text}
                </div>
            )}

            <div className="settings-card">
                {/* Tabs */}
                <div className="tabs-header">
                    <TabButton id="general" label="Branding & Contact" icon={Store} />
                    <TabButton id="locations" label="Location Hierarchy" icon={Map} />
                    <TabButton id="modules" label="Module Management" icon={Grid} />
                </div>

                <div className="settings-content">
                    {activeTab === 'general' && (
                        <div className="general-grid">
                            <div className="settings-section">
                                <h3 className="section-title">Brand Identity</h3>

                                <div className="form-field">
                                    <label htmlFor="company-name">Company Name</label>
                                    <input
                                        id="company-name"
                                        type="text"
                                        value={settings.name}
                                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                        className="form-input"
                                        placeholder="Enter company name"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Logo</label>
                                    <div className="logo-upload-container">
                                        {settings.config.branding.logoUrl && (
                                            <div className="logo-preview">
                                                <img src={settings.config.branding.logoUrl} alt="Current logo" />
                                            </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <label className="upload-label" htmlFor="logo-upload" title="Upload new logo">
                                                <Upload size={16} /> Upload New Logo
                                                <input id="logo-upload" type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
                                            </label>
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>Recommended: PNG or SVG, max 2MB.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="color-picker-group">
                                    <div>
                                        <label className="form-field" style={{ marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Palette size={18} /> Primary / Button Color
                                            </div>
                                        </label>
                                        <div className="color-picker-field">
                                            <input
                                                type="color"
                                                value={settings.config.branding.primaryColor}
                                                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                                                className="color-input"
                                                title="Pick primary color"
                                            />
                                            <div className="color-value-display">
                                                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>Selected</div>
                                                <div className="color-hex">{settings.config.branding.primaryColor.toUpperCase()}</div>
                                            </div>
                                            <div className="color-preview-large" style={{ backgroundColor: settings.config.branding.primaryColor }} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="form-field" style={{ marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Palette size={18} /> Secondary Accent Color
                                            </div>
                                        </label>
                                        <div className="color-picker-field">
                                            <input
                                                type="color"
                                                value={settings.config.branding.secondaryColor}
                                                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                                                className="color-input"
                                                title="Pick secondary color"
                                            />
                                            <div className="color-value-display">
                                                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>Selected</div>
                                                <div className="color-hex">{settings.config.branding.secondaryColor.toUpperCase()}</div>
                                            </div>
                                            <div className="color-preview-large" style={{ backgroundColor: settings.config.branding.secondaryColor }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="font-select"><Type size={16} style={{ display: 'inline', marginRight: '5px' }} /> Default Font</label>
                                    <select
                                        id="font-select"
                                        value={settings.config.branding.fontFamily}
                                        onChange={(e) => handleFontChange(e.target.value)}
                                        className="form-select"
                                        aria-label="Select default font"
                                    >
                                        {FONTS.map(font => (
                                            <option key={font.name} value={font.value}>{font.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3 className="section-title">Contact Information</h3>

                                <div className="form-field">
                                    <label htmlFor="public-email"><Mail size={16} style={{ display: 'inline', marginRight: '5px' }} /> Public Email</label>
                                    <input
                                        id="public-email"
                                        type="email"
                                        value={settings.config.contact.email}
                                        onChange={(e) => setSettings({ ...settings, config: { ...settings.config, contact: { ...settings.config.contact, email: e.target.value } } })}
                                        className="form-input"
                                        placeholder="support@company.com"
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="phone-support"><Phone size={16} style={{ display: 'inline', marginRight: '5px' }} /> Phone Support</label>
                                    <input
                                        id="phone-support"
                                        type="tel"
                                        value={settings.config.contact.phone}
                                        onChange={(e) => setSettings({ ...settings, config: { ...settings.config, contact: { ...settings.config.contact, phone: e.target.value } } })}
                                        className="form-input"
                                        placeholder="+1 (234) 567-8900"
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="headquarters-address"><MapPin size={16} style={{ display: 'inline', marginRight: '5px' }} /> Headquarters Address</label>
                                    <textarea
                                        id="headquarters-address"
                                        rows={4}
                                        value={settings.config.contact.address || ''}
                                        onChange={(e) => setSettings({ ...settings, config: { ...settings.config, contact: { ...settings.config.contact, address: e.target.value } } })}
                                        className="form-textarea"
                                        placeholder="Enter full company address"
                                    />
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3 className="section-title">Regional Settings</h3>

                                <div className="form-field">
                                    <label htmlFor="currency-select">Currency</label>
                                    <select
                                        id="currency-select"
                                        value={settings.config.locale.currency}
                                        onChange={(e) => setSettings({ ...settings, config: { ...settings.config, locale: { ...settings.config.locale, currency: e.target.value } } })}
                                        className="form-select"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="PGK">PGK (K)</option>
                                        <option value="AUD">AUD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="date-format-select">Date Format</label>
                                    <select
                                        id="date-format-select"
                                        value={settings.config.locale.dateFormat}
                                        onChange={(e) => setSettings({ ...settings, config: { ...settings.config, locale: { ...settings.config.locale, dateFormat: e.target.value } } })}
                                        className="form-select"
                                    >
                                        <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="time-format-select">Time Format</label>
                                    <select
                                        id="time-format-select"
                                        value={settings.config.locale.timeFormat}
                                        onChange={(e) => setSettings({ ...settings, config: { ...settings.config, locale: { ...settings.config.locale, timeFormat: e.target.value } } })}
                                        className="form-select"
                                    >
                                        <option value="12h">12 Hour (1:00 PM)</option>
                                        <option value="24h">24 Hour (13:00)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'locations' && (
                        <div style={{ maxWidth: '600px' }}>
                            <div className="info-banner">
                                <h4><Map size={18} /> Location Hierarchy Configuration</h4>
                                <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    Define the naming convention for your geographical levels. Changes here will be reflected throughout the entire application.
                                </p>
                            </div>

                            <div className="settings-section" style={{ gap: '1.5rem' }}>
                                {[1, 2, 3, 4].map(level => (
                                    <div key={level} className="form-field">
                                        <label htmlFor={`level-${level}-label`}>Level {level} Label</label>
                                        <input
                                            id={`level-${level}-label`}
                                            type="text"
                                            placeholder={level === 1 ? "e.g. Region" : level === 2 ? "e.g. Province" : ""}
                                            value={settings.config.locationLabels?.[level] || ''}
                                            onChange={(e) => {
                                                const newLabels = { ...settings.config.locationLabels, [level]: e.target.value };
                                                setSettings({
                                                    ...settings,
                                                    config: { ...settings.config, locationLabels: newLabels }
                                                });
                                            }}
                                            className="form-input"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'modules' && (
                        <div className="settings-section">
                            {MODULE_GROUPS.map((group, groupIdx) => {
                                const isCollapsed = collapsedGroups[group.title];
                                return (
                                    <div key={groupIdx} className="module-group-card">
                                        <div
                                            onClick={() => toggleGroup(group.title)}
                                            className="group-header"
                                            role="button"
                                            aria-expanded={!isCollapsed ? "true" : "false"}
                                        >
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                                                {group.title}
                                            </h3>
                                            {isCollapsed ? <ChevronDown size={20} color="#6b7280" /> : <ChevronUp size={20} color="#6b7280" />}
                                        </div>

                                        {!isCollapsed && (
                                            <div className="modules-grid">
                                                {group.modules.map(mod => (
                                                    <div key={mod.id}
                                                        className={`module-card ${settings.features[mod.id] ? 'active' : ''}`}
                                                        onClick={() => setSettings({
                                                            ...settings,
                                                            features: { ...settings.features, [mod.id]: !settings.features[mod.id] }
                                                        })}
                                                        role="checkbox"
                                                        aria-checked={settings.features[mod.id] ? "true" : "false"}
                                                        tabIndex={0}
                                                        title={`Toggle ${mod.label} module`}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                            <div className="module-icon-box" style={{
                                                                backgroundColor: settings.features[mod.id] ? 'var(--primary-color)' : '#f3f4f6',
                                                                color: settings.features[mod.id] ? 'white' : '#9ca3af'
                                                            }}>
                                                                <Grid size={24} />
                                                            </div>
                                                            <div className="checkbox-visual"></div>
                                                        </div>

                                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#111827' }}>{mod.label}</h4>
                                                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.4' }}>{mod.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
