import { Router } from 'express';
import { getContacts, createContact, updateContact, deleteContact, getLeads, createLead } from '../controllers/crm.controller';

const router = Router();

// Contacts (Renters/Prospects)
router.get('/contacts', getContacts);
router.post('/contacts', createContact);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);

// Leads (Interests)
router.get('/leads', getLeads);
router.post('/leads', createLead);

export default router;
