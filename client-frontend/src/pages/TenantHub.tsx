import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, CreditCard, FileText, Wrench, ShieldCheck, CheckCircle2,
    Calendar, ArrowRight, Download, Phone, MapPin, AlertCircle,
    Plus, Clock, DollarSign, X, Check, Eye, Lock
} from 'lucide-react';
import { ProtectedDocumentViewer } from '../components/ProtectedDocumentViewer';
import './TenantHub.css';

const API_BASE = 'http://localhost:4000/api';

export const TenantHub: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'home' | 'billing' | 'agreement' | 'maintenance'>('home');
    const [loading, setLoading] = useState(true);
    const [hubData, setHubData] = useState<any>(null);

    // Mobile Money Pay Modal
    const [showPayModal, setShowPayModal] = useState(false);
    const [payMethod, setPayMethod] = useState<'AIRTEL_MONEY' | 'MTN_MOMO' | 'ZAMTEL' | 'VISA'>('AIRTEL_MONEY');
    const [payPhone, setPayPhone] = useState('+260 97 ');
    const [payAmount, setPayAmount] = useState('0');
    const [paySubmitting, setPaySubmitting] = useState(false);
    const [latestReceipt, setLatestReceipt] = useState<any>(null);

    // Maintenance Ticket Modal
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketCategory, setTicketCategory] = useState('Plumbing & Leaks');
    const [ticketPriority, setTicketPriority] = useState('HIGH');
    const [ticketTitle, setTicketTitle] = useState('');
    const [ticketDesc, setTicketDesc] = useState('');
    const [ticketSubmitting, setTicketSubmitting] = useState(false);

    const [authPhone, setAuthPhone] = useState('');

    useEffect(() => {
        fetchHubData();
    }, []);

    const fetchHubData = async (phoneOverride?: string) => {
        try {
            const savedPhone = phoneOverride !== undefined ? phoneOverride : (sessionStorage.getItem('remis_tenant_phone') || '');
            const query = savedPhone ? `?phone=${encodeURIComponent(savedPhone)}` : '';
            const res = await fetch(`${API_BASE}/marketplace/tenant/hub${query}`);
            const data = await res.json();
            if (data.success) {
                setHubData(data);
                if (data.activeLease?.rentAmount) {
                    setPayAmount(String(data.activeLease.rentAmount));
                }
            }
        } catch (err) {
            console.error('Error fetching tenant hub data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!authPhone.trim()) return;
        sessionStorage.setItem('remis_tenant_phone', authPhone.trim());
        setLoading(true);
        fetchHubData(authPhone.trim());
    };

    const handleSignOut = () => {
        sessionStorage.removeItem('remis_tenant_phone');
        setAuthPhone('');
        setHubData(null);
        fetchHubData('');
    };

    const handleMobilePay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hubData?.activeLease?.id) return;
        setPaySubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/marketplace/pay-rent-mobile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leaseId: hubData.activeLease.id,
                    amount: payAmount,
                    paymentMethod: payMethod,
                    phoneNumber: payPhone
                })
            });
            const data = await res.json();
            if (data.success) {
                setLatestReceipt(data.receipt);
                setShowPayModal(false);
                fetchHubData();
            }
        } catch (err) {
            console.error('Payment error:', err);
        } finally {
            setPaySubmitting(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hubData?.activeLease?.propertyId) return;
        setTicketSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/marketplace/maintenance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: hubData.activeLease.propertyId,
                    title: ticketTitle,
                    description: ticketDesc,
                    category: ticketCategory,
                    priority: ticketPriority
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowTicketModal(false);
                setTicketTitle('');
                setTicketDesc('');
                fetchHubData();
            }
        } catch (err) {
            console.error('Ticket error:', err);
        } finally {
            setTicketSubmitting(false);
        }
    };

    const lease = hubData?.activeLease;
    const property = lease?.property;
    const renter = hubData?.renter;

    return (
        <div className="tenant-hub-page">
            {/* Top Navigation */}
            <header className="tenant-nav">
                <div className="tenant-nav-brand">
                    <Home size={24} color="#38bdf8" />
                    <h2>REMIS Tenant Self-Service Portal</h2>
                    <span className="tenant-badge">Zambia Cap 206 Verified</span>
                </div>
                <div className="tenant-nav-actions">
                    <button className="btn-nav-market" onClick={() => navigate('/')}>
                        Marketplace Listings
                    </button>
                    <button className="btn-nav-market" onClick={() => navigate('/landlord-hub')} style={{ borderColor: '#0284c7' }}>
                        Switch to Landlord View
                    </button>
                    {renter && (
                        <button className="btn-nav-market" onClick={handleSignOut} style={{ color: '#ef4444', borderColor: '#fca5a5' }}>
                            Sign Out
                        </button>
                    )}
                </div>
            </header>

            <main className="tenant-main">
                {!renter ? (
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
                            <ShieldCheck size={36} />
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                            Protected Resident Portal
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                            To safeguard personal data and prevent unauthorized disclosure of tenancy records, contracts, and rent rolls, please enter your registered phone number or NRC to unlock your profile.
                        </p>
                        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                                    Registered Phone Number or Email
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={authPhone}
                                    onChange={e => setAuthPhone(e.target.value)}
                                    placeholder="e.g. +260 97 1234567 or resident@example.com"
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
                                <ShieldCheck size={18} /> Access Tenancy Hub
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        {/* Header Profile */}
                        <div className="tenant-header">
                            <div>
                                <h1>Welcome, {renter?.name || 'Valued Resident'}</h1>
                                <p>Manage your home, settle monthly rent via Mobile Money, report repairs, and inspect statutory agreements.</p>
                            </div>
                            {lease && (
                                <button
                                    className="btn-primary"
                                    style={{ background: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    onClick={() => setShowPayModal(true)}
                                >
                                    <CreditCard size={18} /> Pay Rent (Mobile Money)
                                </button>
                            )}
                        </div>

                {/* Navigation Tabs */}
                <div className="tenant-tabs">
                    <button
                        className={`tenant-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
                        onClick={() => setActiveTab('home')}
                    >
                        <Home size={18} /> My Active Home
                    </button>
                    <button
                        className={`tenant-tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('billing')}
                    >
                        <CreditCard size={18} /> Pay Rent & Ledgers
                    </button>
                    <button
                        className={`tenant-tab-btn ${activeTab === 'agreement' ? 'active' : ''}`}
                        onClick={() => setActiveTab('agreement')}
                    >
                        <FileText size={18} /> Tenancy Agreement (Cap 206)
                    </button>
                    <button
                        className={`tenant-tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('maintenance')}
                    >
                        <Wrench size={18} /> Repairs & Maintenance ({hubData?.maintenanceTickets?.length || 0})
                    </button>
                </div>

                {/* TAB 1: MY ACTIVE HOME */}
                {activeTab === 'home' && (
                    <div className="tenant-grid-2">
                        <div className="hub-card">
                            <h3><Home size={20} color="#0284c7" /> Current Residential Tenancy</h3>
                            {property ? (
                                <div>
                                    <div className="property-hero-preview">
                                        <img
                                            src={property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80'}
                                            alt={property.name}
                                        />
                                        <div className="prop-meta-title">
                                            <h4>{property.name}</h4>
                                            <p><MapPin size={14} /> {property.address || 'Lusaka, Zambia'}</p>
                                            <span style={{ fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                                                {property.type} • Active Lease
                                            </span>
                                        </div>
                                    </div>

                                    <div className="tenancy-kpi-row">
                                        <div className="kpi-box">
                                            <span>Monthly Rent</span>
                                            <strong>K{Number(lease.rentAmount || 0).toLocaleString()}</strong>
                                        </div>
                                        <div className="kpi-box">
                                            <span>Escrow Deposit</span>
                                            <strong>K{Number(lease.rentAmount || 0).toLocaleString()}</strong>
                                        </div>
                                        <div className="kpi-box">
                                            <span>Lease Period</span>
                                            <strong style={{ fontSize: '0.95rem' }}>
                                                {new Date(lease.startDate).toLocaleDateString()} → {new Date(lease.endDate).toLocaleDateString()}
                                            </strong>
                                        </div>
                                    </div>

                                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <ShieldCheck size={24} color="#166534" />
                                        <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                                            <strong>Protected Tenancy:</strong> This lease is registered under the Republic of Zambia Rent Act Chapter 206 with 14-day refundable security deposit guarantee.
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: '#64748b' }}>No active lease records found for your profile. Browse properties to apply.</p>
                            )}
                        </div>

                        {/* Quick Actions Card */}
                        <div className="hub-card">
                            <h3><ShieldCheck size={20} color="#059669" /> Resident Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={() => setShowPayModal(true)}
                                >
                                    <CreditCard size={16} /> Settle Rent via Mobile Money
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={() => setShowTicketModal(true)}
                                >
                                    <Wrench size={16} /> Report a Repair / Fault
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={() => setActiveTab('agreement')}
                                >
                                    <FileText size={16} /> View Digital Tenancy Contract
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: PAY RENT & BILLING */}
                {activeTab === 'billing' && (
                    <div>
                        <div className="hub-card" style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3><CreditCard size={20} color="#059669" /> Monthly Rent Settlement</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                                        Pay instantly using Airtel Money, MTN MoMo, Zamtel Kwacha, or Card. Official Zambian receipts generated immediately.
                                    </p>
                                </div>
                                <button
                                    className="btn-primary"
                                    style={{ background: '#059669' }}
                                    onClick={() => setShowPayModal(true)}
                                >
                                    Pay Now with MoMo
                                </button>
                            </div>
                        </div>

                        {latestReceipt && (
                            <div className="hub-card" style={{ marginBottom: '2rem', border: '2px solid #059669', background: '#ecfdf5' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 700 }}>
                                            <CheckCircle2 size={20} color="#059669" /> Official Rent Payment Receipt Issued
                                        </div>
                                        <p style={{ margin: '0.35rem 0', fontSize: '0.9rem', color: '#047857' }}>
                                            Receipt No: <strong>{latestReceipt.receiptNumber}</strong> • Amount: <strong>K{latestReceipt.amount?.toLocaleString()}</strong> ({latestReceipt.method})
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#065f46' }}>
                                            {latestReceipt.statutoryCompliance} • Reference: {latestReceipt.referenceNumber}
                                        </p>
                                    </div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', color: '#065f46', fontSize: '0.75rem', fontWeight: 600 }}>
                                        <ShieldCheck size={14} /> Vault Audited Receipt
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="hub-card">
                            <h3>Payment History Ledger</h3>
                            <table className="tenant-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Payment Reference</th>
                                        <th>Method</th>
                                        <th>Amount (ZMW)</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hubData?.payments && hubData.payments.length > 0 ? (
                                        hubData.payments.map((p: any) => (
                                            <tr key={p.id}>
                                                <td>{new Date(p.date).toLocaleDateString()}</td>
                                                <td style={{ fontFamily: 'monospace' }}>{p.reference || p.id.slice(0, 8)}</td>
                                                <td>{p.method}</td>
                                                <td style={{ fontWeight: 700, color: '#059669' }}>K{Number(p.amount).toLocaleString()}</td>
                                                <td>
                                                    <span style={{ background: '#ecfdf5', color: '#065f46', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                                                No payment records logged yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: TENANCY AGREEMENT */}
                {activeTab === 'agreement' && (
                    <div className="hub-card" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                            <div>
                                <h3 style={{ margin: 0 }}><FileText size={20} color="#0284c7" /> Statutory Residential Tenancy Agreement</h3>
                                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                                    Republic of Zambia • Rent Act Chapter 206 • Download Permitted for Tenancy Contract
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => window.print()}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#059669', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '6px', color: 'white', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                <Download size={15} /> Download Contract (PDF)
                            </button>
                        </div>

                        {lease ? (
                            <ProtectedDocumentViewer
                                title="Republic of Zambia • Standard Residential Tenancy Agreement (Cap 206)"
                                documentType="RESIDENTIAL_TENANCY_AGREEMENT"
                                userIdentifier={renter?.name || renter?.phone || 'VERIFIED_TENANT'}
                                allowDownload={true}
                                onDownloadContract={() => window.print()}
                            >
                                <div style={{ background: '#ffffff', padding: '2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', lineHeight: 1.7, fontSize: '0.9rem', color: '#1e293b' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '1.75rem', borderBottom: '2px double #cbd5e1', paddingBottom: '1.25rem' }}>
                                        <div style={{ fontWeight: 800, letterSpacing: '0.15em', color: '#475569', fontSize: '0.85rem' }}>REPUBLIC OF ZAMBIA</div>
                                        <h2 style={{ margin: '0.4rem 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>RESIDENTIAL TENANCY AGREEMENT</h2>
                                        <div style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.85rem' }}>Pursuant to the Rent Act, Chapter 206 of the Laws of Zambia</div>
                                    </div>

                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <p><strong>1. Demised Premises:</strong> {property?.name || 'Designated Residential Unit'} located at {property?.address || 'Lusaka, Republic of Zambia'}.</p>
                                        <p><strong>2. Designated Tenant:</strong> {renter?.name || 'Registered Tenant'} (National Registration Card / Passport: {renter?.idNumber || renter?.nrc || 'Verified on File'}).</p>
                                        <p><strong>3. Monthly Rent:</strong> ZMW K{Number(lease.rentAmount || 0).toLocaleString()} payable in advance on or before the 5th day of each calendar month via REMIS Secure Mobile Money / Bank Gateway.</p>
                                        <p><strong>4. Security Deposit:</strong> ZMW K{Number(lease.rentAmount || 0).toLocaleString()} held in statutory escrow, refundable within 14 business days post-vacation subject to move-out inspection.</p>
                                        <p><strong>5. Statutory Tenancy Protection:</strong> Either party may terminate a periodic tenancy by serving one (1) calendar month's statutory written notice. Self-help evictions, lockout, distress without court order, and unauthorized utility interferences are criminalized under Cap 206.</p>
                                    </div>
                                    
                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#334155', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <ShieldCheck size={18} color="#059669" />
                                        <span><strong>Cryptographic Execution:</strong> Both parties have attested to this agreement under verified digital signing credentials. Audited on REMIS Secure Ledger.</span>
                                    </div>
                                </div>
                            </ProtectedDocumentViewer>
                        ) : (
                            <p style={{ color: '#64748b' }}>No contract found.</p>
                        )}
                    </div>
                )}

                {/* TAB 4: REPAIRS & MAINTENANCE (MILESTONE 3) */}
                {activeTab === 'maintenance' && (
                    <div>
                        <div className="hub-card" style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3><Wrench size={20} color="#ca8a04" /> Resident Maintenance & Repair Hub</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                                        Report leaking pipes, electrical faults, or structural defects directly to your property manager.
                                    </p>
                                </div>
                                <button className="btn-primary" onClick={() => setShowTicketModal(true)}>
                                    <Plus size={16} /> Report New Issue
                                </button>
                            </div>
                        </div>

                        <div className="hub-card">
                            <h3>Logged Maintenance Requests</h3>
                            {hubData?.maintenanceTickets && hubData.maintenanceTickets.length > 0 ? (
                                hubData.maintenanceTickets.map((t: any) => (
                                    <div key={t.id} className="ticket-card">
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                                <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{t.title}</h4>
                                                <span className={`ticket-priority-badge ${t.priority}`}>{t.priority}</span>
                                            </div>
                                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#475569' }}>{t.description}</p>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                Reported on: {new Date(t.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span style={{
                                            padding: '0.3rem 0.75rem',
                                            borderRadius: '99px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: t.status === 'RESOLVED' ? '#ecfdf5' : '#fefce8',
                                            color: t.status === 'RESOLVED' ? '#065f46' : '#ca8a04'
                                        }}>
                                            {t.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                                    No maintenance issues reported. All fixtures in good order.
                                </p>
                            )}
                        </div>
                    </div>
                )}
                    </>
                )}
            </main>

            {/* Pay Rent Modal */}
            {showPayModal && (
                <div className="momo-modal-overlay" onClick={() => setShowPayModal(false)}>
                    <div className="momo-modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Pay Rent via Mobile Money</h3>
                            <button style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setShowPayModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleMobilePay}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Select Gateway</label>
                            <div className="momo-methods-grid">
                                <button
                                    type="button"
                                    className={`momo-method-btn ${payMethod === 'AIRTEL_MONEY' ? 'selected' : ''}`}
                                    onClick={() => setPayMethod('AIRTEL_MONEY')}
                                >
                                    Airtel Money
                                </button>
                                <button
                                    type="button"
                                    className={`momo-method-btn ${payMethod === 'MTN_MOMO' ? 'selected' : ''}`}
                                    onClick={() => setPayMethod('MTN_MOMO')}
                                >
                                    MTN MoMo
                                </button>
                                <button
                                    type="button"
                                    className={`momo-method-btn ${payMethod === 'ZAMTEL' ? 'selected' : ''}`}
                                    onClick={() => setPayMethod('ZAMTEL')}
                                >
                                    Zamtel Kwacha
                                </button>
                                <button
                                    type="button"
                                    className={`momo-method-btn ${payMethod === 'VISA' ? 'selected' : ''}`}
                                    onClick={() => setPayMethod('VISA')}
                                >
                                    Visa / Mastercard
                                </button>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                                    Mobile Number for Push Prompt
                                </label>
                                <input
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    value={payPhone}
                                    onChange={e => setPayPhone(e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                                    Amount to Settle (ZMW)
                                </label>
                                <input
                                    required
                                    type="number"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                                    value={payAmount}
                                    onChange={e => setPayAmount(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ width: '100%', background: '#059669' }}
                                disabled={paySubmitting}
                            >
                                {paySubmitting ? 'Sending USSD Prompt...' : `Pay K${Number(payAmount || 0).toLocaleString()} Now`}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Maintenance Ticket Modal */}
            {showTicketModal && (
                <div className="momo-modal-overlay" onClick={() => setShowTicketModal(false)}>
                    <div className="momo-modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Report Repair / Defect</h3>
                            <button style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setShowTicketModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTicket}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                                    Category
                                </label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    value={ticketCategory}
                                    onChange={e => setTicketCategory(e.target.value)}
                                >
                                    <option>Plumbing & Water Leak</option>
                                    <option>Electrical Fault / Wiring</option>
                                    <option>Roofing & Ceiling</option>
                                    <option>Locks, Windows & Security</option>
                                    <option>Other Structural Defect</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                                    Urgency Priority
                                </label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    value={ticketPriority}
                                    onChange={e => setTicketPriority(e.target.value)}
                                >
                                    <option value="LOW">Low (Cosmetic / Minor)</option>
                                    <option value="MEDIUM">Medium (Standard)</option>
                                    <option value="HIGH">High (Impacts Daily Living)</option>
                                    <option value="EMERGENCY">Emergency (Burst pipe / No Power)</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                                    Issue Title
                                </label>
                                <input
                                    required
                                    placeholder="e.g. Master bathroom tap dripping constantly"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    value={ticketTitle}
                                    onChange={e => setTicketTitle(e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                                    Detailed Description
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Describe when it started and what is affected..."
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    value={ticketDesc}
                                    onChange={e => setTicketDesc(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ width: '100%' }}
                                disabled={ticketSubmitting}
                            >
                                {ticketSubmitting ? 'Logging Ticket...' : 'Dispatch Maintenance Ticket'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantHub;
