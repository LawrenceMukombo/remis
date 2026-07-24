import { Router } from 'express';
import {
    getTasks, createTask, updateTask, deleteTask,
    getRules, createRule, toggleRule
} from '../controllers/workflows.controller';

const router = Router();

// Tasks
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// Rules
router.get('/rules', getRules);
router.post('/rules', createRule);
router.put('/rules/:id/toggle', toggleRule);

export default router;
