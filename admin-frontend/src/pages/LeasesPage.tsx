import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus, Search, Filter, FileText, Download, Send, CheckCircle,
    AlertCircle, Clock, Building, User, DollarSign, Calendar, MapPin,
    ArrowUpDown, ArrowUp, ArrowDown, Printer, Eye, X, Phone, Mail,
    CreditCard, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import LeaseFormModal from '../components/LeaseFormModal';
import LeaseAgreementModal from '../components/LeaseAgreementModal';
import { useToast } from '../hooks/useToast';
import { useSettings } from '../context/SettingsContext';
import './LeasesPage.css';

interface Property {
    id: string;
    name: string;
    address: string;
    locationId?: string;
    location?: {
        id: string;
        name: string;
        type?: string;
    };
}

interface Renter {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    idNumber?: string;
    type?: string;
    status?: string;
    createdAt?: string;
    activeLease?: any;
    totalLeases?: number;
    totalPaid?: number;
    outstandingBalance?: number;
}

interface Lease {
    id: string;
    startDate: string;
    endDate: string;
    rentAmount: string | number;
    frequency: string;
    status: string;
    property: Property;
    renter: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        idNumber?: string;
    };
    invoices?: any[];
}

interface Receipt {
    receiptNumber: string;
    paymentId: string;
    paymentDate: string;
    tenantName: string;
    tenantEmail?: string;
    tenantPhone?: string;
    propertyName: string;
    propertyAddress?: string;
    amountPaid: number;
    paymentMethod: string;
    referenceNumber: string;
    remainingBalance: number;
    issuedBy: string;
    notes?: string;
}

interface ReminderLog {
    id: string;
    recipientName: string;
    recipientContact: string;
    propertyName: string;
    amount: number;
    type: string;
    channel: string;
    status: string;
    timestamp: string;
}

