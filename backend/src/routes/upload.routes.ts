
import { Router } from 'express';
import { uploadLogo, uploadFile, uploadPhotos } from '../controllers/upload.controller';

const router = Router();

router.post('/logo', uploadLogo);
router.post('/file', uploadFile);
router.post('/photos', uploadPhotos);

export default router;
