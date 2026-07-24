import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, Mail, Search, MessageSquare, Briefcase, Plus, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './CRMPage.css';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: string;
    status: string;
}

interface Lead {
    id: string;
    type: 'SALE' | 'LEASE';
    source: string;
    clientName: string;
    clientEmail: string;
    propertyName: string;
    unitName?: string;
    status: string;
    date: string;
    details?: string;
}

const CRMPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'contacts' | 'leads'>('contacts');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [showContactModal, setShowContactModal] = useState(false);

    // New Contact Form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'PROSPECT',
        status: 'ACTIVE'
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;
    const { showToast } = useToast();

    useEffect(() => {
        if (activeTab === 'contacts') fetchContacts();
        if (activeTab === 'leads') fetchLeads();
    }, [activeTab]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/crm/contacts?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setContacts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/crm/leads?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setLeads(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateContact = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/crm/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, tenantId })
            });

            if (!res.ok) throw new Error('Failed to create contact');

            showToast('Contact created successfully', 'success');
            setShowContactModal(false);
            setFormData({ name: '', email: '', phone: '', type: 'PROSPECT', status: 'ACTIVE' });
            fetchContacts();
        } catch (error) {
            showToast('Failed to create contact', 'error');
        }
    };

    return (
        <div className="crm-page">
            <div className="crm-header">
                <div className="crm-title">
                    <h1>CRM & Leads</h1>
                    <p>Manage relationships with tenants, prospects, and buyers.</p>
                </div>
                {activeTab === 'contacts' && (
                    <button className="action-btn" onClick={() => setShowContactModal(true)}>
                        <UserPlus size={18} />
                        Add Contact
                    </button>
                )}
            </div>

            <div className="crm-tabs">
                <button
                    className={`crm-tab ${activeTab === 'contacts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('contacts')}
                >
                    Contacts & Tenants
                </button>
                <button
                    className={`crm-tab ${activeTab === 'leads' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leads')}
                >
                    Inquiries & Leads
                </button>
            </div>

            <div className="crm-content">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
                ) : activeTab === 'contacts' ? (
                    <ContactsTable contacts={contacts} />
                ) : (
                    <LeadsTable leads={leads} />
                )}
            </div>

            {/* Create Contact Modal */}
            {showContactModal && (
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
                            Add New Contact
                            <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowContactModal(false)} />
                        </h2>
                        <form onSubmit={handleCreateContact}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white' }}
                                >
                                    <option value="PROSPECT">Prospect</option>
                                    <option value="TENANT">Tenant</option>
                                    <option value="BUYER">Buyer</option>
                                    <option value="INVESTOR">Investor</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" onClick={() => setShowContactModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer' }}>Save Contact</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ContactsTable: React.FC<{ contacts: Contact[] }> = ({ contacts }) => (
    <div className="crm-table-container">
        {contacts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No contacts found.</div>
        ) : (
            <table className="crm-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Contact Info</th>
                        <th>Type</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map(contact => (
                        <tr key={contact.id}>
                            <td>
                                <div className="contact-cell">
                                    <div className="contact-avatar">
                                        {contact.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontWeight: '600' }}>{contact.name}</span>
                                </div>
                            </td>
                            <td>
                                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> {contact.email || '-'}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {contact.phone || '-'}</span>
                                </div>
                            </td>
                            <td>
                                <span style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                                    {contact.type}
                                </span>
                            </td>
                            <td>
                                <span style={{ color: contact.status === 'ACTIVE' ? '#059669' : '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>
                                    {contact.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);

const LeadsTable: React.FC<{ leads: Lead[] }> = ({ leads }) => (
    <div className="crm-table-container">
        {leads.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No inquiries or leads found.</div>
        ) : (
            <table className="crm-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Interest</th>
                        <th>Property</th>
                        <th>Details</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map(lead => (
                        <tr key={lead.id}>
                            <td style={{ color: '#6b7280' }}>{new Date(lead.date).toLocaleDateString()}</td>
                            <td>
                                <div style={{ fontWeight: '600' }}>{lead.clientName}</div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{lead.clientEmail}</div>
                            </td>
                            <td>
                                <span className={`lead-type-badge lead-type-${lead.type.toLowerCase()}`}>
                                    {lead.type}
                                </span>
                            </td>
                            <td>
                                <div>{lead.propertyName}</div>
                                {lead.unitName && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{lead.unitName}</div>}
                            </td>
                            <td>
                                <div style={{ fontSize: '0.875rem', color: '#4b5563', maxWidth: '300px' }}>{lead.details || '-'}</div>
                            </td>
                            <td>
                                <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                    {lead.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);

export default CRMPage;
