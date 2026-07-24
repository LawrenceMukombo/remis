import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPortalConfig = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        const config = await prisma.portalConfig.findUnique({
            where: { tenantId: String(tenantId) }
        });
        res.json(config || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const updatePortalConfig = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.body;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        const config = await prisma.portalConfig.upsert({
            where: { tenantId },
            update: req.body,
            create: req.body
        });
        res.json(config);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};
