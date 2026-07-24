import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all vendors
export const getVendors = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        const vendors = await prisma.vendor.findMany({
            where: {
                tenant_id: String(tenantId)
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json(vendors);
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ error: 'Failed to fetch vendors' });
    }
};

// Create a new vendor
export const createVendor = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, category, status, tenantId } = req.body;

        if (!name || !tenantId) {
            return res.status(400).json({ error: 'Name and Tenant ID are required' });
        }

        const vendor = await prisma.vendor.create({
            data: {
                name,
                email,
                phone,
                category,
                status: status || 'ACTIVE',
                tenant_id: tenantId
            }
        });

        res.status(201).json(vendor);
    } catch (error) {
        console.error('Error creating vendor:', error);
        res.status(500).json({ error: 'Failed to create vendor' });
    }
};

// Update a vendor
export const updateVendor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, phone, category, status } = req.body;

        const vendor = await prisma.vendor.update({
            where: { vendor_id: id },
            data: {
                name,
                email,
                phone,
                category,
                status
            }
        });

        res.json(vendor);
    } catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ error: 'Failed to update vendor' });
    }
};

// Delete a vendor
export const deleteVendor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.vendor.delete({
            where: { vendor_id: id }
        });

        res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        console.error('Error deleting vendor:', error);
        res.status(500).json({ error: 'Failed to delete vendor' });
    }
};
