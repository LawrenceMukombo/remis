import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, X, Plus, Trash2, Building, MapPin, DollarSign, Calendar } from 'lucide-react';
import GPSPicker from '../components/GPSPicker';
import LocationHierarchy from '../components/LocationHierarchy';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useSettings } from '../context/SettingsContext';
import './PropertyDetailPage.css';

interface Property {
    id: string;
    name: string;
    type: string;
    status: string;
    address?: string;
    images: string[];
    latitude?: number;
    longitude?: number;
    listing_type: string;
    sale_price?: number;
    description?: string;
    yearBuilt?: number;
    landArea?: number;
    floor_count?: number;
    parking_spaces?: number;
    region?: string;
    province?: string;
    district?: string;
    llg?: string;
    regionName?: string;
    provinceName?: string;
    districtName?: string;
    llgName?: string;
    location: {
        id: string;
        name: string;
    };
    units?: Unit[];
    valuations?: Valuation[];
    tags?: Array<{ tag: string; color?: string }>;
    features?: Array<{ feature: string; description?: string }>;
}

interface Unit {
    id: string;
    name: string;
    type?: string;
    floorNumber?: number;
    size?: number;
    bedrooms?: number;
    bathrooms?: number;
    rent?: number;
    status: string;
    images?: string[];
}

interface Valuation {
    id: string;
    valuationDate: string;
    amount: number;
    valuationType: string;
    valuedBy?: string;
    notes?: string;
}

const PropertyDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { settings } = useSettings();
    const primaryColor = settings?.config.branding.primaryColor || '#667eea';
    const { toasts, showToast, removeToast } = useToast();

    const [property, setProperty] = useState<Property | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'units' | 'images' | 'valuations'>('info');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<string | null>(null);
    const [isUnitEditMode, setIsUnitEditMode] = useState(false);

    const [formData, setFormData] = useState<Partial<Property>>({});

    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedLLG, setSelectedLLG] = useState('');
    const [selectedCompound, setSelectedCompound] = useState('');

    const [newUnit, setNewUnit] = useState({
        name: '',
        type: 'RESIDENTIAL',
        floorNumber: '',
        size: '',
        bedrooms: '',
        bathrooms: '',
        rent: '',
        status: 'VACANT',
        images: [] as string[]
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [valuations, setValuations] = useState<Valuation[]>([]);
    const [showValuationModal, setShowValuationModal] = useState(false);
    const [newValuation, setNewValuation] = useState({
        valuationDate: new Date().toISOString().split('T')[0],
        amount: '',
        valuationType: 'MARKET',
        valuedBy: '',
        notes: ''
    });

    useEffect(() => {
        fetchProperty();
        fetchValuations();
    }, [id]);

    useEffect(() => {
        if (property && isEditing) {
            setSelectedRegion(property.region || '');
            setSelectedProvince(property.province || '');
            setSelectedDistrict(property.district || '');
            setSelectedLLG(property.llg || '');
        }
    }, [isEditing, property]);

    const fetchProperty = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/properties/${id}`);
            const data = await res.json();
            setProperty(data);
            setFormData(data);
        } catch (error) {
            console.error('Error fetching property:', error);
            showToast('Failed to load property details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchValuations = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/valuations?propertyId=${id}`);
            if (res.ok) {
                const data = await res.json();
                setValuations(data.valuations || []);
            }
        } catch (error) {
            console.error('Error fetching valuations:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/properties/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    region: selectedRegion || null,
                    province: selectedProvince || null,
                    district: selectedDistrict || null,
                    llg: selectedLLG || null
                })
            });

            if (res.ok) {
                await fetchProperty();
                setIsEditing(false);
                showToast('Property updated successfully!', 'success');
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error('Error updating property:', error);
            showToast('Failed to update property', 'error');
        }
    };

    const handleCreateUnit = async () => {
        if (!newUnit.name.trim()) {
            showToast('Please enter a unit name', 'error');
            return;
        }

        try {
            const res = await fetch('http://localhost:4000/api/units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newUnit,
                    propertyId: id,
                    tenantId: user.tenantId
                })
            });

            if (res.ok) {
                await fetchProperty();
                setShowUnitModal(false);
                setNewUnit({
                    name: '',
                    type: 'RESIDENTIAL',
                    floorNumber: '',
                    size: '',
                    bedrooms: '',
                    bathrooms: '',
                    rent: '',
                    status: 'VACANT',
                    images: [] as string[]
                });
                showToast('Unit added successfully!', 'success');
            } else {
                throw new Error('Failed to create unit');
            }
        } catch (error) {
            console.error('Error creating unit:', error);
            showToast('Failed to add unit', 'error');
        }
    };

    const handleEditUnit = (unit: Unit) => {
        setNewUnit({
            name: unit.name,
            type: unit.type || 'RESIDENTIAL',
            floorNumber: unit.floorNumber?.toString() || '',
            size: unit.size?.toString() || '',
            bedrooms: unit.bedrooms?.toString() || '',
            bathrooms: unit.bathrooms?.toString() || '',
            rent: unit.rent?.toString() || '',
            status: unit.status,
            images: (unit as any).images || []
        });
        setEditingUnit(unit.id);
        setIsUnitEditMode(true);
        setShowUnitModal(true);
    };

    const handleUpdateUnit = async () => {
        if (!newUnit.name.trim()) {
            showToast('Please enter a unit name', 'error');
            return;
        }

        try {
            const res = await fetch(`http://localhost:4000/api/units/${editingUnit}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newUnit,
                    propertyId: id,
                    tenantId: user.tenantId
                })
            });

            if (res.ok) {
                await fetchProperty();
                setShowUnitModal(false);
                setIsUnitEditMode(false);
                setEditingUnit(null);
                setNewUnit({
                    name: '',
                    type: 'RESIDENTIAL',
                    floorNumber: '',
                    size: '',
                    bedrooms: '',
                    bathrooms: '',
                    rent: '',
                    status: 'VACANT',
                    images: [] as string[]
                });
                showToast('Unit updated successfully!', 'success');
            } else {
                throw new Error('Failed to update unit');
            }
        } catch (error) {
            console.error('Error updating unit:', error);
            showToast('Failed to update unit', 'error');
        }
    };

    const handleDeleteUnit = async (unitId: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this unit? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:4000/api/units/${unitId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchProperty();
                showToast('Unit deleted successfully!', 'success');
            } else {
                throw new Error('Failed to delete unit');
            }
        } catch (error) {
            console.error('Error deleting unit:', error);
            showToast('Failed to delete unit', 'error');
        }
    };

    const handleImageUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;

        try {
            const imagePromises = files.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            const base64Images = await Promise.all(imagePromises);
            const currentImages = property?.images || [];
            const newImages = [...currentImages, ...base64Images];

            const res = await fetch(`http://localhost:4000/api/properties/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: newImages })
            });

            if (res.ok) {
                await fetchProperty();
                showToast(`${files.length} image(s) uploaded successfully!`, 'success');
            } else {
                throw new Error('Failed to upload images');
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            showToast('Failed to upload images', 'error');
        }
    };

    const handleDeleteImage = async (index: number) => {
        if (!property) return;

        const confirmDelete = window.confirm('Are you sure you want to delete this image?');
        if (!confirmDelete) return;

        try {
            const newImages = property.images.filter((_, i) => i !== index);

            const res = await fetch(`http://localhost:4000/api/properties/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: newImages })
            });

            if (res.ok) {
                await fetchProperty();
                showToast('Image deleted successfully!', 'success');
            } else {
                throw new Error('Failed to delete image');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            showToast('Failed to delete image', 'error');
        }
    };

    const handleUnitImageUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;

        try {
            const imagePromises = files.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            const base64Images = await Promise.all(imagePromises);
            const currentImages = newUnit.images || [];
            const updatedImages = [...currentImages, ...base64Images];

            setNewUnit({ ...newUnit, images: updatedImages });
            showToast(`${files.length} image(s) added!`, 'success');
        } catch (error) {
            console.error('Error uploading images:', error);
            showToast('Failed to upload images', 'error');
        }
    };

    const handleCreateValuation = async () => {
        if (!newValuation.amount || !newValuation.valuationDate) {
            showToast('Please enter amount and date', 'error');
            return;
        }

        try {
            const res = await fetch('http://localhost:4000/api/valuations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newValuation,
                    propertyId: id,
                    tenantId: user.tenantId
                })
            });

            if (res.ok) {
                await fetchValuations();
                setShowValuationModal(false);
                setNewValuation({
                    valuationDate: new Date().toISOString().split('T')[0],
                    amount: '',
                    valuationType: 'MARKET',
                    valuedBy: '',
                    notes: ''
                });
                showToast('Valuation recorded successfully!', 'success');
            } else {
                throw new Error('Failed to create valuation');
            }
        } catch (error) {
            console.error('Error creating valuation:', error);
            showToast('Failed to record valuation', 'error');
        }
    };

    const handleDeleteValuation = async (valuationId: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this valuation record?');
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:4000/api/valuations/${valuationId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchValuations();
                showToast('Valuation deleted successfully!', 'success');
            } else {
                throw new Error('Failed to delete valuation');
            }
        } catch (error) {
            console.error('Error deleting valuation:', error);
            showToast('Failed to delete valuation', 'error');
        }
    };

    if (loading) {
        return (
            <div className="loading-container" aria-live="polite">
                <div className="loading-content">
                    <div className="loading-text">Loading property...</div>
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="not-found-container">
                Property not found
            </div>
        );
    }

    return (
        <>
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}

            <div className="property-detail-container" style={{ '--primary-color': primaryColor } as React.CSSProperties}>
                <div className="detail-header">
                    <button
                        onClick={() => navigate('/properties')}
                        className="back-btn"
                        title="Return to properties list"
                    >
                        <ArrowLeft size={16} />
                        Back to Properties
                    </button>

                    <div className="header-main">
                        <div className="header-title">
                            <h1>{property.name}</h1>
                            <div className="header-meta">
                                <span>{property.type}</span>
                                <span>•</span>
                                <span className={`status-badge ${property.status === 'AVAILABLE' ? 'available' : ''}`}>
                                    {property.status}
                                </span>
                                {property.latitude && property.longitude && (
                                    <>
                                        <span>•</span>
                                        <span className="gps-badge-meta" title="GPS Coordinates available">
                                            <MapPin size={14} style={{ color: '#ef4444' }} />
                                            GPS Tracked
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="edit-btn primary-btn"
                                title="Edit this property"
                            >
                                <Edit size={16} />
                                Edit Property
                            </button>
                        ) : (
                            <div className="action-buttons">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData(property);
                                    }}
                                    className="cancel-btn"
                                    title="Discard changes"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="save-btn primary-btn"
                                    title="Save changes to property"
                                >
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="tabs-card">
                    <div className="tabs-nav">
                        {[
                            { id: 'info', label: 'Property Info', icon: Building },
                            { id: 'units', label: 'Units & Rooms', icon: Building, badge: property.units?.length || 0 },
                            { id: 'images', label: 'Images', icon: Building },
                            { id: 'valuations', label: 'Valuations', icon: DollarSign, badge: valuations.length }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`tab-nav-btn ${isActive ? 'active' : ''}`}
                                    title={`Switch to ${tab.label} tab`}
                                    aria-pressed={isActive ? "true" : "false"}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                    {tab.badge !== undefined && (
                                        <span className="tab-badge" style={{
                                            backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : `${primaryColor}20`,
                                            color: isActive ? 'white' : primaryColor
                                        }}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="tab-content">
                        {activeTab === 'info' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div className="info-grid">
                                    <div className="info-field">
                                        <label className="field-label" htmlFor="prop-name">Property Name</label>
                                        {isEditing ? (
                                            <input
                                                id="prop-name"
                                                type="text"
                                                value={formData.name || ''}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="edit-input"
                                            />
                                        ) : (
                                            <div className="field-value">{property.name}</div>
                                        )}
                                    </div>

                                    <div className="info-field">
                                        <label className="field-label" htmlFor="prop-type">Type</label>
                                        {isEditing ? (
                                            <select
                                                id="prop-type"
                                                value={formData.type || ''}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="edit-select"
                                            >
                                                <option value="RESIDENTIAL">Residential</option>
                                                <option value="COMMERCIAL">Commercial</option>
                                                <option value="INDUSTRIAL">Industrial</option>
                                                <option value="LAND">Land</option>
                                            </select>
                                        ) : (
                                            <div className="field-value">{property.type}</div>
                                        )}
                                    </div>

                                    <div className="info-field">
                                        <label className="field-label" htmlFor="prop-status">Status</label>
                                        {isEditing ? (
                                            <select
                                                id="prop-status"
                                                value={formData.status || ''}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="edit-select"
                                            >
                                                <option value="AVAILABLE">Available</option>
                                                <option value="LEASED">Leased</option>
                                                <option value="MAINTENANCE">Maintenance</option>
                                                <option value="SOLD">Sold</option>
                                            </select>
                                        ) : (
                                            <div className="field-value">{property.status}</div>
                                        )}
                                    </div>
                                </div>

                                {!isEditing && (
                                    <div className="info-grid">
                                        <div className="info-field">
                                            <label className="field-label">Region</label>
                                            <div className="field-value">{property.regionName || property.region || 'N/A'}</div>
                                        </div>
                                        <div className="info-field">
                                            <label className="field-label">Province</label>
                                            <div className="field-value">{property.provinceName || property.province || 'N/A'}</div>
                                        </div>
                                        <div className="info-field">
                                            <label className="field-label">District</label>
                                            <div className="field-value">{property.districtName || property.district || 'N/A'}</div>
                                        </div>
                                        <div className="info-field">
                                            <label className="field-label">LLG</label>
                                            <div className="field-value">{property.llgName || property.llg || 'N/A'}</div>
                                        </div>
                                    </div>
                                )}

                                {!isEditing && property.latitude && property.longitude && (
                                    <div className="info-field">
                                        <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <MapPin size={16} /> Location Pin
                                        </label>
                                        <div style={{ marginTop: '0.5rem', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            <GPSPicker
                                                latitude={String(property.latitude)}
                                                longitude={String(property.longitude)}
                                                readOnly={true}
                                                primaryColor={primaryColor}
                                            />
                                        </div>
                                    </div>
                                )}


                                <div className="info-field">
                                    <label className="field-label" htmlFor="prop-address">Address</label>
                                    {isEditing ? (
                                        <input
                                            id="prop-address"
                                            type="text"
                                            value={formData.address || ''}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="edit-input"
                                        />
                                    ) : (
                                        <div className="field-value">{property.address || 'N/A'}</div>
                                    )}
                                </div>

                                {isEditing && (
                                    <div>
                                        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.75rem' }}>📍 Location Details</h3>
                                        <LocationHierarchy
                                            selectedRegion={selectedRegion}
                                            selectedProvince={selectedProvince}
                                            selectedDistrict={selectedDistrict}
                                            selectedLLG={selectedLLG}
                                            selectedCompound={selectedCompound}
                                            onRegionChange={setSelectedRegion}
                                            onProvinceChange={setSelectedProvince}
                                            onDistrictChange={setSelectedDistrict}
                                            onLLGChange={setSelectedLLG}
                                            onCompoundChange={setSelectedCompound}
                                            primaryColor={primaryColor}
                                        />
                                    </div>
                                )}

                                <div className="info-field">
                                    <label className="field-label" htmlFor="prop-desc">Description</label>
                                    {isEditing ? (
                                        <textarea
                                            id="prop-desc"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="edit-textarea"
                                        />
                                    ) : (
                                        <div className="field-value description-text">
                                            {property.description || 'No description provided'}
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="info-field">
                                        <label className="field-label">📍 GPS Location</label>
                                        <GPSPicker
                                            latitude={String(formData.latitude || '')}
                                            longitude={String(formData.longitude || '')}
                                            onLocationChange={(lat, lng) =>
                                                setFormData({ ...formData, latitude: parseFloat(lat), longitude: parseFloat(lng) })
                                            }
                                            primaryColor={primaryColor}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'units' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Units & Rooms</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Manage individual units within this property</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsUnitEditMode(false);
                                            setEditingUnit(null);
                                            setShowUnitModal(true);
                                        }}
                                        className="edit-btn primary-btn"
                                        title="Add a new unit to this property"
                                    >
                                        <Plus size={16} />
                                        Add Unit
                                    </button>
                                </div>

                                {property.units && property.units.length > 0 ? (
                                    <div className="units-grid">
                                        {property.units.map((unit) => (
                                            <div
                                                key={unit.id}
                                                className="unit-card"
                                                onClick={() => handleEditUnit(unit)}
                                                style={{ cursor: 'pointer' }}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        handleEditUnit(unit);
                                                    }
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        {/* Unit Image */}
                                                        <div style={{
                                                            width: '80px',
                                                            height: '80px',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            backgroundColor: '#f1f5f9',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            {unit.images && unit.images.length > 0 ? (
                                                                <img src={unit.images[0]} alt={unit.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <Building size={24} color="#cbd5e1" />
                                                            )}
                                                        </div>

                                                        <div style={{ flex: 1 }}>
                                                            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>{unit.name}</h4>
                                                            <span style={{
                                                                padding: '3px 10px',
                                                                borderRadius: '10px',
                                                                fontSize: '0.6875rem',
                                                                fontWeight: '700',
                                                                backgroundColor: unit.status === 'VACANT' ? '#10b98120' : '#ef444420',
                                                                color: unit.status === 'VACANT' ? '#10b981' : '#ef4444',
                                                                display: 'inline-block',
                                                                marginTop: '0.375rem'
                                                            }}>
                                                                {unit.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditUnit(unit);
                                                            }}
                                                            className="tab-nav-btn"
                                                            style={{ padding: '0.375rem' }}
                                                            title="Edit unit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteUnit(unit.id);
                                                            }}
                                                            className="tab-nav-btn"
                                                            style={{ padding: '0.375rem' }}
                                                            title="Delete unit"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.8125rem' }}>
                                                    {unit.floorNumber && (
                                                        <div><span style={{ color: '#94a3b8' }}>Floor:</span> <span style={{ fontWeight: '600' }}>{unit.floorNumber}</span></div>
                                                    )}
                                                    {unit.size && (
                                                        <div><span style={{ color: '#94a3b8' }}>Size:</span> <span style={{ fontWeight: '600' }}>{unit.size} m²</span></div>
                                                    )}
                                                    {unit.bedrooms && (
                                                        <div><span style={{ color: '#94a3b8' }}>Beds:</span> <span style={{ fontWeight: '600' }}>{unit.bedrooms}</span></div>
                                                    )}
                                                    {unit.bathrooms && (
                                                        <div><span style={{ color: '#94a3b8' }}>Baths:</span> <span style={{ fontWeight: '600' }}>{unit.bathrooms}</span></div>
                                                    )}
                                                    {unit.rent && (
                                                        <div style={{ gridColumn: '1 / -1', marginTop: '0.375rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                                                            <span style={{ color: '#94a3b8' }}>Rent:</span> <span style={{ color: primaryColor, fontWeight: '700', fontSize: '1rem' }}>K{unit.rent}/mo</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                        <Building size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                                        <p style={{ fontSize: '0.9375rem', fontWeight: '500' }}>No units added yet</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'images' && (
                            <div>
                                <label
                                    className="upload-label"
                                    style={{
                                        display: 'block',
                                        border: `2px dashed var(--primary-color, #667eea)30`,
                                        borderRadius: '12px',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        marginBottom: '2rem',
                                        backgroundColor: 'color-mix(in srgb, var(--primary-color, #667eea) 5%, transparent)',
                                        cursor: 'pointer'
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const files = Array.from(e.dataTransfer.files);
                                        handleImageUpload(files);
                                    }}
                                    aria-label="Upload images"
                                    tabIndex={0}
                                >
                                    <div style={{ color: primaryColor, marginBottom: '0.75rem' }}>
                                        <Plus size={48} style={{ margin: '0 auto' }} />
                                    </div>
                                    <p style={{ fontWeight: '600' }}>Drag and drop images here or click to browse</p>
                                    <input
                                        id="imageInput"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            handleImageUpload(files);
                                            e.target.value = '';
                                        }}
                                    />
                                </label>

                                {property?.images && property.images.length > 0 ? (
                                    <div className="images-grid">
                                        {property.images.map((image, index) => (
                                            <div key={index} className="image-item" onClick={() => setSelectedImage(image)}>
                                                <img src={image} alt={`Property view ${index + 1}`} />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteImage(index);
                                                    }}
                                                    className="delete-image-btn"
                                                    title="Delete this image"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ textAlign: 'center', color: '#94a3b8' }}>No images uploaded yet.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'valuations' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Valuation History</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Track property value changes over time</p>
                                    </div>
                                    <button
                                        onClick={() => setShowValuationModal(true)}
                                        className="edit-btn"
                                        style={{ backgroundColor: primaryColor, boxShadow: `0 2px 8px ${primaryColor}40` }}
                                        title="Record a new valuation"
                                    >
                                        <Plus size={16} />
                                        Record Valuation
                                    </button>
                                </div>

                                {valuations.length > 0 ? (
                                    <table className="valuation-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Valued By</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {valuations.map((val) => (
                                                <tr key={val.id}>
                                                    <td>{new Date(val.valuationDate).toLocaleDateString()}</td>
                                                    <td>
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            borderRadius: '10px',
                                                            fontSize: '0.75rem',
                                                            backgroundColor: `${primaryColor}15`,
                                                            color: primaryColor,
                                                            fontWeight: '600'
                                                        }}>
                                                            {val.valuationType}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: '700' }}>K{val.amount.toLocaleString()}</td>
                                                    <td>{val.valuedBy || 'N/A'}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleDeleteValuation(val.id)}
                                                            className="tab-nav-btn"
                                                            style={{ color: '#ef4444' }}
                                                            title="Delete valuation record"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No valuations recorded yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {showUnitModal && (
                    <div className="modal-overlay" onClick={() => setShowUnitModal(false)} role="dialog" aria-modal="true" aria-labelledby="unit-modal-title">
                        <div className="modal-container" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 id="unit-modal-title" style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                                    {isUnitEditMode ? 'Edit Unit' : 'Add New Unit'}
                                </h2>
                                <button
                                    onClick={() => setShowUnitModal(false)}
                                    className="tab-nav-btn"
                                    title="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="info-field">
                                    <label className="field-label" htmlFor="unit-name">Unit Name *</label>
                                    <input
                                        id="unit-name"
                                        type="text"
                                        value={newUnit.name}
                                        onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                                        className="edit-input"
                                        placeholder="e.g. Unit 101"
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="info-field">
                                        <label className="field-label" htmlFor="unit-floor">Floor</label>
                                        <input
                                            id="unit-floor"
                                            type="number"
                                            value={newUnit.floorNumber}
                                            onChange={(e) => setNewUnit({ ...newUnit, floorNumber: e.target.value })}
                                            className="edit-input"
                                        />
                                    </div>
                                    <div className="info-field">
                                        <label className="field-label" htmlFor="unit-size">Size (m²)</label>
                                        <input
                                            id="unit-size"
                                            type="number"
                                            value={newUnit.size}
                                            onChange={(e) => setNewUnit({ ...newUnit, size: e.target.value })}
                                            className="edit-input"
                                        />
                                    </div>
                                </div>
                                <div className="info-field">
                                    <label className="field-label" htmlFor="unit-rent">Monthly Rent (K)</label>
                                    <input
                                        id="unit-rent"
                                        type="number"
                                        value={newUnit.rent}
                                        onChange={(e) => setNewUnit({ ...newUnit, rent: e.target.value })}
                                        className="edit-input"
                                    />
                                </div>
                                <div className="info-field">
                                    <label className="field-label" htmlFor="unit-status">Status</label>
                                    <select
                                        id="unit-status"
                                        value={newUnit.status}
                                        onChange={(e) => setNewUnit({ ...newUnit, status: e.target.value })}
                                        className="edit-select"
                                    >
                                        <option value="VACANT">Vacant</option>
                                        <option value="OCCUPIED">Occupied</option>
                                        <option value="RESERVED">Reserved</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                    </select>
                                </div>
                                <div className="info-field">
                                    <label className="field-label">Unit Photos</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {newUnit.images && newUnit.images.map((img, idx) => (
                                            <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                                <img src={img} alt="Unit" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = newUnit.images?.filter((_, i) => i !== idx);
                                                        setNewUnit({ ...newUnit, images: updated });
                                                    }}
                                                    title="Remove image"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-6px',
                                                        right: '-6px',
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        width: '18px',
                                                        height: '18px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '2px solid white',
                                                        cursor: 'pointer',
                                                        fontSize: '10px',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                        <label style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '6px',
                                            border: '1px dashed #cbd5e1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: '#f8fafc'
                                        }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    handleUnitImageUpload(files);
                                                    e.target.value = '';
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                            <Plus size={20} color="#94a3b8" />
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button onClick={() => setShowUnitModal(false)} className="cancel-btn modal-btn" title="Cancel adding unit">Cancel</button>
                                    <button onClick={isUnitEditMode ? handleUpdateUnit : handleCreateUnit} className="save-btn primary-btn modal-btn" title={isUnitEditMode ? 'Update existing unit' : 'Save new unit'}>
                                        {isUnitEditMode ? 'Update Unit' : 'Add Unit'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showValuationModal && (
                    <div className="modal-overlay" onClick={() => setShowValuationModal(false)} role="dialog" aria-modal="true" aria-labelledby="val-modal-title">
                        <div className="modal-container" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 id="val-modal-title" style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Record New Valuation</h2>
                                <button onClick={() => setShowValuationModal(false)} className="tab-nav-btn"><X size={20} /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="info-field">
                                    <label className="field-label" htmlFor="val-amount">Amount (K)</label>
                                    <input
                                        id="val-amount"
                                        type="number"
                                        value={newValuation.amount}
                                        onChange={(e) => setNewValuation({ ...newValuation, amount: e.target.value })}
                                        className="edit-input"
                                    />
                                </div>
                                <div className="info-field">
                                    <label className="field-label" htmlFor="val-date">Date</label>
                                    <input
                                        id="val-date"
                                        type="date"
                                        value={newValuation.valuationDate}
                                        onChange={(e) => setNewValuation({ ...newValuation, valuationDate: e.target.value })}
                                        className="edit-input"
                                    />
                                </div>
                                <div className="info-field">
                                    <label className="field-label" htmlFor="val-type">Type</label>
                                    <select
                                        id="val-type"
                                        value={newValuation.valuationType}
                                        onChange={(e) => setNewValuation({ ...newValuation, valuationType: e.target.value })}
                                        className="edit-select"
                                    >
                                        <option value="MARKET">Market Value</option>
                                        <option value="RENTAL">Rental Appraisal</option>
                                        <option value="INSURANCE">Insurance Value</option>
                                        <option value="FORCED_SALE">Forced Sale Value</option>
                                    </select>
                                </div>
                                <div className="info-field">
                                    <label className="field-label" htmlFor="val-valuer">Valued By</label>
                                    <input
                                        id="val-valuer"
                                        type="text"
                                        value={newValuation.valuedBy}
                                        onChange={(e) => setNewValuation({ ...newValuation, valuedBy: e.target.value })}
                                        className="edit-input"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button onClick={() => setShowValuationModal(false)} className="cancel-btn modal-btn" title="Cancel recording valuation">Cancel</button>
                                    <button onClick={handleCreateValuation} className="save-btn primary-btn modal-btn" title="Save valuation record">Record Valuation</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedImage && (
                    <div className="modal-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }} onClick={() => setSelectedImage(null)}>
                        <img src={selectedImage} alt="Full preview" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px' }} />
                        <button onClick={() => setSelectedImage(null)} className="tab-nav-btn" style={{ position: 'absolute', top: '2rem', right: '2rem', backgroundColor: 'white' }}>
                            <X size={24} />
                        </button>
                    </div>
                )}
            </div >
        </>
    );
};

export default PropertyDetailPage;
