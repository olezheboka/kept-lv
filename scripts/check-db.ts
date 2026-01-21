import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  console.log('Checking promises in database...');

  try {
    // Count all promises
    const count = await prisma.promise.count();
    console.log('Total promises:', count);

    // Check status distribution
    const distribution = await prisma.promise.groupBy({
      by: ['status'],
      _count: true,
      orderBy: {
        status: 'asc'
      }
    });
    console.log('Status distribution:', distribution.map(d => ({ status: d.status, count: d._count })));

    // Check current enum values using raw query for metadata
    // Prisma doesn't expose enum metadata directly, so we use raw query if needed, 
    // or just rely on the fact that Prisma Client is typed.
    // Keeping the original intent of checking DB level enums:
    const enumResult = await prisma.$queryRaw<Array<{ enumlabel: string }>>`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PromiseStatus')
    `;
    console.log('Current PromiseStatus enum values:', enumResult.map(r => r.enumlabel));

    // Get a few sample promises
    const samples = await prisma.promise.findMany({
      take: 5,
      select: { id: true, title: true, status: true }
    });
    console.log('Sample promises:', samples);

  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
