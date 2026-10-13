import React, { useState, useEffect } from 'react';
import { X, Upload, Building2, MapPin, Plus, CheckCircle, AlertCircle, Loader2, Trash2, Star, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import GPSPicker from './GPSPicker';
import { useSettings } from '../context/SettingsContext';

interface CreatePropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialLandlordId?: string;
    propertyToEdit?: any | null;
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

const CreatePropertyModal: React.FC<CreatePropertyModalProps> = ({ isOpen, onClose, onSuccess, initialLandlordId, propertyToEdit }) => {
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
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchLocations();
            setErrorMessage(null);

            if (propertyToEdit) {
                setFormData({
                    name: propertyToEdit.name || '',
                    type: propertyToEdit.type || 'COMMERCIAL',
                    status: propertyToEdit.status || 'AVAILABLE',
                    address: propertyToEdit.address || '',
                    country: propertyToEdit.region || settings?.config?.country || 'Zambia',
                    province: propertyToEdit.province || '',
                    district: propertyToEdit.district || '',
                    latitude: propertyToEdit.latitude !== undefined && propertyToEdit.latitude !== null ? String(propertyToEdit.latitude) : '',
                    longitude: propertyToEdit.longitude !== undefined && propertyToEdit.longitude !== null ? String(propertyToEdit.longitude) : '',
                    listing_type: propertyToEdit.listing_type || 'LEASE',
                    sale_price: propertyToEdit.sale_price !== undefined && propertyToEdit.sale_price !== null ? String(propertyToEdit.sale_price) : '',
                    description: propertyToEdit.description || '',
                    yearBuilt: propertyToEdit.yearBuilt !== undefined && propertyToEdit.yearBuilt !== null ? String(propertyToEdit.yearBuilt) : '',
                    landArea: propertyToEdit.landArea !== undefined && propertyToEdit.landArea !== null ? String(propertyToEdit.landArea) : '',
                    floor_count: propertyToEdit.floor_count !== undefined && propertyToEdit.floor_count !== null ? String(propertyToEdit.floor_count) : '',
                    parking_spaces: propertyToEdit.parking_spaces !== undefined && propertyToEdit.parking_spaces !== null ? String(propertyToEdit.parking_spaces) : '',
                    images: Array.isArray(propertyToEdit.images) ? propertyToEdit.images : []
                });
                setSelectedLocationId(propertyToEdit.locationId || propertyToEdit.location?.id || '');
            } else {
                setFormData({
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
                    images: []
                });
                setSelectedLocationId('');
            }
        }
    }, [isOpen, propertyToEdit]);

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
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadData = new FormData();
            Array.from(files).forEach(file => {
                uploadData.append('photos', file);
            });

            let newUrls: string[] = [];

            // Attempt batch photo upload
            try {
                const res = await fetch('http://localhost:4000/api/upload/photos', {
                    method: 'POST',
                    body: uploadData
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.urls) && data.urls.length > 0) {
                        newUrls = data.urls;
                    }
                }
            } catch (err) {
                console.warn('Batch photo upload failed, attempting single file fallback:', err);
            }

            // Fallback to single file upload
            if (newUrls.length === 0) {
                for (const file of Array.from(files)) {
                    try {
                        const singleData = new FormData();
                        singleData.append('file', file);
                        const res = await fetch('http://localhost:4000/api/upload/file', {
                            method: 'POST',
                            body: singleData
                        });
                        const data = await res.json();
                        if (data.url) newUrls.push(data.url);
                    } catch (singleErr) {
                        console.error('Single upload failed:', singleErr);
                    }
                }
            }

            if (newUrls.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...newUrls]
                }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleAddImageUrl = () => {
        if (!imageUrlInput.trim()) return;
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, imageUrlInput.trim()]
        }));
        setImageUrlInput('');
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleSetCoverImage = (indexToCover: number) => {
        setFormData(prev => {
            const current = [...prev.images];
            if (indexToCover <= 0 || indexToCover >= current.length) return prev;
            const [selected] = current.splice(indexToCover, 1);
            return {
                ...prev,
                images: [selected, ...current]
            };
        });
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

            const url = propertyToEdit
                ? `http://localhost:4000/api/properties/${propertyToEdit.id}`
                : 'http://localhost:4000/api/properties';
            const method = propertyToEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
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
                    images: []
                });
            } else {
                setErrorMessage(data.message || `Failed to ${propertyToEdit ? 'update' : 'create'} property. Please try again.`);
            }
        } catch (error: any) {
            console.error(`Error ${propertyToEdit ? 'updating' : 'creating'} property:`, error);
            setErrorMessage(error.message || `Network error ${propertyToEdit ? 'updating' : 'creating'} property`);
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
                                {propertyToEdit ? `Edit Property: ${propertyToEdit.name}` : 'Register New Property Asset'}
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                                {propertyToEdit ? 'Update details, pricing, location hierarchy, or media assets' : 'Add single or multi-location real estate assets to your portfolio'}
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

                    {/* Image Upload & Gallery Management */}
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <div>
                                <label style={{ display: 'block', margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>
                                    📸 Property Photo Gallery
                                </label>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {formData.images.length === 0 ? 'No photos uploaded yet.' : `${formData.images.length} photo${formData.images.length === 1 ? '' : 's'} attached. First image is the primary cover.`}
                                </span>
                            </div>
                            {formData.images.length > 0 && (
                                <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
                                    {formData.images.length} Photos
                                </span>
                            )}
                        </div>

                        {/* Image Thumbnails Grid */}
                        {formData.images.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
                                {formData.images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            position: 'relative',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            border: idx === 0 ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
                                            background: '#ffffff',
                                            height: '95px'
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt={`Property photo ${idx + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />

                                        {/* Cover Badge */}
                                        {idx === 0 && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '4px',
                                                left: '4px',
                                                background: '#0284c7',
                                                color: '#ffffff',
                                                fontSize: '0.65rem',
                                                fontWeight: '800',
                                                padding: '2px 5px',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                            }}>
                                                <Star size={10} fill="#ffffff" /> COVER
                                            </span>
                                        )}

                                        {/* Action Overlay */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'linear-gradient(transparent, rgba(15, 23, 42, 0.85))',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '4px 6px'
                                        }}>
                                            {idx !== 0 ? (
                                                <button
                                                    type="button"
                                                    title="Set as cover photo"
                                                    onClick={() => handleSetCoverImage(idx)}
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '3px',
                                                        cursor: 'pointer',
                                                        color: '#0284c7',
                                                        display: 'flex'
                                                    }}
                                                >
                                                    <Star size={12} />
                                                </button>
                                            ) : <div />}

                                            <button
                                                type="button"
                                                title="Delete photo"
                                                onClick={() => handleRemoveImage(idx)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.9)',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '3px',
                                                    cursor: 'pointer',
                                                    color: '#ffffff',
                                                    display: 'flex'
                                                }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Controls & URL Input */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <label style={{
                                padding: '0.85rem 1rem',
                                border: '2px dashed #94a3b8',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                backgroundColor: '#ffffff',
                                color: '#475569',
                                fontSize: '0.825rem',
                                fontWeight: '700',
                                transition: 'all 0.15s'
                            }}>
                                {uploading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" color="#0284c7" />
                                        <span>Uploading Photos...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} color="#0284c7" />
                                        <span>Upload Files (Multi-Select)</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                    disabled={uploading}
                                />
                            </label>

                            <div style={{ display: 'flex', gap: '6px' }}>
                                <input
                                    type="text"
                                    value={imageUrlInput}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                    placeholder="Or paste photo web link..."
                                    style={{
                                        flex: 1,
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.825rem',
                                        boxSizing: 'border-box'
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddImageUrl();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddImageUrl}
                                    style={{
                                        padding: '0 0.85rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#0284c7',
                                        color: '#ffffff',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    + Add URL
                                </button>
                            </div>
                        </div>
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
                                    {propertyToEdit ? 'Saving Changes...' : 'Creating Property...'}
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    {propertyToEdit ? 'Save Changes' : 'Save & Create Property'}
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
