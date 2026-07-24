import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        // 1. Total Revenue (Sum of all completed payments + POS Sales)
        const payments = await prisma.payment.aggregate({
            where: { tenantId: String(tenantId), status: 'COMPLETED' },
            _sum: { amount: true }
        });
        const propertyRevenue = Number(payments._sum.amount || 0);

        const posSales = await prisma.sale.aggregate({
            where: { tenantId: String(tenantId), status: 'COMPLETED' },
            _sum: { totalAmount: true }
        });
        const posRevenue = Number(posSales._sum.totalAmount || 0);

        const totalRevenue = propertyRevenue + posRevenue;

        // 2. Outstanding Debt (Sum of invoice balance_due)
        const invoices = await prisma.invoice.aggregate({
            where: { tenant_id: String(tenantId), status: { not: 'PAID' } },
            _sum: { balance_due: true }
        });
        const outstandingDebt = invoices._sum.balance_due || 0;

        // 3. Occupancy Rate
        const totalUnits = await prisma.unit.count({ where: { tenantId: String(tenantId) } });
        const occupiedUnits = await prisma.unit.count({
            where: { tenantId: String(tenantId), status: 'OCCUPIED' }
        });
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

        // 4. Total Leads (Lease + Sale interests)
        // Need to filter by properties owned by tenant
        const properties = await prisma.property.findMany({
            where: { tenantId: String(tenantId) }, select: { id: true }
        });
        const propertyIds = properties.map(p => p.id);

        let totalLeads = 0;
        if (propertyIds.length > 0) {
            const leaseLeads = await prisma.expressionOfInterest.count({ where: { propertyId: { in: propertyIds } } });
            const saleLeads = await prisma.saleInterest.count({ where: { propertyId: { in: propertyIds } } });
            totalLeads = leaseLeads + saleLeads;
        }

        res.json({
            totalRevenue,
            propertyRevenue,
            posRevenue,
            outstandingDebt,
            occupancyRate: Math.round(occupancyRate),
            totalLeads
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getRevenueChart = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        // Get payments from last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const payments = await prisma.payment.findMany({
            where: {
                tenantId: String(tenantId),
                date: { gte: sixMonthsAgo },
                status: 'COMPLETED'
            },
            orderBy: { date: 'asc' }
        });

        // Group by Month (YYYY-MM)
        const monthlyRevenue: Record<string, number> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        payments.forEach(p => {
            const date = new Date(p.date);
            const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
            monthlyRevenue[key] = (monthlyRevenue[key] || 0) + Number(p.amount);
        });

        // Convert to array for Recharts
        const chartData = Object.entries(monthlyRevenue).map(([name, value]) => ({ name, value }));

        res.json(chartData);

    } catch (error) {
        console.error('Error fetching revenue chart:', error);
        res.status(500).json({ error: 'Failed to fetch revenue chart' });
    }
};

export const getPropertyPerformance = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        // Return top 5 properties by revenue (This is complex with current schema, so defaulting to mock or simple logic)
        // For now, let's just return property counts by type

        const properties = await prisma.property.groupBy({
            by: ['type'],
            where: { tenantId: String(tenantId) },
            _count: { id: true }
        });

        const chartData = properties.map(p => ({
            name: p.type,
            value: p._count.id
        }));

        res.json(chartData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};
