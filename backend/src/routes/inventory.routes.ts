import { Router } from 'express';
import { getInventory, createInventoryItem, updateStock, deleteInventoryItem, updateInventoryItem } from '../controllers/inventory.controller';

const router = Router();

router.get('/', getInventory);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.patch('/:id/stock', updateStock);
router.delete('/:id', deleteInventoryItem);

export default router;
