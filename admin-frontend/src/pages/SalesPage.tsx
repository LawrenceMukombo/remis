import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, FileText } from 'lucide-react';
import './SalesPage.css';

interface Sale {
    id: string;
    agreedPrice: string;
    status: string;
    settlementDate: string;
    property: {
        id: string;
        name: string;
        address: string;
    };
    buyer: {
        user_id: string;
        full_name: string;
        email: string;
    };
}

const SalesPage: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/sales?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSales(data);
            }
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'draft': return 'status-draft';
            case 'signed': return 'status-signed';
            case 'settled': return 'status-settled';
            case 'completed': return 'status-completed';
            default: return 'status-draft';
        }
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(parseFloat(amount));
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="sales-page">
            <div className="sales-header">
                <div className="sales-title">
                    <h1>Property Sales</h1>
                    <p>Manage property dispositions, sales contracts, and settlements.</p>
                </div>
                <div className="sales-actions">
                    <button className="create-btn" onClick={() => alert('Feature coming soon: Sales Workflow')}>
                        <Plus size={18} />
                        New Sale
                    </button>
                </div>
            </div>

            <div className="sales-table-container">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading sales...</div>
                ) : sales.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>
                        <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No active sales found</h3>
                        <p>Sales records will appear here.</p>
                    </div>
                ) : (
                    <table className="sales-table">
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Buyer</th>
                                <th>Agreed Price</th>
                                <th>Settlement Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(sale => (
                                <tr key={sale.id}>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{sale.property.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{sale.property.address}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{sale.buyer.full_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{sale.buyer.email}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{formatCurrency(sale.agreedPrice)}</div>
                                    </td>
                                    <td>
                                        {formatDate(sale.settlementDate)}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(sale.status)}`}>
                                            {sale.status}
                                        </span>
                                    </td>
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

export default SalesPage;
