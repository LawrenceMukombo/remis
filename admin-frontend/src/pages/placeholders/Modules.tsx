import React from 'react';
import PlaceholderPage from './PlaceholderPage';

export const LeasesPage = () => (
    <PlaceholderPage
        title="Lease & Contract Management"
        description="Manage the full leasing lifecycle from offer to renewal, including digital approvals and automated escalations."
        features={['Lease Authoring', 'Digital Signatures', 'Renewal Automation', 'Rent Escalation Rules']}
    />
);

export const SalesPage = () => (
    <PlaceholderPage
        title="Property Sales & Disposition"
        description="Manage property sales, offers, and ownership transitions with integrated workflow automation."
        features={['Listing Management', 'Offer Workflow', 'Ownership Transfer', 'Sales Contracts']}
    />
);

export const FinancePage = () => (
    <PlaceholderPage
        title="Financial Management"
        description="Comprehensive financial operations, billing, AR/AP, and multicurrency support."
        features={['Invoicing Engine', 'AR/AP Workflows', 'Rent Roll Reporting', 'ERP Integration']}
    />
);

export const VendorsPage = () => (
    <PlaceholderPage
        title="Vendor Management"
        description="Enterprise-grade tracking of service partners, contracts, and performance."
        features={['Vendor Registry', 'Performance Scorecards', 'Procurement', 'Compliance Tracking']}
    />
);

export const CRMPage = () => (
    <PlaceholderPage
        title="Tenant CRM"
        description="Manage tenant relationships, communications, and satisfaction."
        features={['Lead Pipeline', 'Communication History', 'Satisfaction Surveys', 'Automated Notifications']}
    />
);

export const DocumentsPage = () => (
    <PlaceholderPage
        title="Document Management"
        description="Centralized repository for contracts and compliance documents with version control."
        features={['Version Control', 'Metadata Tagging', 'Audit Logs', 'Retention Policies']}
    />
);

export const CompliancePage = () => (
    <PlaceholderPage
        title="Compliance, Risk & Audit"
        description="Control risk exposure and ensure regulatory compliance across the portfolio."
        features={['Rule Engines', 'Risk Scoring', 'Audit Trails', 'SLA Dashboards']}
    />
);

export const AnalyticsPage = () => (
    <PlaceholderPage
        title="Analytics & BI"
        description="Actionable insights and predictive analytics for strategic decision making."
        features={['Operational Dashboards', 'Financial Forecasts', 'Market Analytics', 'Exportable Reports']}
    />
);

export const MapPage = () => (
    <PlaceholderPage
        title="Geospatial Services"
        description="Visualize properties and market data on interactive maps."
        features={['GIS Layers', 'Heatmaps', 'Distance Analytics', 'Location Intelligence']}
    />
);

export const WorkflowsPage = () => (
    <PlaceholderPage
        title="Workflow Automation"
        description="Drag-and-drop builder for automating complex business processes."
        features={['Visual Workflow Builder', 'Conditional Triggers', 'SLA Timers', 'Approval Chains']}
    />
);

export const CommunicationsPage = () => (
    <PlaceholderPage
        title="Communications Hub"
        description="System-wide multi-channel notification system."
        features={['Email/SMS/Push', 'Template Library', 'Event Triggers', 'Subscription Mgmt']}
    />
);

export const SecurityPage = () => (
    <PlaceholderPage
        title="Identity & Security"
        description="Enterprise authentication and authorization management."
        features={['SSO & MFA', 'RBAC Policies', 'Audit Logging', 'OAuth Integration']}
    />
);

export const PortalPage = () => (
    <PlaceholderPage
        title="Tenant Portal"
        description="Self-service portal for tenants to manage payments and requests."
        features={['Online Payments', 'Maintenance Requests', 'Document Access', 'Digital Leasing']}
    />
);

export const FieldPage = () => (
    <PlaceholderPage
        title="Mobile Field Services"
        description="Mobile tools for technicians and field staff."
        features={['Offline Sync', 'Photo Capture', 'GPS Optimization', 'Work Order Mgmt']}
    />
);

export const StrategyPage = () => (
    <PlaceholderPage
        title="Portfolio Strategy"
        description="Tools for long-term asset planning and investment analysis."
        features={['Capex Planning', 'Scenario Modeling', 'ESG Reporting', 'Risk Simulation']}
    />
);

// Export real ContractsPage
export { default as ContractsPage } from '../ContractsPage';

export { default as TrustPage } from '../TrustPage';

export const IntegrationsPage = () => (
    <PlaceholderPage
        title="API Gateway"
        description="Manage system integrations and API access."
        features={['REST/GraphQL APIs', 'Webhooks', 'Throttling', 'Connector Library']}
    />
);
