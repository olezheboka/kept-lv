import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

// Types for transformed data (matching UI expectations)
export interface PartyUI {
    id: string;
    slug: string;
    name: string;
    description?: string;
    abbreviation: string;
    color: string;
    logoUrl?: string;
    websiteUrl?: string;
    isInCoalition: boolean;
    mpCount: number;
}

export interface PoliticianUI {
    id: string;
    slug: string;
    name: string;
    role: string;
    partyId?: string;
    photoUrl: string;
    isInOffice: boolean;
    roleStartDate?: string;
    roleEndDate?: string;
    bio?: string;
}

export interface PromiseUI {
    id: string;
    title: string;
    fullText: string;
    politicianId: string;
    politicianName: string;
    politicianRole: string;
    politicianPhotoUrl: string;
    politicianIsInOffice: boolean;
    partyId?: string;
    partyAbbreviation?: string;
    partyLogoUrl?: string;
    datePromised: string;
    electionCycle?: string;
    status: "kept" | "partially-kept" | "in-progress" | "broken" | "not-rated";
    statusJustification: string;
    statusUpdatedAt: string;
    statusUpdatedBy: string;
    category: string;
    description?: string;
    importance?: string;
    deadline?: string;
    tags: string[];
    sources: { title: string; url: string; publication: string; date: string }[];
    viewCount: number;
    featured: boolean;
}

export interface CategoryUI {
    id: string;
    slug: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
}

export interface RankingItem {
    id: string;
    name: string;
    avatarUrl?: string;
    color?: string;
    role?: string;
    partyId?: string;
    totalPromises: number;
    keptPromises: number;
    keptPercentage: number;
    abbreviation?: string;
    isInOffice?: boolean;
    isInCoalition?: boolean;
}

// Locale type
type Locale = "lv" | "en" | "ru";

// Helper to extract localized text
function getLocalizedText(json: Prisma.JsonValue, locale: Locale = "lv"): string {
    if (typeof json === "object" && json !== null && !Array.isArray(json)) {
        const obj = json as Record<string, string>;
        return obj[locale] || obj["lv"] || obj["en"] || "";
    }
    return String(json || "");
}

// Map Prisma status to UI status
function mapStatusToUI(status: string): PromiseUI["status"] {
    const statusMap: Record<string, PromiseUI["status"]> = {
        KEPT: "kept",
        NOT_KEPT: "broken",
        IN_PROGRESS: "in-progress",
        PARTIAL: "partially-kept",
        ABANDONED: "broken",
    };
    return statusMap[status] || "not-rated";
}

// Map category slug back to original category id format (if needed, or just use slug)
function mapCategorySlug(slug: string): string {
    // Current UI seems to expect these mapped slugs for icons or routing
    const categoryMap: Record<string, string> = {
        economy: "economy-finance",
        healthcare: "healthcare",
        education: "education-science",
        security: "defense-security",
        "foreign-affairs": "foreign-affairs",
        "social-welfare": "social-welfare",
        environment: "environment-energy",
        infrastructure: "transport-infrastructure",
        justice: "justice-law",
        culture: "culture-heritage",
        agriculture: "agriculture-rural",
        digital: "digital-technology",
        regional: "housing-regional",
        youth: "youth-sports",
    };
    return categoryMap[slug] || slug;
}

// Party abbreviation map (since DB doesn't store abbreviations)
const partyAbbreviations: Record<string, string> = {
    jv: "JV",
    zzs: "ZZS",
    na: "NA",
    ap: "AP!",
    prog: "P",
    lra: "LRA",
    stab: "S!",
    lpv: "LPV",
    sask: "S",
};

// Party MP counts (hardcoded for now as "real world" context)
const partyMpCounts: Record<string, number> = {
    jv: 26,
    zzs: 16,
    na: 13,
    ap: 0,
    prog: 10,
    lra: 8,
    stab: 11,
    lpv: 9,
    sask: 0,
};

