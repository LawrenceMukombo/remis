import { Router } from 'express';
import { getInvoices, createInvoice, getPayments, createPayment } from '../controllers/finance.controller';

const router = Router();

router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);

router.get('/payments', getPayments);
router.post('/payments', createPayment);

export default router;
