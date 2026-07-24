import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all maintenance tickets
export const getTickets = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query; // Filter by tenant if applicable (via Property -> Tenant)

        const tickets = await prisma.maintenanceTicket.findMany({
            where: {
                tenantId: String(tenantId)
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

// Create a new maintenance ticket
export const createTicket = async (req: Request, res: Response) => {
    try {
        const { title, description, priority, status, propertyId, tenantId } = req.body;

        if (!title || !priority || !tenantId) {
            return res.status(400).json({ error: 'Title, Priority, and Tenant ID are required' });
        }

        const ticket = await prisma.maintenanceTicket.create({
            data: {
                title,
                description,
                priority,
                status: status || 'OPEN',
                propertyId,
                tenantId
            },
            include: {
                property: true
            }
        });

        res.status(201).json(ticket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Failed to create maintenance ticket' });
    }
};

// Update a maintenance ticket
export const updateTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, priority, status, propertyId } = req.body;

        const ticket = await prisma.maintenanceTicket.update({
            where: { id },
            data: {
                title,
                description,
                priority,
                status,
                propertyId
            },
            include: {
                property: true
            }
        });

        res.json(ticket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
};

// Delete a maintenance ticket
export const deleteTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.maintenanceTicket.delete({
            where: { id }
        });

        res.json({ message: 'Maintenance ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Failed to delete maintenance ticket' });
    }
};
