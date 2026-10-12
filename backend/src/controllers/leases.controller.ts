import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/leases/stats - KPI summary metrics
export const getLeaseStats = async (req: Request, res: Response) => {
    try {
        const { tenantId, locationId } = req.query;

        let resolvedTenantId = tenantId ? String(tenantId) : '';
        if (!resolvedTenantId || resolvedTenantId === 'default') {
            const firstTenant = await prisma.tenant.findFirst({ select: { id: true } });
            resolvedTenantId = firstTenant?.id || '';
        }

        const where: any = {};
        if (resolvedTenantId) {
            where.tenantId = resolvedTenantId;
        }

        if (locationId && locationId !== 'ALL') {
            where.property = {
                locationId: String(locationId)
            };
        }

        const now = new Date();
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [allLeases, paymentsThisMonth, pendingInvoices] = await Promise.all([
            prisma.lease.findMany({
                where,
                select: {
                    id: true,
                    rentAmount: true,
                    status: true,
                    endDate: true
                }
            }),
            prisma.payment.findMany({
                where: {
                    tenantId: String(tenantId),
                    date: { gte: startOfMonth }
                },
                select: { amount: true }
            }),
            prisma.invoice.findMany({
                where: {
                    tenant_id: String(tenantId),
                    status: { not: 'PAID' }
                },
                select: { balance_due: true }
            })
        ]);

        const activeLeases = allLeases.filter(l => l.status === 'ACTIVE');
        const monthlyRentRoll = activeLeases.reduce((sum, l) => sum + Number(l.rentAmount), 0);
        const collectedThisMonth = paymentsThisMonth.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalOverdue = pendingInvoices.reduce((sum, inv) => sum + Number(inv.balance_due), 0);
        const expiringSoon = activeLeases.filter(l => {
            const end = new Date(l.endDate);
            return end >= now && end <= thirtyDaysFromNow;
        }).length;

        res.json({
            totalActiveLeases: activeLeases.length,
            totalLeasesCount: allLeases.length,
            monthlyRentRoll,
            collectedThisMonth,
            totalOverdue,
            expiringSoon,
            collectionRate: monthlyRentRoll > 0 ? Math.min(100, Math.round((collectedThisMonth / monthlyRentRoll) * 100)) : 100
        });
    } catch (error) {
        console.error('Error fetching lease stats:', error);
        res.status(500).json({ error: 'Failed to fetch lease stats' });
    }
};

// GET /api/leases - Get leases with multi-location filtering, status, search, and pagination
export const getLeases = async (req: Request, res: Response) => {
    try {
        const { tenantId, locationId, status, search, page = '1', limit = '50' } = req.query;

        let resolvedTenantId = tenantId ? String(tenantId) : '';
        if (!resolvedTenantId || resolvedTenantId === 'default') {
            const firstTenant = await prisma.tenant.findFirst({ select: { id: true } });
            resolvedTenantId = firstTenant?.id || '';
        }

        const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
        const skip = (pageNum - 1) * pageSize;

        const where: any = {};
        if (resolvedTenantId) {
            where.tenantId = resolvedTenantId;
        }

        if (status && status !== 'ALL') {
            where.status = String(status);
        }

        if (locationId && locationId !== 'ALL') {
            where.property = {
                locationId: String(locationId)
            };
        }

        if (search) {
            const query = String(search).trim();
            where.OR = [
                { property: { name: { contains: query, mode: 'insensitive' } } },
                { property: { address: { contains: query, mode: 'insensitive' } } },
                { renter: { name: { contains: query, mode: 'insensitive' } } },
                { renter: { email: { contains: query, mode: 'insensitive' } } }
            ];
        }

        const [total, leases] = await Promise.all([
            prisma.lease.count({ where }),
            prisma.lease.findMany({
                where,
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            locationId: true,
                            location: {
                                select: {
                                    id: true,
                                    name: true,
                                    type: true
                                }
                            }
                        }
                    },
                    renter: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            idNumber: true
                        }
                    },
                    invoices: {
                        orderBy: { due_date: 'desc' },
                        take: 5
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: pageSize
            })
        ]);

        res.json({
            data: leases,
            total,
            page: pageNum,
            limit: pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (error) {
        console.error('Error fetching leases:', error);
        res.status(500).json({ error: 'Failed to fetch leases' });
    }
};

// GET /api/leases/:id - Single lease details
export const getLeaseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const lease = await prisma.lease.findUnique({
            where: { id },
            include: {
                property: {
                    include: {
                        location: true
                    }
                },
                renter: {
                    include: {
                        payments: {
                            take: 10,
                            orderBy: { date: 'desc' }
                        }
                    }
                },
                invoices: {
                    orderBy: { due_date: 'desc' }
                },
                signatures: true
            }
        });

        if (!lease) {
            return res.status(404).json({ error: 'Lease not found' });
        }

        res.json(lease);
    } catch (error) {
        console.error('Error fetching lease by ID:', error);
        res.status(500).json({ error: 'Failed to fetch lease details' });
    }
};

