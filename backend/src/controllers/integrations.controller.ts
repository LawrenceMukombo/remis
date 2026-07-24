import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getIntegrations = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        const integrations = await prisma.integrationConnection.findMany({
            where: { tenantId: String(tenantId) }
        });
        res.json(integrations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const connectIntegration = async (req: Request, res: Response) => {
    try {
        const { provider, apiKey, apiSecret, tenantId, config } = req.body;

        const integration = await prisma.integrationConnection.upsert({
            where: {
                tenantId_provider: { tenantId, provider }
            },
            update: { apiKey, apiSecret, config, status: 'CONNECTED' },
            create: {
                provider,
                apiKey,
                apiSecret,
                tenantId,
                config,
                status: 'CONNECTED'
            }
        });
        res.json(integration);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const disconnectIntegration = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.integrationConnection.delete({ where: { id } });
        res.json({ message: 'Disconnected' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};
