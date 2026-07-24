import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Default Tenant
    const tenant = await prisma.tenant.upsert({
        where: { domain: 'remis-hq' },
        update: {},
        create: {
            name: 'Remis HQ',
            domain: 'remis-hq',
            status: 'ACTIVE'
        }
    });

    console.log('Created Tenant:', tenant.name);

    // 2. Create Roles
    const adminRole = await prisma.role.upsert({
        where: {
            role_code_tenant_id: {
                role_code: 'ADMIN',
                tenant_id: tenant.id
            }
        },
        update: {},
        create: {
            role_code: 'ADMIN',
            role_name: 'System Administrator',
            description: 'Full access to all resources',
            tenant_id: tenant.id
        }
    });

    console.log('Created Role:', adminRole.role_name);

    // 3. Create Admin User
    const passwordHash = await bcrypt.hash('password123', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@remis.com' },
        update: {},
        create: {
            email: 'admin@remis.com',
            password: passwordHash,
            full_name: 'Super Admin',
            tenant_id: tenant.id,
            role_id: adminRole.role_id
        }
    });

    console.log('Created Admin User:', adminUser.email);
    console.log('Password: password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
