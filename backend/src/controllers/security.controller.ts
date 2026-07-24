import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper for consistent logging
const logAudit = async (action: string, resource: string, resourceId: string, tenantId: string, details?: any, userId?: string) => {
    try {
        await prisma.auditLog.create({
            data: { action, resource, resourceId, tenantId, details, userId }
        });
    } catch (e) { console.error('Audit Log failed', e); }
};

// --- Roles Management ---

export const getRoles = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        const roles = await prisma.role.findMany({
            where: { OR: [{ tenant_id: String(tenantId) }, { tenant_id: null }] },
            include: { permissions: true }
        });
        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const createRole = async (req: Request, res: Response) => {
    try {
        const { role_name, description, tenant_id } = req.body;
        const role = await prisma.role.create({
            data: { role_name, description, tenant_id, role_code: role_name.toUpperCase().replace(/\s+/g, '_') }
        });
        await logAudit('CREATE', 'ROLE', role.role_id, tenant_id, { role_name });
        res.json(role);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const deleteRole = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params;
        await prisma.role.delete({ where: { role_id: roleId } });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const updateRolePermissions = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params;
        const { permissionIds } = req.body;

        const role = await prisma.role.update({
            where: { role_id: roleId },
            data: {
                permissions: {
                    set: permissionIds.map((id: string) => ({ id }))
                }
            },
            include: { permissions: true }
        });

        res.json(role);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

// --- Users Management ---

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        const users = await prisma.user.findMany({
            where: { tenant_id: String(tenantId) },
            include: {
                role: true,
                groups: true,
                locationAccess: { include: { location: true } }
            }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role_id, group_ids, location_ids } = req.body;

        const data: any = {};
        if (role_id !== undefined) data.role_id = role_id || null;

        if (group_ids) {
            data.groups = {
                set: group_ids.map((gid: string) => ({ id: gid }))
            };
        }

        if (location_ids) {
            await prisma.userLocationAccess.deleteMany({ where: { userId: id } });
            await prisma.userLocationAccess.createMany({
                data: location_ids.map((lid: string) => ({ userId: id, locationId: lid }))
            });
        }

        const user = await prisma.user.update({
            where: { user_id: id },
            data,
            include: { role: true, groups: true }
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

// --- Groups Management ---

export const getGroups = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        const groups = await prisma.userGroup.findMany({
            where: { tenantId: String(tenantId) },
            include: { _count: { select: { users: true } } }
        });
        res.json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const createGroup = async (req: Request, res: Response) => {
    try {
        const { name, description, tenantId } = req.body;
        const group = await prisma.userGroup.create({
            data: { name, description, tenantId }
        });
        await logAudit('CREATE', 'GROUP', group.id, tenantId, { name });
        res.json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const updateGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, userIds } = req.body;

        const group = await prisma.userGroup.update({
            where: { id },
            data: {
                name,
                description,
                users: userIds ? {
                    set: userIds.map((uid: string) => ({ user_id: uid }))
                } : undefined
            },
            include: { _count: { select: { users: true } } }
        });
        res.json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const deleteGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.userGroup.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

// --- Locations (LBAC) ---

export const getLocations = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID required' });
        }

        const locations = await prisma.location.findMany({
            where: { tenantId: String(tenantId) }
        });
        res.json(locations);
    } catch (error: any) {
        console.error('Security getLocations Error:', error);
        res.status(500).json({ error: error.message || 'Failed fetching locations' });
    }
};

// --- Permissions Management ---

export const getPermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await prisma.permission.findMany();
        res.json(permissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const createPermission = async (req: Request, res: Response) => {
    try {
        const { action, resource, description } = req.body;
        const perm = await prisma.permission.create({
            data: { action, resource, description }
        });
        res.json(perm);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const deletePermission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.permission.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role_name, description, permissionIds } = req.body;

        const role = await prisma.role.update({
            where: { role_id: id },
            data: {
                role_name,
                description,
                permissions: permissionIds ? {
                    set: permissionIds.map((pid: string) => ({ id: pid }))
                } : undefined
            },
            include: { permissions: true }
        });

        res.json(role);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const seedPermissions = async (req: Request, res: Response) => {
    try {
        const resources = [
            'PROPERTY', 'LEASE', 'TENANT', 'LANDLORD', 'VALUATION',
            'USER', 'ROLE', 'GROUP', 'MAINTENANCE', 'FINANCE',
            'COMMUNICATION', 'WORKFLOW', 'AUDIT', 'INTEGRATION', 'FIELD_APP'
        ];
        const actions = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT'];

        const perms: any[] = [];
        for (const r of resources) {
            for (const act of actions) {
                perms.push({
                    action: act,
                    resource: r,
                    description: `Ability to ${act.toLowerCase()} ${r.toLowerCase()} resources.`
                });
            }
        }

        for (const p of perms) {
            await prisma.permission.upsert({
                where: { action_resource: { action: p.action, resource: p.resource } },
                update: {},
                create: p
            });
        }

        res.json({ success: true, count: perms.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed seeding' });
    }
};

// --- Audit Logs ---

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const { tenantId, limit = 50 } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        const logs = await prisma.auditLog.findMany({
            where: { tenantId: String(tenantId) },
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
            include: {
                user: { select: { full_name: true, email: true } }
            }
        });
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};
