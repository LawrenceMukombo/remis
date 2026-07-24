import { Router } from 'express';
import {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    addValuation,
    getPropertyStats
} from '../controllers/properties.controller';

const router = Router();

// Property CRUD
router.get('/', getProperties);
router.get('/stats', getPropertyStats);
router.get('/:id', getPropertyById);
router.post('/', createProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

// Property valuations
router.post('/:id/valuations', addValuation);

export default router;