// ========== PARTIES ==========

export async function getParties(locale: Locale = "lv"): Promise<PartyUI[]> {
    const parties = await prisma.party.findMany({
        orderBy: { createdAt: "asc" },
    });

    return parties.map((party) => ({
        id: party.slug,
        slug: party.slug,
        name: getLocalizedText(party.name, locale),
        description: party.description ? getLocalizedText(party.description, locale) : undefined,
        abbreviation: partyAbbreviations[party.slug] || party.slug.toUpperCase(),
        color: party.color,
        logoUrl: party.logoUrl || undefined,
        websiteUrl: party.websiteUrl || undefined,
        isInCoalition: party.isCoalition, // Use correct field from DB
        mpCount: partyMpCounts[party.slug] ?? 0,
    }));
}

export async function getPartyBySlug(
    slug: string,
    locale: Locale = "lv"
): Promise<PartyUI | null> {
    const party = await prisma.party.findUnique({
        where: { slug },
    });

    if (!party) return null;

    return {
        id: party.slug,
        slug: party.slug,
        name: getLocalizedText(party.name, locale),
        description: party.description ? getLocalizedText(party.description, locale) : undefined,
        abbreviation: partyAbbreviations[party.slug] || party.slug.toUpperCase(),
        color: party.color,
        logoUrl: party.logoUrl || undefined,
        websiteUrl: party.websiteUrl || undefined,
        isInCoalition: party.isCoalition,
        mpCount: partyMpCounts[party.slug] ?? 0,
    };
}

// ========== POLITICIANS ==========

export async function getPoliticians(
    locale: Locale = "lv"
): Promise<PoliticianUI[]> {
    const politicians = await prisma.politician.findMany({
        include: { party: true },
        orderBy: { createdAt: "asc" },
    });

    return politicians.map((pol) => ({
        id: pol.slug,
        slug: pol.slug,
        name: pol.name,
        role: pol.role ? getLocalizedText(pol.role, locale) : (pol.bio ? getLocalizedText(pol.bio, locale) : ""),
        partyId: pol.party?.slug,
        photoUrl: pol.imageUrl || "",
        isInOffice: pol.isActive,
        roleStartDate: undefined,
        roleEndDate: undefined,
        bio: pol.bio ? getLocalizedText(pol.bio, locale) : undefined,
    }));
}

export async function getPoliticianBySlug(
    slug: string,
    locale: Locale = "lv"
): Promise<PoliticianUI | null> {
    const pol = await prisma.politician.findUnique({
        where: { slug },
        include: { party: true },
    });

    if (!pol) return null;

    return {
        id: pol.slug,
        slug: pol.slug,
        name: pol.name,
        role: pol.role ? getLocalizedText(pol.role, locale) : (pol.bio ? getLocalizedText(pol.bio, locale) : ""),
        partyId: pol.party?.slug,
        photoUrl: pol.imageUrl || "",
        isInOffice: pol.isActive,
        roleStartDate: undefined,
        roleEndDate: undefined,
        bio: pol.bio ? getLocalizedText(pol.bio, locale) : undefined,
    };
}

// ========== PROMISES ==========

