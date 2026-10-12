import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TenantInfo {
    id: string;
    name: string;
    domain: string;
    status: string;
    config?: {
        country?: string;
        locale?: {
            currency: string;
            dateFormat: string;
            timeFormat: string;
        };
        locationLabels?: Record<number, string>;
    };
    _count?: {
        properties: number;
        locations: number;
        leases: number;
    };
}

export interface TenantSettings {
    id?: string;
    name: string;
    config: {
        country?: string;
        branding: {
            logoUrl: string;
            primaryColor: string;
            secondaryColor: string;
            fontFamily?: string;
        };
        contact: {
            email: string;
            phone: string;
            address?: string;
        };
        locationLabels?: Record<number, string>;
        locale: {
            currency: string;
            dateFormat: string;
            timeFormat: string;
        };
    };
    features: Record<string, boolean>;
}

interface SettingsContextType {
    settings: TenantSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
    organizations: TenantInfo[];
    activeTenantId: string;
    switchOrganization: (tenantId: string) => Promise<void>;
    fetchOrganizations: () => Promise<void>;
}

const defaultSettings: TenantSettings = {
    name: 'Remis Global Enterprise',
    config: {
        country: 'United States',
        branding: {
            logoUrl: '',
            primaryColor: '#4f46e5',
            secondaryColor: '#10b981',
            fontFamily: 'Inter, sans-serif'
        },
        contact: { email: '', phone: '', address: '' },
        locationLabels: {
            1: 'Country',
            2: 'State / Province',
            3: 'City / District',
            4: 'Locality / Area'
        },
        locale: {
            currency: 'USD',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: '12h'
        }
    },
    features: {
        // Core Real Estate
        properties: true,
        leases: true,
        sales: true,
        landlords: true,

        // Operations
        maintenance: true,
        vendors: true,
        inventory: false,
        hr: false,
        pos: false,

        // Finance
        finance: true,

        // Tenant & Experience
        crm: true,
        portal: false,

        // Strategy & Governance
        strategy: false,
        compliance: true,
        documents: true,
        contracts: false,
        trust: false,

        // System & Technology
        analytics: true,
        reports: true,
        map: true,
        locations: true,
        workflows: false,
        communications: false,
        security: true,
        field: false,
        integrations: false
    }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<TenantSettings | null>(null);
    const [organizations, setOrganizations] = useState<TenantInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const getStoredTenantId = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.tenantId) return user.tenantId;
            }
        } catch (e) {}
        return '';
    };

    const [activeTenantId, setActiveTenantId] = useState<string>(getStoredTenantId());

    const fetchOrganizations = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/tenant');
            const data = await res.json();
            if (data && data.success && Array.isArray(data.data)) {
                setOrganizations(data.data);
                // If no activeTenantId stored, pick the first one
                if (!activeTenantId && data.data.length > 0) {
                    setActiveTenantId(data.data[0].id);
                }
            }
        } catch (err) {
            console.error('Error fetching organizations:', err);
        }
    };

    const fetchSettings = async (targetTenantId?: string) => {
        try {
            const tid = targetTenantId || activeTenantId || getStoredTenantId();
            const url = tid ? `http://localhost:4000/api/tenant/settings?tenantId=${tid}` : 'http://localhost:4000/api/tenant/settings';
            const res = await fetch(url);
            const data = await res.json();

            if (data && data.name) {
                const loadedSettings: TenantSettings = {
                    id: data.id,
                    name: data.name || defaultSettings.name,
                    config: {
                        country: data.config?.country || 'United States',
                        branding: {
                            logoUrl: data.config?.branding?.logoUrl || '',
                            primaryColor: data.config?.branding?.primaryColor || defaultSettings.config.branding.primaryColor,
                            secondaryColor: data.config?.branding?.secondaryColor || defaultSettings.config.branding.secondaryColor,
                            fontFamily: data.config?.branding?.fontFamily || defaultSettings.config.branding.fontFamily
                        },
                        contact: {
                            email: data.config?.contact?.email || '',
                            phone: data.config?.contact?.phone || '',
                            address: data.config?.contact?.address || ''
                        },
                        locationLabels: data.config?.locationLabels || defaultSettings.config.locationLabels,
                        locale: {
                            currency: data.config?.locale?.currency || defaultSettings.config.locale.currency,
                            dateFormat: data.config?.locale?.dateFormat || defaultSettings.config.locale.dateFormat,
                            timeFormat: data.config?.locale?.timeFormat || defaultSettings.config.locale.timeFormat
                        }
                    },
                    features: {
                        ...defaultSettings.features,
                        ...data.features
                    }
                };

                setSettings(loadedSettings);
                if (data.id) {
                    setActiveTenantId(data.id);
                }

                // Apply branding globally
                if (loadedSettings.config.branding.primaryColor) {
                    document.documentElement.style.setProperty('--primary-color', loadedSettings.config.branding.primaryColor);
                }
                if (loadedSettings.config.branding.fontFamily) {
                    document.body.style.fontFamily = loadedSettings.config.branding.fontFamily;
                }
            } else {
                setSettings(defaultSettings);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            setSettings(defaultSettings);
        } finally {
            setLoading(false);
        }
    };

    const switchOrganization = async (newTenantId: string) => {
        try {
            setLoading(true);
            setActiveTenantId(newTenantId);

            // Update user in localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.tenantId = newTenantId;
                localStorage.setItem('user', JSON.stringify(user));
            }

            await fetchSettings(newTenantId);
            await fetchOrganizations();
        } finally {
            setLoading(false);
        }
    };

    const refreshSettings = async () => {
        await fetchSettings();
        await fetchOrganizations();
    };

    useEffect(() => {
        fetchOrganizations();
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{
            settings,
            loading,
            refreshSettings,
            organizations,
            activeTenantId,
            switchOrganization,
            fetchOrganizations
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
