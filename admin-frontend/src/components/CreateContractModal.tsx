import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

const CreateContractModal: React.FC<CreateContractModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'VENDOR',
        party: '',
        startDate: '',
        endDate: '',
        value: '',
        status: 'DRAFT'
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            value: Number(formData.value)
        });
        onClose();
        // Reset form
        setFormData({
            title: '',
            type: 'VENDOR',
            party: '',
            startDate: '',
            endDate: '',
            value: '',
            status: 'DRAFT'
        });
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                background: 'white', padding: '2rem', borderRadius: '12px',
                width: '500px', maxWidth: '90%', position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                    <X size={20} color="#6b7280" />
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', color: '#111827' }}>
                    New Contract
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Master Services Agreement"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                            >
                                <option value="VENDOR">Vendor Agreement</option>
                                <option value="NDA">NDA</option>
                                <option value="LEASE_ADDENDUM">Lease Addendum</option>
                                <option value="EMPLOYMENT">Employment</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="ACTIVE">Active</option>
                                <option value="REVIEW">In Review</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Counterparty Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={formData.party}
                            onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                            placeholder="e.g. Acme Corp"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                required
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value (PGK)</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            placeholder="0.00"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.625rem 1.25rem', borderRadius: '8px', border: '1px solid #d1d5db',
                                background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '0.625rem 1.25rem', borderRadius: '8px', border: 'none',
                                background: '#4f46e5', color: 'white', fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            Create Contract
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContractModal;
