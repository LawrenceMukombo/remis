import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TenantSettings {
    name: string;
    config: {
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
}

const defaultSettings: TenantSettings = {
    name: 'REMIS Admin',
    config: {
        branding: {
            logoUrl: '',
            primaryColor: '#4f46e5',
            secondaryColor: '#10b981',
            fontFamily: 'Ubuntu, sans-serif'
        },
        contact: { email: '', phone: '', address: '' },
        locationLabels: { 1: 'Region', 2: 'Province', 3: 'District', 4: 'LLG' },
        locale: {
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h'
        }
    },
    features: {
        // Core Real Estate
        properties: true,
        leases: false,
        sales: false,
        landlords: false,

        // Operations
        maintenance: false,
        vendors: false,
        inventory: false,
        hr: false,
        pos: false,

        // Finance
        finance: false,

        // Tenant & Experience
        crm: false,
        portal: false,

        // Strategy & Governance
        strategy: false,
        compliance: false,
        documents: false,
        contracts: false,
        trust: false,

        // System & Technology
        analytics: true, // Renamed from reports?, keeping reports for backward compat if needed or mapping it
        reports: false, // Legacy or specific reports module
        map: false,
        locations: true,
        workflows: false,
        communications: false,
        security: false,
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
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/tenant/settings');
            const data = await res.json();

            if (data) {
                const loadedSettings: TenantSettings = {
                    name: data.name || defaultSettings.name,
                    config: {
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

    const refreshSettings = async () => {
        await fetchSettings();
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
