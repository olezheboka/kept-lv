
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const promise = await prisma.promise.findFirst();
    if (!promise) {
        console.log('No promises found to update.');
        return;
    }

    console.log(`Updating promise: ${promise.title} (${promise.id})`);

    await prisma.promise.update({
        where: { id: promise.id },
        data: {
            tags: ['budžets', 'nodokļi', 'reforma']
        }
    });

    console.log('Tags added successfully.');
    console.log(`Check url: /promises/${promise.categoryId}/${promise.slug || promise.id}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
