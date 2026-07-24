import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/compliance - List all compliance records
export const getComplianceRecords = async (req: Request, res: Response) => {
    try {
        const { tenantId, type, status, propertyId } = req.query;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        const where: any = {
            tenantId: String(tenantId)
        };

        if (type) where.type = String(type);
        if (status) where.status = String(status);
        if (propertyId) where.propertyId = String(propertyId);

        const records = await prisma.complianceRecord.findMany({
            where,
            include: {
                property: {
                    select: { name: true, address: true }
                }
            },
            orderBy: { expiryDate: 'asc' } // Expiring soonest first
        });

        res.json(records);
    } catch (error) {
        console.error('Error fetching compliance records:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

// POST /api/compliance - Create new record
export const createComplianceRecord = async (req: Request, res: Response) => {
    try {
        const {
            propertyId,
            title,
            type,
            status,
            authority,
            issuedDate,
            expiryDate,
            documentUrl,
            notes,
            tenantId
        } = req.body;

        const record = await prisma.complianceRecord.create({
            data: {
                propertyId,
                title,
                type,
                status,
                authority,
                issuedDate: issuedDate ? new Date(issuedDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                documentUrl,
                notes,
                tenantId
            }
        });

        res.status(201).json(record);
    } catch (error) {
        console.error('Error creating compliance record:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

// PUT /api/compliance/:id - Update record
export const updateComplianceRecord = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            title,
            type,
            status,
            authority,
            issuedDate,
            expiryDate,
            documentUrl,
            notes
        } = req.body;

        const record = await prisma.complianceRecord.update({
            where: { id },
            data: {
                title,
                type,
                status,
                authority,
                issuedDate: issuedDate ? new Date(issuedDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                documentUrl,
                notes
            }
        });

        res.json(record);
    } catch (error) {
        console.error('Error updating compliance record:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

// DELETE /api/compliance/:id - Delete record
export const deleteComplianceRecord = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.complianceRecord.delete({ where: { id } });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting compliance record:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

// GET /api/compliance/stats - Dashboard stats
export const getComplianceStats = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        const tId = String(tenantId);
        const now = new Date();

        // Expired items
        const expiredCount = await prisma.complianceRecord.count({
            where: {
                tenantId: tId,
                expiryDate: { lt: now }, // expired
                status: { not: 'COMPLIANT' } // exclude explicit complaints? no, expiry overrides
            }
        });

        // Compliant items
        const compliantCount = await prisma.complianceRecord.count({
            where: {
                tenantId: tId,
                status: 'COMPLIANT',
                expiryDate: { gte: now }
            }
        });

        // Upcoming Expiry (next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const warningCount = await prisma.complianceRecord.count({
            where: {
                tenantId: tId,
                expiryDate: { gte: now, lte: thirtyDaysFromNow }
            }
        });

        const pendingCount = await prisma.complianceRecord.count({
            where: {
                tenantId: tId,
                status: 'PENDING'
            }
        });

        res.json({
            expired: expiredCount,
            compliant: compliantCount,
            warning: warningCount,
            pending: pendingCount
        });

    } catch (error) {
        console.error('Error getting compliance stats:', error);
        res.status(500).json({ error: 'Failed' });
    }
};
