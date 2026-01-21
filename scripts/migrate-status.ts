import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration: NOT_RATED -> CANCELLED');

    try {
        // First, count records with NOT_RATED status using raw query since NOT_RATED might not be in the generated client Enum if schema updated
        // But assuming we can query safely:
        const countResult = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*) as count FROM promises WHERE status = 'NOT_RATED'`;
        const count = Number(countResult[0]?.count || 0);
        console.log('Records with NOT_RATED status:', count);

        if (count > 0) {
            // Step 1: Add CANCELLED to the enum if it doesn't exist
            console.log('Step 1: Adding CANCELLED to PromiseStatus enum...');
            // Use executeRaw for DDL/DML
            await prisma.$executeRawUnsafe(`ALTER TYPE "PromiseStatus" ADD VALUE IF NOT EXISTS 'CANCELLED'`);

            // Step 2: Update the records
            console.log('Step 2: Updating NOT_RATED to CANCELLED...');
            // Need cast to PromiseStatus because Prisma Client checks types? 
            // Better use executeRawUnsafe to bypass strict client typing if enum mismatch
            const updatedCount = await prisma.$executeRawUnsafe(`UPDATE promises SET status = 'CANCELLED' WHERE status = 'NOT_RATED'`);
            console.log('Updated records:', updatedCount);
        } else {
            console.log('No records with NOT_RATED status to update.');
            // Still add the enum value for future use
            console.log('Adding CANCELLED to PromiseStatus enum...');
            await prisma.$executeRawUnsafe(`ALTER TYPE "PromiseStatus" ADD VALUE IF NOT EXISTS 'CANCELLED'`);
        }

        console.log('Migration complete! Run "npx prisma db push" to finalize schema.');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
