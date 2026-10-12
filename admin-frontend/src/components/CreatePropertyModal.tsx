import React, { useState, useEffect } from 'react';
import { X, Upload, Building2, MapPin, Plus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import GPSPicker from './GPSPicker';
import { useSettings } from '../context/SettingsContext';

interface CreatePropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialLandlordId?: string;
}

interface LocationOption {
    id: string;
    name: string;
    type?: string;
    level?: number;
}

const GLOBAL_COUNTRIES = [
    'Zambia',
    'South Africa',
    'Australia',
    'United States',
    'United Kingdom',
    'Kenya',
    'Nigeria',
    'Ghana',
    'Canada',
    'United Arab Emirates',
    'Papua New Guinea',
    'Singapore',
    'New Zealand',
    'Germany',
    'France'
];

const CreatePropertyModal: React.FC<CreatePropertyModalProps> = ({ isOpen, onClose, onSuccess, initialLandlordId }) => {
    const { settings } = useSettings();
    const primaryColor = settings?.config?.branding?.primaryColor || '#4f46e5';
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Available locations loaded from server
    const [locations, setLocations] = useState<LocationOption[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<string>('');
    const [showQuickLocationInput, setShowQuickLocationInput] = useState<boolean>(false);
    const [newLocationName, setNewLocationName] = useState<string>('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'COMMERCIAL',
        status: 'AVAILABLE',
        address: '',
        country: settings?.config?.country || 'Zambia',
        province: '',
        district: '',
        latitude: '',
        longitude: '',
        listing_type: 'LEASE',
        sale_price: '',
        description: '',
        yearBuilt: '',
        landArea: '',
        floor_count: '',
        parking_spaces: '',
        images: [] as string[]
    });

    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchLocations();
            setErrorMessage(null);
        }
    }, [isOpen]);

    const fetchLocations = async () => {
        try {
            const targetTenantId = settings?.id || user.tenantId || '';
            const res = await fetch(`http://localhost:4000/api/locations?tenantId=${targetTenantId}`);
            const data = await res.json();
            const locList = Array.isArray(data) ? data : (data.data || []);
            setLocations(locList);
            if (locList.length > 0 && !selectedLocationId) {
                setSelectedLocationId(locList[0].id);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const handleQuickAddLocation = async () => {
        if (!newLocationName.trim()) return;
        try {
            const res = await fetch('http://localhost:4000/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newLocationName.trim(),
                    type: 'DISTRICT',
                    level: 2,
                    tenantId: user.tenantId
                })
            });
            const created = await res.json();
            if (created && created.id) {
                setLocations(prev => [...prev, created]);
                setSelectedLocationId(created.id);
                setNewLocationName('');
                setShowQuickLocationInput(false);
            }
        } catch (err) {
            console.error('Error adding location:', err);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploading(true);
        try {
            const res = await fetch('http://localhost:4000/api/upload/file', {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();
            if (data.url) {
                setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!formData.name.trim()) {
            setErrorMessage('Property name is required.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                tenantId: user.tenantId,
                locationId: selectedLocationId || null,
                landlordId: initialLandlordId || null,
                region: formData.country,
                province: formData.province,
                district: formData.district,
                sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null
            };

            const res = await fetch('http://localhost:4000/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                onSuccess();
                onClose();
                // Reset form
                setFormData({
                    name: '',
                    type: 'COMMERCIAL',
                    status: 'AVAILABLE',
                    address: '',
                    country: settings?.config?.country || 'United States',
                    province: '',
                    district: '',
                    latitude: '',
                    longitude: '',
                    listing_type: 'LEASE',
                    sale_price: '',
                    description: '',
                    yearBuilt: '',
                    landArea: '',
                    floor_count: '',
                    parking_spaces: '',
                    images: []
                });
            } else {
                setErrorMessage(data.message || 'Failed to create property. Please try again.');
            }
        } catch (error: any) {
            console.error('Error creating property:', error);
            setErrorMessage(error.message || 'Network error creating property');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
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
            backdropFilter: 'blur(6px)',
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '2rem',
                maxWidth: '850px',
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
                boxSizing: 'border-box'
            }}>
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#eef2ff',
                            color: '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Building2 size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                Register New Property Asset
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                                Add single or multi-location real estate assets to your portfolio
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f1f5f9',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: '#64748b',
                            borderRadius: '8px'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#991b1b',
                        fontSize: '0.9rem'
                    }}>
                        <AlertCircle size={18} />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={handleCreateProperty} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Basic Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                                Property Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Skyline Executive Plaza, Tower A"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.925rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                                Property Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.925rem',
                                    boxSizing: 'border-box',
                                    background: 'white'
                                }}
                            >
                                <option value="COMMERCIAL">Commercial Office / Retail</option>
                                <option value="RESIDENTIAL">Residential Apartments / Villas</option>
                                <option value="INDUSTRIAL">Industrial Warehousing</option>
                                <option value="LAND">Development Land</option>
                                <option value="MIXED_USE">Mixed-Use Commercial & Res.</option>
                            </select>
                        </div>
                    </div>

                    {/* Status & Listing */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                                Operational Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.925rem',
                                    boxSizing: 'border-box',
                                    background: 'white'
                                }}
                            >
                                <option value="AVAILABLE">Available for Lease</option>
                                <option value="LEASED">Currently Leased</option>
                                <option value="MAINTENANCE">Under Maintenance</option>
                                <option value="SOLD">Sold</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                                Listing Purpose
                            </label>
                            <select
                                value={formData.listing_type}
                                onChange={(e) => setFormData({ ...formData, listing_type: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.925rem',
                                    boxSizing: 'border-box',
                                    background: 'white'
                                }}
                            >
                                <option value="LEASE">For Lease / Rental</option>
                                <option value="SALE">For Sale</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                                Valuation / Price ({settings?.config?.locale?.currency || 'USD'})
                            </label>
                            <input
                                type="number"
                                value={formData.sale_price}
                                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                                placeholder="e.g. 250000"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.925rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    {/* Multi-Country Location Section */}
                    <div style={{
                        background: '#f8fafc',
                        padding: '1.25rem',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>
                                <MapPin size={16} color="#4f46e5" />
                                Multi-Country Location Hierarchy
                            </div>
                            {!showQuickLocationInput ? (
                                <button
                                    type="button"
                                    onClick={() => setShowQuickLocationInput(true)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#4f46e5',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Plus size={14} /> Add New Location Node
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowQuickLocationInput(false)}
                                    style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        {showQuickLocationInput && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Enter new District, City, or Metro Area name..."
                                    value={newLocationName}
                                    onChange={(e) => setNewLocationName(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '0.6rem 0.85rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.85rem'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleQuickAddLocation}
                                    style={{
                                        background: '#4f46e5',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.6rem 1rem',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Save Location
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                                    Assign to Location Hierarchy:
                                </label>
                                <select
                                    value={selectedLocationId}
                                    onChange={(e) => setSelectedLocationId(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.875rem',
                                        background: 'white',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>
                                            📍 {loc.name} {loc.type ? `(${loc.type})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                                    Country:
                                </label>
                                <select
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.875rem',
                                        background: 'white',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    {GLOBAL_COUNTRIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                                    State / Province / Region:
                                </label>
                                <input
                                    type="text"
                                    value={formData.province}
                                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                    placeholder="e.g. New York, California, Greater London"
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.875rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                                    City / District:
                                </label>
                                <input
                                    type="text"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    placeholder="e.g. Manhattan, Westminster, Sydney CBD"
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.875rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                                Street Address:
                            </label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Full physical street address, suite, or building number..."
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.875rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    {/* GPS Coordinates Picker */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                            📍 GPS Map Coordinates
                        </label>
                        <GPSPicker
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onLocationChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                            primaryColor={primaryColor}
                        />
                    </div>

                    {/* Building Specifications */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                                Floor Count
                            </label>
                            <input
                                type="number"
                                value={formData.floor_count}
                                onChange={(e) => setFormData({ ...formData, floor_count: e.target.value })}
                                placeholder="e.g. 5"
                                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                                Parking Spaces
                            </label>
                            <input
                                type="number"
                                value={formData.parking_spaces}
                                onChange={(e) => setFormData({ ...formData, parking_spaces: e.target.value })}
                                placeholder="e.g. 20"
                                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                                Land Area (sqm)
                            </label>
                            <input
                                type="number"
                                value={formData.landArea}
                                onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                                placeholder="e.g. 1200"
                                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                                Year Built
                            </label>
                            <input
                                type="number"
                                value={formData.yearBuilt}
                                onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                                placeholder="e.g. 2022"
                                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                            Property Description & Features
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Key features, amenities, accessibility, security, backup power..."
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.875rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                            Property Gallery Images
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {formData.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt="Property"
                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                            ))}
                            <label style={{
                                width: '80px',
                                height: '80px',
                                border: '2px dashed #cbd5e1',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                backgroundColor: '#f8fafc'
                            }}>
                                <Upload size={20} color="#94a3b8" />
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                            </label>
                        </div>
                        {uploading && <p style={{ fontSize: '0.8rem', color: '#4f46e5', margin: '4px 0 0 0' }}>Uploading image...</p>}
                    </div>

                    {/* Modal Footer Actions */}
                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.85rem',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: 'white',
                                color: '#475569',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                flex: 2,
                                padding: '0.85rem',
                                borderRadius: '10px',
                                border: 'none',
                                background: submitting ? '#94a3b8' : primaryColor,
                                color: 'white',
                                fontWeight: '700',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                            }}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating Property...
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    Save & Create Property
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePropertyModal;
