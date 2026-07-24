import React, { useState, useEffect } from 'react';
import {
    FileText, Shield, AlertTriangle, File, Plus, Search,
    Filter, MoreVertical, CheckCircle, Clock
} from 'lucide-react';
import './ContractsPage.css'; // We'll create this later

// Placeholder data for now (mocking the backend we just set up)
const MOCK_CONTRACTS = [
    { id: '1', title: 'Vendor Agreement - CleanCo', type: 'VENDOR', status: 'ACTIVE', party: 'CleanCo Services', endDate: '2026-12-31', value: 12000 },
    { id: '2', title: 'NDA - TechPioneers', type: 'NDA', status: 'ACTIVE', party: 'TechPioneers Inc', endDate: '2027-01-15', value: 0 },
    { id: '3', title: 'Lease Addendum - Unit 404', type: 'LEASE_ADDENDUM', status: 'DRAFT', party: 'John Doe', endDate: '2026-06-30', value: 500 },
];

import CreateContractModal from '../components/CreateContractModal';

import ContractDetailsModal from '../components/ContractDetailsModal';

const ContractsPage: React.FC = () => {
    const [view, setView] = useState<'OVERVIEW' | 'CONTRACTS' | 'CLAUSES' | 'TEMPLATES'>('OVERVIEW');
    const [contracts, setContracts] = useState(MOCK_CONTRACTS);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
    const [selectedContract, setSelectedContract] = useState<any>(null);

    const handleCardClick = (status: string) => {
        setFilterStatus(status);
        setView('CONTRACTS');
    };

    const handleDeleteContract = (id: string) => {
        setContracts(contracts.filter(c => c.id !== id));
        setActionMenuOpenId(null);
    };

    const handleViewContract = (contract: any) => {
        setSelectedContract(contract);
        setActionMenuOpenId(null);
    };

    const handleCreateContract = (newContractData: any) => {
        const newContract = {
            id: (contracts.length + 1).toString(),
            ...newContractData,
        };
        setContracts([...contracts, newContract]);
        setFilterStatus('ALL');
        setView('CONTRACTS');
    };

    const handleUseTemplate = (templateName: string, type: string) => {
        // Quickly create a draft from template
        const newContract = {
            id: (contracts.length + 1).toString(),
            title: `Draft - ${templateName}`,
            type: type,
            status: 'DRAFT',
            party: 'TBD',
            endDate: '',
            value: 0
        };
        setContracts([...contracts, newContract]);
        setFilterStatus('DRAFT');
        setView('CONTRACTS');
    };

    const filteredContracts = contracts.filter(c =>
        filterStatus === 'ALL' ? true : c.status === filterStatus
    );

    return (
        <div className="contracts-page">
            <CreateContractModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateContract}
            />

            <ContractDetailsModal
                isOpen={!!selectedContract}
                contract={selectedContract}
                onClose={() => setSelectedContract(null)}
            />

            <div className="contracts-header">
                <div>
                    <h1>Contract Lifecycle Management</h1>
                    <p>Governance for complex contracts beyond standard leases.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setView('TEMPLATES')}>Templates</button>
                    <button className="btn-secondary" onClick={() => setView('CLAUSES')}>Clause Library</button>
                    <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}><Plus size={16} /> New Contract</button>
                </div>
            </div>

            <div className="contracts-tabs">
                <button className={`tab-btn ${view === 'OVERVIEW' ? 'active' : ''}`} onClick={() => setView('OVERVIEW')}>Overview</button>
                <button className={`tab-btn ${view === 'CONTRACTS' ? 'active' : ''}`} onClick={() => { setView('CONTRACTS'); setFilterStatus('ALL'); }}>All Contracts</button>
                <button className={`tab-btn ${view === 'CLAUSES' ? 'active' : ''}`} onClick={() => setView('CLAUSES')}>Clause Library</button>
                <button className={`tab-btn ${view === 'TEMPLATES' ? 'active' : ''}`} onClick={() => setView('TEMPLATES')}>Templates</button>
            </div>

            <div className="contracts-content">
                {view === 'OVERVIEW' && (
                    <div className="overview-grid">
                        <div className="stats-card interactive-card" onClick={() => handleCardClick('ALL')}>
                            <div className="stats-icon bg-blue-100 text-blue-600"><FileText size={24} /></div>
                            <div>
                                <h3>Total Contracts</h3>
                                <p className="stats-value">{contracts.length}</p>
                            </div>
                        </div>
                        <div className="stats-card interactive-card" onClick={() => handleCardClick('ACTIVE')}>
                            <div className="stats-icon bg-green-100 text-green-600"><Shield size={24} /></div>
                            <div>
                                <h3>Active</h3>
                                <p className="stats-value">{contracts.filter(c => c.status === 'ACTIVE').length}</p>
                            </div>
                        </div>
                        <div className="stats-card interactive-card" onClick={() => handleCardClick('EXPIRING')}>
                            <div className="stats-icon bg-yellow-100 text-yellow-600"><AlertTriangle size={24} /></div>
                            <div>
                                <h3>Expiring Soon</h3>
                                <p className="stats-value">1</p>
                            </div>
                        </div>
                        <div className="stats-card interactive-card" onClick={() => handleCardClick('DRAFT')}>
                            <div className="stats-icon bg-purple-100 text-purple-600"><CheckCircle size={24} /></div>
                            <div>
                                <h3>Pending Approval</h3>
                                <p className="stats-value">{contracts.filter(c => c.status === 'DRAFT').length}</p>
                            </div>
                        </div>

                        <div className="full-width-card">
                            <h3>Renewal Alerts</h3>
                            <div className="alert-list">
                                <div className="alert-item">
                                    <Clock size={16} className="text-yellow-500" />
                                    <span><strong>Vendor Agreement - CleanCo</strong> expires in 45 days.</span>
                                    <button className="btn-xs" onClick={() => alert("Simulating review of CleanCo agreement...")}>Review</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'CONTRACTS' && (
                    <div className="contracts-list-view">
                        <div className="filters-bar">
                            <div className="search-input">
                                <Search size={16} />
                                <input type="text" placeholder="Search contracts..." />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {filterStatus !== 'ALL' && (
                                    <span className="active-filter-badge">
                                        Filtering by: {filterStatus}
                                        <button onClick={() => setFilterStatus('ALL')} style={{ marginLeft: '8px', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
                                    </span>
                                )}
                                <button className="btn-icon"><Filter size={16} /></button>
                            </div>
                        </div>
                        <table className="contracts-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Party</th>
                                    <th>Status</th>
                                    <th>End Date</th>
                                    <th>Value</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContracts.length > 0 ? (
                                    filteredContracts.map(contract => (
                                        <tr key={contract.id}>
                                            <td><strong>{contract.title}</strong></td>
                                            <td>{contract.type}</td>
                                            <td>{contract.party}</td>
                                            <td><span className={`status-badge status-${contract.status}`}>{contract.status}</span></td>
                                            <td>{contract.endDate || '-'}</td>
                                            <td>PGK {contract.value.toLocaleString()}</td>
                                            <td style={{ position: 'relative' }}>
                                                <button
                                                    className="btn-icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActionMenuOpenId(actionMenuOpenId === contract.id ? null : contract.id);
                                                    }}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {actionMenuOpenId === contract.id && (
                                                    <div className="action-menu-dropdown">
                                                        <button onClick={() => handleViewContract(contract)}>View Details</button>
                                                        <button onClick={() => alert(`Editing ${contract.title}`)}>Edit</button>
                                                        <button className="text-red-500" onClick={() => handleDeleteContract(contract.id)}>Delete</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                                            No contracts found matching filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'CLAUSES' && (
                    <div className="clause-library">
                        <div className="library-header">
                            <h3>Standard Clauses</h3>
                            <button className="btn-sm" onClick={() => alert("Add Clause feature coming in next step (Backend API pending).")}><Plus size={14} /> Add Clause</button>
                        </div>
                        <div className="clause-grid">
                            <div className="clause-card interactive-card">
                                <h4>Standard Liability Cap</h4>
                                <p className="clause-excerpt">"The total liability of either party shall not exceed..."</p>
                                <span className="tag">Liability</span>
                            </div>
                            <div className="clause-card interactive-card">
                                <h4>Mutual NDA</h4>
                                <p className="clause-excerpt">"Confidential information shall mean any data..."</p>
                                <span className="tag">Confidentiality</span>
                            </div>
                            <div className="clause-card interactive-card">
                                <h4>Force Majeure</h4>
                                <p className="clause-excerpt">"Neither party shall be liable for delay..."</p>
                                <span className="tag">General</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* TEMPLATES view remains the same... keeping it short here but will strictly verify the replace block */}
                {view === 'TEMPLATES' && (
                    <div className="templates-view">
                        <div className="library-header">
                            <h3>Contract Templates</h3>
                            <button className="btn-sm" onClick={() => alert("Template builder opening... (Demo)")}><Plus size={14} /> New Template</button>
                        </div>
                        <div className="template-list">
                            <div className="template-item interactive-card" onClick={() => handleUseTemplate('Consultant Agreement', 'VENDOR')}>
                                <File size={32} className="text-gray-400" />
                                <div className="template-info">
                                    <h4>Standard Consultant Agreement</h4>
                                    <p>For independent contractors and consultants.</p>
                                </div>
                                <button className="btn-sm">Use</button>
                            </div>
                            <div className="template-item interactive-card" onClick={() => handleUseTemplate('NDA (One Way)', 'NDA')}>
                                <File size={32} className="text-gray-400" />
                                <div className="template-info">
                                    <h4>Non-Disclosure Agreement (One Way)</h4>
                                    <p>Standard protection for proprietary information.</p>
                                </div>
                                <button className="btn-sm">Use</button>
                            </div>
                            <div className="template-item interactive-card" onClick={() => handleUseTemplate('Residential Lease', 'LEASE')}>
                                <File size={32} className="text-gray-400" />
                                <div className="template-info">
                                    <h4>Residential Lease Agreement</h4>
                                    <p>Standard fixed-term residential lease.</p>
                                </div>
                                <button className="btn-sm">Use</button>
                            </div>
                            <div className="template-item interactive-card" onClick={() => handleUseTemplate('Commercial Lease (NNN)', 'LEASE')}>
                                <File size={32} className="text-gray-400" />
                                <div className="template-info">
                                    <h4>Commercial Lease Agreement</h4>
                                    <p>Triple net lease for commercial properties.</p>
                                </div>
                                <button className="btn-sm">Use</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContractsPage;
