import { Router } from 'express';
import { getThreads, createThread, getThreadMessages, sendMessage, sendEmail, sendWhatsApp } from '../controllers/communications.controller';

const router = Router();

router.get('/threads', getThreads);
router.post('/threads', createThread);
router.get('/threads/:id/messages', getThreadMessages);
router.post('/messages', sendMessage);
router.post('/email', sendEmail);
router.post('/whatsapp', sendWhatsApp);

export default router;
