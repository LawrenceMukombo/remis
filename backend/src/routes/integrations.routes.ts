import { Router } from 'express';
import { getIntegrations, connectIntegration, disconnectIntegration } from '../controllers/integrations.controller';

const router = Router();

router.get('/', getIntegrations);
router.post('/connect', connectIntegration);
router.delete('/:id', disconnectIntegration);

export default router;
