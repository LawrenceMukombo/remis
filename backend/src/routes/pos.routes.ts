import { Router } from 'express';
import { getSales, createSale, getSaleDetails } from '../controllers/pos.controller';

const router = Router();

router.get('/', getSales);
router.post('/', createSale);
router.get('/:id', getSaleDetails);

export default router;
