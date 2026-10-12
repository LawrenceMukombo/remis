const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedMultiOrg() {
    console.log('--- Starting Multi-Organization & Multi-Country Seeding ---');

    // 1. Update primary tenant: Remis Global Enterprise (US & Global)
    const primaryTenant = await prisma.tenant.findFirst();
    if (primaryTenant) {
        await prisma.tenant.update({
            where: { id: primaryTenant.id },
            data: {
                name: 'Remis Global Enterprise',
                config: {
                    country: 'United States',
                    branding: {
                        logoUrl: '',
                        primaryColor: '#4f46e5',
                        secondaryColor: '#10b981',
                        fontFamily: 'Inter, sans-serif'
                    },
                    contact: {
                        email: 'contact@remisglobal.com',
                        phone: '+1 (555) 019-2834',
                        address: '742 Evergreen Terrace, New York, NY 10001'
                    },
                    locale: {
                        currency: 'USD',
                        dateFormat: 'YYYY-MM-DD',
                        timeFormat: '12h'
                    },
                    locationLabels: {
                        1: 'Country',
                        2: 'State / Province',
                        3: 'City / District',
                        4: 'Locality / Area'
                    }
                },
                features: {
                    properties: true,
                    leases: true,
                    sales: true,
                    landlords: true,
                    analytics: true,
                    locations: true,
                    maintenance: true,
                    crm: true,
                    finance: true,
                    documents: true
                }
            }
        });
        console.log('Updated Primary Tenant:', primaryTenant.id, '-> Remis Global Enterprise');

        // Add root Level 1 Country locations for primaryTenant
        const usCountry = await prisma.location.upsert({
            where: { id: 'loc-us-root-01' },
            update: {},
            create: {
                id: 'loc-us-root-01',
                name: 'United States',
                type: 'COUNTRY',
                level: 1,
                tenantId: primaryTenant.id
            }
        });

        const nyState = await prisma.location.upsert({
            where: { id: 'loc-us-ny-02' },
            update: {},
            create: {
                id: 'loc-us-ny-02',
                name: 'New York Metro & Tri-State',
                type: 'STATE',
                level: 2,
                parentId: usCountry.id,
                tenantId: primaryTenant.id
            }
        });

        const manhattanCity = await prisma.location.upsert({
            where: { id: 'loc-us-manhattan-03' },
            update: {},
            create: {
                id: 'loc-us-manhattan-03',
                name: 'Manhattan Financial District',
                type: 'CITY',
                level: 3,
                parentId: nyState.id,
                tenantId: primaryTenant.id
            }
        });

        const ukCountry = await prisma.location.upsert({
            where: { id: 'loc-uk-root-01' },
            update: {},
            create: {
                id: 'loc-uk-root-01',
                name: 'United Kingdom',
                type: 'COUNTRY',
                level: 1,
                tenantId: primaryTenant.id
            }
        });

        const londonCity = await prisma.location.upsert({
            where: { id: 'loc-uk-london-02' },
            update: {},
            create: {
                id: 'loc-uk-london-02',
                name: 'Greater London Financial Center',
                type: 'CITY',
                level: 2,
                parentId: ukCountry.id,
                tenantId: primaryTenant.id
            }
        });

        console.log('Multi-country locations added:', [usCountry.name, nyState.name, manhattanCity.name, ukCountry.name, londonCity.name]);

        // Add global properties in Manhattan and London
        await prisma.property.upsert({
            where: { id: 'prop-us-wallst-01' },
            update: {},
            create: {
                id: 'prop-us-wallst-01',
                name: 'One Manhattan Financial Tower',
                type: 'COMMERCIAL',
                status: 'LEASED',
                listing_type: 'LEASE',
                locationId: manhattanCity.id,
                tenantId: primaryTenant.id,
                address: '140 Broadway, Financial District, New York, NY 10005',
                description: 'Prestige corporate office tower with LEED Platinum certification and panoramic harbor views.',
                latitude: 40.7081,
                longitude: -74.0113,
                floor_count: 52,
                parking_spaces: 120,
                images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80']
            }
        });

        await prisma.property.upsert({
            where: { id: 'prop-uk-canary-02' },
            update: {},
            create: {
                id: 'prop-uk-canary-02',
                name: 'Canary Wharf Executive Plaza',
                type: 'COMMERCIAL',
                status: 'AVAILABLE',
                listing_type: 'LEASE',
                locationId: londonCity.id,
                tenantId: primaryTenant.id,
                address: '25 Bank Street, Canary Wharf, London E14 5JP',
                description: 'Grade-A headquarters building featuring column-free floor plates and high-capacity connectivity.',
                latitude: 51.5033,
                longitude: -0.0195,
                floor_count: 33,
                parking_spaces: 80,
                images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80']
            }
        });
    }

    // 2. Organization 2: Apex African & EMEA Holdings (South Africa / Kenya)
    const org2 = await prisma.tenant.upsert({
        where: { domain: 'apex-emea' },
        update: {},
        create: {
            id: 'tenant-apex-emea-02',
            name: 'Apex African & EMEA Holdings',
            domain: 'apex-emea',
            status: 'ACTIVE',
            config: {
                country: 'South Africa',
                branding: {
                    logoUrl: '',
                    primaryColor: '#059669',
                    secondaryColor: '#d97706',
                    fontFamily: 'Inter, sans-serif'
                },
                contact: {
                    email: 'info@apexemea.com',
                    phone: '+27 11 982 4400',
                    address: 'Sandton City Office Towers, Johannesburg, 2196'
                },
                locale: {
                    currency: 'ZAR',
                    dateFormat: 'YYYY-MM-DD',
                    timeFormat: '24h'
                },
                locationLabels: {
                    1: 'Country',
                    2: 'Province / County',
                    3: 'Municipality / City',
                    4: 'Township / Suburb'
                }
            },
            features: {
                properties: true,
                leases: true,
                sales: true,
                landlords: true,
                analytics: true,
                locations: true,
                maintenance: true
            }
        }
    });

    console.log('Organization 2 created:', org2.name);

    // Locations for Org 2
    const saCountry = await prisma.location.upsert({
        where: { id: 'loc-sa-root-01' },
        update: {},
        create: {
            id: 'loc-sa-root-01',
            name: 'South Africa',
            type: 'COUNTRY',
            level: 1,
            tenantId: org2.id
        }
    });

    const jhbCity = await prisma.location.upsert({
        where: { id: 'loc-sa-jhb-02' },
        update: {},
        create: {
            id: 'loc-sa-jhb-02',
            name: 'Sandton Central, Johannesburg',
            type: 'CITY',
            level: 2,
            parentId: saCountry.id,
            tenantId: org2.id
        }
    });

    await prisma.property.upsert({
        where: { id: 'prop-sa-sandton-01' },
        update: {},
        create: {
            id: 'prop-sa-sandton-01',
            name: 'Sandton Gateway Heights',
            type: 'COMMERCIAL',
            status: 'AVAILABLE',
            listing_type: 'LEASE',
            locationId: jhbCity.id,
            tenantId: org2.id,
            address: 'Rivonia Road, Sandton, Johannesburg',
            description: 'Premier financial precinct development offering flexible floor arrangements and solar microgrid.',
            latitude: -26.1076,
            longitude: 28.0567,
            floor_count: 14,
            parking_spaces: 90,
            images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80']
        }
    });

    // 3. Organization 3: Pacific Rim Capital Properties (Australia / PNG)
    const org3 = await prisma.tenant.upsert({
        where: { domain: 'pacific-rim' },
        update: {},
        create: {
            id: 'tenant-pacific-rim-03',
            name: 'Pacific Rim Capital Properties',
            domain: 'pacific-rim',
            status: 'ACTIVE',
            config: {
                country: 'Australia',
                branding: {
                    logoUrl: '',
                    primaryColor: '#0284c7',
                    secondaryColor: '#f97316',
                    fontFamily: 'Inter, sans-serif'
                },
                contact: {
                    email: 'enquiries@pacificrimcap.com.au',
                    phone: '+61 2 9200 1122',
                    address: 'Level 38, Australia Square, Sydney NSW 2000'
                },
                locale: {
                    currency: 'AUD',
                    dateFormat: 'DD/MM/YYYY',
                    timeFormat: '12h'
                },
                locationLabels: {
                    1: 'Country',
                    2: 'State / Territory',
                    3: 'City / LGA',
                    4: 'Suburb / Precinct'
                }
            },
            features: {
                properties: true,
                leases: true,
                sales: true,
                landlords: true,
                analytics: true,
                locations: true,
                maintenance: true
            }
        }
    });

    console.log('Organization 3 created:', org3.name);

    // Locations for Org 3
    const auCountry = await prisma.location.upsert({
        where: { id: 'loc-au-root-01' },
        update: {},
        create: {
            id: 'loc-au-root-01',
            name: 'Australia',
            type: 'COUNTRY',
            level: 1,
            tenantId: org3.id
        }
    });

    const sydneyCity = await prisma.location.upsert({
        where: { id: 'loc-au-syd-02' },
        update: {},
        create: {
            id: 'loc-au-syd-02',
            name: 'Sydney CBD & Barangaroo',
            type: 'CITY',
            level: 2,
            parentId: auCountry.id,
            tenantId: org3.id
        }
    });

    await prisma.property.upsert({
        where: { id: 'prop-au-barangaroo-01' },
        update: {},
        create: {
            id: 'prop-au-barangaroo-01',
            name: 'Barangaroo Harbourview Suites',
            type: 'COMMERCIAL',
            status: 'LEASED',
            listing_type: 'LEASE',
            locationId: sydneyCity.id,
            tenantId: org3.id,
            address: 'Hickson Road, Barangaroo South, Sydney NSW 2000',
            description: 'World-class waterfront commercial asset with 6-star Green Star rating and ferry connectivity.',
            latitude: -33.8646,
            longitude: 151.2014,
            floor_count: 28,
            parking_spaces: 110,
            images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80']
        }
    });

    console.log('--- Multi-Organization & Multi-Country Seeding Finished Successfully ---');
}

seedMultiOrg()
    .catch(e => {
        console.error('Error in multi-org seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
