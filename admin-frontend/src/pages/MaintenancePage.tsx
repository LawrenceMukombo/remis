import React, { useState, useEffect } from 'react';
import { Plus, PenTool, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './MaintenancePage.css';

interface MaintenanceTicket {
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    createdAt: string;
    property?: {
        id: string;
        name: string;
    };
}

interface Property {
    id: string;
    name: string;
}

const MaintenancePage: React.FC = () => {
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        propertyId: ''
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;
    const { showToast } = useToast();

    useEffect(() => {
        fetchTickets();
        fetchProperties();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/maintenance?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setTickets(data);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProperties = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/properties?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setProperties(data);
        } catch (error) {
            console.error('Error fetching properties:', error);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, tenantId })
            });

            if (!res.ok) throw new Error('Failed to create ticket');

            showToast('Maintenance ticket created', 'success');
            setShowModal(false);
            setFormData({ title: '', description: '', priority: 'MEDIUM', propertyId: '' });
            fetchTickets();
        } catch (error) {
            console.error('Error creating ticket:', error);
            showToast('Failed to create ticket', 'error');
        }
    };

    const getPriorityClass = (priority: string) => {
        switch (priority.toUpperCase()) {
            case 'LOW': return 'priority-low';
            case 'MEDIUM': return 'priority-medium';
            case 'HIGH': return 'priority-high';
            case 'URGENT': return 'priority-urgent';
            default: return 'priority-medium';
        }
    };

    return (
        <div className="maintenance-page">
            <div className="maintenance-header">
                <div className="maintenance-title">
                    <h1>Maintenance</h1>
                    <p>Track repairs, work orders, and property issues.</p>
                </div>
                <div className="maintenance-actions">
                    <button className="create-btn" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        New Ticket
                    </button>
                </div>
            </div>

            {/* Create Ticket Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '600px', maxWidth: '90vw',
                        padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        boxSizing: 'border-box'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                            New Maintenance Ticket
                            <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
                        </h2>
                        <form onSubmit={handleCreateTicket}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Title</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                    placeholder="e.g. Leaky Faucet"
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Property</label>
                                <select
                                    value={formData.propertyId}
                                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                >
                                    <option value="">General / No Property</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                    placeholder="Describe the issue..."
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer' }}>Create Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="maintenance-table-container">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading tickets...</div>
                ) : tickets.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>
                        <PenTool size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No maintenance tickets</h3>
                        <p>Create a ticket to track maintenance tasks.</p>
                    </div>
                ) : (
                    <table className="maintenance-table">
                        <thead>
                            <tr>
                                <th>Issue</th>
                                <th>Property</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td>
                                        <div style={{ fontWeight: '600', color: '#111827' }}>{ticket.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280', maxWidth: '300px' }}>{ticket.description}</div>
                                    </td>
                                    <td>
                                        {ticket.property ? (
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{ticket.property.name}</div>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>General</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${ticket.status.toLowerCase().replace('_', '-')}`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
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

export default MaintenancePage;
