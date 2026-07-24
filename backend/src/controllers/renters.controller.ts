import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all renters for a tenant
export const getRenters = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        const renters = await prisma.renter.findMany({
            where: {
                tenantId: String(tenantId),
                status: 'ACTIVE'
            },
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json(renters);
    } catch (error) {
        console.error('Error fetching renters:', error);
        res.status(500).json({ error: 'Failed to fetch renters' });
    }
};
