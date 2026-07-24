import express from 'express';
import {
    getValuations,
    createValuation,
    deleteValuation
} from '../controllers/valuations.controller';

const router = express.Router();

router.get('/', getValuations);
router.post('/', createValuation);
router.delete('/:id', deleteValuation);

export default router;
