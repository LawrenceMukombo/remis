import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
    Search, MapPin, Grid, Table as TableIcon, Map as MapIcon, Plus, Building2,
    SlidersHorizontal, Download, ArrowUpDown, ChevronLeft, ChevronRight, Eye, KeyRound, ExternalLink, ShieldCheck,
    Edit2, Trash2, AlertTriangle
} from 'lucide-react';
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

interface PropertyLocation {
    id: string;
    name: string;
    type?: string;
}

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
    floor_count?: number;
    parking_spaces?: number;
    locationId?: string;
    location: PropertyLocation;
    units?: any[];
    valuations?: any[];
    tags?: Array<{ tag: string; color?: string }>;
}

const PropertiesPage: React.FC = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { settings } = useSettings();
    const [properties, setProperties] = useState<Property[]>([]);
    const [locations, setLocations] = useState<PropertyLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        listing_type: ''
    });
    const [viewMode, setViewMode] = useState<'grid' | 'table' | 'map'>('grid');
    const [showModal, setShowModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalProperties: 0,
        availableProperties: 0,
        leasedProperties: 0,
        propertiesForSale: 0,
        totalUnits: 0
    });

    const handleEdit = (prop: Property) => {
        setEditingProperty(prop);
        setShowModal(true);
    };

    const handleDeleteClick = (prop: Property) => {
        setPropertyToDelete(prop);
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        if (!propertyToDelete) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            const res = await fetch(`http://localhost:4000/api/properties/${propertyToDelete.id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (res.ok) {
                setPropertyToDelete(null);
                fetchProperties();
                fetchStats();
            } else {
                setDeleteError(data.message || 'Failed to delete property.');
            }
        } catch (err: any) {
            setDeleteError(err.message || 'Network error deleting property.');
        } finally {
            setDeleting(false);
        }
    };

    // Enterprise Table State (Global Table Rules)
    const [sortField, setSortField] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [showColMenu, setShowColMenu] = useState<boolean>(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        property: true,
        location: true,
        type: true,
        status: true,
        units: true,
        listingType: true,
        gps: true,
        actions: true
    });

    const primaryColor = settings?.config?.branding?.primaryColor || '#667eea';

    const activeTid = settings?.id || user.tenantId || '';

    useEffect(() => {
        fetchLocations();
    }, [activeTid]);

    useEffect(() => {
        fetchProperties();
        fetchStats();
    }, [filters, searchTerm, selectedLocation, activeTid]);

    const fetchLocations = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/locations?tenantId=${activeTid}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setLocations(data);
            } else if (data.data && Array.isArray(data.data)) {
                setLocations(data.data);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                tenantId: activeTid,
                ...(filters.type && { type: filters.type }),
                ...(filters.status && { status: filters.status }),
                ...(filters.listing_type && { listing_type: filters.listing_type }),
                ...(selectedLocation && { locationId: selectedLocation }),
                ...(searchTerm && { search: searchTerm })
            });

            const res = await fetch(`http://localhost:4000/api/properties?${params}`);
            const data = await res.json();
            setProperties(data.properties || []);
            setPage(1); // Reset page on new data
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/properties/stats?tenantId=${activeTid}`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Sorting & Pagination
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedProperties = useMemo(() => {
        return [...properties].sort((a, b) => {
            let valA: any = a[sortField as keyof Property];
            let valB: any = b[sortField as keyof Property];

            if (sortField === 'location') {
                valA = a.location?.name || '';
                valB = b.location?.name || '';
            } else if (sortField === 'units') {
                valA = a.units?.length || 0;
                valB = b.units?.length || 0;
            }

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = (valB || '').toLowerCase();
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [properties, sortField, sortDirection]);

    const paginatedProperties = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedProperties.slice(start, start + pageSize);
    }, [sortedProperties, page, pageSize]);

    const totalPages = Math.ceil(sortedProperties.length / pageSize) || 1;

    // Export CSV
    const exportPropertiesCSV = () => {
        const headers = ['Property Name', 'Location', 'Type', 'Status', 'Listing Type', 'Units', 'Address', 'Latitude', 'Longitude'];
        const rows = sortedProperties.map(p => [
            `"${p.name.replace(/"/g, '""')}"`,
            `"${(p.location?.name || '').replace(/"/g, '""')}"`,
            `"${p.type}"`,
            `"${p.status}"`,
            `"${p.listing_type}"`,
            p.units?.length || 0,
            `"${(p.address || '').replace(/"/g, '""')}"`,
            p.latitude || '',
            p.longitude || ''
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `REMIS_Properties_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const propertiesWithCoordinates = properties.filter(p => p.latitude && p.longitude);

    return (
        <div className="properties-container" style={{ '--primary-color': primaryColor } as React.CSSProperties}>
            {/* Header */}
            <div className="properties-header">
                <div className="header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h1>Properties & Multi-Location Portfolio</h1>
                        <span className="badge-tag live-badge">Enterprise v2.0</span>
                    </div>
                    <p>Manage single and multiple property assets, units, GPS tracking, and linked rentals</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/leases')}
                        className="action-btn-styled outline-btn"
                        title="Access Rental Management & Tenant Registration"
                    >
                        <KeyRound size={18} />
                        Rentals & Leases Hub
                        {stats.leasedProperties > 0 && (
                            <span className="hub-badge">{stats.leasedProperties} Active</span>
                        )}
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="action-btn-styled primary-btn"
                        title="Add new property"
                    >
                        <Plus size={18} />
                        Add Property
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {[
                    { label: 'Total Properties', value: stats.totalProperties, color: '#667eea', icon: Building2, sub: 'Across all locations' },
                    { label: 'Available for Lease', value: stats.availableProperties, color: '#10b981', icon: Building2, sub: 'Ready for tenants' },
                    { label: 'Currently Leased', value: stats.leasedProperties, color: '#3b82f6', icon: KeyRound, sub: 'Active tenant leases' },
                    { label: 'For Sale / Portfolio', value: stats.propertiesForSale, color: '#f59e0b', icon: Building2, sub: 'Capital investments' }
                ].map((stat, idx) => (
                    <div key={idx} className="stat-card">
                        <div className="stat-content">
                            <div>
                                <div className="stat-label">{stat.label}</div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-sub">{stat.sub}</div>
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

            {/* Search and Filters Bar */}
            <div className="filters-bar">
                <div className="filters-top">
                    {/* Search */}
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search properties by name, address, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            aria-label="Search properties"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="view-toggle">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            title="Grid Card View"
                        >
                            <Grid size={16} /> Grid
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                            title="Enterprise Table View"
                        >
                            <TableIcon size={16} /> Table
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
                            title="Interactive Map View"
                        >
                            <MapIcon size={16} /> Map ({propertiesWithCoordinates.length})
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="filters-bottom">
                    {/* Location Filter */}
                    <div className="filter-item">
                        <label className="filter-label">Location / Region:</label>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="filter-select location-select"
                            title="Filter by Location"
                        >
                            <option value="">All Locations ({locations.length} available)</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    📍 {loc.name} {loc.type ? `(${loc.type})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Property Type */}
                    <div className="filter-item">
                        <label className="filter-label">Property Type:</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="filter-select"
                            title="Filter by Type"
                        >
                            <option value="">All Types</option>
                            <option value="RESIDENTIAL">Residential</option>
                            <option value="COMMERCIAL">Commercial</option>
                            <option value="INDUSTRIAL">Industrial</option>
                            <option value="LAND">Land</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className="filter-item">
                        <label className="filter-label">Status:</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="filter-select"
                            title="Filter by Status"
                        >
                            <option value="">All Statuses</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="LEASED">Leased</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="SOLD">Sold</option>
                        </select>
                    </div>

                    {/* Listing Type */}
                    <div className="filter-item">
                        <label className="filter-label">Listing:</label>
                        <select
                            value={filters.listing_type}
                            onChange={(e) => setFilters({ ...filters, listing_type: e.target.value })}
                            className="filter-select"
                            title="Filter by Listing"
                        >
                            <option value="">All Listings</option>
                            <option value="LEASE">For Lease</option>
                            <option value="SALE">For Sale</option>
                        </select>
                    </div>

                    {/* Reset Filters */}
                    {(selectedLocation || filters.type || filters.status || filters.listing_type || searchTerm) && (
                        <button
                            onClick={() => {
                                setSelectedLocation('');
                                setFilters({ type: '', status: '', listing_type: '' });
                                setSearchTerm('');
                            }}
                            className="reset-filters-btn"
                            title="Clear all active filters"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Content Display */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading enterprise property records...</div>
                </div>
            ) : properties.length === 0 ? (
                <div className="empty-properties-card">
                    <Building2 size={54} className="empty-icon" />
                    <h3>No Properties Match Your Search</h3>
                    <p>Adjust your location or type filters, or add your first property to the portfolio.</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button
                            onClick={() => {
                                setSelectedLocation('');
                                setFilters({ type: '', status: '', listing_type: '' });
                                setSearchTerm('');
                            }}
                            className="action-btn-styled outline-btn"
                        >
                            Reset All Filters
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="action-btn-styled primary-btn"
                        >
                            <Plus size={16} /> Add Property
                        </button>
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="properties-grid">
                    {sortedProperties.map(property => (
                        <div key={property.id} className="property-card">
                            {/* Property Image & Status Badges */}
                            <div className="image-container" onClick={() => navigate(`/properties/${property.id}`)}>
                                {property.images && property.images.length > 0 ? (
                                    <img src={property.images[0]} alt={property.name} className="property-img" />
                                ) : (
                                    <div className="no-image-placeholder">
                                        <Building2 size={40} />
                                    </div>
                                )}
                                <div className="card-badge-container">
                                    <span className={`status-pill status-${property.status.toLowerCase()}`}>
                                        {property.status}
                                    </span>
                                    <span className="type-pill">
                                        {property.type}
                                    </span>
                                </div>
                            </div>

                            {/* Property Info */}
                            <div className="property-details">
                                <h3 className="property-title" onClick={() => navigate(`/properties/${property.id}`)}>
                                    {property.name}
                                </h3>

                                <div className="location-row">
                                    <MapPin size={15} className="location-pin-icon" />
                                    <span className="location-name">{property.location?.name || 'Unassigned Location'}</span>
                                </div>

                                {property.address && (
                                    <p className="property-address">{property.address}</p>
                                )}

                                {/* Meta Stats */}
                                <div className="property-meta-row">
                                    <div className="meta-block">
                                        <span className="meta-label">Units</span>
                                        <span className="meta-val">{property.units?.length || 0} Units</span>
                                    </div>
                                    <div className="meta-block">
                                        <span className="meta-label">Listing</span>
                                        <span className="meta-val">{property.listing_type}</span>
                                    </div>
                                    <div className="meta-block">
                                        <span className="meta-label">GPS</span>
                                        <span className="meta-val">
                                            {property.latitude ? `${property.latitude.toFixed(2)}, ${property.longitude?.toFixed(2)}` : 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="property-card-actions">
                                    <button
                                        onClick={() => navigate(`/properties/${property.id}`)}
                                        className="card-action-btn view-btn"
                                        title="View Full Property Details"
                                    >
                                        <Eye size={15} /> Details
                                    </button>
                                    <button
                                        onClick={() => handleEdit(property)}
                                        className="card-action-btn edit-btn"
                                        style={{ background: '#f0f9ff', color: '#0284c7', borderColor: '#bae6fd' }}
                                        title="Edit Real Estate Property"
                                    >
                                        <Edit2 size={15} /> Edit
                                    </button>
                                    <button
                                        onClick={() => navigate(`/leases?propertyId=${property.id}`)}
                                        className="card-action-btn lease-btn"
                                        title="Manage Rentals & Leases for this property"
                                    >
                                        <KeyRound size={15} /> Leases
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(property)}
                                        className="card-action-btn delete-btn"
                                        style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
                                        title="Delete Property"
                                    >
                                        <Trash2 size={15} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : viewMode === 'table' ? (
                <div className="enterprise-table-wrapper">
                    {/* Table Utility Bar */}
                    <div className="table-utility-bar">
                        <div className="table-count-indicator">
                            Showing <strong>{((page - 1) * pageSize) + 1}</strong> - <strong>{Math.min(page * pageSize, sortedProperties.length)}</strong> of <strong>{sortedProperties.length}</strong> properties
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowColMenu(!showColMenu)}
                                    className="table-util-btn"
                                    title="Toggle Column Visibility"
                                >
                                    <SlidersHorizontal size={14} /> Columns
                                </button>
                                {showColMenu && (
                                    <div className="col-dropdown-menu">
                                        <div className="col-dropdown-title">Toggle Columns</div>
                                        {Object.keys(visibleColumns).map(col => (
                                            <label key={col} className="col-toggle-label">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns[col]}
                                                    onChange={() => setVisibleColumns({ ...visibleColumns, [col]: !visibleColumns[col] })}
                                                />
                                                {col.toUpperCase()}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={exportPropertiesCSV}
                                className="table-util-btn"
                                title="Export Properties to CSV"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive-container">
                        <table className="enterprise-table">
                            <thead>
                                <tr>
                                    {visibleColumns.property && (
                                        <th onClick={() => handleSort('name')} className="sortable-th">
                                            Property <ArrowUpDown size={13} className="sort-icon" />
                                        </th>
                                    )}
                                    {visibleColumns.location && (
                                        <th onClick={() => handleSort('location')} className="sortable-th">
                                            Location / District <ArrowUpDown size={13} className="sort-icon" />
                                        </th>
                                    )}
                                    {visibleColumns.type && (
                                        <th onClick={() => handleSort('type')} className="sortable-th">
                                            Type <ArrowUpDown size={13} className="sort-icon" />
                                        </th>
                                    )}
                                    {visibleColumns.status && (
                                        <th onClick={() => handleSort('status')} className="sortable-th">
                                            Status <ArrowUpDown size={13} className="sort-icon" />
                                        </th>
                                    )}
                                    {visibleColumns.units && (
                                        <th onClick={() => handleSort('units')} className="sortable-th">
                                            Units <ArrowUpDown size={13} className="sort-icon" />
                                        </th>
                                    )}
                                    {visibleColumns.listingType && (
                                        <th onClick={() => handleSort('listing_type')} className="sortable-th">
                                            Listing <ArrowUpDown size={13} className="sort-icon" />
                                        </th>
                                    )}
                                    {visibleColumns.gps && <th>GPS Coordinates</th>}
                                    {visibleColumns.actions && <th style={{ textAlign: 'right' }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProperties.map(property => (
                                    <tr key={property.id}>
                                        {visibleColumns.property && (
                                            <td>
                                                <div className="table-property-cell">
                                                    <div className="table-avatar">
                                                        {property.images && property.images[0] ? (
                                                            <img src={property.images[0]} alt="" />
                                                        ) : (
                                                            <Building2 size={18} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="cell-title">{property.name}</div>
                                                        <div className="cell-sub">{property.address || 'No address specified'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.location && (
                                            <td>
                                                <span className="location-chip">
                                                    <MapPin size={12} /> {property.location?.name || 'Unassigned'}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.type && (
                                            <td>
                                                <span className="type-chip">{property.type}</span>
                                            </td>
                                        )}
                                        {visibleColumns.status && (
                                            <td>
                                                <span className={`status-pill status-${property.status.toLowerCase()}`}>
                                                    {property.status}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.units && (
                                            <td>
                                                <strong>{property.units?.length || 0}</strong>
                                            </td>
                                        )}
                                        {visibleColumns.listingType && (
                                            <td>
                                                <span className="listing-chip">{property.listing_type}</span>
                                            </td>
                                        )}
                                        {visibleColumns.gps && (
                                            <td>
                                                {property.latitude ? (
                                                    <span className="gps-text">
                                                        {property.latitude.toFixed(4)}, {property.longitude?.toFixed(4)}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">N/A</span>
                                                )}
                                            </td>
                                        )}
                                        {visibleColumns.actions && (
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="table-row-actions">
                                                    <button
                                                        onClick={() => navigate(`/properties/${property.id}`)}
                                                        className="row-action-btn"
                                                        title="View Details"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(property)}
                                                        className="row-action-btn edit"
                                                        style={{ color: '#0284c7', background: '#f0f9ff' }}
                                                        title="Edit Property"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/leases?propertyId=${property.id}`)}
                                                        className="row-action-btn lease"
                                                        title="Manage Leases & Rentals"
                                                    >
                                                        <KeyRound size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(property)}
                                                        className="row-action-btn delete"
                                                        style={{ color: '#dc2626', background: '#fef2f2' }}
                                                        title="Delete Property"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls (Global Table Rules) */}
                    <div className="table-pagination-footer">
                        <div className="page-size-selector">
                            <span>Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <div className="pagination-nav-controls">
                            <span className="page-indicator">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="page-nav-btn"
                                title="Previous Page"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages}
                                className="page-nav-btn"
                                title="Next Page"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="map-view-container">
                    {propertiesWithCoordinates.length > 0 ? (
                        <MapContainer
                            center={[propertiesWithCoordinates[0].latitude!, propertiesWithCoordinates[0].longitude!]}
                            zoom={12}
                            style={{ height: '620px', width: '100%', borderRadius: '16px' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_2wxx_1_19a2e48a7de2e23331436131"
                                subdomains={['a', 'b', 'c', 'd']}
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
                                            <div className="popup-gps">📍 GPS: {property.latitude?.toFixed(5)}, {property.longitude?.toFixed(5)}</div>
                                            <div className="popup-meta">
                                                <strong>Location:</strong> {property.location?.name}<br />
                                                <strong>Type:</strong> {property.type} | <strong>Status:</strong> {property.status}
                                            </div>
                                            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => navigate(`/properties/${property.id}`)}
                                                    className="popup-btn"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/leases?propertyId=${property.id}`)}
                                                    className="popup-btn popup-btn-lease"
                                                >
                                                    Manage Leases
                                                </button>
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
                                <p>Properties in the selected location have not been mapped yet.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create & Edit Property Modal */}
            <CreatePropertyModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingProperty(null);
                }}
                onSuccess={() => {
                    fetchProperties();
                    fetchStats();
                    setEditingProperty(null);
                }}
                propertyToEdit={editingProperty}
            />

            {/* Delete Property Confirmation Modal */}
            {propertyToDelete && (
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
                    zIndex: 1100,
                    backdropFilter: 'blur(4px)',
                    padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '480px',
                        width: '100%',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#dc2626' }}>
                            <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Delete Property Asset?</h3>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Action cannot be reversed</span>
                            </div>
                        </div>

                        <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                            Are you sure you want to permanently delete <strong>{propertyToDelete.name}</strong>?
                            All media, units, and tags associated with this property will be removed. Properties with active leases cannot be deleted.
                        </p>

                        {deleteError && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#b91c1c',
                                fontSize: '0.85rem',
                                marginBottom: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <AlertTriangle size={16} />
                                <span>{deleteError}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setPropertyToDelete(null);
                                    setDeleteError(null);
                                }}
                                style={{
                                    padding: '0.7rem 1.25rem',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    background: '#ffffff',
                                    color: '#475569',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                style={{
                                    padding: '0.7rem 1.4rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: deleting ? '#94a3b8' : '#dc2626',
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    cursor: deleting ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Trash2 size={16} />
                                {deleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertiesPage;
