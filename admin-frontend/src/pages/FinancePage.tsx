import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, AlertCircle, FileText, CreditCard } from 'lucide-react';
import './FinancePage.css';

interface Invoice {
    invoice_id: string;
    invoice_no: string;
    total: string;
    balance_due: string;
    due_date: string;
    status: string;
    billToParty: {
        id: string;
        name: string;
    };
}

interface Payment {
    id: string;
    amount: string;
    date: string;
    method: string;
    status: string;
    renter: {
        id: string;
        name: string;
    };
}

const FinancePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments'>('overview');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invRes, payRes] = await Promise.all([
                fetch(`http://localhost:4000/api/finance/invoices?tenantId=${tenantId}`),
                fetch(`http://localhost:4000/api/finance/payments?tenantId=${tenantId}`)
            ]);

            const invData = await invRes.json();
            const payData = await payRes.json();

            if (Array.isArray(invData)) setInvoices(invData);
            if (Array.isArray(payData)) setPayments(payData);

        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(Number(amount));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Calculate Totals
    const totalRevenue = payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const outstandingInvoices = invoices.reduce((acc, curr) => acc + Number(curr.balance_due), 0);

    return (
        <div className="finance-page">
            <div className="finance-header">
                <div className="finance-title">
                    <h1>Financial Management</h1>
                    <p>Track revenue, invoices, and expenses.</p>
                </div>
            </div>

            <div className="finance-tabs">
                <button
                    className={`finance-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`finance-tab ${activeTab === 'invoices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('invoices')}
                >
                    Invoices
                </button>
                <button
                    className={`finance-tab ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payments')}
                >
                    Payments
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading finance data...</div>
            ) : (
                <>
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="finance-overview">
                            <div className="overview-card">
                                <h3>Total Revenue (Received)</h3>
                                <div className="amount" style={{ color: '#059669' }}>{formatCurrency(totalRevenue)}</div>
                            </div>
                            <div className="overview-card">
                                <h3>Outstanding Invoices</h3>
                                <div className="amount" style={{ color: '#dc2626' }}>{formatCurrency(outstandingInvoices)}</div>
                            </div>
                            {/* Add Expense summary if model existed */}
                        </div>
                    )}

                    {/* INVOICES TAB */}
                    {activeTab === 'invoices' && (
                        <div className="finance-table-container">
                            {invoices.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No invoices found.</div>
                            ) : (
                                <table className="finance-table">
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Billed To</th>
                                            <th>Due Date</th>
                                            <th>Total</th>
                                            <th>Balance</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map(inv => (
                                            <tr key={inv.invoice_id}>
                                                <td style={{ fontWeight: '500' }}>{inv.invoice_no || 'N/A'}</td>
                                                <td>{inv.billToParty?.name || 'Unknown'}</td>
                                                <td>{formatDate(inv.due_date)}</td>
                                                <td>{formatCurrency(inv.total)}</td>
                                                <td style={{ color: Number(inv.balance_due) > 0 ? '#dc2626' : '#059669' }}>
                                                    {formatCurrency(inv.balance_due)}
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${inv.status.toLowerCase()}`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* PAYMENTS TAB */}
                    {activeTab === 'payments' && (
                        <div className="finance-table-container">
                            {payments.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No payments found.</div>
                            ) : (
                                <table className="finance-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Renter</th>
                                            <th>Method</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(pay => (
                                            <tr key={pay.id}>
                                                <td>{formatDate(pay.date)}</td>
                                                <td>{pay.renter?.name || 'Unknown'}</td>
                                                <td>{pay.method}</td>
                                                <td style={{ fontWeight: '600' }}>{formatCurrency(pay.amount)}</td>
                                                <td>
                                                    <span className={`status-badge status-${pay.status.toLowerCase()}`}>
                                                        {pay.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FinancePage;
