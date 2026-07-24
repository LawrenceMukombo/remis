import express from 'express';
import {
    getLandlords,
    getLandlordById,
    createLandlord,
    updateLandlord,
    deleteLandlord
} from '../controllers/landlords.controller';

const router = express.Router();

router.get('/', getLandlords);
router.get('/:id', getLandlordById);
router.post('/', createLandlord);
router.put('/:id', updateLandlord);
router.delete('/:id', deleteLandlord);

export default router;