export async function getPromises(locale: Locale = "lv"): Promise<PromiseUI[]> {
    const promises = await prisma.promise.findMany({
        include: {
            politician: { include: { party: true } },
            category: true,
            sources: true,
        },
        orderBy: { updatedAt: "desc" },
    });

    return promises.map((p) => ({
        id: p.id,
        title: getLocalizedText(p.title, locale),
        fullText: p.description ? getLocalizedText(p.description, locale) : getLocalizedText(p.title, locale),
        politicianId: p.politician.slug,
        politicianName: p.politician.name,
        politicianRole: p.politician.role ? getLocalizedText(p.politician.role, locale) : "",
        politicianPhotoUrl: p.politician.imageUrl || "",
        politicianIsInOffice: p.politician.isActive,
        partyId: p.politician.party?.slug,
        partyAbbreviation: p.politician.party ? (partyAbbreviations[p.politician.party.slug] || p.politician.party.slug.toUpperCase()) : undefined,
        partyLogoUrl: p.politician.party?.logoUrl || undefined,
        datePromised: p.dateOfPromise.toISOString().split("T")[0],
        electionCycle: "2022 Saeima Elections",
        status: mapStatusToUI(p.status),
        statusJustification: p.explanation
            ? getLocalizedText(p.explanation, locale)
            : "",
        statusUpdatedAt: (p.statusUpdatedAt || p.updatedAt).toISOString().split("T")[0],
        statusUpdatedBy: "Kept Analytics Team",
        category: mapCategorySlug(p.category.slug),
        description: p.description ? getLocalizedText(p.description, locale) : undefined,
        importance: undefined,
        deadline: undefined,
        tags: [],
        sources: p.sources.map((s) => ({
            title: s.title ? getLocalizedText(s.title, locale) : "",
            url: s.url,
            publication: "",
            date: s.createdAt.toISOString().split("T")[0],
        })),
        viewCount: 0,
        featured: false,
    }));
}

export async function getPromiseById(
    id: string,
    locale: Locale = "lv"
): Promise<PromiseUI | null> {
    const p = await prisma.promise.findUnique({
        where: { id },
        include: {
            politician: { include: { party: true } },
            category: true,
            sources: true,
            evidence: true,
        },
    });

    if (!p) return null;

    return {
        id: p.id,
        title: getLocalizedText(p.title, locale),
        fullText: p.description ? getLocalizedText(p.description, locale) : getLocalizedText(p.title, locale),
        politicianId: p.politician.slug,
        politicianName: p.politician.name,
        politicianRole: p.politician.role ? getLocalizedText(p.politician.role, locale) : "",
        politicianPhotoUrl: p.politician.imageUrl || "",
        politicianIsInOffice: p.politician.isActive,
        partyId: p.politician.party?.slug,
        partyAbbreviation: p.politician.party ? (partyAbbreviations[p.politician.party.slug] || p.politician.party.slug.toUpperCase()) : undefined,
        partyLogoUrl: p.politician.party?.logoUrl || undefined,
        datePromised: p.dateOfPromise.toISOString().split("T")[0],
        electionCycle: "2022 Saeima Elections",
        status: mapStatusToUI(p.status),
        statusJustification: p.explanation
            ? getLocalizedText(p.explanation, locale)
            : "",
        statusUpdatedAt: (p.statusUpdatedAt || p.updatedAt).toISOString().split("T")[0],
        statusUpdatedBy: "Kept Analytics Team",
        category: mapCategorySlug(p.category.slug),
        description: p.description ? getLocalizedText(p.description, locale) : undefined,
        importance: undefined,
        deadline: undefined,
        tags: [],
        sources: p.sources.map((s) => ({
            title: s.title ? getLocalizedText(s.title, locale) : "",
            url: s.url,
            publication: "",
            date: s.createdAt.toISOString().split("T")[0],
        })),
        viewCount: 0,
        featured: false,
    };
}

