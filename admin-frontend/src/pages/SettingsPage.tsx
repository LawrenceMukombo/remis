import React, { useState, useEffect } from 'react';
import {
    Save, Store, Grid, CheckCircle2, RotateCcw, Map, Upload, Type,
    MapPin, Mail, Phone, Palette, ChevronDown, ChevronUp, Globe, Building2,
    Plus, Check, ExternalLink, Sparkles, AlertCircle, X
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { MODULE_GROUPS } from '../constants/appModules';
import './SettingsPage.css';

interface TenantSettings {
    id?: string;
    name: string;
    config: {
        country?: string;
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
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Ubuntu', value: 'Ubuntu, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Lato', value: 'Lato, sans-serif' },
];

const COUNTRY_PRESETS = [
    {
        name: 'Global Standard',
        flag: '🌐',
        country: 'Global',
        currency: 'USD',
        dateFormat: 'YYYY-MM-DD',
        labels: { 1: 'Country', 2: 'State / Province / Region', 3: 'City / District', 4: 'Locality / Area' }
    },
    {
        name: 'United States & Canada',
        flag: '🇺🇸',
        country: 'United States',
        currency: 'USD',
        dateFormat: 'YYYY-MM-DD',
        labels: { 1: 'Country', 2: 'State / Province', 3: 'County / City', 4: 'Neighborhood / Zone' }
    },
    {
        name: 'United Kingdom',
        flag: '🇬🇧',
        country: 'United Kingdom',
        currency: 'GBP',
        dateFormat: 'DD/MM/YYYY',
        labels: { 1: 'Country', 2: 'Region / County', 3: 'City / Borough', 4: 'District / Postal Area' }
    },
    {
        name: 'Australia & New Zealand',
        flag: '🇦🇺',
        country: 'Australia',
        currency: 'AUD',
        dateFormat: 'DD/MM/YYYY',
        labels: { 1: 'Country', 2: 'State / Territory', 3: 'City / LGA', 4: 'Suburb / Precinct' }
    },
    {
        name: 'South Africa & EMEA',
        flag: '🇿🇦',
        country: 'South Africa',
        currency: 'ZAR',
        dateFormat: 'YYYY-MM-DD',
        labels: { 1: 'Country', 2: 'Province / County', 3: 'Municipality / City', 4: 'Township / Suburb' }
    },
    {
        name: 'East Africa (Kenya)',
        flag: '🇰🇪',
        country: 'Kenya',
        currency: 'KES',
        dateFormat: 'YYYY-MM-DD',
        labels: { 1: 'Country', 2: 'County', 3: 'Sub-County / Municipality', 4: 'Ward / Estate' }
    },
    {
        name: 'Zambia',
        flag: '🇿🇲',
        country: 'Zambia',
        currency: 'ZMW',
        dateFormat: 'DD/MM/YYYY',
        labels: { 1: 'Country', 2: 'Province', 3: 'District', 4: 'Settlement / Community' }
    },
    {
        name: 'Papua New Guinea',
        flag: '🇵🇬',
        country: 'Papua New Guinea',
        currency: 'PGK',
        dateFormat: 'DD/MM/YYYY',
        labels: { 1: 'Region', 2: 'Province', 3: 'District', 4: 'LLG / Compound' }
    }
];

const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'ZMW', symbol: 'K', name: 'Zambian Kwacha' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
    { code: 'PGK', symbol: 'K', name: 'Papua New Guinea Kina' }
];

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'organizations' | 'general' | 'locations' | 'modules'>('organizations');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { settings: globalSettings, organizations, activeTenantId, switchOrganization, refreshSettings } = useSettings();

    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const [showNewOrgModal, setShowNewOrgModal] = useState(false);
    const [newOrgData, setNewOrgData] = useState({
        name: '',
        country: 'United States',
        currency: 'USD',
        primaryColor: '#4f46e5'
    });
    const [creatingOrg, setCreatingOrg] = useState(false);

    const toggleGroup = (title: string) => {
        setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const [settings, setSettings] = useState<TenantSettings>({
        name: '',
        config: {
            country: 'United States',
            branding: {
                logoUrl: '',
                primaryColor: '#4f46e5',
                secondaryColor: '#10b981',
                fontFamily: 'Inter, sans-serif'
            },
            contact: { email: '', phone: '', address: '' },
            locationLabels: { 1: 'Country', 2: 'State / Province', 3: 'City / District', 4: 'Locality / Area' },
            locale: { currency: 'USD', dateFormat: 'YYYY-MM-DD', timeFormat: '12h' }
        },
        features: {
            properties: true, leases: true, sales: true, landlords: true,
            maintenance: true, vendors: true, inventory: false, hr: false, pos: false, field: false,
            finance: true,
            crm: true, portal: false,
            strategy: false, compliance: true, documents: true, contracts: false, trust: false,
            analytics: true, reports: true, map: true, locations: true, workflows: false, communications: false, security: true, integrations: false
        }
    });

    useEffect(() => {
        if (globalSettings) {
            setSettings({
                id: globalSettings.id,
                name: globalSettings.name,
                config: {
                    country: globalSettings.config?.country || 'United States',
                    branding: { ...globalSettings.config?.branding },
                    contact: { ...globalSettings.config?.contact },
                    locationLabels: { ...globalSettings.config?.locationLabels },
                    locale: { ...globalSettings.config?.locale }
                },
                features: { ...globalSettings.features }
            });
        }
    }, [globalSettings]);

    const handleApplyPreset = (preset: typeof COUNTRY_PRESETS[0]) => {
        setSettings(prev => ({
            ...prev,
            config: {
                ...prev.config,
                country: preset.country,
                locationLabels: { ...preset.labels },
                locale: {
                    ...prev.config.locale,
                    currency: preset.currency,
                    dateFormat: preset.dateFormat
                }
            }
        }));
        setMsg({ type: 'success', text: `Applied ${preset.name} country & hierarchy preset!` });
        setTimeout(() => setMsg(null), 3000);
    };

    const handleSave = async () => {
        const targetId = settings.id || activeTenantId || user.tenantId;
        if (!targetId) {
            setMsg({ type: 'error', text: 'Organization ID not found.' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/tenant/settings/${targetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setMsg({ type: 'success', text: 'Organization settings saved successfully!' });
                await refreshSettings();
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Error saving settings' });
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(null), 3000);
        }
    };

    const handleCreateNewOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrgData.name.trim()) return;

        setCreatingOrg(true);
        try {
            const preset = COUNTRY_PRESETS.find(p => p.country === newOrgData.country) || COUNTRY_PRESETS[0];
            const res = await fetch('http://localhost:4000/api/tenant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newOrgData.name,
                    country: newOrgData.country,
                    currency: newOrgData.currency,
                    config: {
                        country: newOrgData.country,
                        branding: { primaryColor: newOrgData.primaryColor },
                        locationLabels: preset.labels,
                        locale: { currency: newOrgData.currency, dateFormat: preset.dateFormat, timeFormat: '12h' }
                    }
                })
            });

            const data = await res.json();
            if (res.ok && data.data) {
                setMsg({ type: 'success', text: `Organization "${data.data.name}" created successfully!` });
                setShowNewOrgModal(false);
                setNewOrgData({ name: '', country: 'United States', currency: 'USD', primaryColor: '#4f46e5' });
                await refreshSettings();
                await switchOrganization(data.data.id);
            } else {
                setMsg({ type: 'error', text: data.message || 'Error creating organization' });
            }
        } catch (error) {
            setMsg({ type: 'error', text: 'Failed to create organization' });
        } finally {
            setCreatingOrg(false);
            setTimeout(() => setMsg(null), 3500);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:4000/api/upload/file', {
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
            }
        } catch (err) {
            console.error(err);
        }
    };

    const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            title={`Switch to ${label} settings`}
        >
            <Icon size={18} /> {label}
        </button>
    );

    return (
        <div className="settings-container">
            {/* Header */}
            <div className="settings-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1>System & Multi-Country Configuration</h1>
                        <span className="badge-tag live-badge">Enterprise v2.0</span>
                    </div>
                    <p>Configure multiple organizations, global country hierarchies, branding, and regional currencies.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="save-btn"
                    title="Save all changes for active organization"
                >
                    {loading ? <RotateCcw className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Organization Settings
                </button>
            </div>

            {msg && (
                <div className={`message-banner ${msg.type}`}>
                    {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {msg.text}
                </div>
            )}

            <div className="settings-card">
                {/* Tabs */}
                <div className="tabs-header">
                    <TabButton id="organizations" label="Organizations & Portfolios" icon={Building2} />
                    <TabButton id="locations" label="Location Hierarchy & Presets" icon={Map} />
                    <TabButton id="general" label="Branding & Contact" icon={Store} />
                    <TabButton id="modules" label="Module Management" icon={Grid} />
                </div>

                <div className="settings-content">
                    {/* Organizations Tab */}
                    {activeTab === 'organizations' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                                        Enterprise Organizations & Portfolios
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                                        Manage separate companies, international branches, or client asset portfolios with independent currencies and data boundaries.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowNewOrgModal(true)}
                                    className="action-btn primary-btn"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', background: '#4f46e5', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer' }}
                                >
                                    <Plus size={18} /> Register New Organization
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                                {organizations.map(org => {
                                    const isCurrent = org.id === settings.id || org.id === activeTenantId;
                                    return (
                                        <div
                                            key={org.id}
                                            style={{
                                                background: isCurrent ? '#f5f3ff' : 'white',
                                                border: isCurrent ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                                borderRadius: '16px',
                                                padding: '1.5rem',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
                                                            {org.name}
                                                        </h4>
                                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Domain: {org.domain}</span>
                                                    </div>
                                                    {isCurrent && (
                                                        <span style={{ background: '#4f46e5', color: 'white', fontSize: '0.7rem', fontWeight: '700', padding: '3px 8px', borderRadius: '99px' }}>
                                                            Active Now
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ background: 'white', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', margin: '12px 0', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                                    <div>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: '600' }}>COUNTRY</div>
                                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>📍 {org.config?.country || 'Global'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: '600' }}>CURRENCY</div>
                                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{org.config?.locale?.currency || 'USD'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: '600' }}>PROPERTIES</div>
                                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{org._count?.properties || 0} Assets</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '12px' }}>
                                                {!isCurrent ? (
                                                    <button
                                                        onClick={() => switchOrganization(org.id)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '9px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #c7d2fe',
                                                            background: 'white',
                                                            color: '#4f46e5',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s'
                                                        }}
                                                    >
                                                        Switch to this Organization
                                                    </button>
                                                ) : (
                                                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#4f46e5', fontWeight: '600', padding: '8px 0' }}>
                                                        ✓ Viewing and managing this organization
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Location Hierarchy & Country Presets Tab */}
                    {activeTab === 'locations' && (
                        <div>
                            {/* Country Presets Box */}
                            <div style={{
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                border: '1px solid #bbf7d0',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Sparkles size={20} color="#059669" />
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#065f46' }}>
                                        Multi-Country Regional Presets
                                    </h4>
                                </div>
                                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#166534', lineHeight: 1.5 }}>
                                    Click any preset to instantly configure geographic hierarchy levels, regional currency, and date formats for your target country:
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
                                    {COUNTRY_PRESETS.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleApplyPreset(preset)}
                                            style={{
                                                background: 'white',
                                                border: '1px solid #cbd5e1',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                transition: 'transform 0.15s, border-color 0.15s',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                                        >
                                            <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#1e293b' }}>
                                                {preset.flag} {preset.name}
                                            </div>
                                            <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                                                {preset.labels[1]} → {preset.labels[2]} → {preset.labels[3]}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Hierarchy Labels */}
                            <div style={{ maxWidth: '680px' }}>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                                    Active Geographical Levels for {settings.name}
                                </h4>
                                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#64748b' }}>
                                    Customize the exact naming convention for each level in your geographic hierarchy:
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[1, 2, 3, 4].map(level => (
                                        <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '34px',
                                                height: '34px',
                                                borderRadius: '8px',
                                                background: '#e0e7ff',
                                                color: '#4338ca',
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.85rem',
                                                flexShrink: 0
                                            }}>
                                                L{level}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    type="text"
                                                    value={settings.config.locationLabels?.[level] || ''}
                                                    onChange={(e) => {
                                                        const newLabels = { ...settings.config.locationLabels, [level]: e.target.value };
                                                        setSettings({
                                                            ...settings,
                                                            config: { ...settings.config, locationLabels: newLabels }
                                                        });
                                                    }}
                                                    className="form-input"
                                                    placeholder={`Level ${level} Name`}
                                                    style={{ padding: '0.75rem 1rem', borderRadius: '10px' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Branding & Contact Tab */}
                    {activeTab === 'general' && (
                        <div className="general-grid">
                            <div className="settings-section">
                                <h3 className="section-title">Brand Identity</h3>

                                <div className="form-field">
                                    <label htmlFor="company-name">Organization / Company Name</label>
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
                                    <label>Operating Country</label>
                                    <select
                                        value={settings.config.country || 'United States'}
                                        onChange={(e) => setSettings({ ...settings, config: { ...settings.config, country: e.target.value } })}
                                        className="form-select"
                                    >
                                        {COUNTRY_PRESETS.map(p => (
                                            <option key={p.country} value={p.country}>
                                                {p.flag} {p.country}
                                            </option>
                                        ))}
                                    </select>
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
                                        </div>
                                    </div>
                                </div>

                                <div className="color-picker-group">
                                    <div>
                                        <label className="form-field" style={{ marginBottom: '0.75rem' }}>
                                            Primary Brand Color
                                        </label>
                                        <div className="color-picker-field">
                                            <input
                                                type="color"
                                                value={settings.config.branding.primaryColor}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    config: {
                                                        ...settings.config,
                                                        branding: { ...settings.config.branding, primaryColor: e.target.value }
                                                    }
                                                })}
                                                className="color-input"
                                            />
                                            <div className="color-value-display">
                                                <div className="color-hex">{settings.config.branding.primaryColor}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3 className="section-title">Regional & Currency Standards</h3>

                                <div className="form-field">
                                    <label htmlFor="currency-select">Operating Currency</label>
                                    <select
                                        id="currency-select"
                                        value={settings.config.locale.currency}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            config: {
                                                ...settings.config,
                                                locale: { ...settings.config.locale, currency: e.target.value }
                                            }
                                        })}
                                        className="form-select"
                                    >
                                        {CURRENCIES.map(c => (
                                            <option key={c.code} value={c.code}>
                                                {c.code} ({c.symbol}) - {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="date-format-select">Date Format</label>
                                    <select
                                        id="date-format-select"
                                        value={settings.config.locale.dateFormat}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            config: {
                                                ...settings.config,
                                                locale: { ...settings.config.locale, dateFormat: e.target.value }
                                            }
                                        })}
                                        className="form-select"
                                    >
                                        <option value="YYYY-MM-DD">YYYY-MM-DD (ISO International)</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY (UK / Australia / Africa)</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                                    </select>
                                </div>

                                <h3 className="section-title" style={{ marginTop: '1.5rem' }}>Contact Information</h3>

                                <div className="form-field">
                                    <label>Public Email</label>
                                    <input
                                        type="email"
                                        value={settings.config.contact.email}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            config: { ...settings.config, contact: { ...settings.config.contact, email: e.target.value } }
                                        })}
                                        className="form-input"
                                        placeholder="admin@organization.com"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Contact Phone</label>
                                    <input
                                        type="text"
                                        value={settings.config.contact.phone}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            config: { ...settings.config, contact: { ...settings.config.contact, phone: e.target.value } }
                                        })}
                                        className="form-input"
                                        placeholder="+1 555-0100"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modules Tab */}
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
                                        >
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                                                {group.title}
                                            </h3>
                                            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                                        </div>

                                        {!isCollapsed && (
                                            <div className="module-grid">
                                                {group.modules.map(module => {
                                                    const isEnabled = !!settings.features[module.id];
                                                    return (
                                                        <div key={module.id} className="module-item">
                                                            <div className="module-info">
                                                                <div className="module-name">{module.label}</div>
                                                                <div className="module-desc">{module.desc}</div>
                                                            </div>
                                                            <label className="toggle-switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isEnabled}
                                                                    onChange={(e) => {
                                                                        const updated = {
                                                                            ...settings.features,
                                                                            [module.id]: e.target.checked
                                                                        };
                                                                        setSettings({ ...settings, features: updated });
                                                                    }}
                                                                />
                                                                <span className="toggle-slider"></span>
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* New Organization Modal */}
            {showNewOrgModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '2rem',
                        maxWidth: '540px',
                        width: '100%',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Building2 size={22} color="#4f46e5" />
                                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
                                    Register New Organization
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowNewOrgModal(false)}
                                style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateNewOrganization} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                                    Organization / Company Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Pacific Asset Management, Beacon Commercial"
                                    value={newOrgData.name}
                                    onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                                        Country *
                                    </label>
                                    <select
                                        value={newOrgData.country}
                                        onChange={(e) => {
                                            const country = e.target.value;
                                            const preset = COUNTRY_PRESETS.find(p => p.country === country);
                                            setNewOrgData({
                                                ...newOrgData,
                                                country,
                                                currency: preset ? preset.currency : newOrgData.currency
                                            });
                                        }}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', boxSizing: 'border-box' }}
                                    >
                                        {COUNTRY_PRESETS.map(p => (
                                            <option key={p.country} value={p.country}>{p.flag} {p.country}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                                        Base Currency *
                                    </label>
                                    <select
                                        value={newOrgData.currency}
                                        onChange={(e) => setNewOrgData({ ...newOrgData, currency: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', boxSizing: 'border-box' }}
                                    >
                                        {CURRENCIES.map(c => (
                                            <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowNewOrgModal(false)}
                                    style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingOrg}
                                    style={{ flex: 2, padding: '0.85rem', borderRadius: '10px', border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer', fontWeight: '700' }}
                                >
                                    {creatingOrg ? 'Registering...' : 'Create Organization'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
