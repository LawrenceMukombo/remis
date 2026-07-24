import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up unused schemas...');

    try {
        // Drop public schema cascade to remove all tables in it
        await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "public" CASCADE;`);
        console.log('Dropped schema "public".');

        // Optionally recreate it empty if needed by some postgres internals, or just leave it gone.
        // The user explicitly said "other schemas not in use are deleted".
        // We are using "remis" schema confirmed by the connection string.

    } catch (error) {
        console.error('Error dropping schema:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
