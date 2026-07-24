
import React, { useState, useEffect } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import LocationHierarchy from './LocationHierarchy';
import GPSPicker from './GPSPicker';
import { useSettings } from '../context/SettingsContext';

interface CreatePropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialLandlordId?: string;
}

const CreatePropertyModal: React.FC<CreatePropertyModalProps> = ({ isOpen, onClose, onSuccess, initialLandlordId }) => {
    const { settings } = useSettings();
    const primaryColor = settings?.config.branding.primaryColor || '#667eea';
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'RESIDENTIAL',
        status: 'AVAILABLE',
        address: '',
        latitude: '',
        longitude: '',
        listing_type: 'LEASE',
        description: '',
        yearBuilt: '',
        landArea: '',
        floor_count: '',
        parking_spaces: '',
        images: [] as string[]
    });

    // Location hierarchy states
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedLLG, setSelectedLLG] = useState('');
    const [selectedCompound, setSelectedCompound] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/upload/file`, {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();
            if (data.url) {
                setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateProperty = async () => {
        try {
            // Use the selected compound as the locationId, or fallback to first location if not selected
            // Ideally, we should enforce selection or have a better fallback logic based on requirements
            // For now, mirroring original logic with a safeguard fetch if needed, 
            // but effectively we just send what we have. 
            // NOTE: Original logic fetched locations if ID wasn't set. 
            // We'll rely on the user making a selection or handling nulls gracefully on backend if permissible,
            // or performing the fetch here if strictly required. 
            // Given the complexity, copying the fetch logic is safer.

            let locationId = selectedCompound;

            if (!locationId) {
                const locationsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/locations?tenantId=${user.tenantId}`);
                const locationsData = await locationsRes.json();
                locationId = locationsData[0]?.id || user.tenantId;
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/properties`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tenantId: user.tenantId,
                    locationId,
                    landlordId: initialLandlordId || null,
                    region: selectedRegion || null,
                    province: selectedProvince || null,
                    district: selectedDistrict || null,
                    llg: selectedLLG || null,
                    images: formData.images
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
                // Reset form
                setFormData({
                    name: '',
                    type: 'RESIDENTIAL',
                    status: 'AVAILABLE',
                    address: '',
                    latitude: '',
                    longitude: '',
                    listing_type: 'LEASE',
                    description: '',
                    yearBuilt: '',
                    landArea: '',
                    floor_count: '',
                    parking_spaces: '',
                    images: []
                });
                // Reset location hierarchy
                setSelectedRegion('');
                setSelectedProvince('');
                setSelectedDistrict('');
                setSelectedLLG('');
                setSelectedCompound('');
            }
        } catch (error) {
            console.error('Error creating property:', error);
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
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '2rem',
                maxWidth: '850px',
                width: '95%',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 25px 70px rgba(0,0,0,0.4)',
                position: 'relative',
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Add New Property</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: '#64748b',
                            borderRadius: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                            e.currentTarget.style.color = '#0f172a';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#64748b';
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
                            Property Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Harbor View Apartments"
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.9375rem',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = primaryColor}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
                                Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.9375rem',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="RESIDENTIAL">Residential</option>
                                <option value="COMMERCIAL">Commercial</option>
                                <option value="INDUSTRIAL">Industrial</option>
                                <option value="LAND">Land</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
                                Status *
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.9375rem',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="LEASED">Leased</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="SOLD">Sold</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
                            Address
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Street address, suburb, etc."
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.9375rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Location Hierarchy */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '1rem' }}>📍 Location Details</h3>
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

                    {/* GPS Picker Component */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: '700', color: '#0f172a' }}>
                            📍 GPS Location
                        </label>
                        <GPSPicker
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onLocationChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                            primaryColor={primaryColor}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Property details and highlights..."
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.9375rem',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>
                            Property Images
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {formData.images.map((img, idx) => (
                                <img key={idx} src={img} alt="Property" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            ))}
                            <label style={{
                                width: '80px', height: '80px', border: '2px dashed #cbd5e1', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f8fafc'
                            }}>
                                <Upload size={24} color="#94a3b8" />
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                            </label>
                        </div>
                        {uploading && <p style={{ fontSize: '0.8rem', marginTop: '5px', color: primaryColor }}>Uploading...</p>}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: 'white',
                                color: '#64748b',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateProperty}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: `linear-gradient(135deg, ${primaryColor} 0%, #764ba2 100%)`, // Using primaryColor but keeping gradient flair
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Create Property
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePropertyModal;
