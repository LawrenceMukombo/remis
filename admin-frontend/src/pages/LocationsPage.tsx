
import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Folder, MapPin, Trash2, Edit2, X, Upload, Download, FileText } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './LocationsPage.css';

interface Location {
    id: string;
    name: string;
    type: string;
    level: number;
    parentId: string | null;
    _count?: { children: number };
}

const LocationsPage: React.FC = () => {
    const { showToast } = useToast();

    // Navigation State
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<{ id: string, name: string }[]>([]);

    // Data State
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [primaryColor, setPrimaryColor] = useState('#4f46e5');

    // Config State (Levels)
    const [levelLabels, setLevelLabels] = useState<Record<number, string>>({
        1: 'Region', 2: 'Province', 3: 'District', 4: 'LLG'
    });

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);

    const [formData, setFormData] = useState({ name: '', type: '' });
    const [editingLoc, setEditingLoc] = useState<Location | null>(null);
    const [bulkData, setBulkData] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        fetchLocations();
    }, [currentParentId]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/tenant/settings');
            const data = await res.json();
            if (data?.config?.locationLabels) {
                setLevelLabels(data.config.locationLabels);
            }
            if (data?.primaryColor) {
                setPrimaryColor(data.primaryColor);
            }
        } catch (err) { console.error(err); }
    };

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentParentId) params.append('parentId', currentParentId);
            else params.append('level', '1');

            const res = await fetch(`http://localhost:4000/api/locations?${params.toString()}`);
            const data = await res.json();
            setLocations(data);
        } catch (err) {
            showToast("Error fetching locations", "error");
        } finally {
            setLoading(false);
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
        try {
            const res = await fetch('http://localhost:4000/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    type: currentLevelLabel.toUpperCase(),
                    level: currentLevel,
                    parentId: currentParentId,
                    tenantId: 'default'
                })
            });
            if (res.ok) {
                showToast(`${currentLevelLabel} added`, "success");
                setShowAddModal(false);
                setFormData({ name: '', type: '' });
                fetchLocations();
            }
        } catch (e) { showToast('Error adding', "error"); }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLoc) return;
        try {
            const res = await fetch(`http://localhost:4000/api/locations/${editingLoc.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name })
            });
            if (res.ok) {
                showToast('Location updated', "success");
                setShowEditModal(false);
                setEditingLoc(null);
                fetchLocations();
            }
        } catch (e) { showToast('Error updating', "error"); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure? This will fail if location has children.')) return;
        try {
            const res = await fetch(`http://localhost:4000/api/locations/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Location deleted', "success");
                fetchLocations();
            } else {
                showToast('Cannot delete location with children', "error");
            }
        } catch (e) { showToast('Error deleting', "error"); }
    };

    const handleBulkUpload = async () => {
        // Simple CSV parser: Name, Type
        const lines = bulkData.trim().split('\n');
        if (lines.length === 0) return;

        const payload = lines.map(line => {
            const [name, type] = line.split(',').map(s => s.trim());
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
                body: JSON.stringify({ locations: payload, tenantId: 'default' })
            });
            if (res.ok) {
                showToast('Bulk upload successful', "success");
                setShowBulkModal(false);
                setBulkData('');
                fetchLocations();
            }
        } catch (e) { showToast('Error in bulk upload', "error"); }
    };

    return (
        <div className="locations-container" style={{ '--primary-color': primaryColor } as React.CSSProperties}>
            {/* Header */}
            <div className="locations-header">
                <div className="header-title">
                    <h1>Location Hierarchy</h1>
                    <p>Manage and organize your geographic levels and locations.</p>
                </div>
                <div className="header-actions">
                    <button className="action-btn secondary" onClick={() => setShowBulkModal(true)} title="Bulk upload locations">
                        <Upload size={18} /> Bulk Upload
                    </button>
                    <button className="action-btn primary-btn" onClick={() => { setFormData({ name: '', type: '' }); setShowAddModal(true); }} style={{ backgroundColor: primaryColor }} title={`Add new ${currentLevelLabel}`}>
                        <Plus size={18} /> Add {currentLevelLabel}
                    </button>
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="breadcrumb-container">
                <div className={`breadcrumb-item ${breadcrumbs.length === 0 ? 'active' : ''}`} onClick={() => handleBreadcrumbClick(-1)}>
                    <Folder size={18} /> Root
                </div>
                {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.id}>
                        <ChevronRight size={16} color="#94a3b8" />
                        <div
                            className={`breadcrumb-item ${idx === breadcrumbs.length - 1 ? 'active' : ''}`}
                            onClick={() => handleBreadcrumbClick(idx)}
                        >
                            {crumb.name}
                        </div>
                    </React.Fragment>
                ))}
            </div>

            {/* List Card */}
            <div className="locations-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading locations...</p>
                    </div>
                ) : locations.length === 0 ? (
                    <div className="empty-state">
                        <MapPin size={64} />
                        <h3>No locations found</h3>
                        <p>There are no locations at this level. Click "Add {currentLevelLabel}" to create one.</p>
                    </div>
                ) : (
                    <table className="locations-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map(loc => (
                                <tr key={loc.id}>
                                    <td>
                                        <div className="location-name" onClick={() => handleNavigate(loc)}>
                                            <Folder size={20} color="#fbbf24" fill="#fbbf24" style={{ opacity: 0.8 }} />
                                            {loc.name}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="location-type-badge">{loc.type}</span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="icon-button" onClick={() => { setEditingLoc(loc); setFormData({ name: loc.name, type: loc.type }); setShowEditModal(true); }} title="Edit location">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="icon-button danger" onClick={() => handleDelete(loc.id)} title="Delete location">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New {currentLevelLabel}</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)} title="Close modal"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveAdd}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder={`Enter ${currentLevelLabel} name`}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="action-btn secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="action-btn primary-btn" style={{ backgroundColor: primaryColor }}>Create {currentLevelLabel}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Edit {currentLevelLabel}</h2>
                            <button className="close-btn" onClick={() => setShowEditModal(false)} title="Close modal"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveEdit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="editLocName">Name</label>
                                    <input
                                        id="editLocName"
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        autoFocus
                                        title="Enter location name"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="action-btn secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="action-btn primary-btn" style={{ backgroundColor: primaryColor }}>Update {currentLevelLabel}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {showBulkModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Bulk Upload {currentLevelLabel}s</h2>
                            <button className="close-btn" onClick={() => setShowBulkModal(false)} title="Close modal"><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="info-banner" style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                <FileText size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                                Format: <strong>Name, Type</strong> (one per line). Type is optional.
                            </div>
                            <div className="form-group">
                                <label htmlFor="bulkData">Paste Data (CSV format)</label>
                                <textarea
                                    id="bulkData"
                                    className="form-input"
                                    rows={10}
                                    placeholder="Location Name 1, PROVINCE&#10;Location Name 2, PROVINCE"
                                    value={bulkData}
                                    onChange={(e) => setBulkData(e.target.value)}
                                    style={{ fontFamily: 'monospace' }}
                                    title="Paste CSV content here (Name, Type)"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="action-btn secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
                            <button
                                type="button"
                                className="action-btn primary-btn"
                                style={{ backgroundColor: primaryColor }}
                                onClick={handleBulkUpload}
                                disabled={!bulkData.trim()}
                            >
                                <Upload size={18} /> Upload Locations
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationsPage;
