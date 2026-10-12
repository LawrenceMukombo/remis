import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Folder, MapPin, Trash2, Edit2, X, Upload, Download, Globe, Sparkles, Building2, Check } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useSettings } from '../context/SettingsContext';
import './LocationsPage.css';

interface Location {
    id: string;
    name: string;
    type: string;
    level: number;
    parentId: string | null;
    _count?: {
        children: number;
        properties: number;
    };
}

const COUNTRY_PRESETS = [
    { name: 'Global Standard', flag: '🌐', labels: { 1: 'Country', 2: 'State / Province', 3: 'City / District', 4: 'Locality / Area' } },
    { name: 'Zambia', flag: '🇿🇲', labels: { 1: 'Country', 2: 'Province', 3: 'District', 4: 'Settlement / Community' } },
    { name: 'United States', flag: '🇺🇸', labels: { 1: 'Country', 2: 'State', 3: 'County / City', 4: 'Neighborhood' } },
    { name: 'United Kingdom', flag: '🇬🇧', labels: { 1: 'Country', 2: 'Region / County', 3: 'City / Borough', 4: 'Postal District' } },
    { name: 'Australia', flag: '🇦🇺', labels: { 1: 'Country', 2: 'State / Territory', 3: 'City / LGA', 4: 'Suburb' } },
    { name: 'South Africa', flag: '🇿🇦', labels: { 1: 'Country', 2: 'Province', 3: 'Municipality', 4: 'Township / Suburb' } },
    { name: 'Kenya', flag: '🇰🇪', labels: { 1: 'Country', 2: 'County', 3: 'Sub-County', 4: 'Ward / Estate' } },
    { name: 'Papua New Guinea', flag: '🇵🇬', labels: { 1: 'Region', 2: 'Province', 3: 'District', 4: 'LLG / Compound' } }
];