const LeasesPage: React.FC = () => {
    const { showToast } = useToast();
    const { settings } = useSettings();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = settings?.id || user.tenantId || '';

    // Active Tab
    const [activeTab, setActiveTab] = useState<'leases' | 'tenants' | 'receipts' | 'reminders'>('leases');

    // Data State
    const [leases, setLeases] = useState<Lease[]>([]);
    const [renters, setRenters] = useState<Renter[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [receiptsList, setReceiptsList] = useState<Receipt[]>([]);
    const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);

    // KPI Metrics State
    const [kpiStats, setKpiStats] = useState({
        totalActiveLeases: 0,
        totalLeasesCount: 0,
        monthlyRentRoll: 0,
        collectedThisMonth: 0,
        totalOverdue: 0,
        expiringSoon: 0,
        collectionRate: 100
    });

    const [loading, setLoading] = useState(true);

    // Filters & Multi-Location Selection
    const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Enterprise Table Controls
    const [sortColumn, setSortColumn] = useState<string>('startDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        property: true,
        tenant: true,
        location: true,
        period: true,
        amount: true,
        status: true,
        actions: true
    });
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);

    // Modals
    const [showLeaseModal, setShowLeaseModal] = useState(false);
    const [editingLease, setEditingLease] = useState<Lease | null>(null);
    const [selectedLease, setSelectedLease] = useState<Lease | null>(null);

    // Statutory Agreement Modal
    const [showAgreementModal, setShowAgreementModal] = useState(false);
    const [selectedAgreementLease, setSelectedAgreementLease] = useState<Lease | null>(null);

    const handleOpenAgreementModal = (lease: Lease) => {
        setSelectedAgreementLease(lease);
        setShowAgreementModal(true);
    };

    // Tenant Registration Modal
    const [showTenantModal, setShowTenantModal] = useState(false);
    const [tenantFormData, setTenantFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'INDIVIDUAL',
        idNumber: '',
        status: 'ACTIVE',
        emergencyName: '',
        emergencyPhone: '',
        employer: '',
        monthlyIncome: ''
    });
    const [submittingTenant, setSubmittingTenant] = useState(false);

    // Record Payment & Issue Receipt Modal
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [targetLeaseForPayment, setTargetLeaseForPayment] = useState<Lease | null>(null);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        method: 'BANK_TRANSFER',
        reference: '',
        notes: ''
    });
    const [submittingPayment, setSubmittingPayment] = useState(false);

    // Official Receipt View Modal
    const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);

    // Reminder Dispatch Modal
    const [reminderModalOpen, setReminderModalOpen] = useState(false);
    const [targetLeaseForReminder, setTargetLeaseForReminder] = useState<Lease | null>(null);
    const [reminderForm, setReminderForm] = useState({
        reminderType: 'UPCOMING_DUE',
        channel: 'SMS_AND_EMAIL',
        customMessage: ''
    });
    const [sendingReminder, setSendingReminder] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        fetchAllData();
    }, [selectedLocation, tenantId]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchLeases(),
                fetchStats(),
                fetchRenters(),
                fetchLocations()
            ]);
        } catch (err) {
            console.error('Error fetching rentals data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeases = async () => {
        try {
            const locParam = selectedLocation !== 'ALL' ? `&locationId=${selectedLocation}` : '';
            const res = await fetch(`http://localhost:4000/api/leases?tenantId=${tenantId}${locParam}&limit=100`);
            const resData = await res.json();
            const list = Array.isArray(resData) ? resData : (resData.data || []);
            setLeases(list);
        } catch (error) {
            console.error('Failed to fetch leases:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const locParam = selectedLocation !== 'ALL' ? `&locationId=${selectedLocation}` : '';
            const res = await fetch(`http://localhost:4000/api/leases/stats?tenantId=${tenantId}${locParam}`);
            if (res.ok) {
                const data = await res.json();
                setKpiStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch lease stats:', err);
        }
    };

    const fetchRenters = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/renters?tenantId=${tenantId}&limit=100`);
            if (res.ok) {
                const data = await res.json();
                setRenters(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch renters:', err);
        }
    };

    const fetchLocations = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/locations?tenantId=${tenantId}`);
            if (res.ok) {
                const data = await res.json();
                setLocations(data || []);
            }
        } catch (err) {
            console.error('Failed to fetch locations:', err);
        }
    };

    // Currency and Date Formatters
    const formatCurrency = (amount: string | number) => {
        const val = typeof amount === 'number' ? amount : parseFloat(amount || '0');
        const curr = settings?.config?.locale?.currency || 'USD';
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: curr,
                maximumFractionDigits: 0
            }).format(val || 0);
        } catch {
            return `${curr} ${Number(val || 0).toLocaleString()}`;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusClass = (status: string) => {
        switch ((status || '').toLowerCase()) {
            case 'active': return 'status-active';
            case 'pending': return 'status-pending';
            case 'expired': return 'status-expired';
            case 'terminated': return 'status-terminated';
            default: return 'status-active';
        }
    };

    // Filtered & Sorted Leases
    const filteredLeases = useMemo(() => {
        let result = [...leases];

        if (statusFilter !== 'ALL') {
            result = result.filter(l => l.status.toUpperCase() === statusFilter.toUpperCase());
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(l =>
                l.property?.name?.toLowerCase().includes(q) ||
                l.property?.address?.toLowerCase().includes(q) ||
                l.renter?.name?.toLowerCase().includes(q) ||
                l.renter?.email?.toLowerCase().includes(q)
            );
        }

        result.sort((a, b) => {
            let valA: any = a[sortColumn as keyof Lease];
            let valB: any = b[sortColumn as keyof Lease];

            if (sortColumn === 'property') {
                valA = a.property?.name || '';
                valB = b.property?.name || '';
            } else if (sortColumn === 'renter') {
                valA = a.renter?.name || '';
                valB = b.renter?.name || '';
            } else if (sortColumn === 'rentAmount') {
                valA = Number(a.rentAmount || 0);
                valB = Number(b.rentAmount || 0);
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [leases, statusFilter, searchQuery, sortColumn, sortDirection]);

    // Paginated Leases
    const paginatedLeases = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredLeases.slice(start, start + pageSize);
    }, [filteredLeases, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredLeases.length / pageSize) || 1;

    // Sorting Handler
    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    // Export CSV
    const exportCSV = () => {
        const headers = ['Property', 'Address', 'Tenant', 'Rent Amount', 'Frequency', 'Start Date', 'End Date', 'Status'];
        const rows = filteredLeases.map(l => [
            `"${l.property?.name || ''}"`,
            `"${l.property?.address || ''}"`,
            `"${l.renter?.name || ''}"`,
            l.rentAmount,
            l.frequency,
            new Date(l.startDate).toISOString().split('T')[0],
            new Date(l.endDate).toISOString().split('T')[0],
            l.status
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `remis_rentals_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Exported filtered rentals to CSV', 'success');
    };

    // Tenant Registration Submission
    const handleRegisterTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantFormData.name.trim()) {
            showToast('Tenant name is required', 'error');
            return;
        }

        setSubmittingTenant(true);
        try {
            const res = await fetch('http://localhost:4000/api/renters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: tenantFormData.name,
                    email: tenantFormData.email,
                    phone: tenantFormData.phone,
                    type: tenantFormData.type,
                    idNumber: tenantFormData.idNumber,
                    status: tenantFormData.status,
                    tenantId
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to register tenant');
            }

            showToast(`Tenant "${tenantFormData.name}" successfully registered!`, 'success');
            setShowTenantModal(false);
            setTenantFormData({
                name: '', email: '', phone: '', type: 'INDIVIDUAL', idNumber: '', status: 'ACTIVE',
                emergencyName: '', emergencyPhone: '', employer: '', monthlyIncome: ''
            });
            fetchRenters();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSubmittingTenant(false);
        }
    };

    // Open Payment & Issue Receipt Modal
    const handleOpenPaymentModal = (lease: Lease) => {
        setTargetLeaseForPayment(lease);
        setPaymentForm({
            amount: String(lease.rentAmount || ''),
            method: 'BANK_TRANSFER',
            reference: `REF-${Date.now().toString().slice(-6)}`,
            notes: `Rent payment for ${lease.property?.name}`
        });
        setPaymentModalOpen(true);
    };

    // Submit Payment & Issue Receipt
    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetLeaseForPayment) return;

        setSubmittingPayment(true);
        try {
            const res = await fetch(`http://localhost:4000/api/leases/${targetLeaseForPayment.id}/payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentForm)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Payment recording failed');
            }

            const data = await res.json();
            showToast('Payment recorded & Official Receipt generated!', 'success');
            setPaymentModalOpen(false);

            if (data.receipt) {
                setActiveReceipt(data.receipt);
                setReceiptsList(prev => [data.receipt, ...prev]);
            }

            fetchLeases();
            fetchStats();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSubmittingPayment(false);
        }
    };

    // Open Reminder Modal
    const handleOpenReminderModal = (lease: Lease) => {
        setTargetLeaseForReminder(lease);
        setReminderForm({
            reminderType: 'UPCOMING_DUE',
            channel: 'SMS_AND_EMAIL',
            customMessage: `Dear ${lease.renter?.name}, friendly reminder that rent of $${Number(lease.rentAmount).toLocaleString()} for ${lease.property?.name} is due on your upcoming scheduled date.`
        });
        setReminderModalOpen(true);
    };

    // Dispatch Automated Reminder
    const handleDispatchReminder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetLeaseForReminder) return;

        setSendingReminder(true);
        try {
            const res = await fetch(`http://localhost:4000/api/leases/${targetLeaseForReminder.id}/remind`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reminderForm)
            });

            if (!res.ok) {
                throw new Error('Failed to dispatch reminder');
            }

            const data = await res.json();
            showToast(`Reminder successfully dispatched to ${targetLeaseForReminder.renter?.name}!`, 'success');

            const newLog: ReminderLog = {
                id: data.reminderId || `REM-${Date.now()}`,
                recipientName: targetLeaseForReminder.renter?.name || '',
                recipientContact: targetLeaseForReminder.renter?.phone || targetLeaseForReminder.renter?.email || '',
                propertyName: targetLeaseForReminder.property?.name || '',
                amount: Number(targetLeaseForReminder.rentAmount),
                type: reminderForm.reminderType,
                channel: reminderForm.channel,
                status: 'DELIVERED',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today'
            };

            setReminderLogs(prev => [newLog, ...prev]);
            setReminderModalOpen(false);
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSendingReminder(false);
        }
    };

    return (
        <div className="leases-page">
            {/* Header */}
            <div className="leases-header">
                <div className="leases-title">
                    <h1>Rental & Lease Management</h1>
                    <p>Enterprise command center for tenant registration, multi-location leases, automated reminders, and payment receipts.</p>
                </div>

                <div className="leases-actions">
                    {/* Multi-Location Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={16} style={{ color: '#64748b' }} />
                        <select
                            className="filter-select"
                            value={selectedLocation}
                            onChange={(e) => {
                                setSelectedLocation(e.target.value);
                                setCurrentPage(1);
                            }}
                            title="Filter across single or multiple locations"
                        >
                            <option value="ALL">🌐 All Locations & Regions</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    📍 {loc.name} {loc.type ? `(${loc.type})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button className="btn-secondary" onClick={() => setShowTenantModal(true)}>
                        <User size={16} />
                        Register Tenant
                    </button>

                    <button className="create-btn" onClick={() => { setEditingLease(null); setShowLeaseModal(true); }}>
                        <Plus size={16} />
                        New Lease Contract
                    </button>
                </div>
            </div>

            {/* Interactive KPI Summary Cards */}
            <div className="leases-kpi-grid">
                <div className="leases-kpi-card">
                    <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        <Building size={24} />
                    </div>
                    <div className="kpi-info">
                        <div className="kpi-label">Active Leases</div>
                        <div className="kpi-value">{kpiStats.totalActiveLeases}</div>
                        <div className="kpi-sub">Total: {kpiStats.totalLeasesCount} contracts</div>
                    </div>
                </div>

                <div className="leases-kpi-card">
                    <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="kpi-info">
                        <div className="kpi-label">Monthly Rent Roll</div>
                        <div className="kpi-value">{formatCurrency(kpiStats.monthlyRentRoll)}</div>
                        <div className="kpi-sub">Expected revenue/mo</div>
                    </div>
                </div>

                <div className="leases-kpi-card">
                    <div className="kpi-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="kpi-info">
                        <div className="kpi-label">Collection Rate</div>
                        <div className="kpi-value">{kpiStats.collectionRate}%</div>
                        <div className="kpi-sub">{formatCurrency(kpiStats.collectedThisMonth)} collected</div>
                    </div>
                </div>

                <div className="leases-kpi-card">
                    <div className="kpi-icon-wrapper" style={{ background: '#fef2f2', color: '#dc2626' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div className="kpi-info">
                        <div className="kpi-label">Overdue Rent</div>
                        <div className="kpi-value" style={{ color: kpiStats.totalOverdue > 0 ? '#dc2626' : '#1e293b' }}>
                            {formatCurrency(kpiStats.totalOverdue)}
                        </div>
                        <div className="kpi-sub">Pending settlement</div>
                    </div>
                </div>

                <div className="leases-kpi-card">
                    <div className="kpi-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
                        <Clock size={24} />
                    </div>
                    <div className="kpi-info">
                        <div className="kpi-label">Expiring Soon</div>
                        <div className="kpi-value">{kpiStats.expiringSoon}</div>
                        <div className="kpi-sub">Within next 30 days</div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="leases-nav-tabs">
                <button
                    className={`nav-tab-btn ${activeTab === 'leases' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leases')}
                >
                    <FileText size={18} />
                    Rentals & Leases
                    <span className="tab-badge">{filteredLeases.length}</span>
                </button>

                <button
                    className={`nav-tab-btn ${activeTab === 'tenants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tenants')}
                >
                    <User size={18} />
                    Tenant Directory
                    <span className="tab-badge">{renters.length}</span>
                </button>

                <button
                    className={`nav-tab-btn ${activeTab === 'receipts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('receipts')}
                >
                    <CreditCard size={18} />
                    Payment Receipts
                    <span className="tab-badge">{receiptsList.length}</span>
                </button>

                <button
                    className={`nav-tab-btn ${activeTab === 'reminders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reminders')}
                >
                    <Send size={18} />
                    Automated Reminders
                    <span className="tab-badge">{reminderLogs.length}</span>
                </button>
            </div>

            {/* TAB 1: RENTALS & LEASES */}
            {activeTab === 'leases' && (
                <>
                    {/* Toolbar */}
                    <div className="leases-toolbar">
                        <div className="toolbar-left">
                            <div className="search-box">
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search property, tenant, unit..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                />
                            </div>

                            <select
                                className="filter-select"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="PENDING">Pending</option>
                                <option value="EXPIRED">Expired</option>
                                <option value="TERMINATED">Terminated</option>
                            </select>
                        </div>

                        <div className="toolbar-right">
                            {/* Column Visibility Selector */}
                            <div style={{ position: 'relative' }}>
                                <button className="btn-secondary" onClick={() => setShowColumnDropdown(!showColumnDropdown)}>
                                    <Filter size={15} />
                                    Columns
                                </button>
                                {showColumnDropdown && (
                                    <div style={{
                                        position: 'absolute', right: 0, top: '100%', marginTop: '0.4rem',
                                        background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px',
                                        padding: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        zIndex: 50, minWidth: '180px'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                                            VISIBLE COLUMNS
                                        </div>
                                        {Object.keys(visibleColumns).map(col => (
                                            <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', marginBottom: '0.35rem', cursor: 'pointer', textTransform: 'capitalize' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns[col]}
                                                    onChange={() => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }))}
                                                />
                                                {col}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button className="btn-secondary" onClick={exportCSV} title="Export to CSV">
                                <Download size={15} />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Leases Enterprise Table */}
                    <div className="leases-table-container">
                        {loading ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                                <div>Loading enterprise rental agreements...</div>
                            </div>
                        ) : paginatedLeases.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                                <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No lease agreements found</h3>
                                <p style={{ margin: 0 }}>Create a new lease or adjust your location and search filters.</p>
                            </div>
                        ) : (
                            <table className="leases-table">
                                <thead>
                                    <tr>
                                        {visibleColumns.property && (
                                            <th className="sortable" onClick={() => handleSort('property')}>
                                                <div className="th-content">
                                                    Property & Unit
                                                    {sortColumn === 'property' ? (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} />}
                                                </div>
                                            </th>
                                        )}
                                        {visibleColumns.tenant && (
                                            <th className="sortable" onClick={() => handleSort('renter')}>
                                                <div className="th-content">
                                                    Registered Tenant
                                                    {sortColumn === 'renter' ? (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} />}
                                                </div>
                                            </th>
                                        )}
                                        {visibleColumns.period && (
                                            <th className="sortable" onClick={() => handleSort('startDate')}>
                                                <div className="th-content">
                                                    Lease Term
                                                    {sortColumn === 'startDate' ? (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} />}
                                                </div>
                                            </th>
                                        )}
                                        {visibleColumns.amount && (
                                            <th className="sortable" onClick={() => handleSort('rentAmount')}>
                                                <div className="th-content">
                                                    Rent Amount
                                                    {sortColumn === 'rentAmount' ? (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} />}
                                                </div>
                                            </th>
                                        )}
                                        {visibleColumns.status && <th>Status</th>}
                                        {visibleColumns.actions && <th style={{ textAlign: 'right' }}>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedLeases.map(lease => (
                                        <tr key={lease.id}>
                                            {visibleColumns.property && (
                                                <td>
                                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{lease.property?.name || 'Unnamed Property'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                                                        <MapPin size={12} /> {lease.property?.address || 'No address specified'}
                                                    </div>
                                                </td>
                                            )}
                                            {visibleColumns.tenant && (
                                                <td>
                                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{lease.renter?.name || 'Unassigned'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{lease.renter?.phone || lease.renter?.email || 'No contact'}</div>
                                                </td>
                                            )}
                                            {visibleColumns.period && (
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>
                                                        {formatDate(lease.startDate)} → {formatDate(lease.endDate)}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>
                                                        Billing: {lease.frequency?.toLowerCase() || 'monthly'}
                                                    </div>
                                                </td>
                                            )}
                                            {visibleColumns.amount && (
                                                <td>
                                                    <div style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>
                                                        {formatCurrency(lease.rentAmount)}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Per {lease.frequency?.toLowerCase() || 'month'}</div>
                                                </td>
                                            )}
                                            {visibleColumns.status && (
                                                <td>
                                                    <span className={`status-badge ${getStatusClass(lease.status)}`}>
                                                        {lease.status}
                                                    </span>
                                                </td>
                                            )}
                                            {visibleColumns.actions && (
                                                <td>
                                                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                                                        <button
                                                            className="action-btn-sm success"
                                                            onClick={() => handleOpenPaymentModal(lease)}
                                                            title="Record payment & issue official receipt"
                                                        >
                                                            <CreditCard size={13} />
                                                            Receipt
                                                        </button>

                                                        <button
                                                            className="action-btn-sm"
                                                            onClick={() => handleOpenReminderModal(lease)}
                                                            title="Send automated rent reminder"
                                                        >
                                                            <Send size={13} />
                                                            Remind
                                                        </button>

                                                        <button
                                                            className="action-btn-sm"
                                                            style={{ color: '#0284c7', borderColor: '#bae6fd', background: '#f0f9ff' }}
                                                            onClick={() => handleOpenAgreementModal(lease)}
                                                            title="Generate statutory Zambian Residential Tenancy Agreement (Cap 206)"
                                                        >
                                                            <FileText size={13} />
                                                            Agreement
                                                        </button>

                                                        <button
                                                            className="action-btn-sm primary"
                                                            onClick={() => setSelectedLease(lease)}
                                                            title="View details"
                                                        >
                                                            <Eye size={13} />
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination Bar */}
                    <div className="leases-pagination">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span>Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredLeases.length)} of {filteredLeases.length} leases</span>
                            <select
                                className="filter-select"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            >
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                                <option value={100}>100 per page</option>
                            </select>
                        </div>

                        <div className="pagination-controls">
                            <button
                                className="page-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft size={14} style={{ verticalAlign: 'middle' }} /> Previous
                            </button>
                            <span style={{ fontWeight: 600, padding: '0 0.5rem' }}>Page {currentPage} of {totalPages}</span>
                            <button
                                className="page-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                                Next <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* TAB 2: TENANT DIRECTORY (RENTERS) */}
            {activeTab === 'tenants' && (
                <>
                    <div className="leases-toolbar">
                        <div className="toolbar-left">
                            <div className="search-box">
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by tenant name, phone, email, ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="toolbar-right">
                            <button className="create-btn" onClick={() => setShowTenantModal(true)}>
                                <Plus size={16} />
                                Register New Tenant
                            </button>
                        </div>
                    </div>

                    <div className="leases-table-container">
                        {renters.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                                <User size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <h3>No registered tenants found</h3>
                                <p>Click "Register New Tenant" to enroll individual or corporate tenants.</p>
                            </div>
                        ) : (
                            <table className="leases-table">
                                <thead>
                                    <tr>
                                        <th>Tenant Name</th>
                                        <th>Type</th>
                                        <th>National / Tax ID</th>
                                        <th>Contact</th>
                                        <th>Active Property / Unit</th>
                                        <th>Total Paid</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renters.map(r => (
                                        <tr key={r.id}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Registered {formatDate(r.createdAt)}</div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px', background: r.type === 'CORPORATE' ? '#eff6ff' : '#f1f5f9',
                                                    color: r.type === 'CORPORATE' ? '#1d4ed8' : '#334155'
                                                }}>
                                                    {r.type || 'INDIVIDUAL'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.idNumber || 'None'}</span>
                                            </td>
                                            <td>
                                                <div>{r.phone || 'No phone'}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.email || 'No email'}</div>
                                            </td>
                                            <td>
                                                {r.activeLease ? (
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{r.activeLease.propertyName}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                                                            {formatCurrency(r.activeLease.rentAmount)} / {r.activeLease.frequency?.toLowerCase()}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No active lease</span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: '#059669' }}>
                                                    {formatCurrency(r.totalPaid || 0)}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(r.status || 'ACTIVE')}`}>
                                                    {r.status || 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="action-btn-sm primary"
                                                        onClick={() => {
                                                            showToast(`Tenant profile: ${r.name} (${r.phone || r.email || 'No contact'})`, 'info');
                                                        }}
                                                    >
                                                        Profile
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* TAB 3: PAYMENT RECEIPTS */}
            {activeTab === 'receipts' && (
                <>
                    <div className="leases-toolbar">
                        <div className="toolbar-left">
                            <span style={{ fontWeight: 600, color: '#334155' }}>Official Issued Receipts</span>
                        </div>
                    </div>

                    <div className="leases-table-container">
                        {receiptsList.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                                <CreditCard size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <h3>No issued receipts yet</h3>
                                <p>To issue an official payment receipt, click "Receipt" on any active lease in the Rentals tab.</p>
                            </div>
                        ) : (
                            <table className="leases-table">
                                <thead>
                                    <tr>
                                        <th>Receipt #</th>
                                        <th>Date</th>
                                        <th>Tenant</th>
                                        <th>Property</th>
                                        <th>Amount Paid</th>
                                        <th>Payment Method</th>
                                        <th>Reference</th>
                                        <th style={{ textAlign: 'right' }}>Print / View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receiptsList.map((rcp, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <span style={{ fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>
                                                    {rcp.receiptNumber}
                                                </span>
                                            </td>
                                            <td>{formatDate(rcp.paymentDate)}</td>
                                            <td style={{ fontWeight: 600 }}>{rcp.tenantName}</td>
                                            <td>{rcp.propertyName}</td>
                                            <td style={{ fontWeight: 700, color: '#059669' }}>
                                                {formatCurrency(rcp.amountPaid)}
                                            </td>
                                            <td>{rcp.paymentMethod.replace('_', ' ')}</td>
                                            <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{rcp.referenceNumber}</span></td>
                                            <td>
                                                <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="action-btn-sm primary"
                                                        onClick={() => setActiveReceipt(rcp)}
                                                    >
                                                        <Printer size={13} />
                                                        View Receipt
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* TAB 4: AUTOMATED REMINDERS */}
            {activeTab === 'reminders' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.5rem', borderRadius: '8px' }}>
                                    <Clock size={20} />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Upcoming Due (3 Days)</h4>
                            </div>
                            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                                Proactively alerts tenants 3 days before their contract due date via SMS and Email.
                            </p>
                        </div>

                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.5rem', borderRadius: '8px' }}>
                                    <AlertCircle size={20} />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Overdue Notice & Late Fee</h4>
                            </div>
                            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                                Sends formal payment demand notice immediately when rent passes the agreed grace period.
                            </p>
                        </div>

                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.5rem', borderRadius: '8px' }}>
                                    <ShieldCheck size={20} />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Lease Expiry & Renewal (30 Days)</h4>
                            </div>
                            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                                Prompts tenants regarding contract expiration to begin renewal negotiations or exit checkouts.
                            </p>
                        </div>
                    </div>

                    <div className="leases-toolbar">
                        <span style={{ fontWeight: 600, color: '#334155' }}>Dispatched Notifications & Reminder Logs</span>
                    </div>

                    <div className="leases-table-container">
                        {reminderLogs.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                                <Send size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <h3>No reminders dispatched yet in this session</h3>
                                <p>Click "Remind" on any lease in the Rentals tab to trigger an instant reminder.</p>
                            </div>
                        ) : (
                            <table className="leases-table">
                                <thead>
                                    <tr>
                                        <th>Notification ID</th>
                                        <th>Recipient</th>
                                        <th>Property</th>
                                        <th>Amount Due</th>
                                        <th>Notice Type</th>
                                        <th>Channel</th>
                                        <th>Status</th>
                                        <th>Dispatched</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reminderLogs.map(log => (
                                        <tr key={log.id}>
                                            <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{log.id}</span></td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{log.recipientName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.recipientContact}</div>
                                            </td>
                                            <td>{log.propertyName}</td>
                                            <td style={{ fontWeight: 700, color: '#059669' }}>{formatCurrency(log.amount)}</td>
                                            <td>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>
                                                    {log.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>{log.channel.replace('_', ' ')}</td>
                                            <td>
                                                <span className="status-badge status-active">
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{log.timestamp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* MODAL: REGISTER NEW TENANT */}
            {showTenantModal && (
                <div className="modal-overlay" onClick={() => setShowTenantModal(false)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '650px', maxWidth: '95vw',
                        maxHeight: '90vh', overflowY: 'auto', padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a' }}>Register New Tenant</h2>
                            <button onClick={() => setShowTenantModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleRegisterTenant}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Full Legal Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Jane Doe or Apex Corp Ltd"
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                        value={tenantFormData.name}
                                        onChange={e => setTenantFormData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Tenant Type</label>
                                    <select
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: 'white' }}
                                        value={tenantFormData.type}
                                        onChange={e => setTenantFormData(prev => ({ ...prev, type: e.target.value }))}
                                    >
                                        <option value="INDIVIDUAL">Individual Tenant</option>
                                        <option value="CORPORATE">Corporate / Business Entity</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>National ID / Passport / Tax No</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. NID-98234190"
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                        value={tenantFormData.idNumber}
                                        onChange={e => setTenantFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Contact Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. +675 7000 0000"
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                        value={tenantFormData.phone}
                                        onChange={e => setTenantFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="e.g. tenant@domain.com"
                                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                    value={tenantFormData.email}
                                    onChange={e => setTenantFormData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>
                                    Emergency Contact & Verification
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Next of Kin / Contact Name"
                                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                        value={tenantFormData.emergencyName}
                                        onChange={e => setTenantFormData(prev => ({ ...prev, emergencyName: e.target.value }))}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Emergency Phone Number"
                                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                        value={tenantFormData.emergencyPhone}
                                        onChange={e => setTenantFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowTenantModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="create-btn"
                                    disabled={submittingTenant}
                                >
                                    {submittingTenant ? 'Registering...' : 'Complete Registration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: RECORD PAYMENT & ISSUE RECEIPT */}
            {paymentModalOpen && targetLeaseForPayment && (
                <div className="modal-overlay" onClick={() => setPaymentModalOpen(false)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '560px', maxWidth: '95vw',
                        padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Record Payment & Issue Receipt</h2>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
                                    For {targetLeaseForPayment.property?.name} — {targetLeaseForPayment.renter?.name}
                                </p>
                            </div>
                            <button onClick={() => setPaymentModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitPayment}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Payment Amount ($) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}
                                    value={paymentForm.amount}
                                    onChange={e => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Payment Method</label>
                                    <select
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: 'white' }}
                                        value={paymentForm.method}
                                        onChange={e => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                                    >
                                        <option value="BANK_TRANSFER">Bank Direct Deposit / Wire</option>
                                        <option value="CASH">Cash Over-the-Counter</option>
                                        <option value="CARD">Credit / Debit Card</option>
                                        <option value="MOBILE_MONEY">Mobile Money</option>
                                        <option value="CHEQUE">Bank Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Transaction Reference / Slip #</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TXN-892189"
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                        value={paymentForm.reference}
                                        onChange={e => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Receipt Remarks / Notes</label>
                                <textarea
                                    rows={2}
                                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                    value={paymentForm.notes}
                                    onChange={e => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setPaymentModalOpen(false)}>Cancel</button>
                                <button type="submit" className="create-btn" disabled={submittingPayment} style={{ background: '#059669' }}>
                                    {submittingPayment ? 'Processing...' : 'Confirm & Issue Official Receipt'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: OFFICIAL PRINTABLE RECEIPT */}
            {activeReceipt && (
                <div className="modal-overlay" onClick={() => setActiveReceipt(null)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)',
                    zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
                }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '700px', maxWidth: '95vw',
                        maxHeight: '92vh', overflowY: 'auto', padding: '0'
                    }}>
                        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderRadius: '12px 12px 0 0' }}>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>Official Electronic Rent Receipt</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="create-btn" onClick={() => window.print()} style={{ padding: '0.4rem 0.85rem' }}>
                                    <Printer size={15} /> Print / Save PDF
                                </button>
                                <button className="btn-secondary" onClick={() => setActiveReceipt(null)} style={{ padding: '0.4rem 0.85rem' }}>
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Printable Paper */}
                        <div className="receipt-paper">
                            <div className="receipt-header">
                                <div className="receipt-logo">
                                    <div style={{ width: '42px', height: '42px', background: '#2563eb', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building size={24} />
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>REMIS GLOBAL</h2>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Enterprise Real Estate & Property Management</p>
                                    </div>
                                </div>
                                <div className="receipt-meta">
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{activeReceipt.receiptNumber}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Date: {new Date(activeReceipt.paymentDate).toLocaleString()}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>STATUS: VERIFIED & PAID</div>
                                </div>
                            </div>

                            <div className="receipt-grid">
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>RECEIVED FROM (TENANT)</div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{activeReceipt.tenantName}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>{activeReceipt.tenantPhone || activeReceipt.tenantEmail || 'Registered Tenant'}</div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>PROPERTY / PREMISES</div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{activeReceipt.propertyName}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>{activeReceipt.propertyAddress || 'Address on file'}</div>
                                </div>
                            </div>

                            <div className="receipt-amount-box">
                                <div style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOTAL AMOUNT RECEIVED</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e3a8a', margin: '0.25rem 0' }}>
                                    {formatCurrency(activeReceipt.amountPaid)}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                                    Payment Method: <strong>{activeReceipt.paymentMethod.replace('_', ' ')}</strong> | Reference: <strong>{activeReceipt.referenceNumber}</strong>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', color: '#475569', marginBottom: '1.5rem' }}>
                                <div>
                                    <strong>Description / Remarks:</strong> {activeReceipt.notes || 'Full rent settlement'}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <strong>Remaining Balance:</strong> {formatCurrency(activeReceipt.remainingBalance)}
                                </div>
                            </div>

                            <div className="receipt-footer-stamp">
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>
                                        <ShieldCheck size={18} /> Digitally Signed & System Certified
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Verified by REMIS Automated Core Operations</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ borderBottom: '1px solid #94a3b8', width: '180px', marginBottom: '0.25rem' }}></div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Authorized Property Controller</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: DISPATCH AUTOMATED REMINDER */}
            {reminderModalOpen && targetLeaseForReminder && (
                <div className="modal-overlay" onClick={() => setReminderModalOpen(false)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '560px', maxWidth: '95vw',
                        padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Send Smart Automated Reminder</h2>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
                                    Recipient: {targetLeaseForReminder.renter?.name} ({targetLeaseForReminder.property?.name})
                                </p>
                            </div>
                            <button onClick={() => setReminderModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleDispatchReminder}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Notification Type</label>
                                    <select
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: 'white' }}
                                        value={reminderForm.reminderType}
                                        onChange={e => {
                                            const type = e.target.value;
                                            const rent = Number(targetLeaseForReminder.rentAmount).toLocaleString();
                                            const prop = targetLeaseForReminder.property?.name;
                                            let msg = '';
                                            if (type === 'UPCOMING_DUE') {
                                                msg = `Dear ${targetLeaseForReminder.renter?.name}, friendly reminder that rent of $${rent} for ${prop} is due on your upcoming scheduled date.`;
                                            } else if (type === 'OVERDUE_NOTICE') {
                                                msg = `URGENT NOTICE: Rent payment of $${rent} for ${prop} is currently overdue. Please submit payment immediately to avoid late fees.`;
                                            } else if (type === 'EXPIRY_RENEWAL') {
                                                msg = `Dear ${targetLeaseForReminder.renter?.name}, your lease for ${prop} is scheduled to expire on ${new Date(targetLeaseForReminder.endDate).toLocaleDateString()}. Please contact administration to discuss renewal terms.`;
                                            }
                                            setReminderForm(prev => ({ ...prev, reminderType: type, customMessage: msg }));
                                        }}
                                    >
                                        <option value="UPCOMING_DUE">Upcoming Rent Due (3-day)</option>
                                        <option value="OVERDUE_NOTICE">Overdue Rent Notice</option>
                                        <option value="EXPIRY_RENEWAL">Lease Expiry & Renewal Notice</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Dispatch Channel</label>
                                    <select
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: 'white' }}
                                        value={reminderForm.channel}
                                        onChange={e => setReminderForm(prev => ({ ...prev, channel: e.target.value }))}
                                    >
                                        <option value="SMS_AND_EMAIL">SMS + Email (Omnichannel)</option>
                                        <option value="SMS">Direct SMS Message</option>
                                        <option value="EMAIL">Official Email Notification</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Message Content</label>
                                <textarea
                                    rows={4}
                                    required
                                    style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem' }}
                                    value={reminderForm.customMessage}
                                    onChange={e => setReminderForm(prev => ({ ...prev, customMessage: e.target.value }))}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setReminderModalOpen(false)}>Cancel</button>
                                <button type="submit" className="create-btn" disabled={sendingReminder}>
                                    <Send size={15} />
                                    {sendingReminder ? 'Dispatching...' : 'Dispatch Reminder Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: VIEW LEASE DETAILS */}
            {selectedLease && (
                <div className="modal-overlay" onClick={() => setSelectedLease(null)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '600px', maxWidth: '95vw',
                        maxHeight: '90vh', overflowY: 'auto', padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Lease Agreement Details</h2>
                            <button onClick={() => setSelectedLease(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>PROPERTY</label>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{selectedLease.property?.name}</div>
                                <div style={{ fontSize: '0.825rem', color: '#64748b' }}>{selectedLease.property?.address}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TENANT</label>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{selectedLease.renter?.name}</div>
                                <div style={{ fontSize: '0.825rem', color: '#64748b' }}>{selectedLease.renter?.phone || selectedLease.renter?.email}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>CONTRACT TERM</label>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                                    {formatDate(selectedLease.startDate)} → {formatDate(selectedLease.endDate)}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>RENT AMOUNT</label>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                                    {formatCurrency(selectedLease.rentAmount)}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>Billing: {selectedLease.frequency.toLowerCase()}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                            <button className="btn-secondary" onClick={() => setSelectedLease(null)}>Close</button>
                            <button
                                className="action-btn-sm success"
                                style={{ padding: '0.55rem 1rem' }}
                                onClick={() => {
                                    const l = selectedLease;
                                    setSelectedLease(null);
                                    handleOpenPaymentModal(l);
                                }}
                            >
                                <CreditCard size={15} /> Issue Receipt
                            </button>
                            <button
                                className="action-btn-sm"
                                style={{ color: '#0284c7', borderColor: '#bae6fd', background: '#f0f9ff', padding: '0.55rem 1rem' }}
                                onClick={() => {
                                    const l = selectedLease;
                                    setSelectedLease(null);
                                    handleOpenAgreementModal(l);
                                }}
                            >
                                <FileText size={15} /> Tenancy Agreement
                            </button>
                            <button
                                className="create-btn"
                                onClick={() => {
                                    setEditingLease(selectedLease);
                                    setSelectedLease(null);
                                    setShowLeaseModal(true);
                                }}
                            >
                                Edit Contract
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LEASE CREATE/EDIT MODAL */}
            <LeaseFormModal
                isOpen={showLeaseModal}
                onClose={() => { setShowLeaseModal(false); setEditingLease(null); }}
                onSuccess={() => { fetchLeases(); fetchStats(); }}
                initialData={editingLease}
            />

            {/* STATUTORY RESIDENTIAL TENANCY AGREEMENT MODAL (RENT ACT CAP 206) */}
            <LeaseAgreementModal
                isOpen={showAgreementModal}
                lease={selectedAgreementLease}
                onClose={() => { setShowAgreementModal(false); setSelectedAgreementLease(null); }}
                onSignatureUpdated={() => { fetchLeases(); fetchStats(); }}
            />
        </div>
    );
};

export default LeasesPage;
