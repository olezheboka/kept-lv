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
  console.log('Checking promises in database...');

  try {
    // Count all promises
    const countResult = await pool.query(`SELECT COUNT(*) as count FROM promises`);
    console.log('Total promises:', countResult.rows[0].count);

    // Check status distribution
    const statusResult = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM promises 
      GROUP BY status 
      ORDER BY status
    `);
    console.log('Status distribution:', statusResult.rows);

    // Check current enum values
    const enumResult = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PromiseStatus')
    `);
    console.log('Current PromiseStatus enum values:', enumResult.rows.map(r => r.enumlabel));

    // Get a few sample promises
    const sampleResult = await pool.query(`SELECT id, title, status FROM promises LIMIT 5`);
    console.log('Sample promises:', sampleResult.rows);

  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    await pool.end();
  }
}

main();
