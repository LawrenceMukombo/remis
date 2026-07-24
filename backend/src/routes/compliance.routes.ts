import { Router } from 'express';
import {
    getComplianceRecords,
    createComplianceRecord,
    updateComplianceRecord,
    deleteComplianceRecord,
    getComplianceStats
} from '../controllers/compliance.controller';

const router = Router();

router.get('/', getComplianceRecords);
router.post('/', createComplianceRecord);
router.put('/:id', updateComplianceRecord);
router.delete('/:id', deleteComplianceRecord);
router.get('/stats', getComplianceStats);

export default router;
