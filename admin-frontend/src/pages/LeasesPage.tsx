import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import LeaseFormModal from '../components/LeaseFormModal';
import './LeasesPage.css';

interface Lease {
    id: string;
    startDate: string;
    endDate: string;
    rentAmount: string;
    frequency: string;
    status: string;
    property: {
        id: string;
        name: string;
        address: string;
    };
    renter: {
        id: string;
        name: string;
    };
}

const LeasesPage: React.FC = () => {
    const [leases, setLeases] = useState<Lease[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;

    useEffect(() => {
        fetchLeases();
    }, []);

    const fetchLeases = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/leases?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setLeases(data);
            }
        } catch (error) {
            console.error('Error fetching leases:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        fetchLeases();
    };

    // ... render helpers ...

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'status-active';
            case 'pending': return 'status-pending';
            case 'expired': return 'status-expired';
            case 'terminated': return 'status-terminated';
            default: return 'status-active';
        }
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(parseFloat(amount));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const [selectedLease, setSelectedLease] = useState<Lease | null>(null);

    const handleViewLease = (lease: Lease) => {
        setSelectedLease(lease);
    };

    const handleCloseDetailModal = () => {
        setSelectedLease(null);
    };

    const [editingLease, setEditingLease] = useState<Lease | null>(null);

    const handleEditLease = () => {
        if (selectedLease) {
            setEditingLease(selectedLease);
            setSelectedLease(null); // Close detail modal
            setShowModal(true); // Open form modal
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingLease(null);
    };

    return (
        <div className="leases-page">
            <div className="leases-header">
                <div className="leases-title">
                    <h1>Lease Management</h1>
                    <p>Manage lease agreements, contracts, and renewals.</p>
                </div>
                <div className="leases-actions">
                    <button className="create-btn" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        New Lease
                    </button>
                </div>
            </div>

            <LeaseFormModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                initialData={editingLease}
            />

            {/* Detail Modal */}
            {selectedLease && (
                <div className="modal-overlay" onClick={handleCloseDetailModal} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '600px', maxWidth: '95vw',
                        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>Lease Details</h2>
                            <button onClick={handleCloseDetailModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <FileText size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Property</label>
                                    <div style={{ fontSize: '1rem', fontWeight: '500', color: '#111827' }}>{selectedLease.property.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{selectedLease.property.address}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Tenant</label>
                                    <div style={{ fontSize: '1rem', fontWeight: '500', color: '#111827' }}>{selectedLease.renter.name}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Contract Period</label>
                                    <div style={{ fontSize: '1rem', color: '#111827' }}>{formatDate(selectedLease.startDate)} - {formatDate(selectedLease.endDate)}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Status</label>
                                    <span className={`status-badge ${getStatusClass(selectedLease.status)}`} style={{ display: 'inline-block', marginTop: '0.25rem' }}>
                                        {selectedLease.status}
                                    </span>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Rent Amount</label>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#10b981' }}>{formatCurrency(selectedLease.rentAmount)}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>{selectedLease.frequency.toLowerCase()}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                                <button
                                    onClick={handleCloseDetailModal}
                                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                                <button
                                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer' }}
                                    onClick={handleEditLease}
                                >
                                    Edit Lease
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="leases-table-container">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading leases...</div>
                ) : leases.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>
                        <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No leases found</h3>
                        <p>Create a new lease to get started.</p>
                    </div>
                ) : (
                    <table className="leases-table">
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Tenant / Renter</th>
                                <th>Term</th>
                                <th>Rent Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leases.map(lease => (
                                <tr
                                    key={lease.id}
                                    onClick={() => handleViewLease(lease)}
                                    style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{lease.property.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{lease.property.address}</div>
                                    </td>
                                    <td>
                                        {lease.renter.name}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span>{formatDate(lease.startDate)} - {formatDate(lease.endDate)}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Period</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{formatCurrency(lease.rentAmount)}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{lease.frequency}</div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(lease.status)}`}>
                                            {lease.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewLease(lease);
                                            }}
                                            style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                                        >
                                            View
                                        </button>
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

export default LeasesPage;
