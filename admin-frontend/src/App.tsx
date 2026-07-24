
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import LocationsPage from './pages/LocationsPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LandlordsPage from './pages/LandlordsPage';
import LeasesPage from './pages/LeasesPage';
import SalesPage from './pages/SalesPage';
import FinancePage from './pages/FinancePage';
import MaintenancePage from './pages/MaintenancePage';
import VendorsPage from './pages/VendorsPage';
import DocumentsPage from './pages/DocumentsPage';
import CRMPage from './pages/CRMPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MapPage from './pages/MapPage';
import CommunicationsPage from './pages/CommunicationsPage';
import CompliancePage from './pages/CompliancePage';
import WorkflowsPage from './pages/WorkflowsPage';
import SecurityPage from './pages/SecurityPage';
import PortalPage from './pages/PortalPage';
import FieldPage from './pages/FieldPage';
import HRPage from './pages/HRPage';
import InventoryPage from './pages/InventoryPage';
import POSPage from './pages/POSPage';
import ReportsPage from './pages/ReportsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import { SettingsProvider } from './context/SettingsContext';
import {
    StrategyPage, ContractsPage, TrustPage
} from './pages/placeholders/Modules';

// Protected Route Component
const ProtectedRoute = ({ children }: { children?: JSX.Element }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children ? children : <Outlet />;
};

export function App() {
    return (
        <SettingsProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes wrapped in Layout */}
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/properties" element={<PropertiesPage />} />
                        <Route path="/properties/:id" element={<PropertyDetailPage />} />
                        <Route path="/locations" element={<LocationsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/landlords" element={<LandlordsPage />} />
                        <Route path="/hr" element={<HRPage />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/pos" element={<POSPage />} />
                        <Route path="/reports" element={<ReportsPage />} />

                        {/* Modules */}

                        {/* Modules */}
                        <Route path="/leases" element={<LeasesPage />} />
                        <Route path="/sales" element={<SalesPage />} />
                        <Route path="/finance" element={<FinancePage />} />
                        <Route path="/maintenance" element={<MaintenancePage />} />
                        <Route path="/vendors" element={<VendorsPage />} />
                        <Route path="/crm" element={<CRMPage />} />
                        <Route path="/documents" element={<DocumentsPage />} />
                        <Route path="/compliance" element={<CompliancePage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/workflows" element={<WorkflowsPage />} />
                        <Route path="/communications" element={<CommunicationsPage />} />
                        <Route path="/security" element={<SecurityPage />} />
                        <Route path="/portal" element={<PortalPage />} />
                        <Route path="/field" element={<FieldPage />} />
                        <Route path="/strategy" element={<StrategyPage />} />
                        <Route path="/contracts" element={<ContractsPage />} />
                        <Route path="/trust" element={<TrustPage />} />
                        <Route path="/integrations" element={<IntegrationsPage />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </SettingsProvider >
    );
}
