import React, { useState, useEffect } from 'react';
import { Plus, Users, Mail, Phone, Briefcase, X, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './VendorsPage.css';

interface Vendor {
    vendor_id: string;
    name: string;
    email: string;
    phone: string;
    category: string;
    status: string;
}

const VendorsPage: React.FC = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        category: '',
        status: 'ACTIVE'
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;
    const { showToast } = useToast();

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/vendors?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setVendors(data);
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, tenantId })
            });

            if (!res.ok) throw new Error('Failed to create vendor');

            showToast('Vendor added successfully', 'success');
            setShowModal(false);
            setFormData({ name: '', email: '', phone: '', category: '', status: 'ACTIVE' });
            fetchVendors();
        } catch (error) {
            console.error('Error creating vendor:', error);
            showToast('Failed to add vendor', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vendor?')) return;
        try {
            const res = await fetch(`http://localhost:4000/api/vendors/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Vendor deleted', 'success');
                fetchVendors();
            }
        } catch (error) {
            console.error('Error deleting vendor:', error);
        }
    };

    return (
        <div className="vendors-page">
            <div className="vendors-header">
                <div className="vendors-title">
                    <h1>Vendor Management</h1>
                    <p>Manage suppliers, contractors, and service providers.</p>
                </div>
                <div className="vendors-actions">
                    <button className="create-btn" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        New Vendor
                    </button>
                </div>
            </div>

            {/* Create Vendor Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '500px', maxWidth: '90vw',
                        padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                            Add New Vendor
                            <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
                        </h2>
                        <form onSubmit={handleCreateVendor}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Full Name / Company Name</label>
                                <div style={{ position: 'relative' }}>
                                    <Users size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                        placeholder="Vendor Name"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Phone</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                            placeholder="Phone Number"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Category</label>
                                <div style={{ position: 'relative' }}>
                                    <Briefcase size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white' }}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Plumbing">Plumbing</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Cleaning">Cleaning</option>
                                        <option value="Security">Security</option>
                                        <option value="Legal">Legal</option>
                                        <option value="Consulting">Consulting</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white' }}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer' }}>Add Vendor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="vendors-table-container">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading vendors...</div>
                ) : vendors.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>
                        <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No vendors found</h3>
                        <p>Add vendors to manage your suppliers.</p>
                    </div>
                ) : (
                    <table className="vendors-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map(vendor => (
                                <tr key={vendor.vendor_id}>
                                    <td>
                                        <div style={{ fontWeight: '600', color: '#111827' }}>{vendor.name}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mail size={14} color="#6b7280" /> {vendor.email || '-'}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <Phone size={14} color="#6b7280" /> {vendor.phone || '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: '#4b5563' }}>
                                            {vendor.category || 'General'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${vendor.status.toLowerCase()}`}>
                                            {vendor.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vendor.vendor_id)}
                                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default VendorsPage;
