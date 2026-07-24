import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all documents
export const getDocuments = async (req: Request, res: Response) => {
    try {
        const { tenantId, type } = req.query;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        const documents = await prisma.document.findMany({
            where: {
                tenantId: String(tenantId),
                ...(type ? { type: String(type) } : {})
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

// Create a new document record
export const createDocument = async (req: Request, res: Response) => {
    try {
        const { name, url, type, mimeType, size, tenantId } = req.body;

        if (!name || !url || !tenantId) {
            return res.status(400).json({ error: 'Name, URL, and Tenant ID are required' });
        }

        const document = await prisma.document.create({
            data: {
                name,
                url,
                type: type || 'OTHER',
                mimeType,
                size: size ? Number(size) : null,
                tenantId
            }
        });

        res.status(201).json(document);
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ error: 'Failed to create document record' });
    }
};

// Delete a document
export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.document.delete({
            where: { id }
        });

        // Note: In a real system, we should also delete the actual file from storage
        // But for now, we just delete the record.

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
};
