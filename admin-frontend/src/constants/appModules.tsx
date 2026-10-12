import {
    LayoutDashboard, Settings, Building2, ShoppingCart, Package, Users,
    FileBarChart, HardHat, Home, MapPin, Mail, Map, Shield,
    FileText, PieChart, Wallet, MousePointerClick, Cloud
} from 'lucide-react';

// Using a broad set of icons. If some are missing in the installed version, 
// we might need to fallback. Assuming standard Lucide v0.2+ 

export const MODULE_GROUPS = [
    {
        title: 'Core Real Estate',
        modules: [
            { id: 'properties', path: '/properties', label: 'Properties', desc: 'Core Property & Asset Management', icon: Home },
            { id: 'leases', path: '/leases', label: 'Rentals & Leases', desc: 'Rentals, Leases & Tenant Management', icon: FileBarChart },
            { id: 'sales', path: '/sales', label: 'Sales', desc: 'Property Sales & Disposition', icon: ShoppingCart },
            { id: 'landlords', path: '/landlords', label: 'Landlords', desc: 'Landlord & Ownership Management', icon: Users },
        ]
    },
    {
        title: 'Operations',
        modules: [
            { id: 'maintenance', path: '/maintenance', label: 'Maintenance', desc: 'Work Orders & Preventive Maintenance', icon: HardHat },
            { id: 'vendors', path: '/vendors', label: 'Vendors', desc: 'Vendor & Supplier Management', icon: Users },
            { id: 'inventory', path: '/inventory', label: 'Inventory', desc: 'Inventory & Stock Management', icon: Package },
            { id: 'hr', path: '/hr', label: 'HR', desc: 'Human Resources & Payroll', icon: Users },
            { id: 'pos', path: '/pos', label: 'POS', desc: 'Point of Sale System', icon: ShoppingCart },
            { id: 'field', path: '/field', label: 'Field Services', desc: 'Mobile Field App Management', icon: MapPin },
        ]
    },
    {
        title: 'Finance',
        modules: [
            { id: 'finance', path: '/finance', label: 'Finance', desc: 'Financial Management & Accounting', icon: Building2 }, // Replaced Wallet with Building2 if Wallet missing, but trying Wallet
        ]
    },
    {
        title: 'Tenant & Experience',
        modules: [
            { id: 'crm', path: '/crm', label: 'CRM', desc: 'Tenant Relationship Management', icon: Users },
            { id: 'portal', path: '/portal', label: 'Tenant Portal', desc: 'Self-Service Tenant Portal', icon: LayoutDashboard },
        ]
    },
    {
        title: 'Strategy & Governance',
        modules: [
            { id: 'strategy', path: '/strategy', label: 'Portfolio Strategy', desc: 'Portfolio Planning & Investment', icon: Building2 },
            { id: 'compliance', path: '/compliance', label: 'Compliance', desc: 'Risk, Audit & Compliance', icon: FileBarChart },
            { id: 'verification', path: '/verification', label: 'Deed Audit & Anti-Scam', desc: 'Ownership Proof Audits & Scammer Blacklist', icon: Shield },
            { id: 'documents', path: '/documents', label: 'Documents', desc: 'Document Management (DMS)', icon: FileText },
            { id: 'contracts', path: '/contracts', label: 'Contracts', desc: 'Contract Lifecycle Management', icon: FileBarChart },
            { id: 'trust', path: '/trust', label: 'Digital Trust', desc: 'Digital Signatures & Identity', icon: Shield },
        ]
    },
    {
        title: 'System & Technology',
        modules: [
            { id: 'analytics', path: '/analytics', label: 'Analytics', desc: 'BI & Analytics Dashboards', icon: FileBarChart },
            { id: 'reports', path: '/reports', label: 'Reports', desc: 'Operational Reporting', icon: FileBarChart },
            { id: 'map', path: '/map', label: 'Geospatial', desc: 'GIS & Map Visualizations', icon: Map },
            { id: 'locations', path: '/locations', label: 'Location Hierarchy', desc: 'Manage Geographic Levels', icon: MapPin },
            { id: 'workflows', path: '/workflows', label: 'Workflows', desc: 'Process Automation', icon: MousePointerClick },
            { id: 'communications', path: '/communications', label: 'Communications', desc: 'Notification Hub', icon: Mail },
            { id: 'security', path: '/security', label: 'Security', desc: 'Identity & Access Management', icon: Shield },
            { id: 'integrations', path: '/integrations', label: 'Integrations', desc: 'API Gateway & Webhooks', icon: Cloud },
        ]
    }
];
