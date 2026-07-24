import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Task Management

export const getTasks = async (req: Request, res: Response) => {
    try {
        const { tenantId, status, assignedTo, priority } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        const where: any = { tenantId: String(tenantId) };
        if (status) where.status = String(status);
        if (assignedTo) where.assignedTo = String(assignedTo);
        if (priority) where.priority = String(priority);

        const tasks = await prisma.task.findMany({
            where,
            include: {
                assignee: { select: { full_name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, description, status, priority, dueDate, assignedTo, tenantId, createdBy } = req.body;

        const task = await prisma.task.create({
            data: {
                title,
                description,
                status: status || 'TODO',
                priority: priority || 'MEDIUM',
                dueDate: dueDate ? new Date(dueDate) : null,
                assignedTo,
                tenantId,
                createdBy
            }
        });
        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.update({
            where: { id },
            data: req.body
        });
        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.task.delete({ where: { id } });
        res.json({ message: 'Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

// Workflow Rules

export const getRules = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        const rules = await prisma.workflowRule.findMany({
            where: { tenantId: String(tenantId) }
        });
        res.json(rules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const createRule = async (req: Request, res: Response) => {
    try {
        const { name, triggerType, triggerKey, actionType, actionData, tenantId } = req.body;

        const rule = await prisma.workflowRule.create({
            data: {
                name,
                triggerType,
                triggerKey,
                actionType,
                actionData,
                tenantId
            }
        });
        res.status(201).json(rule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const toggleRule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const rule = await prisma.workflowRule.update({
            where: { id },
            data: { isActive }
        });
        res.json(rule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};
