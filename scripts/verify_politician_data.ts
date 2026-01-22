
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Find a politician (e.g. first one)
    const pol = await prisma.politician.findFirst();
    if (!pol) {
        console.log("No politicians found to update.");
        return;
    }

    console.log(`Updating politician: ${pol.name} (${pol.slug})`);

    // Update with jobs and education
    await prisma.politician.update({
        where: { id: pol.id },
        data: {
            jobs: {
                create: [
                    { title: "Test Job Current", company: "Gov", years: "2022 - Now" },
                    { title: "Test Job Past", company: "Old Corp", years: "2018 - 2022" },
                ]
            },
            educationEntries: {
                create: [
                    { degree: "Master of Testing", institution: "Test University", year: "2018" },
                    { degree: "Bachelor of Code", institution: "Dev Institute", year: "2015" }
                ]
            }
        }
    });

    console.log("Updated successfully with jobs and education.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
