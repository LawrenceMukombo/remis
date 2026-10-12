import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    console.log('--- Starting Safe Enterprise Data Seeding ---');
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        console.error('No tenant found in database!');
        return;
    }
    const tenantId = tenant.id;
    console.log(`Using Tenant: ${tenant.name} (${tenantId})`);

    // 1. Locations
    const loc1 = await prisma.location.upsert({
        where: { id: 'loc-pom-cbd-01' },
        update: {},
        create: {
            id: 'loc-pom-cbd-01',
            name: 'Port Moresby CBD & Waterfront',
            type: 'DISTRICT',
            level: 2,
            tenantId
        }
    });

    const loc2 = await prisma.location.upsert({
        where: { id: 'loc-lae-ind-02' },
        update: {},
        create: {
            id: 'loc-lae-ind-02',
            name: 'Lae Industrial & Maritime Zone',
            type: 'DISTRICT',
            level: 2,
            tenantId
        }
    });

    const loc3 = await prisma.location.upsert({
        where: { id: 'loc-mth-comm-03' },
        update: {},
        create: {
            id: 'loc-mth-comm-03',
            name: 'Mt Hagen Highlands Trade Hub',
            type: 'DISTRICT',
            level: 2,
            tenantId
        }
    });

    console.log('Locations ready:', [loc1.name, loc2.name, loc3.name]);

    // 2. Properties
    const prop1 = await prisma.property.upsert({
        where: { id: 'prop-harbour-city-01' },
        update: {},
        create: {
            id: 'prop-harbour-city-01',
            name: 'Harbour City Commercial Plaza',
            type: 'COMMERCIAL',
            status: 'LEASED',
            listing_type: 'LEASE',
            locationId: loc1.id,
            tenantId,
            address: 'Poreporena Freeway, Port Moresby Waterfront',
            description: 'Prime Grade-A commercial multi-tenant corporate hub with backup utilities and high-speed fiber.',
            latitude: -9.4789,
            longitude: 147.1494,
            floor_count: 8,
            parking_spaces: 60,
            images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80']
        }
    });

    const prop2 = await prisma.property.upsert({
        where: { id: 'prop-apex-res-02' },
        update: {},
        create: {
            id: 'prop-apex-res-02',
            name: 'Apex Horizon Luxury Suites',
            type: 'RESIDENTIAL',
            status: 'AVAILABLE',
            listing_type: 'LEASE',
            locationId: loc1.id,
            tenantId,
            address: 'Touaguba Hill, Port Moresby',
            description: 'Exclusive executive serviced residences with panoramic ocean views and 24/7 security.',
            latitude: -9.4820,
            longitude: 147.1450,
            floor_count: 5,
            parking_spaces: 24,
            images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80']
        }
    });

    const prop3 = await prisma.property.upsert({
        where: { id: 'prop-lae-logistics-03' },
        update: {},
        create: {
            id: 'prop-lae-logistics-03',
            name: 'Lae Maritime Logistics Park',
            type: 'INDUSTRIAL',
            status: 'LEASED',
            listing_type: 'LEASE',
            locationId: loc2.id,
            tenantId,
            address: 'Main Wharf Access Road, Lae Port',
            description: 'Heavy industrial warehousing facility with high-cube clearances and container staging yard.',
            latitude: -6.7264,
            longitude: 146.9972,
            floor_count: 2,
            parking_spaces: 40,
            images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80']
        }
    });

    const prop4 = await prisma.property.upsert({
        where: { id: 'prop-hagen-trade-04' },
        update: {},
        create: {
            id: 'prop-hagen-trade-04',
            name: 'Highlands Gateway Commerce Centre',
            type: 'COMMERCIAL',
            status: 'AVAILABLE',
            listing_type: 'LEASE',
            locationId: loc3.id,
            tenantId,
            address: 'Okuk Highway Junction, Mt Hagen',
            description: 'Strategic regional distribution and corporate retail centre serving the Highlands corridors.',
            latitude: -5.8601,
            longitude: 144.2274,
            floor_count: 3,
            parking_spaces: 50,
            images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80']
        }
    });

    console.log('Properties ready:', [prop1.name, prop2.name, prop3.name, prop4.name]);

    // 3. Units
    await prisma.unit.upsert({
        where: { id: 'unit-harbour-401' },
        update: {},
        create: {
            id: 'unit-harbour-401',
            name: 'Suite 401 - Corporate HQ',
            code: 'HCP-401',
            type: 'OFFICE',
            marketRent: 4500,
            area: 320,
            status: 'OCCUPIED',
            propertyId: prop1.id,
            tenantId,
            images: []
        }
    });

    await prisma.unit.upsert({
        where: { id: 'unit-apex-penthouse' },
        update: {},
        create: {
            id: 'unit-apex-penthouse',
            name: 'Penthouse Suite 3B',
            code: 'AH-3B',
            type: 'APARTMENT',
            marketRent: 2400,
            area: 180,
            bedrooms: 3,
            bathrooms: 2,
            status: 'AVAILABLE',
            propertyId: prop2.id,
            tenantId,
            images: []
        }
    });

    await prisma.unit.upsert({
        where: { id: 'unit-lae-bay1' },
        update: {},
        create: {
            id: 'unit-lae-bay1',
            name: 'Heavy Freight Bay 1',
            code: 'LMLP-B1',
            type: 'WAREHOUSE',
            marketRent: 6000,
            area: 1200,
            status: 'OCCUPIED',
            propertyId: prop3.id,
            tenantId,
            images: []
        }
    });

    // 4. Renters (Tenants)
    const renter1 = await prisma.renter.upsert({
        where: { id: 'renter-telecom-01' },
        update: {},
        create: {
            id: 'renter-telecom-01',
            name: 'Pacific Telecom Global Corp',
            email: 'facilities@pacifictelecom.com',
            phone: '+675 7100 2345',
            type: 'CORPORATE',
            status: 'ACTIVE',
            idNumber: 'CORP-PG-2024-883',
            tenantId
        }
    });

    const renter2 = await prisma.renter.upsert({
        where: { id: 'renter-oceanic-02' },
        update: {},
        create: {
            id: 'renter-oceanic-02',
            name: 'Oceanic Mining & Logistics Ltd',
            email: 'operations@oceanicmining.com',
            phone: '+675 7455 9901',
            type: 'CORPORATE',
            status: 'ACTIVE',
            idNumber: 'CORP-AU-7761-09',
            tenantId
        }
    });

    const renter3 = await prisma.renter.upsert({
        where: { id: 'renter-henderson-03' },
        update: {},
        create: {
            id: 'renter-henderson-03',
            name: 'Dr. Arthur Henderson',
            email: 'arthur.henderson@pacifichealth.org',
            phone: '+675 7234 5678',
            type: 'INDIVIDUAL',
            status: 'ACTIVE',
            idNumber: 'NIC-9812-4412',
            tenantId
        }
    });

    console.log('Renters ready:', [renter1.name, renter2.name, renter3.name]);

    // 5. Leases
    const lease1 = await prisma.lease.upsert({
        where: { id: 'lease-telecom-01' },
        update: {},
        create: {
            id: 'lease-telecom-01',
            propertyId: prop1.id,
            renterId: renter1.id,
            tenantId,
            rentAmount: 4500,
            frequency: 'MONTHLY',
            status: 'ACTIVE',
            startDate: new Date('2026-01-01'),
            endDate: new Date('2027-12-31')
        }
    });

    const lease2 = await prisma.lease.upsert({
        where: { id: 'lease-oceanic-02' },
        update: {},
        create: {
            id: 'lease-oceanic-02',
            propertyId: prop3.id,
            renterId: renter2.id,
            tenantId,
            rentAmount: 6000,
            frequency: 'MONTHLY',
            status: 'ACTIVE',
            startDate: new Date('2025-06-01'),
            endDate: new Date('2028-05-31')
        }
    });

    console.log('Leases ready:', [lease1.id, lease2.id]);

    // 6. Payments with Receipts
    await prisma.payment.upsert({
        where: { id: 'pay-rcp-00101' },
        update: {},
        create: {
            id: 'pay-rcp-00101',
            amount: 4500,
            date: new Date('2026-10-01'),
            method: 'BANK_TRANSFER',
            reference: 'RCP-2026-00101',
            status: 'COMPLETED',
            renterId: renter1.id,
            tenantId
        }
    });

    await prisma.payment.upsert({
        where: { id: 'pay-rcp-00102' },
        update: {},
        create: {
            id: 'pay-rcp-00102',
            amount: 6000,
            date: new Date('2026-10-05'),
            method: 'ELECTRONIC_FUNDS',
            reference: 'RCP-2026-00102',
            status: 'COMPLETED',
            renterId: renter2.id,
            tenantId
        }
    });

    console.log('Payments & Receipts ready.');
    console.log('--- Seeding Completed Successfully ---');
}

seed()
    .catch(e => {
        console.error('Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
