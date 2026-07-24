import { Router } from 'express';
import { getEmployees, createEmployee, deleteEmployee } from '../controllers/employees.controller';

const router = Router();

router.get('/', getEmployees);
router.post('/', createEmployee);
router.delete('/:id', deleteEmployee);

export default router;
