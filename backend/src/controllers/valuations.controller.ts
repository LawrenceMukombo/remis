import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/valuations - Get valuations for a property
export const getValuations = async (req: Request, res: Response) => {
    try {
        const { propertyId, tenantId } = req.query;

        const where: any = {};
        if (propertyId) where.propertyId = String(propertyId);
        if (tenantId) where.tenantId = String(tenantId);

        const valuations = await prisma.propertyValuation.findMany({
            where,
            orderBy: { valuationDate: 'desc' }
        });

        res.json({ valuations });
    } catch (error) {
        console.error('Error fetching valuations:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// POST /api/valuations - Create new valuation
export const createValuation = async (req: Request, res: Response) => {
    try {
        const {
            propertyId,
            valuationDate,
            amount,
            valuationType,
            valuedBy,
            notes,
            tenantId
        } = req.body;

        const valuation = await prisma.propertyValuation.create({
            data: {
                propertyId,
                valuationDate: new Date(valuationDate),
                amount: parseFloat(String(amount)),
                valuationType,
                valuedBy,
                notes,
                tenantId
            }
        });

        res.status(201).json(valuation);
    } catch (error) {
        console.error('Error creating valuation:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// DELETE /api/valuations/:id - Delete valuation
export const deleteValuation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.propertyValuation.delete({
            where: { id }
        });

        res.json({ message: 'Valuation deleted successfully' });
    } catch (error) {
        console.error('Error deleting valuation:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
