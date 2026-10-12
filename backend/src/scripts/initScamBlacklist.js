const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initBlacklistTable() {
    console.log('--- Initializing Global Scammer Blacklist Table (Safe Additive) ---');
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS scam_blacklist (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                entity_type VARCHAR(50) NOT NULL,
                entity_value VARCHAR(255) NOT NULL,
                entity_display VARCHAR(255) NOT NULL,
                severity VARCHAR(50) DEFAULT 'CRITICAL_FRAUD',
                incident_summary TEXT NOT NULL,
                evidence_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
                flagged_by VARCHAR(255) DEFAULT 'SYSTEM_COMPLIANCE',
                tenant_id VARCHAR(255),
                appeal_status VARCHAR(50) DEFAULT 'NONE',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('✓ scam_blacklist table confirmed or created successfully.');

        // Seed 2 sample blacklisted scammer signatures for testing
        const existing = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM scam_blacklist`);
        const count = existing[0]?.count || 0;
        if (count === 0) {
            await prisma.$executeRawUnsafe(`
                INSERT INTO scam_blacklist (entity_type, entity_value, entity_display, severity, incident_summary, flagged_by)
                VALUES 
                ('PHONE_NUMBER', '+260977000999', '+260 977 *** 999', 'CRITICAL_FRAUD', 'Repeatedly collected advance viewing fees via mobile money for non-existent Kabulonga apartments', 'CHIEF_COMPLIANCE_OFFICER'),
                ('NATIONAL_ID', '199823/11/1', 'NRC: 199823/**/1', 'IDENTITY_THEFT', 'Attempted to upload forged certificate of title deed with altered parcel numbers in Woodlands', 'AUDIT_OFFICER')
            `);
            console.log('✓ Seeded 2 sample scammer blacklist records.');
        }

    } catch (e) {
        console.error('Error creating scam_blacklist table:', e);
        process.exit(1);
    }
}

initBlacklistTable()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
