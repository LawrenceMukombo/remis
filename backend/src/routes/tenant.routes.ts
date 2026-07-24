
import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/tenant.controller';

const router = Router();

// Public route to get config (for login page etc)
router.get('/settings', getSettings);

// Protected route (TODO: Add Auth Middleware) to update settings
router.put('/settings/:tenantId', updateSettings);

export default router;
