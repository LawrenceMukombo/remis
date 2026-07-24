import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all landlords for a tenant
export const getLandlords = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;

        if (!tenantId) {
            return res.status(400).json({ message: 'tenantId is required' });
        }

        const landlords = await prisma.landlord.findMany({
            where: { tenantId: String(tenantId) },
            orderBy: { lastName: 'asc' },
            include: {
                properties: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        status: true,
                        address: true,
                        listing_type: true,
                        sale_price: true,
                        updatedAt: true
                    }
                }
            }
        });

        res.json(landlords);
    } catch (error) {
        console.error('Error fetching landlords:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get single landlord
export const getLandlordById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const landlord = await prisma.landlord.findUnique({
            where: { id },
            include: {
                properties: true
            }
        });

        if (!landlord) {
            return res.status(404).json({ message: 'Landlord not found' });
        }

        res.json(landlord);
    } catch (error) {
        console.error('Error fetching landlord:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Create a new landlord
export const createLandlord = async (req: Request, res: Response) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            address,
            idNumber,
            bankName,
            accountNumber,
            accountName,
            notes,
            tenantId
        } = req.body;

        if (!firstName || !lastName || !phone || !tenantId) {
            return res.status(400).json({
                message: 'firstName, lastName, phone, and tenantId are required'
            });
        }

        const landlord = await prisma.landlord.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                address,
                idNumber,
                bankName,
                accountNumber,
                accountName,
                notes,
                tenantId
            }
        });

        res.status(201).json(landlord);
    } catch (error) {
        console.error('Error creating landlord:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update a landlord
export const updateLandlord = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.id;
        delete updateData.tenantId;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const landlord = await prisma.landlord.update({
            where: { id },
            data: updateData
        });

        res.json(landlord);
    } catch (error) {
        console.error('Error updating landlord:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a landlord
export const deleteLandlord = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if landlord has properties
        const landlord = await prisma.landlord.findUnique({
            where: { id },
            include: {
                properties: true
            }
        });

        if (!landlord) {
            return res.status(404).json({ message: 'Landlord not found' });
        }

        if (landlord.properties.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete landlord with associated properties. Please reassign or delete properties first.'
            });
        }

        await prisma.landlord.delete({
            where: { id }
        });

        res.json({ message: 'Landlord deleted successfully' });
    } catch (error) {
        console.error('Error deleting landlord:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