export async function getPromisesByPolitician(
    politicianSlug: string,
    locale: Locale = "lv"
): Promise<PromiseUI[]> {
    const politician = await prisma.politician.findUnique({
        where: { slug: politicianSlug },
    });

    if (!politician) return [];

    const promises = await prisma.promise.findMany({
        where: { politicianId: politician.id },
        include: {
            politician: { include: { party: true } },
            category: true,
            sources: true,
        },
        orderBy: { updatedAt: "desc" },
    });

    return promises.map((p) => ({
        id: p.id,
        title: getLocalizedText(p.title, locale),
        fullText: p.description ? getLocalizedText(p.description, locale) : getLocalizedText(p.title, locale),
        politicianId: p.politician.slug,
        politicianName: p.politician.name,
        politicianRole: p.politician.role ? getLocalizedText(p.politician.role, locale) : "",
        politicianPhotoUrl: p.politician.imageUrl || "",
        politicianIsInOffice: p.politician.isActive,
        partyId: p.politician.party?.slug,
        partyAbbreviation: p.politician.party ? (partyAbbreviations[p.politician.party.slug] || p.politician.party.slug.toUpperCase()) : undefined,
        partyLogoUrl: p.politician.party?.logoUrl || undefined,
        datePromised: p.dateOfPromise.toISOString().split("T")[0],
        electionCycle: "2022 Saeima Elections",
        status: mapStatusToUI(p.status),
        statusJustification: p.explanation
            ? getLocalizedText(p.explanation, locale)
            : "",
        statusUpdatedAt: (p.statusUpdatedAt || p.updatedAt).toISOString().split("T")[0],
        statusUpdatedBy: "Kept Analytics Team",
        category: mapCategorySlug(p.category.slug),
        description: p.description ? getLocalizedText(p.description, locale) : undefined,
        importance: undefined,
        deadline: undefined,
        tags: [],
        sources: p.sources.map((s) => ({
            title: s.title ? getLocalizedText(s.title, locale) : "",
            url: s.url,
            publication: "",
            date: s.createdAt.toISOString().split("T")[0],
        })),
        viewCount: 0,
        featured: false,
    }));
}

export async function getPromisesByParty(
    partySlug: string,
    locale: Locale = "lv"
): Promise<PromiseUI[]> {
    const party = await prisma.party.findUnique({
        where: { slug: partySlug },
        include: { politicians: true },
    });

    if (!party) return [];

    const politicianIds = party.politicians.map((p) => p.id);

    const promises = await prisma.promise.findMany({
        where: { politicianId: { in: politicianIds } },
        include: {
            politician: { include: { party: true } },
            category: true,
            sources: true,
        },
        orderBy: { updatedAt: "desc" },
    });

    return promises.map((p) => ({
        id: p.id,
        title: getLocalizedText(p.title, locale),
        fullText: p.description ? getLocalizedText(p.description, locale) : getLocalizedText(p.title, locale),
        politicianId: p.politician.slug,
        politicianName: p.politician.name,
        politicianRole: p.politician.role ? getLocalizedText(p.politician.role, locale) : "",
        politicianPhotoUrl: p.politician.imageUrl || "",
        politicianIsInOffice: p.politician.isActive,
        partyId: p.politician.party?.slug,
        partyAbbreviation: p.politician.party ? (partyAbbreviations[p.politician.party.slug] || p.politician.party.slug.toUpperCase()) : undefined,
        partyLogoUrl: p.politician.party?.logoUrl || undefined,
        datePromised: p.dateOfPromise.toISOString().split("T")[0],
        electionCycle: "2022 Saeima Elections",
        status: mapStatusToUI(p.status),
        statusJustification: p.explanation
            ? getLocalizedText(p.explanation, locale)
            : "",
        statusUpdatedAt: (p.statusUpdatedAt || p.updatedAt).toISOString().split("T")[0],
        statusUpdatedBy: "Kept Analytics Team",
        category: mapCategorySlug(p.category.slug),
        description: p.description ? getLocalizedText(p.description, locale) : undefined,
        importance: undefined,
        deadline: undefined,
        tags: [],
        sources: p.sources.map((s) => ({
            title: s.title ? getLocalizedText(s.title, locale) : "",
            url: s.url,
            publication: "",
            date: s.createdAt.toISOString().split("T")[0],
        })),
        viewCount: 0,
        featured: false,
    }));
}

