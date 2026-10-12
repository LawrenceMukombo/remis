import { Router } from 'express';
import {
    getRenters,
    getRenterById,
    createRenter,
    updateRenter,
    deleteRenter,
    sendRenterReminder
} from '../controllers/renters.controller';

const router = Router();

router.get('/', getRenters);
router.get('/:id', getRenterById);
router.post('/', createRenter);
router.put('/:id', updateRenter);
router.delete('/:id', deleteRenter);
router.post('/:id/remind', sendRenterReminder);

export default router;
