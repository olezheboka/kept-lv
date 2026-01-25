
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://solijums.lv";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [politicians, parties, promises, categories] = await Promise.all([
        prisma.politician.findMany({ select: { slug: true, updatedAt: true } }),
        prisma.party.findMany({ select: { slug: true, updatedAt: true } }),
        prisma.promise.findMany({
            select: { slug: true, updatedAt: true, dateOfPromise: true, category: { select: { slug: true } } },
        }),
        prisma.category.findMany({ select: { slug: true } }),
    ]);

    const staticRoutes = [
        "",
        "/promises",
        "/politicians",
        "/parties",
        "/categories",
        "/methodology",
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    const politicianRoutes = politicians.map((politician) => ({
        url: `${BASE_URL}/politicians/${politician.slug}`,
        lastModified: politician.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    const partyRoutes = parties.map((party) => ({
        url: `${BASE_URL}/parties/${party.slug}`,
        lastModified: party.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    const categoryRoutes = categories.map((category) => ({
        url: `${BASE_URL}/categories/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
    }));

    const promiseRoutes = promises.map((promise) => {
        const date = new Date(promise.dateOfPromise);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const dateSlug = `${day}-${month}-${year}`;

        return {
            url: `${BASE_URL}/promises/${promise.category.slug}/${dateSlug}-${promise.slug}`,
            lastModified: promise.updatedAt,
            changeFrequency: "monthly" as const,
            priority: 0.6,
        };
    });

    return [
        ...staticRoutes,
        ...politicianRoutes,
        ...partyRoutes,
        ...categoryRoutes,
        ...promiseRoutes,
    ];
}
