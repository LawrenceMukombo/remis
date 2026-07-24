
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSettings = async (req: Request, res: Response) => {
    try {
        // Assuming we have a way to identify the current tenant. 
        // For now, let's fetch the first tenant since it's a single deployment scenario mostly,
        // OR we relies on the user's tenantId if authenticated.
        // But for "public" config (login page branding), we need a way to get it without auth.
        // Let's assume domain-based lookup or just first tenant for now.

        // Check if tenantId is in query or user body (if auth) which might be not available for login page.
        // Implementation: Get the first tenant.
        const tenant = await prisma.tenant.findFirst();

        if (!tenant) {
            return res.status(404).json({ message: 'No tenant found' });
        }

        res.json({
            name: tenant.name,
            config: tenant.config,
            features: tenant.features
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    const { tenantId } = req.params;
    const { config, features, name } = req.body;

    try {
        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                config,
                features,
                name
            },
        });

        res.json(updatedTenant);
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error });
    }
};
