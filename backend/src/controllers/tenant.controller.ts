import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List all organizations / tenants
export const listTenants = async (req: Request, res: Response) => {
    try {
        const tenants = await prisma.tenant.findMany({
            include: {
                _count: {
                    select: {
                        properties: true,
                        locations: true,
                        leases: true,
                        users: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json({ success: true, data: tenants });
    } catch (error) {
        res.status(500).json({ message: 'Error listing organizations', error });
    }
};

// Create a new organization
export const createTenant = async (req: Request, res: Response) => {
    try {
        const { name, domain, config, features, country, currency } = req.body;
        if (!name) return res.status(400).json({ message: 'Organization name is required' });

        const rawSlug = (domain || name.toLowerCase().replace(/[^a-z0-9]/g, '-')).slice(0, 24);
        const uniqueDomain = `${rawSlug}-${Date.now().toString().slice(-4)}`;

        const baseConfig = {
            country: country || 'Global',
            branding: {
                logoUrl: '',
                primaryColor: '#4f46e5',
                secondaryColor: '#10b981',
                fontFamily: 'Inter, sans-serif',
                ...config?.branding
            },
            contact: {
                email: '',
                phone: '',
                address: '',
                ...config?.contact
            },
            locale: {
                currency: currency || 'USD',
                dateFormat: 'YYYY-MM-DD',
                timeFormat: '12h',
                ...config?.locale
            },
            locationLabels: config?.locationLabels || {
                1: 'Country',
                2: 'State / Province',
                3: 'City / District',
                4: 'Locality / Area'
            }
        };

        const defaultFeatures = {
            properties: true,
            leases: true,
            sales: true,
            landlords: true,
            analytics: true,
            locations: true,
            maintenance: true,
            crm: true,
            finance: true,
            ...features
        };

        const tenant = await prisma.tenant.create({
            data: {
                name,
                domain: uniqueDomain,
                config: baseConfig,
                features: defaultFeatures
            }
        });

        // Seed initial root location for the new organization
        await prisma.location.create({
            data: {
                name: `${name} - Primary Operations`,
                type: 'HQ',
                level: 1,
                tenantId: tenant.id
            }
        });

        res.status(201).json({ success: true, data: tenant });
    } catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({ message: 'Error creating organization', error });
    }
};

// Get settings for active organization or first
export const getSettings = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        let tenant = null;

        if (tenantId && String(tenantId) !== 'undefined' && String(tenantId) !== 'null') {
            tenant = await prisma.tenant.findUnique({
                where: { id: String(tenantId) }
            });
        }

        if (!tenant) {
            tenant = await prisma.tenant.findFirst();
        }

        if (!tenant) {
            return res.status(404).json({ message: 'No organization found' });
        }

        res.json({
            id: tenant.id,
            name: tenant.name,
            config: tenant.config,
            features: tenant.features
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error });
    }
};

// Update organization settings
export const updateSettings = async (req: Request, res: Response) => {
    const { tenantId } = req.params;
    const { config, features, name } = req.body;

    try {
        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                ...(config && { config }),
                ...(features && { features }),
                ...(name && { name })
            },
        });

        res.json({ success: true, data: updatedTenant });
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error });
    }
};
