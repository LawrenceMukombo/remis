import { Router } from 'express';
import {
    getLeases,
    getLeaseStats,
    getLeaseById,
    createLease,
    updateLease,
    deleteLease,
    recordPayment,
    sendLeaseReminder,
    signLease
} from '../controllers/leases.controller';

const router = Router();

router.get('/', getLeases);
router.get('/stats', getLeaseStats);
router.get('/:id', getLeaseById);
router.post('/', createLease);
router.put('/:id', updateLease);
router.delete('/:id', deleteLease);
router.post('/:id/payment', recordPayment);
router.post('/:id/remind', sendLeaseReminder);
router.post('/:id/sign', signLease);

export default router;

