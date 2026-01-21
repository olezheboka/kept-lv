import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config({ path: '.env.local' });

// Reverted to env var for safety
const connectionString = process.env.DATABASE_URL;

console.log('Testing Database Connection...');
console.log('DATABASE_URL starts with:', connectionString ? connectionString.substring(0, 15) + '...' : 'UNDEFINED');

async function testConnection() {
    if (!connectionString) {
        console.error('❌ DATABASE_URL is undefined');
        return;
    }

    // Test 1: Direct PG Connection
    console.log('\n--- Test 1: Direct pg Pool Connection ---');
    // Match lib/prisma.ts SSL config
    const sslConfig = process.env.NODE_ENV === 'production' ? true : { rejectUnauthorized: false };
    console.log('Using SSL Config:', JSON.stringify(sslConfig));

    const pool = new pg.Pool({
        connectionString,
        ssl: sslConfig
    });
    try {
        const client = await pool.connect();
        console.log('✅ Connected to pg pool successfully.');
        const res = await client.query('SELECT NOW()');
        console.log('✅ Query result:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('❌ pg connection failed:', err);
    } finally {
        await pool.end();
    }

    // Test 2: Prisma Client Connection
    console.log('\n--- Test 2: Prisma Client Connection ---');
    // Re-create pool for Prisma
    const prismaPool = new pg.Pool({
        connectionString,
        ssl: sslConfig
    });
    const adapter = new PrismaPg(prismaPool);
    const prisma = new PrismaClient({ adapter });

    try {
        await prisma.$connect();
        console.log('✅ Prisma connected successfully.');
        const count = await prisma.promise.count();
        console.log(`✅ Promise count via Prisma: ${count}`);
        const promises = await prisma.promise.findMany({ take: 3 });
        console.log('✅ Fetched 3 promises:', promises.map(p => p.slug));
    } catch (err) {
        // Print full error structure
        console.error('❌ Prisma connection failed:', JSON.stringify(err, null, 2));
        console.error('Original error:', err);
    } finally {
        await prisma.$disconnect();
        await prismaPool.end();
    }
}

testConnection();
