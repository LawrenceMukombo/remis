import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Search, MapPin, Grid, Map as MapIcon, Plus, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreatePropertyModal from '../components/CreatePropertyModal';
import { useSettings } from '../context/SettingsContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './PropertiesPage.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
    location: {
        name: string;
    };
    units?: any[];
    valuations?: any[];
    tags?: Array<{ tag: string; color?: string }>;
}

const PropertiesPage: React.FC = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { settings } = useSettings();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        listing_type: ''
    });
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({
        totalProperties: 0,
        availableProperties: 0,
        leasedProperties: 0,
        propertiesForSale: 0
    });

    const primaryColor = settings?.config.branding.primaryColor || '#667eea';

    useEffect(() => {
        fetchProperties();
        fetchStats();
    }, [filters, searchTerm]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                tenantId: user.tenantId,
                ...(filters.type && { type: filters.type }),
                ...(filters.status && { status: filters.status }),
                ...(filters.listing_type && { listing_type: filters.listing_type }),
                ...(searchTerm && { search: searchTerm })
            });

            const res = await fetch(`http://localhost:4000/api/properties?${params}`);
            const data = await res.json();
            setProperties(data.properties || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/properties/stats?tenantId=${user.tenantId}`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const propertiesWithCoordinates = properties.filter(p => p.latitude && p.longitude);

    return (
        <div className="properties-container" style={{ '--primary-color': primaryColor } as React.CSSProperties}>
            {/* Header */}
            <div className="properties-header">
                <div className="header-title">
                    <h1>Properties</h1>
                    <p>Manage your property portfolio with GPS tracking</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="action-btn-styled primary-btn"
                    title="Add new property"
                >
                    <Plus size={20} />
                    Add Property
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {[
                    { label: 'Total Properties', value: stats.totalProperties, color: '#667eea', icon: Building2 },
                    { label: 'Available', value: stats.availableProperties, color: '#10b981', icon: Building2 },
                    { label: 'Leased', value: stats.leasedProperties, color: '#3b82f6', icon: Building2 },
                    { label: 'For Sale', value: stats.propertiesForSale, color: '#f59e0b', icon: Building2 }
                ].map((stat, idx) => (
                    <div key={idx} className="stat-card">
                        <div className="stat-content">
                            <div>
                                <div className="stat-label">{stat.label}</div>
                                <div className="stat-value">{stat.value}</div>
                            </div>
                            <div className="stat-icon-wrapper" style={{
                                background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                                color: stat.color
                            } as React.CSSProperties}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="filters-bar">
                <div className="filters-top">
                    {/* Search */}
                    <div className="search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search properties by name or address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            aria-label="Search properties"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="view-toggle">
                        {['grid', 'map'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode as 'grid' | 'map')}
                                className={`view-btn ${viewMode === mode ? 'active' : ''}`}
                                title={`Switch to ${mode} view`}
                                aria-pressed={viewMode === mode ? "true" : "false"}
                            >
                                {mode === 'grid' ? <Grid size={18} /> : <MapIcon size={18} />}
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bottom">
                    {[
                        {
                            label: 'Property Type',
                            value: filters.type, onChange: (v: string) => setFilters({ ...filters, type: v }), options: [
                                { value: '', label: 'All Types' },
                                { value: 'RESIDENTIAL', label: 'Residential' },
                                { value: 'COMMERCIAL', label: 'Commercial' },
                                { value: 'INDUSTRIAL', label: 'Industrial' },
                                { value: 'LAND', label: 'Land' }
                            ]
                        },
                        {
                            label: 'Status',
                            value: filters.status, onChange: (v: string) => setFilters({ ...filters, status: v }), options: [
                                { value: '', label: 'All Status' },
                                { value: 'AVAILABLE', label: 'Available' },
                                { value: 'LEASED', label: 'Leased' },
                                { value: 'MAINTENANCE', label: 'Maintenance' },
                                { value: 'SOLD', label: 'Sold' }
                            ]
                        },
                        {
                            label: 'Listing Type',
                            value: filters.listing_type, onChange: (v: string) => setFilters({ ...filters, listing_type: v }), options: [
                                { value: '', label: 'All Listings' },
                                { value: 'LEASE', label: 'For Lease' },
                                { value: 'SALE', label: 'For Sale' }
                            ]
                        }
                    ].map((filter, idx) => (
                        <select
                            key={idx}
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            className="filter-select"
                            title={`Filter by ${filter.label}`}
                            aria-label={`Filter by ${filter.label}`}
                        >
                            {filter.options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="loading-state">
                    <div className="loading-text">Loading properties...</div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="properties-grid">
                    {properties.map(property => (
                        <div
                            key={property.id}
                            onClick={() => navigate(`/properties/${property.id}`)}
                            className="property-card"
                            title={`View details for ${property.name}`}
                        >
                            {/* Property Image */}
                            <div className="image-container">
                                {property.images[0] ? (
                                    <img src={property.images[0]} alt={property.name} className="property-img" />
                                ) : (
                                    <div className="placeholder-img">
                                        <Building2 size={56} />
                                    </div>
                                )}
                                {property.latitude && property.longitude && (
                                    <div className="gps-badge">
                                        <MapPin size={16} style={{ color: '#ef4444' }} />
                                        <span>GPS</span>
                                    </div>
                                )}
                            </div>

                            {/* Property Details */}
                            <div className="property-details">
                                <h3>{property.name}</h3>
                                <p className="property-address">{property.address || property.location.name}</p>

                                {/* Tags */}
                                {property.tags && property.tags.length > 0 && (
                                    <div className="tag-list">
                                        {property.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="property-tag"
                                                style={{
                                                    backgroundColor: tag.color ? `${tag.color}20` : 'var(--primary-color-light, #ede9fe)',
                                                    color: tag.color || 'var(--primary-color, #6b21a8)'
                                                } as React.CSSProperties}
                                            >
                                                {tag.tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Meta Info */}
                                <div className="meta-info">
                                    <div>
                                        <div className="meta-item-label">Type</div>
                                        <div className="meta-item-value">{property.type}</div>
                                    </div>
                                    <div>
                                        <div className="meta-item-label">Status</div>
                                        <div className="meta-item-value" style={{ color: property.status === 'AVAILABLE' ? '#10b981' : '#64748b' }}>
                                            {property.status}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="meta-item-label">Units</div>
                                        <div className="meta-item-value">{property.units?.length || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="map-view-container">
                    {propertiesWithCoordinates.length > 0 ? (
                        <MapContainer
                            center={[propertiesWithCoordinates[0].latitude!, propertiesWithCoordinates[0].longitude!]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {propertiesWithCoordinates.map(property => (
                                <Marker
                                    key={property.id}
                                    position={[property.latitude!, property.longitude!]}
                                >
                                    <Popup>
                                        <div className="popup-content">
                                            <h4>{property.name}</h4>
                                            <p className="popup-address">{property.address}</p>
                                            <div className="popup-gps">📍 GPS: {property.latitude?.toFixed(6)}, {property.longitude?.toFixed(6)}</div>
                                            <div className="popup-meta">
                                                <strong>Type:</strong> {property.type}<br />
                                                <strong>Status:</strong> {property.status}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    ) : (
                        <div className="empty-map">
                            <div className="empty-map-content">
                                <MapPin size={64} style={{ marginBottom: '1.5rem', color: '#cbd5e1' }} />
                                <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No GPS coordinates found</p>
                                <p>Add GPS coordinates to properties to view them on the map</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create Property Modal */}
            <CreatePropertyModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => {
                    fetchProperties();
                    fetchStats();
                }}
            />
        </div>
    );
};

export default PropertiesPage;
