
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

// Dynamic import to ensure env vars are loaded first
async function main() {
    const { getParties, getPoliticians, getPromises, getCategories } = await import("../lib/db");

    console.log("Verifying data access...");

    const parties = await getParties("lv");
    console.log(`Parties: ${parties.length}`);
    if (parties.length > 0) {
        console.log("Sample Party:", JSON.stringify(parties[0], null, 2));
    }

    const politicians = await getPoliticians("lv");
    console.log(`Politicians: ${politicians.length}`);
    if (politicians.length > 0) {
        console.log("Sample Politician:", JSON.stringify(politicians[0], null, 2));
    }

    const promises = await getPromises("lv");
    console.log(`Promises: ${promises.length}`);
    if (promises.length > 0) {
        console.log("Sample Promise:", JSON.stringify(promises[0], null, 2));
    }

    const categories = await getCategories("lv");
    console.log(`Categories: ${categories.length}`);
    if (categories.length > 0) {
        console.log("Sample Category:", JSON.stringify(categories[0], null, 2));
    }
}

main().catch(console.error);