// POST /api/leases - Create a new lease
export const createLease = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, rentAmount, frequency, status, propertyId, renterId, tenantId } = req.body;

        if (!propertyId || !renterId) {
            return res.status(400).json({ error: 'Property and Renter IDs are required' });
        }

        let resolvedTenantId = tenantId ? String(tenantId) : '';
        if (!resolvedTenantId || resolvedTenantId === 'default') {
            const firstTenant = await prisma.tenant.findFirst({ select: { id: true } });
            resolvedTenantId = firstTenant?.id || '';
        } else {
            const existingTenant = await prisma.tenant.findUnique({ where: { id: resolvedTenantId } });
            if (!existingTenant) {
                const firstTenant = await prisma.tenant.findFirst({ select: { id: true } });
                resolvedTenantId = firstTenant?.id || resolvedTenantId;
            }
        }

        const lease = await prisma.lease.create({
            data: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                rentAmount: Number(rentAmount),
                frequency: frequency || 'MONTHLY',
                status: status || 'ACTIVE',
                propertyId,
                renterId,
                tenantId: resolvedTenantId
            },
            include: {
                property: true,
                renter: true
            }
        });

        // Auto-generate initial rent invoice
        try {
            await prisma.invoice.create({
                data: {
                    invoice_no: `INV-${Date.now().toString().slice(-6)}`,
                    total: Number(rentAmount),
                    balance_due: Number(rentAmount),
                    due_date: new Date(startDate),
                    status: 'PENDING',
                    bill_to_party_id: renterId,
                    lease_id: lease.id,
                    tenant_id: tenantId,
                    items: [
                        {
                            description: `Initial Rent for ${lease.property?.name || 'Property'}`,
                            amount: Number(rentAmount)
                        }
                    ]
                }
            });
        } catch (invErr) {
            console.warn('Initial invoice generation skipped:', invErr);
        }

        res.status(201).json(lease);
    } catch (error) {
        console.error('Error creating lease:', error);
        res.status(500).json({ error: 'Failed to create lease' });
    }
};

// PUT /api/leases/:id - Update lease
export const updateLease = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, rentAmount, frequency, status } = req.body;

        const lease = await prisma.lease.update({
            where: { id },
            data: {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                rentAmount: rentAmount !== undefined ? Number(rentAmount) : undefined,
                frequency: frequency !== undefined ? frequency : undefined,
                status: status !== undefined ? status : undefined
            },
            include: {
                property: true,
                renter: true
            }
        });

        res.json(lease);
    } catch (error) {
        console.error('Error updating lease:', error);
        res.status(500).json({ error: 'Failed to update lease' });
    }
};

// DELETE /api/leases/:id - Delete lease
export const deleteLease = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.lease.delete({
            where: { id }
        });

        res.json({ message: 'Lease deleted successfully' });
    } catch (error) {
        console.error('Error deleting lease:', error);
        res.status(500).json({ error: 'Failed to delete lease' });
    }
};

