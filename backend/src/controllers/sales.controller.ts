import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all property sales
export const getSales = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query; // Filter by tenant if applicable (via Property -> Tenant)

        const sales = await prisma.propertySale.findMany({
            where: tenantId ? {
                property: {
                    tenantId: String(tenantId)
                }
            } : {},
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                },
                buyer: {
                    select: {
                        user_id: true,
                        full_name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
};

// Create a new property sale record
export const createSale = async (req: Request, res: Response) => {
    try {
        const { propertyId, buyerId, agreedPrice, status, settlementDate } = req.body;

        if (!propertyId || !buyerId) {
            return res.status(400).json({ error: 'Property ID and Buyer ID are required' });
        }

        const sale = await prisma.propertySale.create({
            data: {
                propertyId,
                buyerId,
                agreedPrice: agreedPrice ? Number(agreedPrice) : undefined,
                status: status || 'DRAFT',
                settlementDate: settlementDate ? new Date(settlementDate) : undefined
            },
            include: {
                property: true,
                buyer: true
            }
        });

        res.status(201).json(sale);
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(500).json({ error: 'Failed to create sale record' });
    }
};

// Update a sale record
export const updateSale = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { agreedPrice, status, settlementDate } = req.body;

        const sale = await prisma.propertySale.update({
            where: { id },
            data: {
                agreedPrice: agreedPrice ? Number(agreedPrice) : undefined,
                status,
                settlementDate: settlementDate ? new Date(settlementDate) : undefined
            }
        });

        res.json(sale);
    } catch (error) {
        console.error('Error updating sale:', error);
        res.status(500).json({ error: 'Failed to update sale' });
    }
};

// Delete a sale record
export const deleteSale = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.propertySale.delete({
            where: { id }
        });

        res.json({ message: 'Sale record deleted successfully' });
    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).json({ error: 'Failed to delete sale record' });
    }
};
