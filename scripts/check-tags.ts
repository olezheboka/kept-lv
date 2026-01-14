
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const promises = await prisma.promise.findMany({
        take: 5,
        select: {
            id: true,
            title: true,
            slug: true,
            tags: true
        }
    });

    console.log('Promises in DB:', JSON.stringify(promises, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
