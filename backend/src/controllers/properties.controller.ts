import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/properties - List all properties with filters
export const getProperties = async (req: Request, res: Response) => {
    try {
        const {
            tenantId,
            type,
            status,
            locationId,
            search,
            minPrice,
            maxPrice,
            listing_type,
            page = '1',
            limit = '20'
        } = req.query;

        const where: any = {};
        if (tenantId) {
            where.tenantId = String(tenantId);
        } else {
            // Fallback: get first tenant to show something in client portal if not specified
            const firstTenant = await prisma.tenant.findFirst();
            if (firstTenant) where.tenantId = firstTenant.id;
        }

        // Apply filters
        if (type) where.type = type;
        if (status) where.status = status;
        if (locationId) where.locationId = locationId;
        if (listing_type) where.listing_type = listing_type;

        if (search) {
            const searchStr = search as string;
            // Split by whitespace and remove empty strings, but keep short words (e.g. "Lae", "NCD")
            const words = searchStr.split(/\s+/).filter(w => w.length > 0);

            if (words.length > 0) {
                // AGGRESSIVE SEARCH: Every word must be found in at least one of these fields
                where.AND = words.map(word => ({
                    OR: [
                        { name: { contains: word, mode: 'insensitive' } },
                        { address: { contains: word, mode: 'insensitive' } },
                        { region: { contains: word, mode: 'insensitive' } },
                        { province: { contains: word, mode: 'insensitive' } },
                        { district: { contains: word, mode: 'insensitive' } },
                        { llg: { contains: word, mode: 'insensitive' } },
                        { description: { contains: word, mode: 'insensitive' } },
                        // Deep hierarchical location search (up to 4 levels deep)
                        {
                            location: {
                                OR: [
                                    { name: { contains: word, mode: 'insensitive' } },
                                    { parent: { name: { contains: word, mode: 'insensitive' } } },
                                    { parent: { parent: { name: { contains: word, mode: 'insensitive' } } } },
                                    { parent: { parent: { parent: { name: { contains: word, mode: 'insensitive' } } } } }
                                ]
                            }
                        },
                        {
                            tags: {
                                some: {
                                    tag: { contains: word, mode: 'insensitive' }
                                }
                            }
                        },
                        {
                            features: {
                                some: {
                                    feature: { contains: word, mode: 'insensitive' }
                                }
                            }
                        }
                    ]
                }));
            }
        }

        if (minPrice || maxPrice) {
            where.sale_price = {};
            if (minPrice) where.sale_price.gte = parseFloat(minPrice as string);
            if (maxPrice) where.sale_price.lte = parseFloat(maxPrice as string);
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const take = parseInt(limit as string);

        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                include: {
                    location: true,
                    units: {
                        select: {
                            id: true,
                            name: true,
                            status: true
                        }
                    },
                    valuations: {
                        orderBy: { valuationDate: 'desc' },
                        take: 1
                    },
                    tags: true,
                    features: true
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.property.count({ where })
        ]);

        res.json({
            properties,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                pages: Math.ceil(total / parseInt(limit as string))
            }
        });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/properties/:id - Get single property
export const getPropertyById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                location: true,
                units: true,
                valuations: {
                    orderBy: { valuationDate: 'desc' }
                },
                tags: true,
                features: true,
                leases: {
                    include: {
                        renter: true
                    }
                },
                complianceRecords: {
                    where: { type: 'OWNERSHIP_TITLE_DEED' },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                tenant: true,
                maintenance: {
                    where: { status: { not: 'CLOSED' } },
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Extract registered owner contact and custom category specifications from compliance record if present
        let ownerPhone: string | null = null;
        let ownerName: string | null = null;
        let ownerEmail: string | null = null;
        let specifications: any = null;

        if (property.complianceRecords && property.complianceRecords.length > 0) {
            try {
                const parsedNotes = JSON.parse(property.complianceRecords[0].notes || '{}');
                ownerPhone = parsedNotes.owner_phone || parsedNotes.ownerPhone || null;
                ownerName = parsedNotes.owner_name || parsedNotes.ownerName || null;
                ownerEmail = parsedNotes.owner_email || parsedNotes.ownerEmail || null;
                specifications = parsedNotes.specifications || null;
            } catch (e) {
                // Ignore parse errors
            }
        }

        // Build ancestor hierarchy chain from locationId if present
        let locationHierarchy: Array<{ level: number; id: string; name: string; type: string }> = [];
        if (property.locationId) {
            let cur = await prisma.location.findUnique({ where: { id: property.locationId } });
            while (cur) {
                locationHierarchy.unshift({
                    level: cur.level,
                    id: cur.id,
                    name: cur.name,
                    type: cur.type
                });
                if (!cur.parentId) break;
                cur = await prisma.location.findUnique({ where: { id: cur.parentId } });
            }
        }

        // Fallback: Resolve location names for the hierarchy IDs if stored individually
        const locationIds = [
            property.region,
            property.province,
            property.district,
            property.llg
        ].filter(id => id && typeof id === 'string' && id.length > 0) as string[];

        let locationNamesMap: Record<string, string> = {};
        if (locationIds.length > 0) {
            const locations = await prisma.location.findMany({
                where: { id: { in: locationIds } },
                select: { id: true, name: true }
            });
            locations.forEach(loc => {
                locationNamesMap[loc.id] = loc.name;
            });
        }

        const l1 = locationHierarchy.find(h => h.level === 1);
        const l2 = locationHierarchy.find(h => h.level === 2);
        const l3 = locationHierarchy.find(h => h.level === 3);
        const l4 = locationHierarchy.find(h => h.level === 4);

        // Security & Anti-Leakage Shield: Mask landlord contact details and scrub sensitive records
        const isStaffOrAdmin = Boolean(req.headers['x-staff-token'] || req.headers['authorization']);

        // Helper to format protected phone proxy e.g. +260 97 ••• ••34
        const maskPhoneNumber = (phone: string | null): string => {
            if (!phone) return '+260 97 ••• ••XX (REMIS Shield)';
            const cleaned = phone.replace(/[^0-9+]/g, '');
            if (cleaned.length < 6) return '+260 ••• ••• (REMIS Shield)';
            const prefix = cleaned.slice(0, 5);
            const suffix = cleaned.slice(-2);
            return `${prefix} ••• ••${suffix} (REMIS Shield)`;
        };

        const maskedPhone = isStaffOrAdmin ? ownerPhone : maskPhoneNumber(ownerPhone);
        const maskedEmail = isStaffOrAdmin ? ownerEmail : (ownerEmail ? `shield-listing-${property.id.slice(0, 8)}@remis.org` : null);
        const safeOwnerName = ownerName ? `${ownerName.split(' ')[0]} (Verified Lister)` : 'Verified Property Owner';

        // Separate and protect sensitive legal relations (Title Deeds, Leases, Tenant PII)
        const {
            leases,
            complianceRecords,
            maintenance,
            tenant,
            ...safePropertyBase
        } = property;

        const isVerified = (complianceRecords && complianceRecords.length > 0 && complianceRecords[0].status === 'APPROVED') || property.status === 'AVAILABLE';

        const enrichedProperty = {
            ...safePropertyBase,
            // Safe verification indicator without leaking uploaded deed PDFs or notes
            isVerified,
            verificationBadge: isVerified ? 'VERIFIED_OWNER' : 'PENDING_AUDIT',
            // Communication Shield: Protected contact proxy preventing off-platform disintermediation
            ownerPhone: maskedPhone,
            ownerName: isStaffOrAdmin ? ownerName : safeOwnerName,
            ownerEmail: maskedEmail,
            isDirectContactProtected: !isStaffOrAdmin,
            specifications,
            locationHierarchy,
            region: l1 ? l1.id : property.region,
            regionName: l1 ? l1.name : (property.region ? (locationNamesMap[property.region] || property.region) : null),
            province: l2 ? l2.id : property.province,
            provinceName: l2 ? l2.name : (property.province ? (locationNamesMap[property.province] || property.province) : null),
            district: l3 ? l3.id : property.district,
            districtName: l3 ? l3.name : (property.district ? (locationNamesMap[property.district] || property.district) : null),
            llg: l4 ? l4.id : property.llg,
            llgName: l4 ? l4.name : (property.llg ? (locationNamesMap[property.llg] || property.llg) : null)
        };

        res.json(enrichedProperty);
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/properties - Create new property
export const createProperty = async (req: Request, res: Response) => {
    try {
        const {
            name,
            type,
            status,
            locationId,
            landlordId, // Add landlordId
            tenantId,
            address,
            images,
            latitude,
            longitude,
            province,
            district,
            llg,
            region,
            listing_type,
            sale_price,
            description,
            yearBuilt,
            landArea,
            floor_count,
            parking_spaces,
            tags,
            features
        } = req.body;

        let resolvedTenantId = tenantId;
        if (!resolvedTenantId) {
            const firstTenant = await prisma.tenant.findFirst();
            resolvedTenantId = firstTenant?.id;
        }

        let resolvedLocationId = locationId;
        if (!resolvedLocationId) {
            const existingLoc = await prisma.location.findFirst({
                where: { tenantId: resolvedTenantId }
            });
            if (existingLoc) {
                resolvedLocationId = existingLoc.id;
            } else {
                const newLoc = await prisma.location.create({
                    data: {
                        name: 'Primary Location',
                        type: 'DISTRICT',
                        level: 1,
                        tenantId: resolvedTenantId
                    }
                });
                resolvedLocationId = newLoc.id;
            }
        }

        const property = await prisma.property.create({
            data: {
                name,
                type: type || 'COMMERCIAL',
                status: status || 'AVAILABLE',
                locationId: resolvedLocationId,
                landlordId: landlordId || null,
                tenantId: resolvedTenantId,
                address,
                images: images || [],
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                province,
                district,
                llg,
                region,
                listing_type: listing_type || 'LEASE',
                sale_price: sale_price ? parseFloat(sale_price) : null,
                description,
                yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
                landArea: landArea ? parseFloat(landArea) : null,
                floor_count: floor_count ? parseInt(floor_count) : null,
                parking_spaces: parking_spaces ? parseInt(parking_spaces) : null,
                // Create tags if provided
                ...(tags && tags.length > 0 && {
                    tags: {
                        create: tags.map((tag: string) => ({
                            tag,
                            tenantId
                        }))
                    }
                }),
                // Create features if provided
                ...(features && features.length > 0 && {
                    features: {
                        create: features.map((feature: { feature: string; description?: string }) => ({
                            feature: feature.feature,
                            description: feature.description,
                            tenantId
                        }))
                    }
                })
            },
            include: {
                location: true,
                tags: true,
                features: true
            }
        });

        res.status(201).json(property);
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/properties/:id - Update property
export const updateProperty = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Build update data object - NO DESTRUCTURING WITH SPREAD!
        const data: any = {};

        // String fields
        if (updateData.name !== undefined) data.name = updateData.name;
        if (updateData.type !== undefined) data.type = updateData.type;
        if (updateData.status !== undefined) data.status = updateData.status;
        if (updateData.address !== undefined) data.address = updateData.address;
        if (updateData.description !== undefined) data.description = updateData.description;
        if (updateData.listing_type !== undefined) data.listing_type = updateData.listing_type;

        if (updateData.listing_type !== undefined) data.listing_type = updateData.listing_type;
        if (updateData.landlordId !== undefined) data.landlordId = updateData.landlordId;

        // Location hierarchy fields
        if (updateData.locationId !== undefined) data.locationId = updateData.locationId;
        if (updateData.region !== undefined) data.region = updateData.region;
        if (updateData.province !== undefined) data.province = updateData.province;
        if (updateData.district !== undefined) data.district = updateData.district;
        if (updateData.llg !== undefined) data.llg = updateData.llg;

        // Images array field
        if (updateData.images !== undefined) data.images = updateData.images;

        // Numeric fields with conversion
        if (updateData.latitude !== undefined && updateData.latitude !== null && updateData.latitude !== '') {
            data.latitude = parseFloat(String(updateData.latitude));
        }
        if (updateData.longitude !== undefined && updateData.longitude !== null && updateData.longitude !== '') {
            data.longitude = parseFloat(String(updateData.longitude));
        }
        if (updateData.sale_price !== undefined && updateData.sale_price !== null && updateData.sale_price !== '') {
            data.sale_price = parseFloat(String(updateData.sale_price));
        }
        if (updateData.yearBuilt !== undefined && updateData.yearBuilt !== null && updateData.yearBuilt !== '') {
            data.yearBuilt = parseInt(String(updateData.yearBuilt));
        }
        if (updateData.landArea !== undefined && updateData.landArea !== null && updateData.landArea !== '') {
            data.landArea = parseFloat(String(updateData.landArea));
        }
        if (updateData.floor_count !== undefined && updateData.floor_count !== null && updateData.floor_count !== '') {
            data.floor_count = parseInt(String(updateData.floor_count));
        }
        if (updateData.parking_spaces !== undefined && updateData.parking_spaces !== null && updateData.parking_spaces !== '') {
            data.parking_spaces = parseInt(String(updateData.parking_spaces));
        }

        const property = await prisma.property.update({
            where: { id },
            data,
            include: {
                location: true,
                tags: true,
                features: true,
                valuations: {
                    orderBy: { valuationDate: 'desc' },
                    take: 1
                }
            }
        });

        res.json(property);
    } catch (error) {
        console.error('Error updating property:', error);
        console.error('Update data received:', req.body);
        res.status(500).json({ message: 'Server error', error: String(error) });
    }
};

// DELETE /api/properties/:id - Delete property
export const deleteProperty = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.property.delete({
            where: { id }
        });

        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/properties/:id/valuations - Add valuation
export const addValuation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { valuationDate, amount, valuationType, valuedBy, notes, tenantId } = req.body;

        const valuation = await prisma.propertyValuation.create({
            data: {
                propertyId: id,
                valuationDate: new Date(valuationDate),
                amount: parseFloat(amount),
                valuationType,
                valuedBy,
                notes,
                tenantId
            }
        });

        res.status(201).json(valuation);
    } catch (error) {
        console.error('Error adding valuation:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/properties/stats - Get property statistics
export const getPropertyStats = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;

        const [
            totalProperties,
            availableProperties,
            leasedProperties,
            propertiesForSale,
            totalUnits
        ] = await Promise.all([
            prisma.property.count({ where: { tenantId: tenantId as string } }),
            prisma.property.count({ where: { tenantId: tenantId as string, status: 'AVAILABLE' } }),
            prisma.property.count({ where: { tenantId: tenantId as string, status: 'LEASED' } }),
            prisma.property.count({ where: { tenantId: tenantId as string, listing_type: 'SALE' } }),
            prisma.unit.count({ where: { tenantId: tenantId as string } })
        ]);

        res.json({
            totalProperties,
            availableProperties,
            leasedProperties,
            propertiesForSale,
            totalUnits
        });
    } catch (error) {
        console.error('Error fetching property stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};