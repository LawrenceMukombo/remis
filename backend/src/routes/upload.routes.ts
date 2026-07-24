
import { Router } from 'express';
import { uploadLogo, uploadFile } from '../controllers/upload.controller';

const router = Router();

router.post('/logo', uploadLogo);
router.post('/file', uploadFile);

export default router;
