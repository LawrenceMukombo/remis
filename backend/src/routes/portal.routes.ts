import { Router } from 'express';
import { getPortalConfig, updatePortalConfig } from '../controllers/portal.controller';

const router = Router();

router.get('/', getPortalConfig);
router.post('/', updatePortalConfig);

export default router;
