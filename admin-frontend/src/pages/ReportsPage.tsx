import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, CreditCard, PieChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import './ReportsPage.css';

import { useSettings } from '../context/SettingsContext';

const ReportsPage: React.FC = () => {
    const { settings } = useSettings();
    const currencyCode = settings?.config.locale.currency || 'USD';

    const getCurrencySymbol = (code: string) => {
        switch (code) {
            case 'USD': return '$';
            case 'PGK': return 'K';
            case 'AUD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            default: return code; // Fallback to code if unknown
        }
    };

    const currencySymbol = getCurrencySymbol(currencyCode);

    const [stats, setStats] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch summary stats
            const statsRes = await fetch(`http://localhost:4000/api/analytics/dashboard?tenantId=${tenantId}`);
            const statsData = await statsRes.json();
            setStats(statsData);

            // Fetch revenue chart (Using existing endpoint, which currently tracks Property Payments)
            // Ideally we would update this to include POS sales over time too
            const chartRes = await fetch(`http://localhost:4000/api/analytics/revenue?tenantId=${tenantId}`);
            const chartData = await chartRes.json();
            setRevenueData(chartData);
        } catch (error) {
            console.error('Error fetching reports data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="reports-loading">Loading reports...</div>;

    return (
        <div className="reports-page">
            <div className="reports-header">
                <h1>Financial Reports & Analytics</h1>
                <p>Comprehensive overview of property and point-of-sale performance.</p>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="icon start">
                        <DollarSign size={24} />
                    </div>
                    <div className="info">
                        <h3>Total Revenue</h3>
                        <p className="value">{currencySymbol}{stats?.totalRevenue?.toLocaleString() || '0'}</p>
                        <span className="trend positive">Lifetime Earnings</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="icon property">
                        <TrendingUp size={24} />
                    </div>
                    <div className="info">
                        <h3>Property Income</h3>
                        <p className="value">{currencySymbol}{stats?.propertyRevenue?.toLocaleString() || '0'}</p>
                        <span className="sub-text">Rent & Lease Payments</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="icon pos">
                        <CreditCard size={24} />
                    </div>
                    <div className="info">
                        <h3>POS Sales</h3>
                        <p className="value">{currencySymbol}{stats?.posRevenue?.toLocaleString() || '0'}</p>
                        <span className="sub-text">Direct Store Sales</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="icon debt">
                        <PieChart size={24} />
                    </div>
                    <div className="info">
                        <h3>Outstanding Debt</h3>
                        <p className="value">{currencySymbol}{stats?.outstandingDebt?.toLocaleString() || '0'}</p>
                        <span className="trend negative">Unpaid Invoices</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-container main">
                    <div className="chart-header">
                        <h3>Revenue Trend (6 Months)</h3>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `${currencySymbol}${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number | undefined) => [`${currencySymbol}${value?.toLocaleString() ?? 0}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-container secondary">
                    <div className="chart-header">
                        <h3>Revenue Distribution</h3>
                    </div>
                    <div className="chart-body distribution">
                        {/* Simple CSS Bar for distribution */}
                        <div className="dist-bars">
                            <div className="dist-group">
                                <div className="label">
                                    <span>Property Income</span>
                                    <span>{Math.round((stats?.propertyRevenue / stats?.totalRevenue) * 100) || 0}%</span>
                                </div>
                                <div className="bar-bg">
                                    <div className="bar-fill property" style={{ width: `${(stats?.propertyRevenue / stats?.totalRevenue) * 100 || 0}%` }}></div>
                                </div>
                            </div>
                            <div className="dist-group">
                                <div className="label">
                                    <span>POS Sales</span>
                                    <span>{Math.round((stats?.posRevenue / stats?.totalRevenue) * 100) || 0}%</span>
                                </div>
                                <div className="bar-bg">
                                    <div className="bar-fill pos" style={{ width: `${(stats?.posRevenue / stats?.totalRevenue) * 100 || 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="insight-box">
                            <h4>Quick Insight</h4>
                            <p>
                                Property income makes up the majority of your revenue.
                                Consider running promotions to boost POS sales.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
