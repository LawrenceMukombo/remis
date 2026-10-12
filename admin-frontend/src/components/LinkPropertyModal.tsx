import React, { useState, useEffect } from 'react';
import { Search, Building, Check, X, Loader2, MapPin } from 'lucide-react';

interface Property {
    id: string;
    name: string;
    address?: string;
    status: string;
    type: string;
    landlordId?: string;
}

interface LinkPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLink: (propertyId: string) => Promise<void>;
    tenantId: string;
    landlordName: string;
}

const LinkPropertyModal: React.FC<LinkPropertyModalProps> = ({ isOpen, onClose, onLink, tenantId, landlordName }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [linking, setLinking] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProperties();
            setSearchQuery('');
            setSelectedPropertyId(null);
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen) fetchProperties();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            // Fetch available properties (we filter client-side for now or rely on backend search)
            let url = `http://localhost:4000/api/properties?tenantId=${tenantId}&limit=50`;
            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            const res = await fetch(url);
            const data = await res.json();

            // Filter out properties that already have a DIFFERENT landlord? 
            // Or just show all. Let's show all but mark ones that are taken.
            // For now, simple list.
            if (data.properties) {
                setProperties(data.properties);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLink = async () => {
        if (!selectedPropertyId) return;
        setLinking(true);
        try {
            await onLink(selectedPropertyId);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLinking(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px',
                display: 'flex', flexDirection: 'column', maxHeight: '85vh',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>Link Property</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>Assign a property to <strong>{landlordName}</strong></p>
                    </div>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                        <X size={20} color="#94a3b8" />
                    </button>
                </div>

                <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search properties by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem',
                                boxSizing: 'border-box'
                            }}
                            autoFocus
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: '#94a3b8' }}>
                            <Loader2 className="animate-spin" size={24} />
                        </div>
                    ) : properties.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            No properties found.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {properties.map(property => (
                                <button
                                    key={property.id}
                                    onClick={() => setSelectedPropertyId(property.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '0.75rem 1rem', border: '1px solid', borderRadius: '8px',
                                        backgroundColor: selectedPropertyId === property.id ? '#eff6ff' : 'white',
                                        borderColor: selectedPropertyId === property.id ? '#3b82f6' : 'transparent',
                                        cursor: 'pointer', textAlign: 'left',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '6px',
                                            backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#64748b'
                                        }}>
                                            <Building size={18} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>{property.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <MapPin size={12} /> {property.address || 'No address'}
                                            </div>
                                        </div>
                                    </div>
                                    {selectedPropertyId === property.id && (
                                        <div style={{ color: '#3b82f6' }}>
                                            <Check size={20} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.625rem 1.25rem', borderRadius: '6px', border: '1px solid #cbd5e1',
                            backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLink}
                        disabled={!selectedPropertyId || linking}
                        style={{
                            padding: '0.625rem 1.5rem', borderRadius: '6px', border: 'none',
                            backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', cursor: (!selectedPropertyId || linking) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            opacity: (!selectedPropertyId || linking) ? 0.7 : 1
                        }}
                    >
                        {linking ? <Loader2 className="animate-spin" size={18} /> : null}
                        Link Property
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkPropertyModal;
