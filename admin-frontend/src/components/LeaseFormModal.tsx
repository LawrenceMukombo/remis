import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Building, User } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface LeaseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any; // Add initialData prop
}

interface Property {
    id: string;
    name: string;
}

interface Renter {
    id: string;
    name: string;
}

const LeaseFormModal: React.FC<LeaseFormModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [renters, setRenters] = useState<Renter[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        propertyId: '',
        renterId: '',
        startDate: '',
        endDate: '',
        rentAmount: '',
        frequency: 'MONTHLY',
        status: 'ACTIVE'
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;
    const { showToast } = useToast();

    const [isLoadingDependencies, setIsLoadingDependencies] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchDependencies();
            if (initialData) {
                // Populate form with existing data
                setFormData({
                    propertyId: initialData.property.id || initialData.propertyId || '',
                    renterId: initialData.renter.id || initialData.renterId || '',
                    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
                    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
                    rentAmount: initialData.rentAmount || '',
                    frequency: initialData.frequency || 'MONTHLY',
                    status: initialData.status || 'ACTIVE'
                });
            } else {
                // Reset form for create mode
                setFormData({
                    propertyId: '',
                    renterId: '',
                    startDate: '',
                    endDate: '',
                    rentAmount: '',
                    frequency: 'MONTHLY',
                    status: 'ACTIVE'
                });
            }
        }
    }, [isOpen, initialData]);

    const fetchDependencies = async () => {
        setIsLoadingDependencies(true);
        try {
            // Fetch properties and renters in parallel
            // Note: In a real app, you might want to filter properties by status='AVAILABLE'
            const [propsRes, rentersRes] = await Promise.all([
                fetch(`http://localhost:4000/api/properties?tenantId=${tenantId}`),
                fetch(`http://localhost:4000/api/renters?tenantId=${tenantId}`)
            ]);

            const propsData = await propsRes.json();
            const rentersData = await rentersRes.json();

            // Handle potential different response structures (e.g. { properties: [...] } vs [...])
            const loadedProperties = Array.isArray(propsData) ? propsData : (propsData.properties || []);
            const loadedRenters = Array.isArray(rentersData) ? rentersData : (rentersData.renters || []);

            setProperties(loadedProperties);
            setRenters(loadedRenters);

            console.log("Loaded dependencies:", { properties: loadedProperties.length, renters: loadedRenters.length });

        } catch (error) {
            console.error('Error fetching dependencies:', error);
            showToast('Failed to load form data. Please try again.', 'error');
        } finally {
            setIsLoadingDependencies(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData
                ? `http://localhost:4000/api/leases/${initialData.id}`
                : 'http://localhost:4000/api/leases';

            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, tenantId })
            });

            if (!res.ok) throw new Error(initialData ? 'Failed to update lease' : 'Failed to create lease');

            showToast(initialData ? 'Lease updated successfully!' : 'Lease created successfully!', 'success');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving lease:', error);
            showToast(initialData ? 'Failed to update lease' : 'Failed to create lease', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000,
            boxSizing: 'border-box'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                width: '700px',
                maxWidth: '95vw',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                boxSizing: 'border-box'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {initialData ? 'Edit Lease' : 'Create New Lease'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                        {/* Property Selection */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Property</label>
                            <div style={{ position: 'relative' }}>
                                <Building size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <select
                                    required
                                    value={formData.propertyId}
                                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                                    disabled={isLoadingDependencies}
                                    style={{
                                        width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        borderRadius: '8px', border: '1px solid #d1d5db',
                                        backgroundColor: isLoadingDependencies ? '#f3f4f6' : '#f9fafb',
                                        cursor: isLoadingDependencies ? 'wait' : 'default',
                                        opacity: isLoadingDependencies ? 0.7 : 1,
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="">{isLoadingDependencies ? 'Loading properties...' : 'Select a Property'}</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Renter Selection */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Tenant / Renter</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <select
                                    required
                                    value={formData.renterId}
                                    onChange={(e) => setFormData({ ...formData, renterId: e.target.value })}
                                    disabled={isLoadingDependencies}
                                    style={{
                                        width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        borderRadius: '8px', border: '1px solid #d1d5db',
                                        backgroundColor: isLoadingDependencies ? '#f3f4f6' : '#f9fafb',
                                        cursor: isLoadingDependencies ? 'wait' : 'default',
                                        opacity: isLoadingDependencies ? 0.7 : 1,
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="">{isLoadingDependencies ? 'Loading renters...' : 'Select a Renter'}</option>
                                    {renters.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Start Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        borderRadius: '8px', border: '1px solid #d1d5db',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>End Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        borderRadius: '8px', border: '1px solid #d1d5db',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Rent Amount */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Rent Amount</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.rentAmount}
                                    onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        borderRadius: '8px', border: '1px solid #d1d5db',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Frequency */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Frequency</label>
                            <select
                                value={formData.frequency}
                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.75rem',
                                    borderRadius: '8px', border: '1px solid #d1d5db',
                                    backgroundColor: '#f9fafb',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="QUARTERLY">Quarterly</option>
                                <option value="ANNUALLY">Annually</option>
                                <option value="WEEKLY">Weekly</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
                            {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Lease' : 'Create Lease')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaseFormModal;
