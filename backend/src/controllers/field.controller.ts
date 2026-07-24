import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const getDevices = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        const devices = await prisma.fieldDevice.findMany({
            where: { tenantId: String(tenantId) },
            include: { user: { select: { full_name: true } } }
        });
        res.json(devices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const registerDevice = async (req: Request, res: Response) => {
    try {
        let { deviceId, platform, appVersion, tenantId, assignedTo } = req.body;

        if (!tenantId) {
            // Fallback: Assign to the first found tenant (Dev Mode)
            const defaultTenant = await prisma.tenant.findFirst();
            if (defaultTenant) {
                tenantId = defaultTenant.id;
            } else {
                return res.status(400).json({ error: 'Tenant ID required and no default tenant found' });
            }
        }

        const device = await prisma.fieldDevice.upsert({
            where: { deviceId },
            update: { lastSyncAt: new Date(), appVersion, assignedTo, tenantId }, // Update tenantId too just in case
            create: {
                deviceId,
                platform,
                appVersion,
                tenantId,
                assignedTo,
                lastSyncAt: new Date()
            }
        });
        res.json(device);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const blockDevice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // BLOCKED or ACTIVE
        const device = await prisma.fieldDevice.update({
            where: { id },
            data: { status }
        });
        res.json(device);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const syncData = async (req: Request, res: Response) => {
    try {
        const { deviceId, localChanges } = req.body;

        // 1. Verify Device
        const device = await prisma.fieldDevice.findUnique({
            where: { deviceId }
        });

        if (!device || !device.tenantId) {
            return res.status(401).json({ error: 'Device not authorized' });
        }

        // 2. Get Default Location (Required by Schema)
        const defaultLocation = await prisma.location.findFirst({
            where: { tenantId: device.tenantId }
        });

        if (!defaultLocation) {
            // Check if ANY location exists, if not create a default one?
            // For safety, return error.
            return res.status(400).json({ error: 'Tenant has no locations configured. Cannot sync properties.' });
        }

        const results = [];

        // 3. Process Items
        if (Array.isArray(localChanges)) {
            for (const item of localChanges) {
                // Determine Type (Property Creation)
                if (item.propertyName) {
                    try {
                        // Process Images
                        let processedImages: string[] = [];
                        if (item.images && Array.isArray(item.images)) {
                            for (const imgStr of item.images) {
                                if (typeof imgStr === 'string' && imgStr.startsWith('data:image')) {
                                    try {
                                        const matches = imgStr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                                        if (matches && matches.length === 3) {
                                            const ext = matches[1].split('/')[1];
                                            const buffer = Buffer.from(matches[2], 'base64');
                                            const filename = `field-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;

                                            // Ensure uploads dir
                                            const uploadDir = 'uploads';
                                            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

                                            fs.writeFileSync(path.join(uploadDir, filename), buffer);

                                            const protocol = req.protocol;
                                            const host = req.get('host');
                                            processedImages.push(`${protocol}://${host}/${filename}`);
                                        }
                                    } catch (err) {
                                        console.error("Failed to process image", err);
                                    }
                                }
                            }
                        }

                        const newProp = await prisma.property.create({
                            data: {
                                name: item.propertyName,
                                address: item.address || '',
                                type: item.type || 'RESIDENTIAL',
                                status: item.status || 'AVAILABLE',
                                description: item.description || null,
                                tenantId: device.tenantId,
                                locationId: defaultLocation.id,
                                latitude: item.gps ? parseFloat(item.gps.lat) : null,
                                longitude: item.gps ? parseFloat(item.gps.lng) : null,
                                images: processedImages
                            }
                        });
                        results.push({ id: item.id, status: 'synced', remoteId: newProp.id });
                    } catch (e) {
                        console.error("Error creating property", item, e);
                        results.push({ id: item.id, status: 'failed', error: String(e) });
                    }
                }
            }
        }

        // 4. Update Last Sync
        await prisma.fieldDevice.update({
            where: { id: device.id },
            data: { lastSyncAt: new Date() }
        });

        res.json({ success: true, processed: results.length, results });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sync failed' });
    }
};
