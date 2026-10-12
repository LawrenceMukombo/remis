import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to check if an entity (phone, NRC, email, etc.) is blacklisted
export async function isEntityBlacklisted(value?: string | null): Promise<boolean> {
    if (!value || !value.trim()) return false;
    const clean = value.trim().toLowerCase();
    const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM scam_blacklist WHERE is_active = true AND LOWER(entity_value) = $1 LIMIT 1`,
        clean
    );
    return rows.length > 0;
}

// GET /api/blacklist - List all blacklisted entities
export const getBlacklist = async (req: Request, res: Response) => {
    try {
        const { search, severity, entityType, limit = '50', page = '1' } = req.query;
        const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
        const offset = (pageNum - 1) * pageSize;

        let whereClause = `WHERE is_active = true`;
        const params: any[] = [];

        if (severity && severity !== 'ALL') {
            params.push(String(severity));
            whereClause += ` AND severity = $${params.length}`;
        }

        if (entityType && entityType !== 'ALL') {
            params.push(String(entityType));
            whereClause += ` AND entity_type = $${params.length}`;
        }

        if (search) {
            params.push(`%${String(search).toLowerCase()}%`);
            whereClause += ` AND (LOWER(entity_value) LIKE $${params.length} OR LOWER(entity_display) LIKE $${params.length} OR LOWER(incident_summary) LIKE $${params.length})`;
        }

        const countQuery = `SELECT COUNT(*)::int as total FROM scam_blacklist ${whereClause}`;
        const countResult: any[] = await prisma.$queryRawUnsafe(countQuery, ...params);
        const total = countResult[0]?.total || 0;

        params.push(pageSize);
        const limitParam = `$${params.length}`;
        params.push(offset);
        const offsetParam = `$${params.length}`;

        const dataQuery = `
            SELECT id, entity_type as "entityType", entity_value as "entityValue", 
                   entity_display as "entityDisplay", severity, incident_summary as "incidentSummary",
                   evidence_urls as "evidenceUrls", flagged_by as "flaggedBy",
                   appeal_status as "appealStatus", is_active as "isActive",
                   created_at as "createdAt", updated_at as "updatedAt"
            FROM scam_blacklist
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ${limitParam} OFFSET ${offsetParam}
        `;

        const rows: any[] = await prisma.$queryRawUnsafe(dataQuery, ...params);

        res.json({
            success: true,
            data: rows,
            pagination: {
                total,
                page: pageNum,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error('Error fetching scam blacklist:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blacklist records', error });
    }
};

// POST /api/blacklist - Add an entity to the blacklist
export const addToBlacklist = async (req: Request, res: Response) => {
    try {
        const {
            entityType,
            entityValue,
            entityDisplay,
            severity = 'CRITICAL_FRAUD',
            incidentSummary,
            evidenceUrls = [],
            flaggedBy = 'COMPLIANCE_OFFICER'
        } = req.body;

        if (!entityType || !entityValue || !incidentSummary) {
            return res.status(400).json({ success: false, message: 'entityType, entityValue, and incidentSummary are required' });
        }

        const display = entityDisplay || `${entityType}: ${entityValue.slice(0, 4)}***${entityValue.slice(-3)}`;

        const insertQuery = `
            INSERT INTO scam_blacklist (entity_type, entity_value, entity_display, severity, incident_summary, evidence_urls, flagged_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, entity_type as "entityType", entity_display as "entityDisplay", severity, created_at as "createdAt"
        `;

        const rows: any[] = await prisma.$queryRawUnsafe(
            insertQuery,
            entityType.toUpperCase(),
            entityValue.trim().toLowerCase(),
            display,
            severity.toUpperCase(),
            incidentSummary.trim(),
            evidenceUrls,
            flaggedBy
        );

        res.status(201).json({
            success: true,
            message: 'Entity blacklisted and flagged across Remis TrustShield network',
            data: rows[0]
        });
    } catch (error) {
        console.error('Error adding to blacklist:', error);
        res.status(500).json({ success: false, message: 'Failed to add entity to blacklist', error });
    }
};

// DELETE /api/blacklist/:id - Deactivate or exonerate entity
export const removeBlacklist = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        await prisma.$executeRawUnsafe(
            `UPDATE scam_blacklist SET is_active = false, appeal_status = 'EXONERATED', incident_summary = incident_summary || $1, updated_at = NOW() WHERE id = $2::uuid`,
            ` [Exonerated: ${reason || 'Reviewed by Legal'}]`,
            id
        );

        res.json({ success: true, message: 'Entity removed from active blacklist' });
    } catch (error) {
        console.error('Error updating blacklist:', error);
        res.status(500).json({ success: false, message: 'Failed to update blacklist', error });
    }
};
