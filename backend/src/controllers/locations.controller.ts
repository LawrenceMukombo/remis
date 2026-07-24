
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get Locations with filters
export const getLocations = async (req: Request, res: Response) => {
    try {
        const { type, parentId, level, tenantId } = req.query;

        const where: any = {};

        // Basic filters
        if (type) where.type = String(type);
        if (parentId) where.parentId = String(parentId);
        if (level) where.level = Number(level);

        // Tenant scope (optional if public, but good practice)
        if (tenantId) where.tenantId = String(tenantId);
        else {
            const firstTenant = await prisma.tenant.findFirst();
            if (firstTenant) where.tenantId = firstTenant.id;
        }

        const locations = await prisma.location.findMany({
            where,
            orderBy: { name: 'asc' }
        });

        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching locations', error });
    }
};

// Get Hierarchy Tree (for verification)
export const getHierarchy = async (req: Request, res: Response) => {
    try {
        const firstTenant = await prisma.tenant.findFirst();
        if (!firstTenant) return res.json([]);

        const locations = await prisma.location.findMany({
            where: { tenantId: firstTenant.id },
            orderBy: { name: 'asc' }
        });

        const buildTree = (parentId: string | null): any[] => {
            return locations
                .filter(l => l.parentId === parentId)
                .map(l => ({
                    ...l,
                    children: buildTree(l.id)
                }));
        };

        res.json(buildTree(null));

    } catch (error) {
        res.status(500).json({ message: 'Error fetching hierarchy', error });
    }
};

// Get Single Location (for breadcrumbs/details)
export const getLocationById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const location = await prisma.location.findUnique({
            where: { id },
            include: { parent: true }
        });
        if (!location) return res.status(404).json({ message: 'Location not found' });
        res.json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching location', error });
    }
};

// Create Location
export const createLocation = async (req: Request, res: Response) => {
    try {
        const { name, type, level, parentId, tenantId } = req.body;
        const location = await prisma.location.create({
            data: { name, type, level, parentId, tenantId: tenantId || 'default' }
            // Note: forcing 'default' or handling tenant logic better in real app
        });
        res.json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error creating location', error });
    }
};

// Update Location
export const updateLocation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const location = await prisma.location.update({
            where: { id },
            data: { name }
        });
        res.json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error updating location', error });
    }
};

// Delete Location
export const deleteLocation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const children = await prisma.location.count({ where: { parentId: id } });
        if (children > 0) {
            return res.status(400).json({ message: 'Cannot delete location with children' });
        }

        await prisma.location.delete({ where: { id } });
        res.json({ message: 'Location deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting location', error });
    }
};

// Bulk Create Locations
export const bulkCreateLocations = async (req: Request, res: Response) => {
    try {
        const { locations, tenantId } = req.body;

        if (!Array.isArray(locations)) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array of locations.' });
        }

        const createdLocations = await prisma.location.createMany({
            data: locations.map((loc: any) => ({
                name: loc.name,
                type: loc.type,
                level: loc.level,
                parentId: loc.parentId || null,
                tenantId: tenantId || 'default'
            }))
        });

        res.json({ message: `${createdLocations.count} locations created successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Error bulk creating locations', error });
    }
};
