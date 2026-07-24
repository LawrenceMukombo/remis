import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all sales for a tenant
export const getSales = async (req: Request, res: Response) => {
    const { tenantId } = req.query;
    try {
        const sales = await prisma.sale.findMany({
            where: { tenantId: tenantId as string },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ message: 'Error fetching sales' });
    }
};

// Create a new sale (Checkout)
export const createSale = async (req: Request, res: Response) => {
    const { items, paymentMethod, customerName, tenantId, performedBy } = req.body;

    // items is array of { inventoryItemId, name, quantity, unitPrice }

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in sale' });
    }

    try {
        // Calculate totals
        let totalAmount = 0;
        let taxAmount = 0; // Simplified tax logic (0 for now or calculated from total)

        const saleItemsData = items.map((item: any) => {
            const lineTotal = Number(item.unitPrice) * Number(item.quantity);
            totalAmount += lineTotal;
            return {
                inventoryItemId: item.inventoryItemId, // Optional, link if it exists in inventory
                name: item.name,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                totalPrice: lineTotal
            };
        });

        // Generate Order Number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Transaction: Create Sale + Update Inventory
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Sale
            const sale = await tx.sale.create({
                data: {
                    orderNumber,
                    customerName,
                    totalAmount,
                    taxAmount,
                    paymentMethod,
                    status: 'COMPLETED',
                    tenantId,
                    performedBy,
                    items: {
                        create: saleItemsData
                    }
                },
                include: { items: true }
            });

            // 2. Update Inventory Quantities (if items are linked)
            for (const item of items) {
                if (item.inventoryItemId) {
                    await tx.inventoryItem.update({
                        where: { id: item.inventoryItemId },
                        data: {
                            quantity: { decrement: Number(item.quantity) }
                        }
                    });

                    // Optional: Log stock transaction here if strict tracking needed
                    // For now, simple decrement is sufficient as 'Sales' implicitly log it
                }
            }

            return sale;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error processing sale:', error);
        res.status(500).json({ message: 'Error processing sale' });
    }
};

export const getSaleDetails = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sale = await prisma.sale.findUnique({
            where: { id },
            include: { items: true }
        });
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        res.json(sale);
    } catch (error) {
        console.error('Error fetching sale details:', error);
        res.status(500).json({ message: 'Error fetching sale details' });
    }
};
