import { Router } from 'express';
import { getLeases, createLease, updateLease, deleteLease } from '../controllers/leases.controller';

const router = Router();

router.get('/', getLeases);
router.post('/', createLease);
router.put('/:id', updateLease);
router.delete('/:id', deleteLease);

export default router;
