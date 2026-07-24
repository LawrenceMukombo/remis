import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- INVOICES ---

export const getInvoices = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        const invoices = await prisma.invoice.findMany({
            where: {
                tenant_id: String(tenantId)
            },
            include: {
                billToParty: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

export const createInvoice = async (req: Request, res: Response) => {
    try {
        const { total, due_date, bill_to_party_id, tenant_id, items, status } = req.body;

        if (!total || !bill_to_party_id || !tenant_id) {
            return res.status(400).json({ error: 'Total, Bill To Party, and Tenant ID are required' });
        }

        const invoice = await prisma.invoice.create({
            data: {
                total: Number(total),
                balance_due: Number(total), // Initially balance is total
                due_date: new Date(due_date),
                status: status || 'DRAFT',
                bill_to_party_id,
                tenant_id,
                items: items || []
            }
        });

        res.status(201).json(invoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};

// --- PAYMENTS ---

export const getPayments = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        const payments = await prisma.payment.findMany({
            where: {
                tenantId: String(tenantId)
            },
            include: {
                renter: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
};

export const createPayment = async (req: Request, res: Response) => {
    try {
        const { amount, method, reference, renterId, tenantId, date } = req.body;

        if (!amount || !renterId || !tenantId) {
            return res.status(400).json({ error: 'Amount, Renter ID, and Tenant ID are required' });
        }

        const payment = await prisma.payment.create({
            data: {
                amount: Number(amount),
                method,
                reference,
                status: 'COMPLETED', // Default to completed for now
                renterId,
                tenantId,
                date: date ? new Date(date) : new Date()
            }
        });

        res.status(201).json(payment);
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
};
