
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration of PromiseStatus...');

    try {
        // 2. Update existing records
        // Since both IN_PROGRESS and PENDING are now in the enum (thanks to db:push), 
        // we can update directly.
        // We cast to text to be safe if Prisma/Postgres acts up with Enum types in raw query
        // or just use Enum literal.

        // Attempt 1: Direct Enum update
        console.log('Updating IN_PROGRESS records to PENDING...');
        const result = await prisma.$executeRawUnsafe(`
      UPDATE "promises" 
      SET "status" = 'PENDING'
      WHERE "status" = 'IN_PROGRESS';
    `);

        console.log(`Updated records count: ${result}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