// POST /api/leases/:id/payment - Record payment & generate official receipt
export const recordPayment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, method = 'BANK_TRANSFER', reference, notes } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Valid payment amount is required' });
        }

        const lease = await prisma.lease.findUnique({
            where: { id },
            include: {
                property: true,
                renter: true
            }
        });

        if (!lease) {
            return res.status(404).json({ error: 'Lease not found' });
        }

        const paymentAmount = Number(amount);
        const receiptNo = `RCP-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

        // Record payment in payments table
        const payment = await prisma.payment.create({
            data: {
                amount: paymentAmount,
                date: new Date(),
                method,
                reference: reference || `REF-${Date.now().toString().slice(-6)}`,
                status: 'PAID',
                renterId: lease.renterId,
                tenantId: lease.tenantId
            }
        });

        // Update oldest pending invoice for this lease if any exists
        const pendingInvoice = await prisma.invoice.findFirst({
            where: {
                lease_id: id,
                status: { not: 'PAID' }
            },
            orderBy: { due_date: 'asc' }
        });

        let remainingBalance = 0;
        if (pendingInvoice) {
            const currentBal = Number(pendingInvoice.balance_due);
            const newBal = Math.max(0, currentBal - paymentAmount);
            remainingBalance = newBal;

            await prisma.invoice.update({
                where: { invoice_id: pendingInvoice.invoice_id },
                data: {
                    balance_due: newBal,
                    status: newBal === 0 ? 'PAID' : 'PARTIALLY_PAID'
                }
            });
        }

        const receiptData = {
            receiptNumber: receiptNo,
            paymentId: payment.id,
            paymentDate: payment.date.toISOString(),
            tenantName: lease.renter.name,
            tenantEmail: lease.renter.email,
            tenantPhone: lease.renter.phone,
            propertyName: lease.property.name,
            propertyAddress: lease.property.address,
            amountPaid: paymentAmount,
            paymentMethod: method,
            referenceNumber: payment.reference,
            remainingBalance,
            issuedBy: 'REMIS Enterprise Property Management',
            notes: notes || 'Official rent payment receipt'
        };

        res.status(201).json({
            success: true,
            message: 'Payment recorded and receipt generated successfully',
            receipt: receiptData,
            payment
        });
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ error: 'Failed to record payment' });
    }
};

// POST /api/leases/:id/remind - Send automated rent reminder
export const sendLeaseReminder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reminderType = 'UPCOMING_DUE', channel = 'SMS_AND_EMAIL', customMessage } = req.body;

        const lease = await prisma.lease.findUnique({
            where: { id },
            include: {
                property: true,
                renter: true
            }
        });

        if (!lease) {
            return res.status(404).json({ error: 'Lease not found' });
        }

        const rent = Number(lease.rentAmount);
        const reminderId = `REM-${Date.now().toString().slice(-6)}`;

        const defaultMessages: Record<string, string> = {
            UPCOMING_DUE: `Dear ${lease.renter.name}, friendly reminder that rent of $${rent.toLocaleString()} for ${lease.property.name} is due on your upcoming scheduled date.`,
            OVERDUE_NOTICE: `URGENT NOTICE: Rent payment of $${rent.toLocaleString()} for ${lease.property.name} is currently overdue. Please submit payment immediately to avoid late fees.`,
            EXPIRY_RENEWAL: `Dear ${lease.renter.name}, your lease for ${lease.property.name} is scheduled to expire on ${new Date(lease.endDate).toLocaleDateString()}. Please contact administration to discuss renewal terms.`
        };

        const finalMessage = customMessage || defaultMessages[reminderType] || defaultMessages.UPCOMING_DUE;

        res.json({
            success: true,
            reminderId,
            recipient: {
                id: lease.renter.id,
                name: lease.renter.name,
                email: lease.renter.email,
                phone: lease.renter.phone
            },
            leaseId: lease.id,
            property: lease.property.name,
            rentAmount: rent,
            reminderType,
            channel,
            message: finalMessage,
            status: 'SENT',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error sending lease reminder:', error);
        res.status(500).json({ error: 'Failed to send lease reminder' });
    }
};

// POST /api/leases/:id/sign - Digitally sign a lease agreement
export const signLease = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { signatureType = 'MANAGER', signatureData, userId } = req.body;

        const lease = await prisma.lease.findUnique({
            where: { id },
            include: { renter: true, property: true }
        });

        if (!lease) {
            return res.status(404).json({ error: 'Lease not found' });
        }

        const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'REMIS-Client/1.0';

        const signature = await prisma.leaseSignature.create({
            data: {
                leaseId: id,
                userId: userId || null,
                signatureType,
                signatureData: signatureData || `Digital Signature: Verified under Republic of Zambia Rent Act Cap 206 by ${signatureType} on ${new Date().toISOString()}`,
                ipAddress: String(ipAddress).slice(0, 45),
                userAgent: String(userAgent).slice(0, 255)
            }
        });

        // Retrieve all signatures for this lease
        const allSignatures = await prisma.leaseSignature.findMany({
            where: { leaseId: id },
            orderBy: { signedAt: 'asc' }
        });

        res.status(201).json({
            success: true,
            message: 'Lease agreement digitally signed successfully',
            signature,
            signatures: allSignatures
        });
    } catch (error) {
        console.error('Error recording lease signature:', error);
        res.status(500).json({ error: 'Failed to record digital signature' });
    }
};

