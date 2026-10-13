import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Users, DollarSign, Wrench, PlusCircle, CheckCircle2,
    Calendar, Phone, MapPin, Eye, FileText, ArrowRight, ShieldCheck,
    AlertCircle, MessageSquare, Clock, Search, ChevronRight, X,
    Edit2, Trash2, ArrowUpDown, ChevronLeft, SlidersHorizontal, Download,
    AlertTriangle, Loader2, Upload, Star, Image as ImageIcon
} from 'lucide-react';
import './LandlordHub.css';

const API_BASE = 'http://localhost:4000/api';

export const LandlordHub: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'properties' | 'applications' | 'rentroll' | 'repairs'>('properties');
    const [loading, setLoading] = useState(true);
    const [landlordData, setLandlordData] = useState<any>(null);
    const [authPhone, setAuthPhone] = useState('');

    // Enterprise Table & Filters State
    const [propertySearch, setPropertySearch] = useState('');
    const [propertyTypeFilter, setPropertyTypeFilter] = useState('ALL');
    const [propertyStatusFilter, setPropertyStatusFilter] = useState('ALL');
    const [propertySortField, setPropertySortField] = useState('name');
    const [propertySortDir, setPropertySortDir] = useState<'asc' | 'desc'>('asc');
    const [propertyPage, setPropertyPage] = useState(1);
    const [propertyPageSize, setPropertyPageSize] = useState(10);
    const [showColMenu, setShowColMenu] = useState(false);
    const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
        property: true,
        type: true,
        address: true,
        price: true,
        leases: true,
        status: true,
        actions: true
    });

    // Edit Property Modal State
    const [editingProperty, setEditingProperty] = useState<any | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [savingEdit, setSavingEdit] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [newPhotoUrl, setNewPhotoUrl] = useState('');

    // Delete Property Modal State
    const [propertyToDelete, setPropertyToDelete] = useState<any | null>(null);
    const [deletingProperty, setDeletingProperty] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        fetchLandlordData();
    }, []);

    const fetchLandlordData = async (identifierOverride?: string) => {
        try {
            const savedIdentifier = identifierOverride !== undefined 
                ? identifierOverride 
                : (sessionStorage.getItem('remis_landlord_id') || '');
            const query = savedIdentifier ? `?phone=${encodeURIComponent(savedIdentifier)}` : '';
            const res = await fetch(`${API_BASE}/marketplace/landlord/hub${query}`);
            const data = await res.json();
            if (data.success) {
                setLandlordData(data);
            }
        } catch (err) {
            console.error('Error fetching landlord hub data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!authPhone.trim()) return;
        sessionStorage.setItem('remis_landlord_id', authPhone.trim());
        setLoading(true);
        fetchLandlordData(authPhone.trim());
    };

    const handleSignOut = () => {
        sessionStorage.removeItem('remis_landlord_id');
        setAuthPhone('');
        setLandlordData(null);
        fetchLandlordData('');
    };

    const handleUpdateRepairStatus = async (ticketId: string, newStatus: string) => {
        try {
            await fetch(`${API_BASE}/marketplace/maintenance/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchLandlordData();
        } catch (err) {
            console.error('Error updating repair status:', err);
        }
    };

    // Property CRUD Handlers
    const handleOpenEdit = (prop: any) => {
        setEditingProperty(prop);
        setEditError(null);
        setNewPhotoUrl('');
        setEditFormData({
            name: prop.name || '',
            type: prop.type || 'RESIDENTIAL',
            listing_type: prop.listing_type || 'LEASE',
            status: prop.status || 'AVAILABLE',
            address: prop.address || '',
            province: prop.province || '',
            district: prop.district || '',
            description: prop.description || '',
            sale_price: prop.sale_price !== undefined && prop.sale_price !== null ? prop.sale_price : '',
            landArea: prop.landArea !== undefined && prop.landArea !== null ? prop.landArea : '',
            yearBuilt: prop.yearBuilt !== undefined && prop.yearBuilt !== null ? prop.yearBuilt : '',
            parking_spaces: prop.parking_spaces !== undefined && prop.parking_spaces !== null ? prop.parking_spaces : '',
            floor_count: prop.floor_count !== undefined && prop.floor_count !== null ? prop.floor_count : '',
            images: Array.isArray(prop.images) ? [...prop.images] : []
        });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploadingPhotos(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('photos', file);
            });

            let uploadedUrls: string[] = [];

            // Attempt batch photo upload
            try {
                const res = await fetch(`${API_BASE}/upload/photos`, {
                    method: 'POST',
                    body: formData
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.urls) && data.urls.length > 0) {
                        uploadedUrls = data.urls;
                    }
                }
            } catch (err) {
                console.warn('Batch photo upload failed, attempting single fallback:', err);
            }

            // Fallback to single file upload
            if (uploadedUrls.length === 0) {
                for (const file of Array.from(files)) {
                    try {
                        const singleData = new FormData();
                        singleData.append('file', file);
                        const res = await fetch(`${API_BASE}/upload/file`, {
                            method: 'POST',
                            body: singleData
                        });
                        const data = await res.json();
                        if (data.url) uploadedUrls.push(data.url);
                    } catch (singleErr) {
                        console.error('Single upload failed:', singleErr);
                    }
                }
            }

            if (uploadedUrls.length > 0) {
                setEditFormData((prev: any) => ({
                    ...prev,
                    images: [...(prev.images || []), ...uploadedUrls]
                }));
            }
        } finally {
            setUploadingPhotos(false);
            e.target.value = '';
        }
    };

    const handleAddPhotoByUrl = () => {
        if (!newPhotoUrl.trim()) return;
        setEditFormData((prev: any) => ({
            ...prev,
            images: [...(prev.images || []), newPhotoUrl.trim()]
        }));
        setNewPhotoUrl('');
    };

    const handleRemovePhoto = (indexToRemove: number) => {
        setEditFormData((prev: any) => ({
            ...prev,
            images: (prev.images || []).filter((_: any, idx: number) => idx !== indexToRemove)
        }));
    };

    const handleSetCoverPhoto = (indexToCover: number) => {
        setEditFormData((prev: any) => {
            const currentImages = [...(prev.images || [])];
            if (indexToCover <= 0 || indexToCover >= currentImages.length) return prev;
            const [selected] = currentImages.splice(indexToCover, 1);
            return {
                ...prev,
                images: [selected, ...currentImages]
            };
        });
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProperty) return;
        setSavingEdit(true);
        setEditError(null);
        try {
            const res = await fetch(`${API_BASE}/properties/${editingProperty.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData)
            });
            const data = await res.json();
            if (res.ok) {
                setEditingProperty(null);
                fetchLandlordData();
            } else {
                setEditError(data.message || 'Failed to update property');
            }
        } catch (err: any) {
            setEditError(err.message || 'Network error updating property');
        } finally {
            setSavingEdit(false);
        }
    };

    const handleQuickStatusChange = async (propertyId: string, newStatus: string) => {
        try {
            const res = await fetch(`${API_BASE}/properties/${propertyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchLandlordData();
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleConfirmDelete = async () => {
        if (!propertyToDelete) return;
        setDeletingProperty(true);
        setDeleteError(null);
        try {
            const res = await fetch(`${API_BASE}/properties/${propertyToDelete.id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (res.ok) {
                setPropertyToDelete(null);
                fetchLandlordData();
            } else {
                setDeleteError(data.message || 'Failed to delete property');
            }
        } catch (err: any) {
            setDeleteError(err.message || 'Network error deleting property');
        } finally {
            setDeletingProperty(false);
        }
    };

    const handleSort = (field: string) => {
        if (propertySortField === field) {
            setPropertySortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setPropertySortField(field);
            setPropertySortDir('asc');
        }
    };

    const properties = landlordData?.properties || [];
    const applications = landlordData?.applications || [];
    const allLeases = properties.flatMap((p: any) => p.leases || []);
    const allTickets = properties.flatMap((p: any) => p.maintenance || []);

    // Filtered & Sorted Properties
    const filteredProperties = useMemo(() => {
        return properties.filter((p: any) => {
            const query = propertySearch.trim().toLowerCase();
            const matchesSearch = !query || (
                (p.name && p.name.toLowerCase().includes(query)) ||
                (p.address && p.address.toLowerCase().includes(query)) ||
                (p.district && p.district.toLowerCase().includes(query)) ||
                (p.province && p.province.toLowerCase().includes(query))
            );
            const matchesType = propertyTypeFilter === 'ALL' || p.type === propertyTypeFilter;
            const matchesStatus = propertyStatusFilter === 'ALL' || p.status === propertyStatusFilter;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [properties, propertySearch, propertyTypeFilter, propertyStatusFilter]);

    const sortedProperties = useMemo(() => {
        return [...filteredProperties].sort((a: any, b: any) => {
            let valA = a[propertySortField];
            let valB = b[propertySortField];
            if (propertySortField === 'leases') {
                valA = a.leases?.length || 0;
                valB = b.leases?.length || 0;
            } else if (propertySortField === 'price') {
                valA = a.sale_price !== null && a.sale_price !== undefined ? Number(a.sale_price) : 0;
                valB = b.sale_price !== null && b.sale_price !== undefined ? Number(b.sale_price) : 0;
            }
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = (valB || '').toLowerCase();
            }
            if (valA < valB) return propertySortDir === 'asc' ? -1 : 1;
            if (valA > valB) return propertySortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredProperties, propertySortField, propertySortDir]);

    const totalPropertyPages = Math.ceil(sortedProperties.length / propertyPageSize) || 1;
    const paginatedProperties = useMemo(() => {
        return sortedProperties.slice(
            (propertyPage - 1) * propertyPageSize,
            propertyPage * propertyPageSize
        );
    }, [sortedProperties, propertyPage, propertyPageSize]);

    const handleExportCSV = () => {
        if (properties.length === 0) return;
        const headers = ['Property Name', 'Type', 'Listing Type', 'Status', 'Address', 'District', 'Province', 'Active Leases', 'Price'];
        const rows = sortedProperties.map((p: any) => [
            `"${p.name?.replace(/"/g, '""') || ''}"`,
            p.type || '',
            p.listing_type || '',
            p.status || '',
            `"${p.address?.replace(/"/g, '""') || ''}"`,
            p.district || '',
            p.province || '',
            p.leases?.length || 0,
            p.sale_price || ''
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `remis_landlord_properties_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="landlord-hub-page">
            {/* Top Navigation */}
            <header className="landlord-nav">
                <div className="landlord-nav-brand">
                    <Building2 size={24} color="#38bdf8" />
                    <h2>REMIS Landlord Command Center</h2>
                    <span className="landlord-badge">Property Host Hub</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0284c7' }}
                        onClick={() => navigate('/list-property')}
                    >
                        <PlusCircle size={16} /> List New Property
                    </button>
                    <button
                        className="btn-secondary"
                        style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        onClick={() => navigate('/tenant-hub')}
                    >
                        Tenant Portal
                    </button>
                    {sessionStorage.getItem('remis_landlord_id') && (
                        <button
                            className="btn-secondary"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            onClick={handleSignOut}
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            </header>

            <main className="landlord-main">
                {(!sessionStorage.getItem('remis_landlord_id') && (landlordData?.requiresAuth || properties.length === 0)) ? (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '2.5rem',
                        textAlign: 'center',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                        maxWidth: '560px',
                        margin: '3rem auto'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: '#e0f2fe',
                            color: '#0284c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <Building2 size={36} />
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                            Protected Landlord Portfolio Command
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                            To prevent cross-landlord data leakage and protect sensitive rent roll financials, please enter your registered Lister Phone Number or Organization Tenant ID.
                        </p>
                        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                                    Lister Phone Number or Tenant ID
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={authPhone}
                                    onChange={e => setAuthPhone(e.target.value)}
                                    placeholder="e.g. +260 97 1234567 or tenant-zambia-realty-01"
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 1rem',
                                        borderRadius: '10px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{
                                    background: '#0284c7',
                                    padding: '0.85rem',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Building2 size={18} /> Access Landlord Hub
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        {/* KPI Overview Grid */}
                        <div className="landlord-kpi-grid">
                    <div className="landlord-kpi-card">
                        <div className="landlord-kpi-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                            <Building2 size={24} />
                        </div>
                        <div>
                            <span>Portfolio Size</span>
                            <strong>{landlordData?.totalProperties || 0} Units</strong>
                        </div>
                    </div>

                    <div className="landlord-kpi-card">
                        <div className="landlord-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <span>Active Tenancies</span>
                            <strong>{landlordData?.activeLeasesCount || 0} Leased</strong>
                        </div>
                    </div>

                    <div className="landlord-kpi-card">
                        <div className="landlord-kpi-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <span>Monthly Rent Roll</span>
                            <strong>K{Number(landlordData?.monthlyRentRoll || 0).toLocaleString()}</strong>
                        </div>
                    </div>

                    <div className="landlord-kpi-card">
                        <div className="landlord-kpi-icon" style={{ background: '#fefce8', color: '#ca8a04' }}>
                            <Wrench size={24} />
                        </div>
                        <div>
                            <span>Open Repairs</span>
                            <strong>{landlordData?.openMaintenanceTickets || 0} Pending</strong>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="landlord-tabs">
                    <button
                        className={`landlord-tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
                        onClick={() => setActiveTab('properties')}
                    >
                        <Building2 size={18} /> Properties & Occupancy
                    </button>
                    <button
                        className={`landlord-tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('applications')}
                    >
                        <Users size={18} /> Applications & Viewings ({applications.length})
                    </button>
                    <button
                        className={`landlord-tab-btn ${activeTab === 'rentroll' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rentroll')}
                    >
                        <DollarSign size={18} /> Rent Roll & Ledgers
                    </button>
                    <button
                        className={`landlord-tab-btn ${activeTab === 'repairs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('repairs')}
                    >
                        <Wrench size={18} /> Artisan Repairs ({allTickets.length})
                    </button>
                </div>

                {/* TAB 1: PROPERTIES (Enterprise Grade with Full CRUD) */}
                {activeTab === 'properties' && (
                    <div className="landlord-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>My Managed Real Estate Properties</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                    Oversee, edit, update occupancy status, or manage listings across your portfolio.
                                </p>
                            </div>
                            <button
                                className="btn-primary"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: '#0284c7',
                                    padding: '0.65rem 1.25rem',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '0.85rem'
                                }}
                                onClick={() => navigate('/list-property')}
                            >
                                <PlusCircle size={16} /> List New Property
                            </button>
                        </div>

                        {/* Enterprise Table Toolbar */}
                        <div className="landlord-table-toolbar">
                            <div className="toolbar-search-box">
                                <Search size={16} color="#94a3b8" />
                                <input
                                    type="text"
                                    placeholder="Search properties, address, district..."
                                    value={propertySearch}
                                    onChange={e => {
                                        setPropertySearch(e.target.value);
                                        setPropertyPage(1);
                                    }}
                                />
                            </div>

                            <div className="toolbar-filters">
                                <select
                                    className="toolbar-select"
                                    value={propertyTypeFilter}
                                    onChange={e => {
                                        setPropertyTypeFilter(e.target.value);
                                        setPropertyPage(1);
                                    }}
                                >
                                    <option value="ALL">All Types</option>
                                    <option value="RESIDENTIAL">Residential</option>
                                    <option value="COMMERCIAL">Commercial</option>
                                    <option value="LAND">Land</option>
                                    <option value="INDUSTRIAL">Industrial</option>
                                    <option value="RETAIL">Retail</option>
                                </select>

                                <select
                                    className="toolbar-select"
                                    value={propertyStatusFilter}
                                    onChange={e => {
                                        setPropertyStatusFilter(e.target.value);
                                        setPropertyPage(1);
                                    }}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="AVAILABLE">Available</option>
                                    <option value="LEASED">Leased</option>
                                    <option value="UNDER_OFFER">Under Offer</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                </select>

                                {/* Column visibility control */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        className="toolbar-btn"
                                        onClick={() => setShowColMenu(!showColMenu)}
                                        title="Toggle Visible Columns"
                                    >
                                        <SlidersHorizontal size={14} /> Columns
                                    </button>
                                    {showColMenu && (
                                        <div style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: '110%',
                                            background: '#ffffff',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '8px',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                            padding: '0.75rem',
                                            zIndex: 50,
                                            minWidth: '160px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                Toggle Columns
                                            </div>
                                            {Object.keys(visibleCols).map(col => (
                                                <label key={col} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleCols[col]}
                                                        onChange={() => setVisibleCols(prev => ({ ...prev, [col]: !prev[col] }))}
                                                    />
                                                    {col.charAt(0).toUpperCase() + col.slice(1)}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    className="toolbar-btn"
                                    onClick={handleExportCSV}
                                    title="Export Properties to CSV"
                                >
                                    <Download size={14} /> Export CSV
                                </button>
                            </div>
                        </div>

                        {/* Responsive Enterprise Table */}
                        <div className="landlord-table-responsive">
                            <table className="landlord-table">
                                <thead>
                                    <tr>
                                        {visibleCols.property && (
                                            <th className="sortable-th" onClick={() => handleSort('name')}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    Property <ArrowUpDown size={12} />
                                                </span>
                                            </th>
                                        )}
                                        {visibleCols.type && (
                                            <th className="sortable-th" onClick={() => handleSort('type')}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    Type <ArrowUpDown size={12} />
                                                </span>
                                            </th>
                                        )}
                                        {visibleCols.address && (
                                            <th className="sortable-th" onClick={() => handleSort('address')}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    Address / District <ArrowUpDown size={12} />
                                                </span>
                                            </th>
                                        )}
                                        {visibleCols.price && (
                                            <th className="sortable-th" onClick={() => handleSort('price')}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    Rent / Price <ArrowUpDown size={12} />
                                                </span>
                                            </th>
                                        )}
                                        {visibleCols.leases && (
                                            <th className="sortable-th" onClick={() => handleSort('leases')}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    Active Leases <ArrowUpDown size={12} />
                                                </span>
                                            </th>
                                        )}
                                        {visibleCols.status && (
                                            <th className="sortable-th" onClick={() => handleSort('status')}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    Status <ArrowUpDown size={12} />
                                                </span>
                                            </th>
                                        )}
                                        {visibleCols.actions && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedProperties.length > 0 ? (
                                        paginatedProperties.map((p: any) => (
                                            <tr key={p.id}>
                                                {visibleCols.property && (
                                                    <td className="cell-prop">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            {p.images && p.images[0] ? (
                                                                <img
                                                                    src={p.images[0]}
                                                                    alt=""
                                                                    style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                                                                />
                                                            ) : (
                                                                <div style={{
                                                                    width: '42px',
                                                                    height: '42px',
                                                                    borderRadius: '8px',
                                                                    background: '#e0f2fe',
                                                                    color: '#0284c7',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0
                                                                }}>
                                                                    <Building2 size={20} />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <strong style={{ color: '#0f172a', display: 'block', lineHeight: 1.35, fontSize: '0.875rem' }}>
                                                                    {p.name}
                                                                </strong>
                                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                    {p.listing_type || 'LEASE'} • ID: {p.id.slice(0, 8)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleCols.type && (
                                                    <td>
                                                        <span style={{
                                                            padding: '0.2rem 0.5rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            background: '#f1f5f9',
                                                            color: '#334155'
                                                        }}>
                                                            {p.type}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleCols.address && (
                                                    <td className="cell-address">
                                                        <span style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                                            <MapPin size={13} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                                                            <span>{p.address || p.district || 'Lusaka, Zambia'}</span>
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleCols.price && (
                                                    <td>
                                                        <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                                                            {p.sale_price ? `K${Number(p.sale_price).toLocaleString()}` : 'Price on Request'}
                                                        </strong>
                                                    </td>
                                                )}
                                                {visibleCols.leases && (
                                                    <td>
                                                        <span style={{ fontWeight: 600, color: (p.leases?.length > 0) ? '#059669' : '#64748b' }}>
                                                            {p.leases?.length || 0} Active Leases
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleCols.status && (
                                                    <td>
                                                        <select
                                                            value={p.status}
                                                            onChange={(e) => handleQuickStatusChange(p.id, e.target.value)}
                                                            className="status-dropdown"
                                                            style={{
                                                                background: p.status === 'AVAILABLE' ? '#ecfdf5' : (p.status === 'LEASED' ? '#eff6ff' : '#fffbeb'),
                                                                color: p.status === 'AVAILABLE' ? '#059669' : (p.status === 'LEASED' ? '#1d4ed8' : '#b45309'),
                                                                borderColor: p.status === 'AVAILABLE' ? '#a7f3d0' : (p.status === 'LEASED' ? '#bfdbfe' : '#fde68a'),
                                                                padding: '4px 8px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700,
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <option value="AVAILABLE">AVAILABLE</option>
                                                            <option value="LEASED">LEASED</option>
                                                            <option value="UNDER_OFFER">UNDER OFFER</option>
                                                            <option value="MAINTENANCE">MAINTENANCE</option>
                                                        </select>
                                                    </td>
                                                )}
                                                {visibleCols.actions && (
                                                    <td>
                                                        <div className="action-btn-group">
                                                            <button
                                                                className="action-btn preview"
                                                                onClick={() => navigate(`/property/${p.id}`)}
                                                                title="Preview public marketplace listing"
                                                            >
                                                                <Eye size={13} /> Preview
                                                            </button>
                                                            <button
                                                                className="action-btn edit"
                                                                onClick={() => handleOpenEdit(p)}
                                                                title="Edit and update property details"
                                                            >
                                                                <Edit2 size={13} /> Edit
                                                            </button>
                                                            <button
                                                                className="action-btn delete"
                                                                onClick={() => {
                                                                    setPropertyToDelete(p);
                                                                    setDeleteError(null);
                                                                }}
                                                                title="Delete this property"
                                                            >
                                                                <Trash2 size={13} /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                                <Building2 size={40} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.4 }} />
                                                <strong style={{ display: 'block', color: '#475569', marginBottom: '4px' }}>No properties match your filter criteria</strong>
                                                <span>Try adjusting your search terms or filters above.</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="landlord-pagination-footer">
                            <div>
                                Showing <strong>{sortedProperties.length === 0 ? 0 : ((propertyPage - 1) * propertyPageSize) + 1}</strong> to <strong>{Math.min(propertyPage * propertyPageSize, sortedProperties.length)}</strong> of <strong>{sortedProperties.length}</strong> properties
                                <label style={{ marginLeft: '12px' }}>
                                    Rows:
                                    <select
                                        className="pagination-size-select"
                                        value={propertyPageSize}
                                        onChange={e => {
                                            setPropertyPageSize(Number(e.target.value));
                                            setPropertyPage(1);
                                        }}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </label>
                            </div>
                            <div className="pagination-nav-btns">
                                <span>Page {propertyPage} of {totalPropertyPages}</span>
                                <button
                                    className="nav-page-btn"
                                    onClick={() => setPropertyPage(prev => Math.max(prev - 1, 1))}
                                    disabled={propertyPage === 1}
                                    title="Previous page"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    className="nav-page-btn"
                                    onClick={() => setPropertyPage(prev => Math.min(prev + 1, totalPropertyPages))}
                                    disabled={propertyPage >= totalPropertyPages}
                                    title="Next page"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: APPLICATIONS & PHYSICAL VIEWINGS */}
                {activeTab === 'applications' && (
                    <div className="landlord-card">
                        <h3>Prospective Tenant Applications & Viewing Pipeline</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Review applicant background checks, schedule physical walkthroughs, and verify on-site arrival passes.
                        </p>

                        <table className="landlord-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Property</th>
                                    <th>Applicant Details</th>
                                    <th>Verification Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.length > 0 ? (
                                    applications.map((app: any) => {
                                        let parsed: any = {};
                                        try { parsed = JSON.parse(app.message || '{}'); } catch {}

                                        const isViewing = app.status.includes('VIEWING');

                                        return (
                                            <tr key={app.id}>
                                                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '4px',
                                                        background: isViewing ? '#e0f2fe' : '#f0fdf4',
                                                        color: isViewing ? '#0369a1' : '#166534'
                                                    }}>
                                                        {isViewing ? 'PHYSICAL VIEWING' : 'LEASE APPLICATION'}
                                                    </span>
                                                </td>
                                                <td><strong>{app.property?.name || 'Property'}</strong></td>
                                                <td>
                                                    <div>{parsed.applicantName || 'Applicant'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                        {parsed.applicantPhone || 'Phone hidden'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem',
                                                        color: app.status === 'VIEWING_ATTENDED' ? '#059669' : '#ca8a04'
                                                    }}>
                                                        {app.status === 'VIEWING_ATTENDED' ? '✓ ATTENDED & VERIFIED' : app.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="action-chip whatsapp"
                                                        onClick={() => {
                                                            const text = encodeURIComponent(`Hi ${parsed.applicantName || 'there'}, regarding your interest in ${app.property?.name} on REMIS...`);
                                                            window.open(`https://wa.me/${parsed.applicantPhone?.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                                                        }}
                                                    >
                                                        <MessageSquare size={14} /> WhatsApp
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                            No applications or scheduled viewings logged yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 3: RENT ROLL & REMINDERS */}
                {activeTab === 'rentroll' && (
                    <div className="landlord-card">
                        <h3>Monthly Rent Roll & Collections Tracker</h3>
                        <table className="landlord-table">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Tenant</th>
                                    <th>Rent (ZMW)</th>
                                    <th>Billing Cycle</th>
                                    <th>Status</th>
                                    <th>Chaser Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allLeases.length > 0 ? (
                                    allLeases.map((l: any) => (
                                        <tr key={l.id}>
                                            <td><strong>{l.property?.name || 'Unit'}</strong></td>
                                            <td>
                                                <div>{l.renter?.name || 'Assigned Resident'}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.renter?.phone}</div>
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#059669' }}>
                                                K{Number(l.rentAmount || 0).toLocaleString()}
                                            </td>
                                            <td>{l.frequency || 'MONTHLY'}</td>
                                            <td>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    background: l.status === 'ACTIVE' ? '#ecfdf5' : '#f8fafc',
                                                    color: l.status === 'ACTIVE' ? '#065f46' : '#64748b',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px'
                                                }}>
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="action-chip whatsapp"
                                                    onClick={() => {
                                                        const clean = l.renter?.phone?.replace(/[^0-9]/g, '');
                                                        const msg = encodeURIComponent(`Dear ${l.renter?.name}, friendly reminder that monthly rent of K${Number(l.rentAmount || 0).toLocaleString()} for ${l.property?.name} is due. Please settle via the REMIS portal.`);
                                                        window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
                                                    }}
                                                >
                                                    <MessageSquare size={13} /> Send WhatsApp Reminder
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                            No active lease agreements found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 4: REPAIRS (MILESTONE 3) */}
                {activeTab === 'repairs' && (
                    <div className="landlord-card">
                        <h3>Reported Maintenance & Repair Tickets</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Resolve tenant reported defects, manage contractor dispatches, and track statutory maintenance compliance.
                        </p>

                        <table className="landlord-table">
                            <thead>
                                <tr>
                                    <th>Reported</th>
                                    <th>Priority</th>
                                    <th>Title & Description</th>
                                    <th>Status</th>
                                    <th>Resolution Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allTickets.length > 0 ? (
                                    allTickets.map((t: any) => (
                                        <tr key={t.id}>
                                            <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: t.priority === 'HIGH' || t.priority === 'EMERGENCY' ? '#fef2f2' : '#fefce8',
                                                    color: t.priority === 'HIGH' || t.priority === 'EMERGENCY' ? '#dc2626' : '#ca8a04'
                                                }}>
                                                    {t.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <strong>{t.title}</strong>
                                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#475569' }}>{t.description}</p>
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontWeight: 700,
                                                    fontSize: '0.8rem',
                                                    color: t.status === 'RESOLVED' ? '#059669' : '#0284c7'
                                                }}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td>
                                                {t.status !== 'RESOLVED' ? (
                                                    <button
                                                        className="action-chip resolve"
                                                        onClick={() => handleUpdateRepairStatus(t.id, 'RESOLVED')}
                                                    >
                                                        <CheckCircle2 size={14} /> Mark Resolved
                                                    </button>
                                                ) : (
                                                    <span style={{ color: '#059669', fontSize: '0.8rem' }}>✓ Closed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                            No maintenance issues reported across your properties.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            {/* Edit Property Modal for Landlord */}
            {editingProperty && (
                <div className="landlord-modal-backdrop">
                    <div className="landlord-modal-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '10px' }}>
                                    <Edit2 size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Edit Real Estate Property</h3>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Update real estate specifications & details</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditingProperty(null)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {editError && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#b91c1c',
                                fontSize: '0.85rem',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <AlertTriangle size={16} />
                                <span>{editError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveEdit}>
                            <div className="landlord-form-grid">
                                <div className="landlord-form-group full-width">
                                    <label>Property Name / Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editFormData.name || ''}
                                        onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                        placeholder="e.g. Prime Executive Suites"
                                    />
                                </div>

                                <div className="landlord-form-group">
                                    <label>Property Type</label>
                                    <select
                                        value={editFormData.type || 'RESIDENTIAL'}
                                        onChange={e => setEditFormData({ ...editFormData, type: e.target.value })}
                                    >
                                        <option value="RESIDENTIAL">Residential</option>
                                        <option value="COMMERCIAL">Commercial</option>
                                        <option value="LAND">Land</option>
                                        <option value="INDUSTRIAL">Industrial</option>
                                        <option value="RETAIL">Retail</option>
                                    </select>
                                </div>

                                <div className="landlord-form-group">
                                    <label>Listing Type</label>
                                    <select
                                        value={editFormData.listing_type || 'LEASE'}
                                        onChange={e => setEditFormData({ ...editFormData, listing_type: e.target.value })}
                                    >
                                        <option value="LEASE">For Lease / Rent</option>
                                        <option value="SALE">For Sale</option>
                                    </select>
                                </div>

                                <div className="landlord-form-group">
                                    <label>Status</label>
                                    <select
                                        value={editFormData.status || 'AVAILABLE'}
                                        onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                                    >
                                        <option value="AVAILABLE">AVAILABLE</option>
                                        <option value="LEASED">LEASED</option>
                                        <option value="UNDER_OFFER">UNDER OFFER</option>
                                        <option value="MAINTENANCE">MAINTENANCE</option>
                                    </select>
                                </div>

                                <div className="landlord-form-group">
                                    <label>Price / Monthly Rent (ZMW)</label>
                                    <input
                                        type="number"
                                        value={editFormData.sale_price || ''}
                                        onChange={e => setEditFormData({ ...editFormData, sale_price: e.target.value })}
                                        placeholder="e.g. 15000"
                                    />
                                </div>

                                <div className="landlord-form-group full-width">
                                    <label>Physical Address / Street</label>
                                    <input
                                        type="text"
                                        value={editFormData.address || ''}
                                        onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                                        placeholder="e.g. Plot 43477, Mushitala-Golf Area"
                                    />
                                </div>

                                <div className="landlord-form-group">
                                    <label>Province</label>
                                    <input
                                        type="text"
                                        value={editFormData.province || ''}
                                        onChange={e => setEditFormData({ ...editFormData, province: e.target.value })}
                                        placeholder="e.g. North-Western"
                                    />
                                </div>

                                <div className="landlord-form-group">
                                    <label>District / City</label>
                                    <input
                                        type="text"
                                        value={editFormData.district || ''}
                                        onChange={e => setEditFormData({ ...editFormData, district: e.target.value })}
                                        placeholder="e.g. Solwezi"
                                    />
                                </div>

                                <div className="landlord-form-group">
                                    <label>Land Area (sqm or Ha)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={editFormData.landArea || ''}
                                        onChange={e => setEditFormData({ ...editFormData, landArea: e.target.value })}
                                        placeholder="e.g. 11000"
                                    />
                                </div>

                                <div className="landlord-form-group">
                                    <label>Parking Spaces</label>
                                    <input
                                        type="number"
                                        value={editFormData.parking_spaces || ''}
                                        onChange={e => setEditFormData({ ...editFormData, parking_spaces: e.target.value })}
                                        placeholder="e.g. 10"
                                    />
                                </div>

                                <div className="landlord-form-group full-width">
                                    <label>Description</label>
                                    <textarea
                                        rows={3}
                                        value={editFormData.description || ''}
                                        onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                                        placeholder="Detailed description of the property..."
                                    />
                                </div>

                                {/* Property Photos & Media Gallery */}
                                <div className="landlord-form-group full-width" style={{ marginTop: '0.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <div>
                                            <label style={{ display: 'block', margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                                                📸 Property Photos & Media Gallery
                                            </label>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                {(editFormData.images || []).length === 0
                                                    ? 'No photos uploaded yet. Upload images below to boost tenant inquiries.'
                                                    : `${editFormData.images.length} photo${editFormData.images.length === 1 ? '' : 's'} attached. First image is the public listing cover.`}
                                            </span>
                                        </div>
                                        {(editFormData.images || []).length > 0 && (
                                            <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                                                {editFormData.images.length} Photos
                                            </span>
                                        )}
                                    </div>

                                    {/* Thumbnails Grid */}
                                    {(editFormData.images || []).length > 0 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
                                            {editFormData.images.map((img: string, idx: number) => (
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
                                                            fontWeight: 800,
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
                                                                onClick={() => handleSetCoverPhoto(idx)}
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
                                                            onClick={() => handleRemovePhoto(idx)}
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

                                    {/* Upload and URL Controls */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <label style={{
                                            padding: '0.85rem 1rem',
                                            border: '2px dashed #94a3b8',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            cursor: uploadingPhotos ? 'not-allowed' : 'pointer',
                                            backgroundColor: '#ffffff',
                                            color: '#475569',
                                            fontSize: '0.825rem',
                                            fontWeight: 700,
                                            transition: 'all 0.15s'
                                        }}>
                                            {uploadingPhotos ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" color="#0284c7" />
                                                    <span>Uploading Photos...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={16} color="#0284c7" />
                                                    <span>Upload Photos (Multi-Select)</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handlePhotoUpload}
                                                style={{ display: 'none' }}
                                                disabled={uploadingPhotos}
                                            />
                                        </label>

                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <input
                                                type="text"
                                                value={newPhotoUrl}
                                                onChange={(e) => setNewPhotoUrl(e.target.value)}
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
                                                        handleAddPhotoByUrl();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddPhotoByUrl}
                                                style={{
                                                    padding: '0 0.85rem',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    background: '#0284c7',
                                                    color: '#ffffff',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                + Add URL
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingProperty(null)}
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
                                    type="submit"
                                    disabled={savingEdit}
                                    style={{
                                        padding: '0.7rem 1.4rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: savingEdit ? '#94a3b8' : '#0284c7',
                                        color: '#ffffff',
                                        fontWeight: 700,
                                        cursor: savingEdit ? 'not-allowed' : 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {savingEdit ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        'Save & Update Property'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Property Confirmation Modal for Landlord */}
            {propertyToDelete && (
                <div className="landlord-modal-backdrop">
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '460px',
                        width: '100%',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#dc2626' }}>
                            <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Delete Property?</h3>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Action cannot be reversed</span>
                            </div>
                        </div>

                        <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                            Are you sure you want to delete <strong>{propertyToDelete.name}</strong>?
                            This will remove the listing and all related applications. Properties with active leases cannot be deleted.
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
                                disabled={deletingProperty}
                                style={{
                                    padding: '0.7rem 1.4rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: deletingProperty ? '#94a3b8' : '#dc2626',
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    cursor: deletingProperty ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Trash2 size={16} />
                                {deletingProperty ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
                    </>
                )}
            </main>
        </div>
    );
};

export default LandlordHub;
