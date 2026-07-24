import { Router } from 'express';
import { getTickets, createTicket, updateTicket, deleteTicket } from '../controllers/maintenance.controller';

const router = Router();

router.get('/', getTickets);
router.post('/', createTicket);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);

export default router;
