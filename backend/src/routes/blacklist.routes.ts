import { Router } from 'express';
import { getBlacklist, addToBlacklist, removeBlacklist } from '../controllers/blacklist.controller';

const router = Router();

router.get('/', getBlacklist);
router.post('/', addToBlacklist);
router.delete('/:id', removeBlacklist);

export default router;
