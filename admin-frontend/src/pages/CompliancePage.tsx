import React, { useState, useEffect } from 'react';
import {
    AlertCircle, CheckCircle, Clock, FileText,
    Plus, Search, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './CompliancePage.css';

interface ComplianceRecord {
    id: string;
    propertyId: string;
    title: string;
    type: string;
    status: string;
    authority?: string;
    expiryDate?: string;
    property: {
        name: string;
    };
}

interface ComplianceStats {
    expired: number;
    compliant: number;
    warning: number;
    pending: number;
}

const CompliancePage: React.FC = () => {
    const [records, setRecords] = useState<ComplianceRecord[]>([]);
    const [stats, setStats] = useState<ComplianceStats>({ expired: 0, compliant: 0, warning: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [newItem, setNewItem] = useState({
        title: '',
        type: 'FIRE',
        status: 'PENDING',
        propertyId: '',
        expiryDate: '',
        authority: '',
        notes: ''
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recordsRes, statsRes] = await Promise.all([
                fetch(`http://localhost:4000/api/compliance?tenantId=${tenantId}`),
                fetch(`http://localhost:4000/api/compliance/stats?tenantId=${tenantId}`)
            ]);

            const recordsData = await recordsRes.json();
            const statsData = await statsRes.json();

            if (Array.isArray(recordsData)) setRecords(recordsData);
            if (statsData) setStats(statsData);
        } catch (error) {
            console.error('Error fetching compliance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Need to select a property. For MVP, we might need a property selector dropdown.
            // Assuming user inputs Property ID manually or we fetch properties to populate select.
            // For now, simple textual input or placeholder.

            const res = await fetch('http://localhost:4000/api/compliance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newItem, tenantId })
            });

            if (res.ok) {
                setShowModal(false);
                fetchData();
                setNewItem({ title: '', type: 'FIRE', status: 'PENDING', propertyId: '', expiryDate: '', authority: '', notes: '' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLIANT': return <span className="status-badge status-compliant"><CheckCircle size={12} style={{ marginRight: 4 }} /> Compliant</span>;
            case 'EXPIRED': return <span className="status-badge status-expired"><AlertCircle size={12} style={{ marginRight: 4 }} /> Expired</span>;
            case 'WARNING': return <span className="status-badge status-warning"><AlertTriangle size={12} style={{ marginRight: 4 }} /> Expiring Soon</span>;
            default: return <span className="status-badge status-pending"><Clock size={12} style={{ marginRight: 4 }} /> {status}</span>;
        }
    };

    return (
        <div className="compliance-page">
            <div className="compliance-header">
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Compliance & Regulatory</h1>
                    <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>Track certifications, insurance, and inspections.</p>
                </div>
                <button className="action-btn" onClick={() => setShowModal(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Record
                </button>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-title">Expired Items</div>
                    <div className="kpi-value" style={{ color: '#dc2626' }}>{stats.expired}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-title">Expiring Soon</div>
                    <div className="kpi-value" style={{ color: '#d97706' }}>{stats.warning}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-title">Fully Compliant</div>
                    <div className="kpi-value" style={{ color: '#059669' }}>{stats.compliant}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-title">Pending Review</div>
                    <div className="kpi-value">{stats.pending}</div>
                </div>
            </div>

            <div className="compliance-table-container">
                <table className="compliance-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Property</th>
                            <th>Type</th>
                            <th>Authority</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(record => (
                            <tr key={record.id}>
                                <td style={{ fontWeight: 500 }}>{record.title}</td>
                                <td>{record.property?.name || 'N/A'}</td>
                                <td>{record.type}</td>
                                <td>{record.authority || '-'}</td>
                                <td>{record.expiryDate ? new Date(record.expiryDate).toLocaleDateString() : '-'}</td>
                                <td>{getStatusBadge(record.status)}</td>
                            </tr>
                        ))}
                        {records.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    No compliance records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Simple Modal for MVP */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '500px',
                        padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>New Compliance Record</h2>
                        <form onSubmit={handleCreate}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Title</label>
                                    <input required type="text" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Property ID (UUID)</label>
                                    <input required type="text" value={newItem.propertyId} onChange={e => setNewItem({ ...newItem, propertyId: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} placeholder="Enter Property ID" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Type</label>
                                        <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                                            <option value="FIRE">Fire Safety</option>
                                            <option value="HEALTH">Health & Safety</option>
                                            <option value="INSURANCE">Insurance</option>
                                            <option value="TAX">Tax</option>
                                            <option value="ZONING">Zoning</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Status</label>
                                        <select value={newItem.status} onChange={e => setNewItem({ ...newItem, status: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                                            <option value="PENDING">Pending</option>
                                            <option value="COMPLIANT">Compliant</option>
                                            <option value="WARNING">Warning</option>
                                            <option value="EXPIRED">Expired</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Expiry Date</label>
                                    <input type="date" value={newItem.expiryDate} onChange={e => setNewItem({ ...newItem, expiryDate: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer' }}>Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompliancePage;
