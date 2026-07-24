
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronDown, ChevronRight, Edit2, Trash2, X, Building, Phone, Mail, MapPin, Link as LinkIcon } from 'lucide-react';
import './LandlordsPage.css';
import { useToast } from '../hooks/useToast';
import LinkPropertyModal from '../components/LinkPropertyModal';
import CreatePropertyModal from '../components/CreatePropertyModal';

interface Property {
    id: string;
    name: string;
    type: string;
    status: string;
    address?: string;
    rent?: number;
    updatedAt: string;
}

interface Landlord {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    properties: Property[];
    address?: string;
    notes?: string;
    idNumber?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
}

const LandlordsPage: React.FC = () => {
    const [landlords, setLandlords] = useState<Landlord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingLandlord, setEditingLandlord] = useState<Landlord | null>(null);
    const [linkingLandlord, setLinkingLandlord] = useState<Landlord | null>(null);
    const [creatingPropertyLandlord, setCreatingPropertyLandlord] = useState<Landlord | null>(null);
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', address: '',
        idNumber: '', bankName: '', accountNumber: '', accountName: '', notes: ''
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;

    useEffect(() => {
        fetchLandlords();
    }, []);

    const fetchLandlords = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/landlords?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setLandlords(data);
            }
        } catch (error) {
            console.error('Error fetching landlords:', error);
            showToast('Failed to fetch landlords', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (landlord?: Landlord) => {
        if (landlord) {
            setEditingLandlord(landlord);
            setFormData({
                firstName: landlord.firstName,
                lastName: landlord.lastName,
                email: landlord.email,
                phone: landlord.phone,
                address: landlord.address || '',
                idNumber: landlord.idNumber || '',
                bankName: landlord.bankName || '',
                accountNumber: landlord.accountNumber || '',
                accountName: landlord.accountName || '',
                notes: landlord.notes || ''
            });
        } else {
            setEditingLandlord(null);
            setFormData({
                firstName: '', lastName: '', email: '', phone: '', address: '',
                idNumber: '', bankName: '', accountNumber: '', accountName: '', notes: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingLandlord
            ? `http://localhost:4000/api/landlords/${editingLandlord.id}`
            : 'http://localhost:4000/api/landlords';

        const method = editingLandlord ? 'PUT' : 'POST';
        const body = { ...formData, tenantId };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                showToast(`Landlord ${editingLandlord ? 'updated' : 'created'} successfully`, 'success');
                setShowModal(false);
                fetchLandlords();
            } else {
                showToast('Operation failed', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('An error occurred', 'error');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this landlord?')) return;

        try {
            const res = await fetch(`http://localhost:4000/api/landlords/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Landlord deleted', 'success');
                fetchLandlords();
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to delete', 'error');
            }
        } catch (error) {
            showToast('Delete failed', 'error');
        }
    };

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleLinkProperty = async (propertyId: string) => {
        if (!linkingLandlord) return;
        try {
            const res = await fetch(`http://localhost:4000/api/properties/${propertyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ landlordId: linkingLandlord.id })
            });

            if (res.ok) {
                showToast('Property linked successfully', 'success');
                setLinkingLandlord(null);
                fetchLandlords();
            } else {
                showToast('Failed to link property', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error linking property', 'error');
        }
    };

    const filteredLandlords = landlords.filter(l =>
        l.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="landlords-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Landlords</h1>
                    <p className="page-subtitle">Manage property owners and their portfolios</p>
                </div>
                <button onClick={() => handleOpenModal()} className="action-button" aria-label="Add new landlord">
                    <Plus size={20} />
                    Add Landlord
                </button>
            </div>

            <div className="search-bar">
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '10px', color: '#9ca3af' }} />
                <input
                    type="text"
                    placeholder="Search landlords..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="table-container">
                <table className="landlords-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}></th>
                            <th>Name</th>
                            <th>Contact Info</th>
                            <th>Properties</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                        ) : filteredLandlords.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No landlords found.</td></tr>
                        ) : (
                            filteredLandlords.map(landlord => (
                                <React.Fragment key={landlord.id}>
                                    <tr className="landlord-row" onClick={() => toggleRow(landlord.id)}>
                                        <td>
                                            {expandedRow === landlord.id ? <ChevronDown size={20} color="#6b7280" /> : <ChevronRight size={20} color="#6b7280" />}
                                        </td>
                                        <td style={{ fontWeight: '500' }}>{landlord.firstName} {landlord.lastName}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {landlord.email}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {landlord.phone}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                backgroundColor: '#eff6ff', color: '#1d4ed8',
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600'
                                            }}>
                                                {landlord.properties.length} Properties
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenModal(landlord); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', color: '#6b7280' }}
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(landlord.id, e)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRow === landlord.id && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: 0 }}>
                                                <div className="expanded-row-content">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                                                            <Building size={18} /> Property Portfolio
                                                        </h4>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setLinkingLandlord(landlord); }}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                                    padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1',
                                                                    backgroundColor: 'white', color: '#475569', fontSize: '0.8rem', fontWeight: '600',
                                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
                                                            >
                                                                <LinkIcon size={14} /> Link Property
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setCreatingPropertyLandlord(landlord); }}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                                    padding: '6px 12px', borderRadius: '6px', border: 'none',
                                                                    backgroundColor: '#3b82f6', color: 'white', fontSize: '0.8rem', fontWeight: '600',
                                                                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                                                            >
                                                                <Plus size={14} /> Add Property
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {landlord.properties.length > 0 ? (
                                                        <table className="properties-subtable">
                                                            <thead>
                                                                <tr>
                                                                    <th>Property Name</th>
                                                                    <th>Type</th>
                                                                    <th>Status</th>
                                                                    <th>Location (Address)</th>
                                                                    <th>Rent (Est)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {landlord.properties.map(p => (
                                                                    <tr
                                                                        key={p.id}
                                                                        onClick={() => navigate(`/properties/${p.id}`)}
                                                                        style={{ cursor: 'pointer' }}
                                                                        className="clickable-row"
                                                                    >
                                                                        <td style={{ fontWeight: '500' }}>{p.name}</td>
                                                                        <td>{p.type}</td>
                                                                        <td>
                                                                            <span className={`status-badge status-${p.status.toLowerCase()}`}>
                                                                                {p.status}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <MapPin size={14} color="#94a3b8" /> {p.address || 'N/A'}
                                                                        </td>
                                                                        <td>{p.rent ? `K${p.rent.toLocaleString()}` : '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                                            No properties linked to this landlord.
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">{editingLandlord ? 'Edit Landlord' : 'Add New Landlord'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="#6b7280" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Information</h4>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input required className="form-input" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <input required className="form-input" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Phone *</label>
                                    <input required className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Address</label>
                                <input className="form-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            </div>

                            <h4 style={{ margin: '1.5rem 0 1rem 0', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financial Details</h4>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Bank Name</label>
                                    <input className="form-input" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Account Number</label>
                                    <input className="form-input" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Account Name</label>
                                <input className="form-input" value={formData.accountName} onChange={e => setFormData({ ...formData, accountName: e.target.value })} />
                            </div>

                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Notes</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Cancel</button>
                                <button type="submit" className="btn-submit">{editingLandlord ? 'Update Landlord' : 'Create Landlord'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {linkingLandlord && (
                <LinkPropertyModal
                    isOpen={!!linkingLandlord}
                    onClose={() => setLinkingLandlord(null)}
                    onLink={handleLinkProperty}
                    tenantId={tenantId}
                    landlordName={`${linkingLandlord.firstName} ${linkingLandlord.lastName}`}
                />
            )}

            {creatingPropertyLandlord && (
                <CreatePropertyModal
                    isOpen={!!creatingPropertyLandlord}
                    onClose={() => setCreatingPropertyLandlord(null)}
                    onSuccess={() => {
                        fetchLandlords(); // Refresh list to show new property
                        showToast('Property created successfully', 'success');
                    }}
                    initialLandlordId={creatingPropertyLandlord.id}
                />
            )}
        </div>
    );
};

export default LandlordsPage;