const LocationsPage: React.FC = () => {
    const { showToast } = useToast();
    const { settings, refreshSettings } = useSettings();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Navigation State
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<{ id: string, name: string }[]>([]);

    // Data State
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);

    // Config State (Levels)
    const [levelLabels, setLevelLabels] = useState<Record<number, string>>({
        1: 'Country', 2: 'State / Province', 3: 'City / District', 4: 'Locality / Area'
    });

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);

    const [formData, setFormData] = useState({ name: '', type: '' });
    const [editingLoc, setEditingLoc] = useState<Location | null>(null);
    const [bulkData, setBulkData] = useState('');

    useEffect(() => {
        if (settings?.config?.locationLabels) {
            setLevelLabels(settings.config.locationLabels);
        }
    }, [settings]);

    useEffect(() => {
        fetchLocations();
    }, [currentParentId, settings?.id]);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            const tid = settings?.id || user.tenantId;
            if (tid) params.append('tenantId', tid);

            if (currentParentId) {
                params.append('parentId', currentParentId);
            } else {
                params.append('parentId', 'root');
            }

            const res = await fetch(`http://localhost:4000/api/locations?${params.toString()}`);
            const data = await res.json();
            setLocations(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast("Error fetching locations", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleApplyPreset = async (preset: typeof COUNTRY_PRESETS[0]) => {
        try {
            setLevelLabels(preset.labels);
            const targetId = settings?.id || user.tenantId;
            if (targetId) {
                await fetch(`http://localhost:4000/api/tenant/settings/${targetId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        config: {
                            ...settings?.config,
                            locationLabels: preset.labels
                        }
                    })
                });
                await refreshSettings();
            }
            showToast(`Configured hierarchy for ${preset.name}!`, "success");
        } catch (e) {
            showToast("Error updating preset", "error");
        }
    };

    const handleNavigate = (loc: Location) => {
        setBreadcrumbs([...breadcrumbs, { id: loc.id, name: loc.name }]);
        setCurrentParentId(loc.id);
    };

    const handleBreadcrumbClick = (index: number) => {
        if (index === -1) {
            setBreadcrumbs([]);
            setCurrentParentId(null);
        } else {
            const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
            setBreadcrumbs(newBreadcrumbs);
            setCurrentParentId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
        }
    };

    const currentLevel = breadcrumbs.length + 1;
    const currentLevelLabel = levelLabels[currentLevel] || `Level ${currentLevel}`;

    const handleSaveAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            const res = await fetch('http://localhost:4000/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    type: formData.type || currentLevelLabel.toUpperCase(),
                    level: currentLevel,
                    parentId: currentParentId,
                    tenantId: settings?.id || user.tenantId
                })
            });
            if (res.ok) {
                showToast(`${currentLevelLabel} "${formData.name}" added successfully`, "success");
                setShowAddModal(false);
                setFormData({ name: '', type: '' });
                fetchLocations();
            } else {
                showToast("Failed to add location", "error");
            }
        } catch (e) {
            showToast('Error adding location', "error");
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLoc || !formData.name.trim()) return;

        try {
            const res = await fetch(`http://localhost:4000/api/locations/${editingLoc.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name.trim() })
            });
            if (res.ok) {
                showToast('Location updated', "success");
                setShowEditModal(false);
                setEditingLoc(null);
                fetchLocations();
            }
        } catch (e) {
            showToast('Error updating location', "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this location? (Locations with child zones or properties cannot be deleted)')) return;
        try {
            const res = await fetch(`http://localhost:4000/api/locations/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Location deleted successfully', "success");
                fetchLocations();
            } else {
                const data = await res.json();
                showToast(data.message || 'Cannot delete location with children', "error");
            }
        } catch (e) {
            showToast('Error deleting location', "error");
        }
    };

    const [seedingZambia, setSeedingZambia] = useState(false);
    const [importTab, setImportTab] = useState<'upload' | 'text' | 'presets'>('upload');
    const [fileName, setFileName] = useState('');
    const [parsedCount, setParsedCount] = useState(0);

    const handleSeedZambia = async () => {
        setSeedingZambia(true);
        try {
            const res = await fetch('http://localhost:4000/api/locations/seed-zambia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId: settings?.id || user.tenantId })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Zambia hierarchy successfully seeded with all 10 Provinces, Districts & Settlements!', 'success');
                fetchLocations();
                await refreshSettings();
            } else {
                showToast(data.message || 'Failed to seed Zambia locations', 'error');
            }
        } catch (err) {
            showToast('Error seeding Zambia hierarchy', 'error');
        } finally {
            setSeedingZambia(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
                try {
                    const parsed = JSON.parse(content);
                    const list = Array.isArray(parsed) ? parsed : (parsed.features || []);
                    const lines = list.map((item: any) => {
                        const name = item.name || item.properties?.name || item.properties?.NAME || 'Location';
                        const type = item.type || item.properties?.type || currentLevelLabel.toUpperCase();
                        return `${name}, ${type}`;
                    }).join('\n');
                    setBulkData(lines);
                    setParsedCount(list.length);
                    showToast(`Parsed ${list.length} locations from ${file.name}`, 'success');
                } catch {
                    showToast('Failed to parse JSON file', 'error');
                }
            } else {
                // CSV or plain text
                const rows = content.trim().split('\n');
                // Remove header row if exists
                const filtered = rows.filter(r => !r.toLowerCase().startsWith('name,'));
                setBulkData(filtered.join('\n'));
                setParsedCount(filtered.length);
                showToast(`Parsed ${filtered.length} locations from ${file.name}`, 'success');
            }
        };
        reader.readAsText(file);
    };

    const downloadSampleCSV = () => {
        const sampleContent = `Name,Type\nLusaka Province,PROVINCE\nCopperbelt Province,PROVINCE\nKitwe District,DISTRICT\nKabulonga,COMMUNITY\nWoodlands,COMMUNITY\nRiverside,COMMUNITY\n`;
        const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'remis_location_import_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Downloaded sample CSV template', 'success');
    };

    const handleBulkUpload = async () => {
        const lines = bulkData.trim().split('\n');
        if (lines.length === 0 || !bulkData.trim()) {
            showToast('Please provide location entries to import', 'error');
            return;
        }

        const payload = lines.map(line => {
            const parts = line.split(',').map(s => s.trim());
            const name = parts[0];
            const type = parts[1];
            return {
                name,
                type: type || currentLevelLabel.toUpperCase(),
                level: currentLevel,
                parentId: currentParentId
            };
        }).filter(l => l.name);

        try {
            const res = await fetch('http://localhost:4000/api/locations/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locations: payload,
                    tenantId: settings?.id || user.tenantId
                })
            });
            if (res.ok) {
                showToast(`Successfully imported ${payload.length} locations!`, "success");
                setShowBulkModal(false);
                setBulkData('');
                setFileName('');
                setParsedCount(0);
                fetchLocations();
            }
        } catch (e) {
            showToast('Error in bulk upload', "error");
        }
    };

    const primaryColor = settings?.config?.branding?.primaryColor || '#4f46e5';

    return (
        <div className="locations-container" style={{ '--primary-color': primaryColor } as React.CSSProperties}>
            {/* Header */}
            <div className="locations-header">
                <div className="header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1>Multi-Country Geographic Hierarchy</h1>
                        <span className="badge-tag live-badge">Level {currentLevel}: {currentLevelLabel}</span>
                    </div>
                    <p>
                        Current Organization: <strong>{settings?.name || 'Default Organization'}</strong> • Country: <strong>{settings?.config?.country || 'Global'}</strong>
                    </p>
                </div>
                <div className="header-actions">
                    <button
                        className="action-btn secondary"
                        onClick={handleSeedZambia}
                        disabled={seedingZambia}
                        title="Seed all 10 Provinces, official Districts & Settlements in Zambia"
                        style={{ borderColor: '#059669', color: '#059669', background: '#ecfdf5', fontWeight: 700 }}
                    >
                        <span>🇿🇲</span> {seedingZambia ? 'Seeding Zambia...' : 'Seed Zambia Spatial Hierarchy'}
                    </button>
                    <button className="action-btn secondary" onClick={() => { setImportTab('upload'); setShowBulkModal(true); }} title="Import locations via CSV, JSON or GeoJSON">
                        <Upload size={18} /> Import Locations
                    </button>
                    <button
                        className="action-btn primary-btn"
                        onClick={() => { setFormData({ name: '', type: '' }); setShowAddModal(true); }}
                        style={{ backgroundColor: primaryColor }}
                        title={`Add new ${currentLevelLabel}`}
                    >
                        <Plus size={18} /> Add {currentLevelLabel}
                    </button>
                </div>
            </div>

            {/* Country Presets Quick Switcher */}
            <div style={{
                background: 'white',
                padding: '12px 18px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                    <Sparkles size={16} color="#4f46e5" /> Hierarchy Convention:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {COUNTRY_PRESETS.map((preset, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleApplyPreset(preset)}
                            style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                padding: '5px 10px',
                                borderRadius: '8px',
                                fontSize: '0.785rem',
                                fontWeight: '600',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            {preset.flag} {preset.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="breadcrumbs-container">
                <div
                    className={`breadcrumb-item ${breadcrumbs.length === 0 ? 'active' : ''}`}
                    onClick={() => handleBreadcrumbClick(-1)}
                >
                    <Globe size={16} /> All Root Locations ({levelLabels[1] || 'Level 1'})
                </div>
                {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.id}>
                        <ChevronRight size={16} className="breadcrumb-separator" />
                        <div
                            className={`breadcrumb-item ${idx === breadcrumbs.length - 1 ? 'active' : ''}`}
                            onClick={() => handleBreadcrumbClick(idx)}
                        >
                            {crumb.name}
                        </div>
                    </React.Fragment>
                ))}
            </div>

            {/* Content List */}
            {loading ? (
                <div className="loading-state">
                    <div className="loading-text">Loading geographical zones...</div>
                </div>
            ) : locations.length === 0 ? (
                <div className="empty-state">
                    <MapPin size={48} className="empty-icon" />
                    <h3>No {currentLevelLabel}s Registered</h3>
                    <p>Click "Add {currentLevelLabel}" to create your first geographical node in this level.</p>
                    <button
                        className="action-btn primary-btn"
                        onClick={() => { setFormData({ name: '', type: '' }); setShowAddModal(true); }}
                        style={{ marginTop: '1rem', backgroundColor: primaryColor }}
                    >
                        <Plus size={18} /> Add First {currentLevelLabel}
                    </button>
                </div>
            ) : (
                <div className="locations-grid">
                    {locations.map(loc => (
                        <div key={loc.id} className="location-card">
                            <div className="location-card-content" onClick={() => handleNavigate(loc)}>
                                <div className="location-icon-wrapper" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                    <Folder size={24} />
                                </div>
                                <div className="location-info">
                                    <h3 className="location-name">{loc.name}</h3>
                                    <div className="location-meta">
                                        <span className="location-type-badge">{loc.type || currentLevelLabel}</span>
                                        <span className="location-sub-count">
                                            {loc._count?.children || 0} sub-zones • {loc._count?.properties || 0} properties
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="chevron-icon" />
                            </div>

                            <div className="location-card-actions">
                                <button
                                    className="action-icon-btn edit-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingLoc(loc);
                                        setFormData({ name: loc.name, type: loc.type });
                                        setShowEditModal(true);
                                    }}
                                    title="Edit name"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    className="action-icon-btn delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(loc.id);
                                    }}
                                    title="Delete location"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New {currentLevelLabel}</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveAdd}>
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={`e.g. ${currentLevel === 1 ? 'United States, Australia' : currentLevel === 2 ? 'California, New South Wales' : 'San Francisco, Sydney CBD'}`}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save" style={{ backgroundColor: primaryColor }}>Save {currentLevelLabel}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Edit Location</h2>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveEdit}>
                            <div className="form-group">
                                <label>Location Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save" style={{ backgroundColor: primaryColor }}>Update Location</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Location Import Center Modal */}
            {showBulkModal && (
                <div className="modal-backdrop">
                    <div className="modal-content" style={{ maxWidth: '640px', width: '100%' }}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Import Geographic Locations</h2>
                                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                    Adding locations into: <strong>{breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Root Level'}</strong> (Level {currentLevel}: {currentLevelLabel})
                                </p>
                            </div>
                            <button className="close-btn" onClick={() => setShowBulkModal(false)}><X size={20} /></button>
                        </div>

                        {/* Import Mode Tabs */}
                        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setImportTab('upload')}
                                style={{
                                    padding: '8px 12px',
                                    border: 'none',
                                    borderBottom: importTab === 'upload' ? '2.5px solid #4f46e5' : '2.5px solid transparent',
                                    background: 'transparent',
                                    fontWeight: importTab === 'upload' ? 700 : 500,
                                    color: importTab === 'upload' ? '#4f46e5' : '#64748b',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                📁 Upload CSV / JSON
                            </button>
                            <button
                                type="button"
                                onClick={() => setImportTab('text')}
                                style={{
                                    padding: '8px 12px',
                                    border: 'none',
                                    borderBottom: importTab === 'text' ? '2.5px solid #4f46e5' : '2.5px solid transparent',
                                    background: 'transparent',
                                    fontWeight: importTab === 'text' ? 700 : 500,
                                    color: importTab === 'text' ? '#4f46e5' : '#64748b',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                ✍️ Paste Text / CSV
                            </button>
                            <button
                                type="button"
                                onClick={() => setImportTab('presets')}
                                style={{
                                    padding: '8px 12px',
                                    border: 'none',
                                    borderBottom: importTab === 'presets' ? '2.5px solid #059669' : '2.5px solid transparent',
                                    background: 'transparent',
                                    fontWeight: importTab === 'presets' ? 700 : 500,
                                    color: importTab === 'presets' ? '#059669' : '#64748b',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                🇿🇲 1-Click Zambia Hierarchy
                            </button>
                        </div>

                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            {importTab === 'upload' && (
                                <div>
                                    <div style={{
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        background: '#f8fafc',
                                        marginBottom: '1rem',
                                        cursor: 'pointer'
                                    }}>
                                        <Upload size={32} color="#64748b" style={{ margin: '0 auto 8px' }} />
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                                            {fileName ? `Selected: ${fileName}` : 'Choose CSV, JSON or GeoJSON file'}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                                            Supported: .csv, .json, .geojson (columns: Name, Type)
                                        </div>
                                        <input
                                            type="file"
                                            accept=".csv,.json,.geojson,text/csv,application/json"
                                            onChange={handleFileUpload}
                                            style={{ marginTop: '10px' }}
                                        />
                                    </div>

                                    {parsedCount > 0 && (
                                        <div style={{
                                            background: '#ecfdf5',
                                            border: '1px solid #a7f3d0',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            marginBottom: '1rem',
                                            fontSize: '0.825rem',
                                            color: '#065f46',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <Check size={16} /> <strong>{parsedCount}</strong> locations ready to be imported.
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={downloadSampleCSV}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#4f46e5',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: 0
                                            }}
                                        >
                                            <Download size={14} /> Download Sample CSV Template
                                        </button>
                                    </div>
                                </div>
                            )}

                            {importTab === 'text' && (
                                <div>
                                    <div className="bulk-instructions" style={{ marginBottom: '8px' }}>
                                        <p style={{ margin: 0, fontSize: '0.825rem', color: '#475569' }}>
                                            Enter one location per line in CSV format: <code>Name, Type</code>
                                        </p>
                                    </div>
                                    <textarea
                                        rows={6}
                                        placeholder={`Lusaka Province, PROVINCE\nCopperbelt Province, PROVINCE\nCentral Province, PROVINCE\nSouthern Province, PROVINCE`}
                                        value={bulkData}
                                        onChange={(e) => {
                                            setBulkData(e.target.value);
                                            setParsedCount(e.target.value.trim().split('\n').filter(Boolean).length);
                                        }}
                                        className="bulk-textarea"
                                    />
                                    <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                                        {parsedCount} entries ready to import.
                                    </div>
                                </div>
                            )}

                            {importTab === 'presets' && (
                                <div style={{
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '12px',
                                    padding: '1.25rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>🇿🇲</span>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#14532d' }}>
                                                Zambia National Spatial Hierarchy
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#166534' }}>
                                                Official 10 Provinces, All Districts, Townships & Settlements
                                            </p>
                                        </div>
                                    </div>
                                    <ul style={{ margin: '8px 0 12px 18px', padding: 0, fontSize: '0.78rem', color: '#166534', lineHeight: 1.5 }}>
                                        <li><strong>Lusaka Province:</strong> Lusaka, Chilanga, Kafue, Chongwe (Kabulonga, Woodlands, Rhodes Park...)</li>
                                        <li><strong>Copperbelt:</strong> Kitwe, Ndola, Chingola, Mufulira (Riverside, Kansenshi, Parklands...)</li>
                                        <li><strong>Central, Southern, Eastern, Luapula, Northern, North-Western, Muchinga, Western</strong></li>
                                        <li>Over <strong>990+ total verified locations</strong> with hierarchical relationships.</li>
                                    </ul>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowBulkModal(false);
                                            handleSeedZambia();
                                        }}
                                        disabled={seedingZambia}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#059669',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {seedingZambia ? 'Seeding Zambia Database...' : '🚀 Execute 1-Click Zambia Hierarchy Seed'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                            <button type="button" className="btn-cancel" onClick={() => setShowBulkModal(false)}>Cancel</button>
                            {importTab !== 'presets' && (
                                <button
                                    type="button"
                                    className="btn-save"
                                    onClick={handleBulkUpload}
                                    style={{ backgroundColor: primaryColor }}
                                    disabled={!bulkData.trim()}
                                >
                                    Import {parsedCount > 0 ? `(${parsedCount})` : ''} Locations
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationsPage;
