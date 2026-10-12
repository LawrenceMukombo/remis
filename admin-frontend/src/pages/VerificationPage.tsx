import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, XCircle,
    Search, Filter, Plus, FileText, UserCheck, Eye, Trash2, 
    ChevronLeft, ChevronRight, ArrowUpDown, ExternalLink, RefreshCw, 
    SlidersHorizontal, Building2, Phone, AlertCircle, Shield
} from 'lucide-react';
import ProtectedDocumentViewer from '../components/ProtectedDocumentViewer';
import './VerificationPage.css';

interface VerificationItem {
    id: string;
    name: string;
    type: string;
    status: string;
    listing_type: string;
    sale_price?: number;
    province?: string;
    district?: string;
    llg?: string;
    address: string;
    createdAt: string;
    complianceRecords: Array<{
        id: string;
        title: string;
        type: string;
        status: string;
        notes?: string;
        createdAt: string;
    }>;
}

interface BlacklistEntity {
    id: string;
    entityType: string;
    entityValue: string;
    entityDisplay: string;
    severity: string;
    incidentSummary: string;
    evidenceUrls: string[];
    flaggedBy: string;
    appealStatus: string;
    isActive: boolean;
    createdAt: string;
}

const API_BASE = 'http://localhost:4000/api';

export const VerificationPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'queue' | 'blacklist'>('queue');
    const [loading, setLoading] = useState(false);

    // Queue State
    const [queue, setQueue] = useState<VerificationItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
    const [auditModalOpen, setAuditModalOpen] = useState(false);
    const [scamModalOpen, setScamModalOpen] = useState(false);
    const [scamReason, setScamReason] = useState('');
    const [auditNotes, setAuditNotes] = useState('');
    const [auditDocTab, setAuditDocTab] = useState<'deed' | 'id' | 'rates'>('deed');
    const [drmDocToView, setDrmDocToView] = useState<{ url: string; title: string } | null>(null);

    // Blacklist State
    const [blacklist, setBlacklist] = useState<BlacklistEntity[]>([]);
    const [blacklistSearch, setBlacklistSearch] = useState('');
    const [blacklistTypeFilter, setBlacklistTypeFilter] = useState('');
    const [blacklistSeverityFilter, setBlacklistSeverityFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBlacklist, setTotalBlacklist] = useState(0);
    const [addBlacklistModalOpen, setAddBlacklistModalOpen] = useState(false);

    // New Blacklist Entry Form
    const [newBlacklist, setNewBlacklist] = useState({
        entityType: 'PHONE_NUMBER',
        entityValue: '',
        entityDisplay: '',
        severity: 'CRITICAL_FRAUD',
        incidentSummary: ''
    });

    // Column Visibility State for Blacklist Table
    const [visibleCols, setVisibleCols] = useState({
        entity: true,
        type: true,
        severity: true,
        incident: true,
        flaggedBy: true,
        date: true,
        actions: true
    });
    const [showColPicker, setShowColPicker] = useState(false);

    // Fetch Verification Queue
    const fetchQueue = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/marketplace/verification-queue`);
            const data = await res.json();
            if (data.success) {
                setQueue(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch verification queue", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Blacklist
    const fetchBlacklist = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(pageSize),
                ...(blacklistSearch && { search: blacklistSearch }),
                ...(blacklistTypeFilter && { entityType: blacklistTypeFilter }),
                ...(blacklistSeverityFilter && { severity: blacklistSeverityFilter })
            });
            const res = await fetch(`${API_BASE}/blacklist?${params}`);
            const data = await res.json();
            if (data.success) {
                setBlacklist(data.data || []);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages || 1);
                    setTotalBlacklist(data.pagination.total || 0);
                }
            }
        } catch (err) {
            console.error("Failed to fetch blacklist", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'queue') {
            fetchQueue();
        } else {
            fetchBlacklist();
        }
    }, [activeTab, page, pageSize, blacklistTypeFilter, blacklistSeverityFilter]);

    // Handle Search Debounce for Blacklist
    useEffect(() => {
        if (activeTab === 'blacklist') {
            const delay = setTimeout(() => {
                setPage(1);
                fetchBlacklist();
            }, 300);
            return () => clearTimeout(delay);
        }
    }, [blacklistSearch]);

    // Audit Action: Approve or Reject or Scam Flag
    const handleReview = async (decision: 'APPROVED' | 'REJECTED' | 'SCAM_FLAGGED') => {
        if (!selectedItem) return;

        try {
            const parsedNotes = getComplianceDetails(selectedItem) || {};
            const targetPropId = (selectedItem as any).property?.id || (selectedItem as any).propertyId || selectedItem.id;

            const payload = {
                id: (selectedItem as any).id,
                propertyId: targetPropId,
                decision,
                notes: auditNotes || (decision === 'APPROVED' ? 'Title deed verified with Lands Registry' : 'Document rejected'),
                scamReason: decision === 'SCAM_FLAGGED' ? scamReason : undefined,
                entityToBlacklist: decision === 'SCAM_FLAGGED' ? {
                    type: 'PHONE_NUMBER',
                    value: parsedNotes.owner_phone || parsedNotes.ownerPhone || '+260977000000',
                    display: parsedNotes.owner_name || parsedNotes.ownerName || 'Flagged Entity'
                } : undefined
            };

            const res = await fetch(`${API_BASE}/marketplace/review-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                alert(`Decision applied: ${decision}`);
                setAuditModalOpen(false);
                setScamModalOpen(false);
                setSelectedItem(null);
                setScamReason('');
                setAuditNotes('');
                fetchQueue();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (err) {
            console.error(err);
            alert('Server error processing review');
        }
    };

    // Add Manual Blacklist Entry
    const handleAddBlacklist = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/blacklist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    entityType: newBlacklist.entityType,
                    entityValue: newBlacklist.entityValue,
                    entityDisplay: newBlacklist.entityDisplay || newBlacklist.entityValue,
                    severity: newBlacklist.severity,
                    incidentSummary: newBlacklist.incidentSummary,
                    evidenceUrls: []
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('Entity blacklisted successfully');
                setAddBlacklistModalOpen(false);
                setNewBlacklist({
                    entityType: 'PHONE_NUMBER',
                    entityValue: '',
                    entityDisplay: '',
                    severity: 'CRITICAL_FRAUD',
                    incidentSummary: ''
                });
                fetchBlacklist();
            } else {
                alert(data.message || 'Failed to blacklist entity');
            }
        } catch (err) {
            console.error(err);
            alert('Server error creating blacklist record');
        }
    };

    // Remove from Blacklist (Pardon / Appeal Approved)
    const handleRemoveBlacklist = async (id: string) => {
        if (!confirm('Are you sure you want to remove this entity from the Scammer Blacklist? This will restore their listing permissions.')) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/blacklist/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                alert('Entity removed from blacklist');
                fetchBlacklist();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Helper: Parse compliance details JSON
    const getComplianceDetails = (item: any) => {
        if (item.ownerDetails) return item.ownerDetails;
        const record = item.complianceRecords?.[0];
        if (!record?.notes) return null;
        try {
            return JSON.parse(record.notes);
        } catch {
            return null;
        }
    };

    return (
        <div className="verification-page">
            {/* Header & KPI Statistics */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <ShieldCheck className="title-icon" /> Deed Audit & Anti-Scam Verification Console
                    </h1>
                    <p className="page-subtitle">
                        Inspect registered title deeds, verify ownership credentials, and administer the National Scammer Blacklist Registry.
                    </p>
                </div>

                <div className="tab-switcher">
                    <button 
                        className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
                        onClick={() => setActiveTab('queue')}
                    >
                        <FileText size={16} />
                        <span>Ownership Audit Queue</span>
                        {queue.length > 0 && <span className="tab-badge">{queue.length}</span>}
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'blacklist' ? 'active' : ''}`}
                        onClick={() => setActiveTab('blacklist')}
                    >
                        <ShieldAlert size={16} />
                        <span>Global Scammer Blacklist</span>
                        <span className="tab-badge-dark">{totalBlacklist}</span>
                    </button>
                </div>
            </div>

            {/* KPI Metrics */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">PENDING TITLE DEED AUDITS</span>
                        <div className="kpi-icon-wrap amber"><AlertTriangle size={20} /></div>
                    </div>
                    <div className="kpi-value">{queue.length}</div>
                    <span className="kpi-subtext">Requires Ministry of Lands cross-check</span>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">ACTIVE BLACKLISTED ENTITIES</span>
                        <div className="kpi-icon-wrap red"><ShieldAlert size={20} /></div>
                    </div>
                    <div className="kpi-value">{totalBlacklist}</div>
                    <span className="kpi-subtext">Intercepted phones, NRCs & counterfeiters</span>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">VERIFIED DEED BADGES ISSUED</span>
                        <div className="kpi-icon-wrap emerald"><ShieldCheck size={20} /></div>
                    </div>
                    <div className="kpi-value">6</div>
                    <span className="kpi-subtext">Active on Public Marketplace with Gold Badges</span>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">PREVENTED PHANTOM RENTALS</span>
                        <div className="kpi-icon-wrap blue"><Building2 size={20} /></div>
                    </div>
                    <div className="kpi-value">ZMW 1.25M</div>
                    <span className="kpi-subtext">Tenant advance fee scams blocked by filter</span>
                </div>
            </div>

            {/* TAB 1: OWNERSHIP VERIFICATION QUEUE */}
            {activeTab === 'queue' && (
                <div className="console-panel">
                    <div className="panel-toolbar">
                        <div className="toolbar-left">
                            <span className="table-caption">
                                <strong>Pending Verification Requests</strong> ({queue.length})
                            </span>
                        </div>
                        <button className="btn-refresh" onClick={fetchQueue}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <RefreshCw size={28} className="spin" />
                            <p>Loading verification audit queue...</p>
                        </div>
                    ) : queue.length === 0 ? (
                        <div className="empty-state">
                            <CheckCircle size={44} color="#10b981" />
                            <h3>All Title Deeds Audited</h3>
                            <p>There are no pending property listings awaiting ownership verification.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="enterprise-table">
                                <thead>
                                    <tr>
                                        <th>Property & Location</th>
                                        <th>Registered Owner</th>
                                        <th>Deed & Parcel Ref</th>
                                        <th>Proof Documents</th>
                                        <th>Risk Assessment</th>
                                        <th>Submitted</th>
                                        <th style={{ textAlign: 'right' }}>Audit Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {queue.map((item) => {
                                        const details = getComplianceDetails(item);
                                        const propName = (item as any).property?.name || item.name;
                                        const propAddress = (item as any).property?.address || item.address || `${(item as any).property?.district || item.district || 'Zambia'}`;
                                        const deedUrl = details?.deed_url || details?.titleDeedUrl || (item as any).documentUrl;
                                        const idUrl = details?.id_doc_url || details?.idDocumentUrl;
                                        const ratesUrl = details?.rates_statement_url || details?.ratesReceiptUrl;

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="prop-cell">
                                                        <strong>{propName}</strong>
                                                        <span className="cell-sub">{propAddress}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="owner-cell">
                                                        <span>{details?.owner_name || details?.ownerName || 'Owner Profile'}</span>
                                                        <span className="cell-sub">
                                                            <Phone size={11} /> {details?.owner_phone || details?.ownerPhone || 'N/A'}
                                                        </span>
                                                        <span className="cell-sub">NRC: {details?.national_id || details?.ownerIdNumber || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="code-pill">
                                                        {details?.title_deed_number || details?.documentNumber || 'CT-UNSPECIFIED'}
                                                    </span>
                                                    <div className="cell-sub">Parcel: {details?.parcel_number || 'Stand 418'}</div>
                                                </td>
                                                <td>
                                                    <div className="doc-links-cell">
                                                        {deedUrl && (
                                                            <a href={deedUrl.split(',')[0]} target="_blank" rel="noreferrer" className="doc-chip" title="View Title Deed">
                                                                <FileText size={12} /> Title Deed
                                                            </a>
                                                        )}
                                                        {idUrl && (
                                                            <a href={idUrl.split(',')[0]} target="_blank" rel="noreferrer" className="doc-chip" title="View Owner ID">
                                                                <UserCheck size={12} /> Owner ID
                                                            </a>
                                                        )}
                                                        {ratesUrl && (
                                                            <a href={ratesUrl.split(',')[0]} target="_blank" rel="noreferrer" className="doc-chip" title="View Rates Bill">
                                                                <Building2 size={12} /> Rates Bill
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="risk-badge low">
                                                        LOW RISK (CLEAR)
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="cell-date">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className="action-buttons-group">
                                                        <button 
                                                            className="btn-inspect" 
                                                            onClick={() => { setSelectedItem(item); setAuditModalOpen(true); }}
                                                            title="Inspect Full Title Documents"
                                                        >
                                                            <Eye size={14} /> Audit
                                                        </button>
                                                        <button 
                                                            className="btn-approve" 
                                                            onClick={() => { setSelectedItem(item); handleReview('APPROVED'); }}
                                                            title="Approve & Issue Gold Shield"
                                                        >
                                                            <CheckCircle size={14} /> Approve
                                                        </button>
                                                        <button 
                                                            className="btn-scam" 
                                                            onClick={() => { setSelectedItem(item); setScamModalOpen(true); }}
                                                            title="Flag as Scam & Blacklist"
                                                        >
                                                            <ShieldAlert size={14} /> Flag Scam
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: GLOBAL SCAMMER BLACKLIST REGISTRY */}
            {activeTab === 'blacklist' && (
                <div className="console-panel">
                    <div className="panel-toolbar">
                        <div className="toolbar-left">
                            <div className="search-input-wrap">
                                <Search size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search by Phone, NRC, or Incident Keywords..." 
                                    value={blacklistSearch}
                                    onChange={(e) => setBlacklistSearch(e.target.value)}
                                />
                            </div>

                            <select 
                                className="filter-select"
                                value={blacklistTypeFilter}
                                onChange={(e) => setBlacklistTypeFilter(e.target.value)}
                            >
                                <option value="">All Entity Types</option>
                                <option value="PHONE_NUMBER">Phone Numbers</option>
                                <option value="NATIONAL_ID">National IDs (NRC)</option>
                                <option value="BANK_ACCOUNT">Bank / Mobile Money Accounts</option>
                                <option value="TITLE_DEED">Forged Title Deeds</option>
                            </select>

                            <select 
                                className="filter-select"
                                value={blacklistSeverityFilter}
                                onChange={(e) => setBlacklistSeverityFilter(e.target.value)}
                            >
                                <option value="">All Severities</option>
                                <option value="CRITICAL_FRAUD">Critical Fraud</option>
                                <option value="IDENTITY_THEFT">Identity Theft</option>
                                <option value="COUNTERFEIT_DEED">Counterfeit Deed</option>
                                <option value="PHANTOM_LISTING">Phantom Listing</option>
                            </select>
                        </div>

                        <div className="toolbar-right">
                            {/* Column Visibility Control */}
                            <div className="col-picker-container">
                                <button className="btn-col-picker" onClick={() => setShowColPicker(!showColPicker)}>
                                    <SlidersHorizontal size={14} /> Columns
                                </button>
                                {showColPicker && (
                                    <div className="col-dropdown">
                                        <label><input type="checkbox" checked={visibleCols.entity} onChange={() => setVisibleCols(p => ({ ...p, entity: !p.entity }))} /> Entity Value</label>
                                        <label><input type="checkbox" checked={visibleCols.type} onChange={() => setVisibleCols(p => ({ ...p, type: !p.type }))} /> Type</label>
                                        <label><input type="checkbox" checked={visibleCols.severity} onChange={() => setVisibleCols(p => ({ ...p, severity: !p.severity }))} /> Severity</label>
                                        <label><input type="checkbox" checked={visibleCols.incident} onChange={() => setVisibleCols(p => ({ ...p, incident: !p.incident }))} /> Incident Summary</label>
                                        <label><input type="checkbox" checked={visibleCols.flaggedBy} onChange={() => setVisibleCols(p => ({ ...p, flaggedBy: !p.flaggedBy }))} /> Flagged By</label>
                                        <label><input type="checkbox" checked={visibleCols.date} onChange={() => setVisibleCols(p => ({ ...p, date: !p.date }))} /> Date Flagged</label>
                                    </div>
                                )}
                            </div>

                            <button className="btn-add-blacklist" onClick={() => setAddBlacklistModalOpen(true)}>
                                <Plus size={16} /> Add Scammer Record
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <RefreshCw size={28} className="spin" />
                            <p>Loading blacklist registry...</p>
                        </div>
                    ) : blacklist.length === 0 ? (
                        <div className="empty-state">
                            <ShieldCheck size={44} color="#10b981" />
                            <h3>No Matching Records</h3>
                            <p>No entities found matching the current search and filter criteria.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="enterprise-table">
                                <thead>
                                    <tr>
                                        {visibleCols.entity && <th>Intercepted Entity</th>}
                                        {visibleCols.type && <th>Type</th>}
                                        {visibleCols.severity && <th>Fraud Severity</th>}
                                        {visibleCols.incident && <th>Incident / M.O. Summary</th>}
                                        {visibleCols.flaggedBy && <th>Flagged Authority</th>}
                                        {visibleCols.date && <th>Date Added</th>}
                                        {visibleCols.actions && <th style={{ textAlign: 'right' }}>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {blacklist.map((item) => (
                                        <tr key={item.id}>
                                            {visibleCols.entity && (
                                                <td>
                                                    <div className="entity-cell">
                                                        <span className="entity-display">{item.entityDisplay}</span>
                                                        <code className="raw-entity">{item.entityValue}</code>
                                                    </div>
                                                </td>
                                            )}
                                            {visibleCols.type && (
                                                <td>
                                                    <span className="type-badge">{item.entityType}</span>
                                                </td>
                                            )}
                                            {visibleCols.severity && (
                                                <td>
                                                    <span className={`severity-badge ${item.severity.toLowerCase()}`}>
                                                        {item.severity}
                                                    </span>
                                                </td>
                                            )}
                                            {visibleCols.incident && (
                                                <td className="incident-cell">
                                                    <p>{item.incidentSummary}</p>
                                                </td>
                                            )}
                                            {visibleCols.flaggedBy && (
                                                <td>
                                                    <span className="authority-tag">{item.flaggedBy}</span>
                                                </td>
                                            )}
                                            {visibleCols.date && (
                                                <td>
                                                    <span className="cell-date">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                            )}
                                            {visibleCols.actions && (
                                                <td style={{ textAlign: 'right' }}>
                                                    <button 
                                                        className="btn-pardon"
                                                        onClick={() => handleRemoveBlacklist(item.id)}
                                                        title="Pardon / Remove from Blacklist"
                                                    >
                                                        <Trash2 size={14} /> Remove
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Bar */}
                    <div className="pagination-bar">
                        <div className="pagination-info">
                            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalBlacklist} total records)
                        </div>

                        <div className="pagination-controls">
                            <select 
                                value={pageSize} 
                                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                                className="page-size-select"
                            >
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                            </select>

                            <button 
                                className="page-btn" 
                                disabled={page <= 1} 
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <span className="page-indicator">{page}</span>
                            <button 
                                className="page-btn" 
                                disabled={page >= totalPages} 
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AUDIT MODAL: SPLIT SCREEN TITLE DEED & OWNER INSPECTION */}
            {auditModalOpen && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-card wide">
                        <div className="modal-header">
                            <div>
                                <h2>Ownership Proof Audit: {selectedItem.name}</h2>
                                <span className="modal-subtitle">Verify title deed alignment with Zambia Lands Registry</span>
                            </div>
                            <button className="btn-close" onClick={() => setAuditModalOpen(false)}>×</button>
                        </div>

                        <div className="audit-split-view">
                            <div className="split-column">
                                <h3>Registered Credentials</h3>
                                {(() => {
                                    const d = getComplianceDetails(selectedItem);
                                    return (
                                        <div className="cred-list">
                                            <div className="cred-row">
                                                <label>Owner Legal Name:</label>
                                                <span>{d?.owner_name || 'N/A'}</span>
                                            </div>
                                            <div className="cred-row">
                                                <label>National ID / NRC:</label>
                                                <code>{d?.national_id || 'N/A'}</code>
                                            </div>
                                            <div className="cred-row">
                                                <label>Owner Phone:</label>
                                                <span>{d?.owner_phone || 'N/A'}</span>
                                            </div>
                                            <div className="cred-row">
                                                <label>Owner Email:</label>
                                                <span>{d?.owner_email || 'N/A'}</span>
                                            </div>
                                            <div className="cred-row">
                                                <label>Certificate of Title #:</label>
                                                <code className="highlight">{d?.title_deed_number || 'N/A'}</code>
                                            </div>
                                            <div className="cred-row">
                                                <label>Stand / Parcel #:</label>
                                                <span>{d?.parcel_number || 'N/A'}</span>
                                            </div>
                                            <div className="cred-row">
                                                <label>Physical Address:</label>
                                                <span>{selectedItem.address}</span>
                                            </div>
                                            <div className="cred-row">
                                                <label>Territory & Mode:</label>
                                                <span style={{ fontWeight: 600, color: '#2563eb' }}>
                                                    {d?.country ? `${d.country} • ` : ''}{selectedItem.listing_type === 'SALE' ? 'FOR SALE' : 'FOR LEASE'} • {selectedItem.type}
                                                </span>
                                            </div>
                                            {d?.specifications && Object.keys(d.specifications).length > 0 && (
                                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                                        {selectedItem.type} Specifications & Audit Attributes:
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                                                        {Object.entries(d.specifications).map(([key, val]) => {
                                                            if (val === null || val === undefined || val === '') return null;
                                                            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                            const displayVal = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val);
                                                            return (
                                                                <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{formattedKey}:</span>
                                                                    <strong style={{ color: '#0f172a' }}>{displayVal}</strong>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                <div className="notes-box">
                                    <label>Auditor Verification Notes:</label>
                                    <textarea 
                                        rows={3}
                                        placeholder="Record Ministry of Lands verification confirmation number or comments..."
                                        value={auditNotes}
                                        onChange={(e) => setAuditNotes(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="split-column">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Submitted Proof Documents</h3>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button 
                                            type="button" 
                                            className={`tab-btn-mini ${auditDocTab === 'deed' ? 'active' : ''}`}
                                            onClick={() => setAuditDocTab('deed')}
                                        >
                                            <FileText size={12} /> Deed
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`tab-btn-mini ${auditDocTab === 'id' ? 'active' : ''}`}
                                            onClick={() => setAuditDocTab('id')}
                                        >
                                            <UserCheck size={12} /> ID
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`tab-btn-mini ${auditDocTab === 'rates' ? 'active' : ''}`}
                                            onClick={() => setAuditDocTab('rates')}
                                        >
                                            <Building2 size={12} /> Rates
                                        </button>
                                    </div>
                                </div>
                                {(() => {
                                    const d = getComplianceDetails(selectedItem);
                                    let activeUrls: string[] = [];
                                    let activeLabel = 'Certificate of Title / Deed';

                                    if (auditDocTab === 'deed') {
                                        activeLabel = 'Certificate of Title / Deed Scan';
                                        const raw = d?.deed_url || (selectedItem as any).documentUrl;
                                        if (raw) activeUrls = raw.split(',').map((s: string) => s.trim()).filter(Boolean);
                                        if (d?.deed_files && Array.isArray(d.deed_files)) {
                                            d.deed_files.forEach((f: any) => { if (f?.url && !activeUrls.includes(f.url)) activeUrls.push(f.url); });
                                        }
                                        if (d?.specifications?.deed_files && Array.isArray(d.specifications.deed_files)) {
                                            d.specifications.deed_files.forEach((f: any) => { if (f?.url && !activeUrls.includes(f.url)) activeUrls.push(f.url); });
                                        }
                                    } else if (auditDocTab === 'id') {
                                        activeLabel = 'Owner Government ID (NRC/Passport)';
                                        const raw = d?.id_doc_url || d?.idDocumentUrl;
                                        if (raw) activeUrls = raw.split(',').map((s: string) => s.trim()).filter(Boolean);
                                        if (d?.id_files && Array.isArray(d.id_files)) {
                                            d.id_files.forEach((f: any) => { if (f?.url && !activeUrls.includes(f.url)) activeUrls.push(f.url); });
                                        }
                                        if (d?.specifications?.id_files && Array.isArray(d.specifications.id_files)) {
                                            d.specifications.id_files.forEach((f: any) => { if (f?.url && !activeUrls.includes(f.url)) activeUrls.push(f.url); });
                                        }
                                    } else {
                                        activeLabel = 'Council Rates / Utility Bill';
                                        const raw = d?.rates_statement_url || d?.ratesReceiptUrl;
                                        if (raw) activeUrls = raw.split(',').map((s: string) => s.trim()).filter(Boolean);
                                        if (d?.rates_files && Array.isArray(d.rates_files)) {
                                            d.rates_files.forEach((f: any) => { if (f?.url && !activeUrls.includes(f.url)) activeUrls.push(f.url); });
                                        }
                                        if (d?.specifications?.rates_files && Array.isArray(d.specifications.rates_files)) {
                                            d.specifications.rates_files.forEach((f: any) => { if (f?.url && !activeUrls.includes(f.url)) activeUrls.push(f.url); });
                                        }
                                    }

                                    if (activeUrls.length === 0) {
                                        return (
                                            <div className="preview-frame">
                                                <div className="no-preview">No {activeLabel.toLowerCase()} attached for this listing</div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                                            {activeUrls.map((docUrl, idx) => {
                                                const isPdf = docUrl.toLowerCase().endsWith('.pdf') || docUrl.includes('application/pdf');
                                                return (
                                                    <div key={idx} className="preview-img-box" style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', minHeight: '220px', background: '#f8fafc', position: 'relative' }}>
                                                        {isPdf ? (
                                                            <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem' }}>
                                                                <FileText size={48} color="#2563eb" />
                                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>PDF Document ({idx + 1} of {activeUrls.length})</span>
                                                                <button
                                                                    type="button"
                                                                    className="btn-popout"
                                                                    onClick={() => setDrmDocToView({ url: docUrl, title: `${activeLabel} (${idx + 1} of ${activeUrls.length})` })}
                                                                    style={{ position: 'static', marginTop: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7', color: 'white' }}
                                                                >
                                                                    <Shield size={14} /> Inspect in DRM Protected Vault
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <img 
                                                                    src={docUrl} 
                                                                    alt={`${activeLabel} ${idx + 1}`} 
                                                                    style={{ width: '100%', height: '220px', objectFit: 'contain', background: '#0f172a', pointerEvents: 'none' }} 
                                                                    draggable="false"
                                                                    onContextMenu={(e) => e.preventDefault()}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn-popout"
                                                                    onClick={() => setDrmDocToView({ url: docUrl, title: `${activeLabel} (${idx + 1} of ${activeUrls.length})` })}
                                                                    style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7', color: 'white' }}
                                                                >
                                                                    <Shield size={14} /> Inspect in DRM Vault
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setAuditModalOpen(false)}>
                                Close
                            </button>
                            <div className="footer-actions">
                                <button 
                                    className="btn-danger" 
                                    onClick={() => { setAuditModalOpen(false); setScamModalOpen(true); }}
                                >
                                    <ShieldAlert size={16} /> Flag Fraud & Blacklist
                                </button>
                                <button 
                                    className="btn-primary" 
                                    onClick={() => handleReview('APPROVED')}
                                >
                                    <ShieldCheck size={16} /> Approve & Grant Verified Badge
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SCAM FLAGGING & BLACKLIST INTERCEPTION MODAL */}
            {scamModalOpen && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header danger">
                            <div>
                                <h2>FLAG AS FRAUD & BLACKLIST OWNER</h2>
                                <span className="modal-subtitle">Immediate permanent bar from REMIS marketplace</span>
                            </div>
                            <button className="btn-close" onClick={() => setScamModalOpen(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="warning-callout">
                                <AlertTriangle size={24} color="#dc2626" />
                                <p>
                                    Confirming this action will immediately reject the property listing and write the owner's phone number and National ID to the <strong>Global Scammer Blacklist Registry</strong>.
                                </p>
                            </div>

                            <div className="form-group">
                                <label>Specific Reason / Incident Description *</label>
                                <textarea 
                                    rows={4}
                                    required
                                    placeholder="e.g. Altered deed seal; verified non-owner attempting unauthorized sublet fee collection."
                                    value={scamReason}
                                    onChange={(e) => setScamReason(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setScamModalOpen(false)}>
                                Cancel
                            </button>
                            <button 
                                className="btn-danger" 
                                disabled={!scamReason.trim()}
                                onClick={() => handleReview('SCAM_FLAGGED')}
                            >
                                Confirm Blacklist & Lock Identity
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD MANUAL BLACKLIST ENTRY MODAL */}
            {addBlacklistModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <div>
                                <h2>Add Entity to Scammer Blacklist</h2>
                                <span className="modal-subtitle">Intercept suspicious actors across all portals</span>
                            </div>
                            <button className="btn-close" onClick={() => setAddBlacklistModalOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleAddBlacklist}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Entity Category *</label>
                                    <select 
                                        value={newBlacklist.entityType}
                                        onChange={(e) => setNewBlacklist(prev => ({ ...prev, entityType: e.target.value }))}
                                    >
                                        <option value="PHONE_NUMBER">Phone Number</option>
                                        <option value="NATIONAL_ID">National ID / NRC / Passport</option>
                                        <option value="BANK_ACCOUNT">Bank / Mobile Money Account</option>
                                        <option value="TITLE_DEED">Counterfeit Deed Number</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Entity Exact Value (Match Key) *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. +260977888999 or 198241/11/1"
                                        value={newBlacklist.entityValue}
                                        onChange={(e) => setNewBlacklist(prev => ({ ...prev, entityValue: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Display Label</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. +260 977 *** 999 (Kabulonga scammer)"
                                        value={newBlacklist.entityDisplay}
                                        onChange={(e) => setNewBlacklist(prev => ({ ...prev, entityDisplay: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Severity Level *</label>
                                    <select 
                                        value={newBlacklist.severity}
                                        onChange={(e) => setNewBlacklist(prev => ({ ...prev, severity: e.target.value }))}
                                    >
                                        <option value="CRITICAL_FRAUD">Critical Fraud (Immediate Block)</option>
                                        <option value="IDENTITY_THEFT">Identity Theft</option>
                                        <option value="COUNTERFEIT_DEED">Counterfeit Deed</option>
                                        <option value="PHANTOM_LISTING">Phantom Listing</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Incident Evidence & Summary *</label>
                                    <textarea 
                                        rows={3} 
                                        required 
                                        placeholder="Details of complaint, police reference, or detected forgery..."
                                        value={newBlacklist.incidentSummary}
                                        onChange={(e) => setNewBlacklist(prev => ({ ...prev, incidentSummary: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setAddBlacklistModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-danger">
                                    Add to Blacklist
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Fullscreen Readonly DRM Protected Viewer Modal */}
            {drmDocToView && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(2, 6, 23, 0.88)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 3500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div style={{ width: '100%', maxWidth: '1040px', height: '88vh', maxHeight: '920px' }}>
                        <ProtectedDocumentViewer
                            title={drmDocToView.title}
                            documentType={drmDocToView.title.toLowerCase().includes('id') ? 'IDENTITY_NRC' : 'OWNERSHIP_TITLE_DEED'}
                            documentUrl={drmDocToView.url}
                            allowDownload={false}
                            enableShutter={true}
                            onClose={() => setDrmDocToView(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificationPage;