export async function getPromisesByCategory(
    categorySlug: string,
    locale: Locale = "lv"
): Promise<PromiseUI[]> {
    const promises = await prisma.promise.findMany({
        where: { category: { slug: categorySlug } },
        include: {
            politician: { include: { party: true } },
            category: true,
            sources: true,
        },
        orderBy: { updatedAt: "desc" },
    });

    return promises.map((p) => ({
        id: p.id,
        title: getLocalizedText(p.title, locale),
        fullText: p.description ? getLocalizedText(p.description, locale) : getLocalizedText(p.title, locale),
        politicianId: p.politician.slug,
        politicianName: p.politician.name,
        politicianRole: p.politician.role ? getLocalizedText(p.politician.role, locale) : "",
        politicianPhotoUrl: p.politician.imageUrl || "",
        politicianIsInOffice: p.politician.isActive,
        partyId: p.politician.party?.slug,
        partyAbbreviation: p.politician.party ? (partyAbbreviations[p.politician.party.slug] || p.politician.party.slug.toUpperCase()) : undefined,
        datePromised: p.dateOfPromise.toISOString().split("T")[0],
        electionCycle: "2022 Saeima Elections",
        status: mapStatusToUI(p.status),
        statusJustification: p.explanation
            ? getLocalizedText(p.explanation, locale)
            : "",
        statusUpdatedAt: (p.statusUpdatedAt || p.updatedAt).toISOString().split("T")[0],
        statusUpdatedBy: "Kept Analytics Team",
        category: mapCategorySlug(p.category.slug),
        description: p.description ? getLocalizedText(p.description, locale) : undefined,
        importance: undefined,
        deadline: undefined,
        tags: [],
        sources: p.sources.map((s) => ({
            title: s.title ? getLocalizedText(s.title, locale) : "",
            url: s.url,
            publication: "",
            date: s.createdAt.toISOString().split("T")[0],
        })),
        viewCount: 0,
        featured: false,
    }));
}

export async function getFeaturedPromises(
    locale: Locale = "lv",
    limit: number = 4
): Promise<PromiseUI[]> {
    try {
        const promises = await getPromises(locale);
        // Return most recently updated promises as "featured"
        return promises.slice(0, limit);
    } catch (error) {
        console.error("Error fetching featured promises:", error);
        return [];
    }
}



// ========== RANKINGS ==========

export async function getPoliticianRankings(
    locale: Locale = "lv"
): Promise<RankingItem[]> {
    try {
        const politicians = await prisma.politician.findMany({
            include: {
                party: true,
                promises: true,
            },
        });

        const rankings = politicians
            .map((pol) => {
                const totalPromises = pol.promises.length;
                const keptPromises = pol.promises.filter((p) => p.status === "KEPT").length;

                return {
                    id: pol.slug,
                    name: pol.name,
                    avatarUrl: pol.imageUrl || undefined,
                    partyId: pol.party?.slug,
                    role: pol.role ? getLocalizedText(pol.role, locale) : undefined,
                    isInOffice: pol.isActive,
                    totalPromises,
                    keptPromises,
                    keptPercentage:
                        totalPromises > 0 ? Math.round((keptPromises / totalPromises) * 100) : 0,
                };
            })
            .filter((item) => item.totalPromises > 0)
            .sort((a, b) => b.keptPercentage - a.keptPercentage);

        return rankings;
    } catch (error) {
        console.error("Error fetching politician rankings:", error);
        return [];
    }
}

