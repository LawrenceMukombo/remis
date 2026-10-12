
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
        if (parentId === 'null' || parentId === 'root') {
            where.parentId = null;
        } else if (parentId) {
            where.parentId = String(parentId);
        }
        if (level) where.level = Number(level);

        const country = req.query.country ? String(req.query.country) : undefined;
        if (country && !parentId && Number(level) === 1) {
            where.name = { contains: country, mode: 'insensitive' };
        }

        // Tenant scope
        if (tenantId && tenantId !== 'undefined' && tenantId !== 'null' && tenantId !== '') {
            where.tenantId = String(tenantId);
        } else if (!parentId && !country) {
            // Only fall back to firstTenant when querying top-level roots without any tenant/country scope
            const firstTenant = await prisma.tenant.findFirst();
            if (firstTenant) where.tenantId = firstTenant.id;
        }

        const locations = await prisma.location.findMany({
            where,
            include: {
                _count: {
                    select: {
                        children: true,
                        properties: true
                    }
                }
            },
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
        let resolvedTenantId = tenantId;
        if (!resolvedTenantId || resolvedTenantId === 'default') {
            const firstTenant = await prisma.tenant.findFirst();
            resolvedTenantId = firstTenant?.id;
        }

        const location = await prisma.location.create({
            data: {
                name,
                type: type || 'LOCATION',
                level: Number(level) || 1,
                parentId: parentId || null,
                tenantId: resolvedTenantId
            }
        });
        res.json(location);
    } catch (error) {
        console.error('Error creating location:', error);
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

        let resolvedTenantId = tenantId;
        if (!resolvedTenantId || resolvedTenantId === 'default') {
            const firstTenant = await prisma.tenant.findFirst();
            resolvedTenantId = firstTenant?.id;
        }

        const createdLocations = await prisma.location.createMany({
            data: locations.map((loc: any) => ({
                name: loc.name,
                type: loc.type || 'LOCATION',
                level: Number(loc.level) || 1,
                parentId: loc.parentId || null,
                tenantId: resolvedTenantId
            }))
        });

        res.json({ message: `${createdLocations.count} locations created successfully`, count: createdLocations.count });
    } catch (error) {
        console.error('Error bulk creating locations:', error);
        res.status(500).json({ message: 'Error bulk creating locations', error });
    }
};

// Seed Complete Zambia Hierarchy for a Tenant
export const seedZambiaLocations = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.body;
        let resolvedTenantId = tenantId;
        if (!resolvedTenantId || resolvedTenantId === 'default') {
            const firstTenant = await prisma.tenant.findFirst();
            resolvedTenantId = firstTenant?.id;
        }

        if (!resolvedTenantId) {
            return res.status(400).json({ message: 'Valid Tenant ID required' });
        }

        // Run seed script logic or require script
        const { exec } = require('child_process');
        const path = require('path');
        const scriptPath = path.resolve(__dirname, '../scripts/seedZambiaHierarchy.js');

        exec(`node "${scriptPath}"`, (err: any, stdout: any, stderr: any) => {
            if (err) {
                console.error('Error executing Zambia seed script:', err);
                return res.status(500).json({ message: 'Failed to execute Zambia seeder', error: err.message });
            }
            res.json({
                message: 'Zambia Provinces, Districts, and Settlements successfully seeded!',
                details: 'All 10 Provinces, official Districts and Communities are now available.'
            });
        });
    } catch (error) {
        console.error('Error in seedZambiaLocations:', error);
        res.status(500).json({ message: 'Error seeding Zambia locations', error });
    }
};
