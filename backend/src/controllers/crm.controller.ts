import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Contacts (Renters) ---

// Get all contacts
export const getContacts = async (req: Request, res: Response) => {
    try {
        const { tenantId, type } = req.query;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        const contacts = await prisma.renter.findMany({
            where: {
                tenantId: String(tenantId),
                ...(type ? { type: String(type) } : {})
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
};

// Create a new contact
export const createContact = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, type, status, idNumber, tenantId } = req.body;

        if (!name || !tenantId) {
            return res.status(400).json({ error: 'Name and Tenant ID are required' });
        }

        const contact = await prisma.renter.create({
            data: {
                name,
                email,
                phone,
                type: type || 'PROSPECT', // Default to PROSPECT if not specified
                status: status || 'ACTIVE',
                idNumber,
                tenantId
            }
        });

        res.status(201).json(contact);
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ error: 'Failed to create contact' });
    }
};

// Update contact
export const updateContact = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, phone, type, status, idNumber } = req.body;

        const contact = await prisma.renter.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                type,
                status,
                idNumber
            }
        });

        res.json(contact);
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
};

// Delete contact
export const deleteContact = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.renter.delete({ where: { id } });
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
};

// --- Leads (Interests) ---

export const getLeads = async (req: Request, res: Response) => {
    try {
        // Fetch Expressions of Interest (Lease Leads)
        // Note: These might not be directly linked to tenantId in schema, but usually property is.
        // We'll filter by properties belonging to the tenant.
        const { tenantId } = req.query;

        // 1. Get properties for this tenant to filter leads
        const properties = await prisma.property.findMany({
            where: { tenantId: String(tenantId) },
            select: { id: true }
        });
        const propertyIds = properties.map(p => p.id);

        if (propertyIds.length === 0) {
            return res.json([]);
        }

        // 2. Fetch ExpressionOfInterest (Lease)
        const leaseLeads = await prisma.expressionOfInterest.findMany({
            where: {
                propertyId: { in: propertyIds }
            },
            include: {
                property: { select: { name: true } },
                user: { select: { full_name: true, email: true } },
                unit: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Fetch SaleInterest (Sale)
        const saleLeads = await prisma.saleInterest.findMany({
            where: {
                propertyId: { in: propertyIds }
            },
            include: {
                property: { select: { name: true } },
                user: { select: { full_name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 4. Combine and Transform
        const formattedLeads = [
            ...leaseLeads.map(l => ({
                id: l.id,
                type: 'LEASE',
                source: 'Web Inquiry',
                clientName: l.user ? l.user.full_name : 'Guest User',
                clientEmail: l.user?.email || 'N/A',
                propertyName: l.property?.name || 'Unknown',
                unitName: l.unit?.name,
                status: l.status,
                date: l.createdAt,
                details: l.message
            })),
            ...saleLeads.map(l => ({
                id: l.id,
                type: 'SALE',
                source: 'Offer',
                clientName: l.user ? l.user.full_name : 'Guest User',
                clientEmail: l.user?.email || 'N/A',
                propertyName: l.property?.name || 'Unknown',
                status: l.status,
                date: l.createdAt,
                details: `Offer: ${l.offeredPrice}`
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json(formattedLeads);

    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
};

// Create a new lead (Expression of Interest)
export const createLead = async (req: Request, res: Response) => {
    try {
        const { fullName, email, phone, message, propertyId, moveInDate } = req.body;

        if (!propertyId || !fullName || !email) {
            return res.status(400).json({ error: 'Property ID, Name, and Email are required' });
        }

        const lead = await prisma.expressionOfInterest.create({
            data: {
                propertyId,
                message: `${message || ''} | Phone: ${phone} | Moving: ${moveInDate}`,
                status: 'NEW',
                userId: (await prisma.user.findFirst())?.user_id || '' // Fallback to first user for guest inquiries
            }
        });

        res.status(201).json(lead);
    } catch (error: any) {
        console.error('Error creating lead:', error);
        res.status(500).json({ error: 'Failed' });
    }
};
