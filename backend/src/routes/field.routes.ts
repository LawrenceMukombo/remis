import { Router } from 'express';
import { getDevices, registerDevice, blockDevice, syncData } from '../controllers/field.controller';

const router = Router();

router.get('/devices', getDevices);
router.post('/devices', registerDevice);
router.put('/devices/:id/block', blockDevice);
router.post('/sync', syncData);

export default router;