export async function getPartyRankings(locale: Locale = "lv"): Promise<RankingItem[]> {
    try {
        const parties = await prisma.party.findMany({
            include: {
                politicians: {
                    include: {
                        promises: true,
                    },
                },
            },
        });

        const rankings = parties
            .map((party) => {
                const allPromises = party.politicians.flatMap((p) => p.promises);
                const totalPromises = allPromises.length;
                const keptPromises = allPromises.filter((p) => p.status === "KEPT").length;

                return {
                    id: party.slug,
                    name: getLocalizedText(party.name, locale),
                    avatarUrl: party.logoUrl || undefined,
                    abbreviation: partyAbbreviations[party.slug] || party.slug.toUpperCase(),
                    color: party.color,
                    isInCoalition: party.isCoalition, // Use correct field from DB
                    totalPromises,
                    keptPromises,
                    keptPercentage:
                        totalPromises > 0 ? Math.round((keptPromises / totalPromises) * 100) : 0,
                };
            })
            .filter((item) => item.totalPromises > 0)
            .sort((a, b) => b.keptPercentage - a.keptPercentage);

        return rankings;
    } catch (error) {
        console.error("Error fetching party rankings:", error);
        return [];
    }
}

// ========== CATEGORIES ==========

export async function getCategories(locale: Locale = "lv"): Promise<(CategoryUI & {
    stats: {
        total: number;
        kept: number;
        inProgress: number;
        broken: number;
    }
})[]> {
    const categories = await prisma.category.findMany({
        include: {
            promises: {
                select: { status: true },
            },
        },
        orderBy: { slug: "asc" },
    });

    return categories.map((cat) => {
        const total = cat.promises.length;
        const kept = cat.promises.filter((p) => p.status === "KEPT").length;
        const inProgress = cat.promises.filter((p) => p.status === "IN_PROGRESS" || p.status === "PARTIAL").length; // group partial with in-progress? Or separate? UI has "inProgressCount". Status config: kept, partially-kept, in-progress, broken.
        // UI (step 901) has: kept, in-progress, broken. 
        // Logic in step 901: includes 'partially-kept'...? No, looks like it matches 'partially-kept' explicitly? 
        // Line 49: `p.status === 'in-progress'`.
        // Line 47: `p.status === 'kept'`.
        // Line 48: `p.status === 'broken'`.
        // What about partial? It might be ignored in the mini-stats or grouped.
        // Let's group PARTIAL with IN_PROGRESS for simplicity or expose it.
        // Let's match typical patterns. Kept, In Progress (inc partial), Broken.
        // Or kept, partial, in progress, broken.
        // The UI component I'll write can decide. I'll return specific counts.

        const partial = cat.promises.filter((p) => p.status === "PARTIAL").length;
        const broken = cat.promises.filter((p) => p.status === "NOT_KEPT").length;

        return {
            id: cat.slug,
            slug: cat.slug,
            name: getLocalizedText(cat.name, locale),
            description: cat.description ? getLocalizedText(cat.description, locale) : undefined,
            color: cat.color,
            icon: cat.icon || undefined,
            stats: {
                total,
                kept,
                inProgress: inProgress + partial, // Combine for "Processing" or return separate.
                partial,
                broken,
            }
        };
    });
}

export async function getCategoryBySlug(
    slug: string,
    locale: Locale = "lv"
): Promise<CategoryUI | null> {
    const category = await prisma.category.findUnique({
        where: { slug },
    });

    if (!category) return null;

    return {
        id: category.slug, // id as slug
        slug: category.slug,
        name: getLocalizedText(category.name, locale),
        description: category.description ? getLocalizedText(category.description, locale) : undefined,
        color: category.color,
        icon: category.icon || undefined,
    };
}

// ========== STATS ==========

export async function getPromiseStats() {
    const promises = await prisma.promise.findMany();

    const total = promises.length;
    const kept = promises.filter((p) => p.status === "KEPT").length;
    const partiallyKept = promises.filter((p) => p.status === "PARTIAL").length;
    const inProgress = promises.filter((p) => p.status === "IN_PROGRESS").length;
    const broken = promises.filter((p) => p.status === "NOT_KEPT").length;
    const notRated = 0;

    return {
        total,
        kept,
        partiallyKept,
        inProgress,
        broken,
        notRated,
        keptPercentage: total > 0 ? Math.round((kept / total) * 100) : 0,
        brokenPercentage: total > 0 ? Math.round((broken / total) * 100) : 0,
    };
}
