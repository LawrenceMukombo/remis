import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getEmployees = async (req: Request, res: Response) => {
    const { tenantId } = req.query;
    try {
        const employees = await prisma.employee.findMany({
            where: { tenantId: tenantId as string },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Error fetching employees' });
    }
};

export const createEmployee = async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, title, department, hireDate, status, tenantId } = req.body;
    try {
        const employee = await prisma.employee.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                title,
                department,
                hireDate: new Date(hireDate),
                status: status || 'ACTIVE',
                tenantId
            }
        });
        res.status(201).json(employee);
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ message: 'Error creating employee' });
    }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.employee.delete({
            where: { id }
        });
        res.json({ message: 'Employee deleted' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Error deleting employee' });
    }
};
