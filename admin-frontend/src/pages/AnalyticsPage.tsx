import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AnalyticsPage.css';

interface DashboardStats {
    totalRevenue: number;
    outstandingDebt: number;
    occupancyRate: number;
    totalLeads: number;
}

const AnalyticsPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenueData, setRevenueData] = useState([]);
    const [propertyData, setPropertyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, revenueRes, propertyRes] = await Promise.all([
                    fetch(`http://localhost:4000/api/analytics/stats?tenantId=${tenantId}`),
                    fetch(`http://localhost:4000/api/analytics/revenue-chart?tenantId=${tenantId}`),
                    fetch(`http://localhost:4000/api/analytics/property-chart?tenantId=${tenantId}`)
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (revenueRes.ok) setRevenueData(await revenueRes.json());
                if (propertyRes.ok) setPropertyData(await propertyRes.json());

            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tenantId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Analytics...</div>;

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <div className="analytics-title">
                    <h1>Performance Analytics</h1>
                    <p>Real-time insights into your property portfolio</p>
                </div>
            </div>

            {stats && (
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-label">Total Revenue</div>
                        <div className="kpi-value" style={{ color: '#059669' }}>
                            {formatCurrency(stats.totalRevenue)}
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-label">Outstanding Debt</div>
                        <div className="kpi-value" style={{ color: '#dc2626' }}>
                            {formatCurrency(stats.outstandingDebt)}
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-label">Occupancy Rate</div>
                        <div className="kpi-value" style={{ color: '#2563eb' }}>
                            {stats.occupancyRate}%
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-label">Total Leads</div>
                        <div className="kpi-value" style={{ color: '#4b5563' }}>
                            {stats.totalLeads}
                        </div>
                    </div>
                </div>
            )}

            <div className="charts-grid">
                <div className="chart-card">
                    <h3 className="chart-title">Monthly Revenue</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                />
                                <Tooltip
                                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                                    cursor={{ fill: '#f3f4f6' }}
                                />
                                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3 className="chart-title">Properties by Type</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={propertyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {propertyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
