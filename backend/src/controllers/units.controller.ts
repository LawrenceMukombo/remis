import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all units with filters
export const getUnits = async (req: Request, res: Response) => {
    try {
        const { propertyId, tenantId, status } = req.query;

        const where: any = {};
        if (propertyId) where.propertyId = String(propertyId);
        if (tenantId) where.tenantId = String(tenantId);
        if (status) where.status = String(status);

        const units = await prisma.unit.findMany({
            where,
            include: {
                property: true
            },
            orderBy: { name: 'asc' }
        });

        res.json({ units });
    } catch (error) {
        console.error('Error fetching units:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get single unit
export const getUnitById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const unit = await prisma.unit.findUnique({
            where: { id },
            include: {
                property: true
            }
        });

        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        res.json(unit);
    } catch (error) {
        console.error('Error fetching unit:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Create a new unit
export const createUnit = async (req: Request, res: Response) => {
    try {
        const {
            name,
            propertyId,
            tenantId,
            type,
            area,
            bedrooms,
            bathrooms,
            marketRent,
            status,
            images
        } = req.body;

        const unit = await prisma.unit.create({
            data: {
                name,
                propertyId,
                tenantId,
                type: type || 'STANDARD',
                area: area ? parseFloat(String(area)) : null,
                bedrooms: bedrooms ? parseInt(String(bedrooms)) : null,
                bathrooms: bathrooms ? parseFloat(String(bathrooms)) : null,
                marketRent: marketRent ? parseFloat(String(marketRent)) : null,
                status: status || 'AVAILABLE',
                images: images || []
            },
            include: {
                property: true
            }
        });

        res.status(201).json(unit);
    } catch (error) {
        console.error('Error creating unit:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update a unit
export const updateUnit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            type,
            size,      // Frontend sends 'size'
            bedrooms,
            bathrooms,
            rent,      // Frontend sends 'rent'
            status,
            images
        } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (type !== undefined) updateData.type = type;

        // Map 'size' to 'area' for Prisma schema
        if (size !== undefined) updateData.area = size ? parseFloat(String(size)) : null;

        if (bedrooms !== undefined) updateData.bedrooms = bedrooms ? parseInt(String(bedrooms)) : null;
        if (bathrooms !== undefined) updateData.bathrooms = bathrooms ? parseFloat(String(bathrooms)) : null;

        // Map 'rent' to 'marketRent' for Prisma schema
        if (rent !== undefined) updateData.marketRent = rent ? parseFloat(String(rent)) : null;

        if (status !== undefined) updateData.status = status;
        if (images !== undefined) updateData.images = images;

        const unit = await prisma.unit.update({
            where: { id },
            data: updateData,
            include: {
                property: true
            }
        });

        res.json(unit);
    } catch (error) {
        console.error('Error updating unit:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a unit
export const deleteUnit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.unit.delete({
            where: { id }
        });

        res.json({ message: 'Unit deleted successfully' });
    } catch (error) {
        console.error('Error deleting unit:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
