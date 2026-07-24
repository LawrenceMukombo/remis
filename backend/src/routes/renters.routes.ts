import { Router } from 'express';
import { getRenters } from '../controllers/renters.controller';

const router = Router();

router.get('/', getRenters);

export default router;
