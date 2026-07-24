import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/communications/threads
export const getThreads = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        const threads = await prisma.messageThread.findMany({
            where: { tenantId: String(tenantId) },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Format for frontend
        const formattedThreads = threads.map(t => ({
            id: t.id,
            subject: t.subject || 'No Subject',
            lastMessage: t.messages[0]?.content || 'No messages',
            updatedAt: t.updatedAt,
            unreadCount: 0 // Placeholder logic for now
        }));

        res.json(formattedThreads);
    } catch (error) {
        console.error('Error fetching threads:', error);
        res.status(500).json({ error: 'Failed to fetch threads' });
    }
};

// GET /api/communications/threads/:id/messages
export const getThreadMessages = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const messages = await prisma.message.findMany({
            where: { threadId: id },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

// POST /api/communications/threads
export const createThread = async (req: Request, res: Response) => {
    try {
        const { subject, tenantId, content, senderId } = req.body;

        const thread = await prisma.messageThread.create({
            data: {
                subject,
                tenantId,
                messages: {
                    create: {
                        content,
                        senderId: senderId || 'SYSTEM'
                    }
                }
            },
            include: { messages: true }
        });

        res.status(201).json(thread);
    } catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

// POST /api/communications/messages
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { threadId, content, senderId } = req.body;

        const message = await prisma.message.create({
            data: {
                threadId,
                content,
                senderId: senderId || 'SYSTEM'
            }
        });

        // Update thread timestamp
        await prisma.messageThread.update({
            where: { id: threadId },
            data: { updatedAt: new Date() }
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed' });
    }
};
import nodemailer from 'nodemailer';

// POST /api/communications/email
export const sendEmail = async (req: Request, res: Response) => {
    try {
        const { to, subject, html, tenantId } = req.body;

        // In a real app, you might fetch tenant-specific SMTP settings here
        // For now, using env vars
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM, // sender address
            to, // list of receivers
            subject, // Subject line
            html, // html body
        });

        res.status(200).json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
};

// POST /api/communications/whatsapp
export const sendWhatsApp = async (req: Request, res: Response) => {
    try {
        const { to, message } = req.body;
        // Verify destination is the approved number +67582440803 for now or generic
        // Integration with Twilio or WhatsApp Business API would go here

        // Placeholder log
        console.log(`Sending WhatsApp to ${to}: ${message}`);

        res.status(200).json({ success: true, message: 'WhatsApp message queued' });
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        res.status(500).json({ error: 'Failed' });
    }
};
