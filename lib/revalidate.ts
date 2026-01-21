import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Define the shape of a Promise with relations needed for revalidation
export type PromiseWithRelations = Prisma.PromiseGetPayload<{
    include: {
        category: true;
        politician: { include: { party: true } };
        party: true;
    }
}>;

export function revalidatePromise(promise: PromiseWithRelations) {
    if (!promise) return;

    console.log(`[Revalidate] Purging cache for Promise: ${promise.title}`);

    // 1. Home Page (Latest promises)
    revalidatePath("/");

    // 2. Promise List Page
    revalidatePath("/promises");

    // 3. Promise Detail Page (Public URL: /promises/[category]/[slug])
    // The dateSlug is complex logic, but usually it's just the slug in the URL if the route is [...slug] or similar.
    // In this app, route is /promises/[categorySlug]/[dateSlug]
    if (promise.category && promise.slug) {
        revalidatePath(`/promises/${promise.category.slug}/${promise.slug}`);
    }

    // 4. Politician Detail Page
    if (promise.politician) {
        revalidatePath(`/politicians/${promise.politician.slug}`);
        // Also revalidate list?
        revalidatePath("/politicians");
    }

    // 5. Party Detail Page
    // Promise can be linked to party directly or via politician
    const partySlug = promise.party?.slug || promise.politician?.party?.slug;
    if (partySlug) {
        revalidatePath(`/parties/${partySlug}`);
        revalidatePath("/parties");
    }

    // 6. Category Detail Page
    if (promise.category) {
        revalidatePath(`/categories/${promise.category.slug}`);
        revalidatePath("/categories");
    }
}

export function revalidatePolitician(slug: string) {
    revalidatePath(`/politicians/${slug}`);
    revalidatePath("/politicians");
    revalidatePath("/"); // Top politicians might change
}

export function revalidateParty(slug: string) {
    revalidatePath(`/parties/${slug}`);
    revalidatePath("/parties");
    revalidatePath("/");
}

export function revalidateCategory(slug: string) {
    revalidatePath(`/categories/${slug}`);
    revalidatePath("/categories");
    revalidatePath("/");
}
