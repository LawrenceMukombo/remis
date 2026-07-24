import { Router } from 'express';
import { getLocations, getHierarchy, getLocationById, createLocation, updateLocation, deleteLocation, bulkCreateLocations } from '../controllers/locations.controller';

const router = Router();

router.get('/', getLocations);
router.get('/hierarchy', getHierarchy);
router.post('/bulk', bulkCreateLocations);
router.get('/:id', getLocationById);
router.post('/', createLocation);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

export default router;
