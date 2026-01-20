import { Pool } from "pg";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
});

async function main() {
    console.log('Starting migration: NOT_RATED -> CANCELLED');

    try {
        // First, count records with NOT_RATED status
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM promises WHERE status = 'NOT_RATED'`);
        console.log('Records with NOT_RATED status:', countResult.rows[0].count);

        if (parseInt(countResult.rows[0].count) > 0) {
            // Step 1: Add CANCELLED to the enum if it doesn't exist
            console.log('Step 1: Adding CANCELLED to PromiseStatus enum...');
            await pool.query(`ALTER TYPE "PromiseStatus" ADD VALUE IF NOT EXISTS 'CANCELLED'`);

            // Step 2: Update the records
            console.log('Step 2: Updating NOT_RATED to CANCELLED...');
            const updateResult = await pool.query(`UPDATE promises SET status = 'CANCELLED' WHERE status = 'NOT_RATED'`);
            console.log('Updated records:', updateResult.rowCount);
        } else {
            console.log('No records with NOT_RATED status to update.');
            // Still add the enum value for future use
            console.log('Adding CANCELLED to PromiseStatus enum...');
            await pool.query(`ALTER TYPE "PromiseStatus" ADD VALUE IF NOT EXISTS 'CANCELLED'`);
        }

        // Step 3: Remove NOT_RATED from enum (more complex - requires recreating enum)
        // This is handled by prisma db push

        console.log('Migration complete! Run "npx prisma db push" to finalize schema.');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

main();
