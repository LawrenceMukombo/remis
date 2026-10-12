import { Router } from 'express';
import {
    ownerRegisterProperty,
    getVerificationQueue,
    reviewVerification,
    getMarketplaceProperties,
    applyForLease,
    getTenantHubData,
    getLandlordHubData,
    payRentMobile,
    scheduleViewing,
    verifyViewingCheckIn,
    submitMaintenanceRequest,
    updateMaintenanceStatus
} from '../controllers/marketplace.controller';

const router = Router();

// Public Property & Application routes
router.post('/register-property', ownerRegisterProperty);
router.post('/owner/register', ownerRegisterProperty);
router.get('/properties', getMarketplaceProperties);
router.post('/apply-lease', applyForLease);

// Milestone 1: Tenant & Landlord Hub routes
router.get('/tenant/hub', getTenantHubData);
router.get('/landlord/hub', getLandlordHubData);
router.post('/pay-rent-mobile', payRentMobile);

// Milestone 2: Physical Viewing & QR Check-in routes
router.post('/viewings/schedule', scheduleViewing);
router.post('/viewings/verify-checkin', verifyViewingCheckIn);

// Milestone 3: Maintenance & Repairs routes
router.post('/maintenance', submitMaintenanceRequest);
router.put('/maintenance/:id', updateMaintenanceStatus);

// Admin verification routes
router.get('/verification-queue', getVerificationQueue);
router.put('/review-verification/:id', reviewVerification);
router.post('/review-verification', reviewVerification);

export default router;
