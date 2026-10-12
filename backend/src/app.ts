import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import tenantRoutes from './routes/tenant.routes';
import locationRoutes from './routes/locations.routes';
import uploadRoutes from './routes/upload.routes';
import propertiesRoutes from './routes/properties.routes';
import landlordsRoutes from './routes/landlords.routes';
import unitsRoutes from './routes/units.routes';
import valuationsRoutes from './routes/valuations.routes';
import leasesRoutes from './routes/leases.routes';
import rentersRoutes from './routes/renters.routes';
import salesRoutes from './routes/sales.routes';
import financeRoutes from './routes/finance.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import vendorsRoutes from './routes/vendors.routes';
import documentsRoutes from './routes/documents.routes';
import crmRoutes from './routes/crm.routes';
import analyticsRoutes from './routes/analytics.routes';
import communicationsRoutes from './routes/communications.routes';
import complianceRoutes from './routes/compliance.routes';
import workflowsRoutes from './routes/workflows.routes';
import securityRoutes from './routes/security.routes';
import portalRoutes from './routes/portal.routes';
import fieldRoutes from './routes/field.routes';
import integrationsRoutes from './routes/integrations.routes';
import employeesRoutes from './routes/employees.routes';
import inventoryRoutes from './routes/inventory.routes';
import posRoutes from './routes/pos.routes';
import blacklistRoutes from './routes/blacklist.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
    res.send('REMIS Backend API is running');
});

// Serve uploaded files statically
app.use(express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/landlords', landlordsRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/valuations', valuationsRoutes);
app.use('/api/leases', leasesRoutes);
app.use('/api/renters', rentersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/workflows', workflowsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/field', fieldRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/blacklist', blacklistRoutes);
app.use('/api/marketplace', marketplaceRoutes);

export default app;
