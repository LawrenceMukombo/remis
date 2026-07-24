import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getInventory = async (req: Request, res: Response) => {
    const { tenantId } = req.query;
    try {
        const items = await prisma.inventoryItem.findMany({
            where: { tenantId: tenantId as string },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(items);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ message: 'Error fetching inventory' });
    }
};

export const createInventoryItem = async (req: Request, res: Response) => {
    const { name, sku, description, category, quantity, minQuantity, unitPrice, location, tenantId } = req.body;
    try {
        const item = await prisma.inventoryItem.create({
            data: {
                name,
                sku,
                description,
                category,
                quantity: Number(quantity),
                minQuantity: Number(minQuantity) || 5,
                unitPrice: unitPrice ? Number(unitPrice) : null,
                location,
                tenantId,
                status: Number(quantity) <= 0 ? 'OUT_OF_STOCK' : (Number(quantity) <= (Number(minQuantity) || 5) ? 'LOW_STOCK' : 'IN_STOCK')
            }
        });
        res.status(201).json(item);
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ message: 'Error creating inventory item' });
    }
};

export const updateStock = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { quantityChange, type, reason, performedBy, tenantId } = req.body;

    try {
        const item = await prisma.inventoryItem.findUnique({ where: { id } });
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const newQuantity = item.quantity + Number(quantityChange);
        const newStatus = newQuantity <= 0 ? 'OUT_OF_STOCK' : (newQuantity <= item.minQuantity ? 'LOW_STOCK' : 'IN_STOCK');

        const updatedItem = await prisma.$transaction([
            prisma.stockTransaction.create({
                data: {
                    inventoryItemId: id,
                    type,
                    quantity: Number(quantityChange),
                    reason,
                    performedBy,
                    tenantId
                }
            }),
            prisma.inventoryItem.update({
                where: { id },
                data: {
                    quantity: newQuantity,
                    status: newStatus
                }
            })
        ]);

        res.json(updatedItem[1]);
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Error updating stock' });
    }
};

export const updateInventoryItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, sku, description, category, minQuantity, unitPrice, location } = req.body;

    try {
        const item = await prisma.inventoryItem.update({
            where: { id },
            data: {
                name,
                sku,
                description,
                category,
                minQuantity: Number(minQuantity),
                unitPrice: unitPrice ? Number(unitPrice) : null,
                location
            }
        });
        res.json(item);
    } catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({ message: 'Error updating inventory item' });
    }
};

export const deleteInventoryItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.inventoryItem.delete({ where: { id } });
        res.json({ message: 'Item deleted' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Error deleting item' });
    }
};
