import { Router } from 'express';
import { getSettings, updateSettings, listTenants, createTenant } from '../controllers/tenant.controller';

const router = Router();

// Multi-Organization management routes
router.get('/', listTenants);
router.post('/', createTenant);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings/:tenantId', updateSettings);

export default router;
