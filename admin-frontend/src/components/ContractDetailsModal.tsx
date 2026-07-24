import React from 'react';
import { X, FileText, Calendar, DollarSign, User, Shield, CheckCircle } from 'lucide-react';

interface ContractDetailsModalProps {
    contract: any;
    isOpen: boolean;
    onClose: () => void;
}

const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({ contract, isOpen, onClose }) => {
    if (!isOpen || !contract) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                background: 'white', padding: '0', borderRadius: '12px',
                width: '700px', maxWidth: '90%', position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem', borderBottom: '1px solid #e5e7eb',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>{contract.title}</h2>
                            <span className={`status-badge status-${contract.status}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                {contract.status}
                            </span>
                        </div>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>ID: {contract.id} • {contract.type}</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={24} color="#6b7280" />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '2rem' }}>

                    {/* Key Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '1rem' }}>Contract Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <User size={18} className="text-gray-400" />
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Counterparty</p>
                                        <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>{contract.party}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <DollarSign size={18} className="text-gray-400" />
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Contract Value</p>
                                        <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>PGK {contract.value?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '1rem' }}>Dates</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Calendar size={18} className="text-gray-400" />
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Effective Date</p>
                                        <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>{contract.startDate || 'Not Set'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Calendar size={18} className="text-gray-400" />
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Expiration Date</p>
                                        <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>{contract.endDate || 'Not Set'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs / Sections */}
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>Obligations & Deliverables</h3>

                        {contract.status === 'DRAFT' ? (
                            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border: '1px dashed #d1d5db' }}>
                                <p style={{ color: '#6b7280', margin: 0 }}>No obligations tracked for draft contracts.</p>
                                <button className="btn-secondary" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>+ Add Obligation</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></div>
                                        <span style={{ fontWeight: 500 }}>Monthly Service Report</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Due: 15th of every month</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ca8a04' }}></div>
                                        <span style={{ fontWeight: 500 }}>Quarterly Business Review</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Due: 30 Sep 2026</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>Clauses</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {['Confidentiality', 'Liability Cap', 'Governing Law', 'Termination', 'Indemnity'].map((tag, i) => (
                                <span key={i} style={{
                                    padding: '0.25rem 0.75rem', background: '#e0e7ff', color: '#4338ca',
                                    borderRadius: '16px', fontSize: '0.875rem', fontWeight: 500
                                }}>
                                    {tag}
                                </span>
                            ))}
                            <button style={{
                                padding: '0.25rem 0.75rem', background: 'transparent', color: '#6b7280',
                                borderRadius: '16px', fontSize: '0.875rem', fontWeight: 500, border: '1px dashed #9ca3af',
                                cursor: 'pointer'
                            }}>+ Add</button>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb',
                    display: 'flex', justifyContent: 'flex-end', gap: '1rem',
                    borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px'
                }}>
                    <button onClick={onClose} className="btn-secondary">Close</button>
                    <button className="btn-primary">Edit Contract</button>
                </div>
            </div>
        </div>
    );
};

export default ContractDetailsModal;
