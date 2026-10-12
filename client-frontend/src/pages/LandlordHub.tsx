import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Users, DollarSign, Wrench, PlusCircle, CheckCircle2,
    Calendar, Phone, MapPin, Eye, FileText, ArrowRight, ShieldCheck,
    AlertCircle, MessageSquare, Clock, Search, ChevronRight, X
} from 'lucide-react';
import './LandlordHub.css';

const API_BASE = 'http://localhost:4000/api';

export const LandlordHub: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'properties' | 'applications' | 'rentroll' | 'repairs'>('properties');
    const [loading, setLoading] = useState(true);
    const [landlordData, setLandlordData] = useState<any>(null);
    const [authPhone, setAuthPhone] = useState('');

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

    const properties = landlordData?.properties || [];
    const applications = landlordData?.applications || [];
    const allLeases = properties.flatMap((p: any) => p.leases || []);
    const allTickets = properties.flatMap((p: any) => p.maintenance || []);

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

                {/* TAB 1: PROPERTIES */}
                {activeTab === 'properties' && (
                    <div className="landlord-card">
                        <h3>My Managed Real Estate Properties</h3>
                        <table className="landlord-table">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Type</th>
                                    <th>Address / District</th>
                                    <th>Active Leases</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.map((p: any) => (
                                    <tr key={p.id}>
                                        <td>
                                            <strong style={{ color: '#0f172a' }}>{p.name}</strong>
                                        </td>
                                        <td>{p.type}</td>
                                        <td>{p.address || p.district || 'Lusaka'}</td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>{p.leases?.length || 0} Leases</span>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                background: p.status === 'AVAILABLE' ? '#ecfdf5' : '#f8fafc',
                                                color: p.status === 'AVAILABLE' ? '#059669' : '#334155'
                                            }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-text"
                                                onClick={() => navigate(`/property/${p.id}`)}
                                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                <Eye size={14} /> Preview
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                    </>
                )}
            </main>
        </div>
    );
};

export default LandlordHub;
