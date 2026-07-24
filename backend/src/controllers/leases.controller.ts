import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all leases for a tenant
export const getLeases = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        const leases = await prisma.lease.findMany({
            where: {
                tenantId: String(tenantId)
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                },
                renter: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(leases);
    } catch (error) {
        console.error('Error fetching leases:', error);
        res.status(500).json({ error: 'Failed to fetch leases' });
    }
};

// Create a new lease
export const createLease = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, rentAmount, frequency, status, propertyId, renterId, tenantId } = req.body;

        if (!propertyId || !renterId || !tenantId) {
            return res.status(400).json({ error: 'Property, Renter, and Tenant IDs are required' });
        }

        const lease = await prisma.lease.create({
            data: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                rentAmount: Number(rentAmount),
                frequency,
                status,
                propertyId,
                renterId,
                tenantId
            },
            include: {
                property: true,
                renter: true
            }
        });

        res.status(201).json(lease);
    } catch (error) {
        console.error('Error creating lease:', error);
        res.status(500).json({ error: 'Failed to create lease' });
    }
};

// Update a lease
export const updateLease = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, rentAmount, frequency, status } = req.body;

        const lease = await prisma.lease.update({
            where: { id },
            data: {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                rentAmount: rentAmount ? Number(rentAmount) : undefined,
                frequency,
                status
            }
        });

        res.json(lease);
    } catch (error) {
        console.error('Error updating lease:', error);
        res.status(500).json({ error: 'Failed to update lease' });
    }
};

// Delete a lease
export const deleteLease = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.lease.delete({
            where: { id }
        });

        res.json({ message: 'Lease deleted successfully' });
    } catch (error) {
        console.error('Error deleting lease:', error);
        res.status(500).json({ error: 'Failed to delete lease' });
    }
};
