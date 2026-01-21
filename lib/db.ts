import { prisma } from "./prisma";
import { Prisma, Party, Source } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { mapStatusToUI } from "./utils";

// Types for transformed data (matching UI expectations)
export interface PartyUI {
    id: string;
    slug: string;
    name: string;
    description?: string;
    abbreviation: string;
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
    education?: string;
}

export interface PromiseUI {
    id: string;
    slug: string;
    categorySlug: string;
    title: string;
    fullText: string;
    type: "INDIVIDUAL" | "PARTY" | "COALITION";
    politicianId?: string;
    politicianName?: string;
    politicianRole?: string;
    politicianPhotoUrl?: string;
    politicianIsInOffice?: boolean;
    partyId?: string;
    partyAbbreviation?: string;
    partyLogoUrl?: string;
    partyName?: string;
    partyColor?: string;
    coalitionParties?: {
        id: string;
        slug: string;
        name: string;
        abbreviation: string;
        logoUrl?: string;
        color: string;
    }[];
    datePromised: string;
    electionCycle?: string;
    status: "kept" | "partially-kept" | "in-progress" | "broken" | "cancelled";
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
    imageUrl?: string;
}

export interface RankingItem {
    id: string;
    name: string;
    avatarUrl?: string;
    role?: string;
    partyId?: string;
    partyLogoUrl?: string;
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

// Party abbreviation map (official 14th Saeima election abbreviations)
// Slugs must match those in seed.ts
const partyAbbreviations: Record<string, string> = {
    // Parties in Parliament (per seed.ts slugs)
    jv: "JV",        // Jaunā Vienotība (New Unity)
    zzs: "ZZS",      // Zaļo un Zemnieku savienība (Union of Greens and Farmers)
    as: "AS",        // Apvienotais Saraksts (United List)
    na: "NA",        // Nacionālā apvienība (National Alliance)
    stab: "S!",      // Stabilitātei! (For Stability!)
    prog: "PRO",     // Progresīvie (The Progressives)
    lpv: "LPV",      // Latvija Pirmajā Vietā (Latvia First)
    lra: "LRA",      // Latvijas Reģionu apvienība (Latvian Regions Association)
    // Parties not in Parliament (per seed.ts slugs)
    sask: "S",       // Saskaņa (Harmony)
    ap: "A/P",       // Attīstībai/Par! (Development/For!)
    lks: "LKS",      // Latvijas Krievu savienība (Latvian Russian Union)
    kons: "K",       // Konservatīvie (Conservatives) - slug is "kons" in seed
    sv: "SV",        // Suverēnā vara (Sovereign Power)
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

const getPartiesFromDb = async (locale: Locale): Promise<PartyUI[]> => {
    try {
        const parties = await prisma.party.findMany({
            orderBy: { createdAt: "asc" },
        });

        return parties.map((party) => ({
            id: party.slug,
            slug: party.slug,
            name: getLocalizedText(party.name, locale),
            description: party.description ? getLocalizedText(party.description, locale) : undefined,
            abbreviation: partyAbbreviations[party.slug] || party.slug.toUpperCase(),
            logoUrl: party.logoUrl || undefined,
            websiteUrl: party.websiteUrl || undefined,
            isInCoalition: party.isCoalition,
            mpCount: partyMpCounts[party.slug] ?? 0,
        }));
    } catch (error) {
        console.error("Error fetching parties:", error);
        try {
            await prisma.auditLog.create({
                data: {
                    action: "error_fetch_parties",
                    entityType: "System",
                    adminEmail: "system@internal",
                    details: { message: error instanceof Error ? error.message : String(error) }
                }
            });
        } catch {
            // Ignore logging errors
        }
        return [];
    }
};

export async function getParties(locale: Locale = "lv"): Promise<PartyUI[]> {
    const getCachedParties = unstable_cache(
        () => getPartiesFromDb(locale),
        [`parties-${locale}`],
        { revalidate: 1, tags: ['parties'] }
    );
    return getCachedParties();
}

export async function getPartyBySlug(
    slug: string,
    locale: Locale = "lv"
): Promise<PartyUI | null> {

    try {
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
            logoUrl: party.logoUrl || undefined,
            websiteUrl: party.websiteUrl || undefined,
            isInCoalition: party.isCoalition,
            mpCount: partyMpCounts[party.slug] ?? 0,
        };
    } catch (error) {
        console.error("Error fetching party by slug:", error);
        return null;
    }
}

// ========== POLITICIANS ==========

const getPoliticiansFromDb = async (locale: Locale): Promise<PoliticianUI[]> => {
    try {
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
            education: pol.education || undefined,
        }));
    } catch (error) {
        console.error("Error fetching politicians:", error);
        // Attempt to log to AuditLog for production debugging
        try {
            await prisma.auditLog.create({
                data: {
                    action: "error_fetch_politicians",
                    entityType: "System",
                    adminEmail: "system@internal",
                    details: { message: error instanceof Error ? error.message : String(error) }
                }
            });
        } catch {
            // Ignore logging errors
        }
        return [];
    }
};

export async function getPoliticians(locale: Locale = "lv"): Promise<PoliticianUI[]> {
    const getCachedPoliticians = unstable_cache(
        () => getPoliticiansFromDb(locale),
        [`politicians-${locale}`],
        { revalidate: 1, tags: ['politicians'] }
    );
    return getCachedPoliticians();
}

export async function getPoliticianBySlug(
    slug: string,
    locale: Locale = "lv"
): Promise<PoliticianUI | null> {

    try {
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
            education: pol.education || undefined,
        };
    } catch (error) {
        console.error("Error fetching politician by slug:", error);
        return null;
    }
}

// ========== PROMISES ==========

// Helper to map DB promise to UI promise
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPromiseToUI(p: any, locale: Locale): PromiseUI {
    return {
        id: p.id,
        slug: p.slug || p.id,
        categorySlug: p.category.slug,
        title: getLocalizedText(p.title, locale),
        fullText: p.description ? getLocalizedText(p.description, locale) : getLocalizedText(p.title, locale),
        type: p.type || "INDIVIDUAL",
        politicianId: p.politician?.slug || "",
        politicianName: p.politician?.name || "",
        politicianRole: p.politician?.role ? getLocalizedText(p.politician.role, locale) : "",
        politicianPhotoUrl: p.politician?.imageUrl || "",
        politicianIsInOffice: p.politician?.isActive ?? false,
        // Party logic:
        partyId: p.type === 'PARTY' ? p.party?.slug : p.politician?.party?.slug,
        partyAbbreviation: p.type === 'PARTY'
            ? (p.party ? (partyAbbreviations[p.party.slug] || p.party.slug.toUpperCase()) : undefined)
            : (p.politician?.party ? (partyAbbreviations[p.politician.party.slug] || p.politician.party.slug.toUpperCase()) : undefined),
        partyLogoUrl: p.type === 'PARTY' ? p.party?.logoUrl || undefined : p.politician?.party?.logoUrl || undefined,
        partyName: p.type === 'PARTY' && p.party ? getLocalizedText(p.party.name, locale) : undefined,
        partyColor: "#CCCCCC",
        coalitionParties: p.type === 'COALITION' && p.coalitionParties ? p.coalitionParties.map((cp: Party) => ({
            id: cp.slug,
            slug: cp.slug,
            name: getLocalizedText(cp.name, locale),
            abbreviation: partyAbbreviations[cp.slug] || cp.slug.toUpperCase(),
            logoUrl: cp.logoUrl || undefined,
            color: "#CCCCCC"
        })) : undefined,
        datePromised: p.dateOfPromise.toISOString().split("T")[0],
        electionCycle: "2022 Saeima Elections",
        status: mapStatusToUI(p.status),
        statusJustification: p.explanation ? getLocalizedText(p.explanation, locale) : "",
        statusUpdatedAt: (p.statusUpdatedAt || p.updatedAt).toISOString().split("T")[0],
        statusUpdatedBy: "Solījums.lv Team",
        category: mapCategorySlug(p.category.slug),
        description: p.description ? getLocalizedText(p.description, locale) : undefined,
        importance: undefined,
        deadline: undefined,
        tags: p.tags,
        sources: p.sources.map((s: Source) => ({
            title: s.title ? getLocalizedText(s.title, locale) : "",
            url: s.url,
            publication: "",
            date: s.createdAt.toISOString().split("T")[0],
        })),
        viewCount: 0,
        featured: false,
    };
}

const getPromisesFromDb = async (locale: Locale): Promise<PromiseUI[]> => {
    try {
        const promises = await prisma.promise.findMany({
            include: {
                politician: { include: { party: true } },
                party: true,
                coalitionParties: true,
                category: true,
                sources: true,
            },
            orderBy: { updatedAt: "desc" },
        });

        return promises.map((p) => mapPromiseToUI(p, locale));
    } catch (error) {
        console.error("Error fetching promises:", error);
        try {
            await prisma.auditLog.create({
                data: {
                    action: "error_fetch_promises",
                    entityType: "System",
                    adminEmail: "system@internal",
                    details: { message: error instanceof Error ? error.message : String(error) }
                }
            });
        } catch {
            // Ignore logging errors
        }
        return [];
    }
};

export async function getPromises(locale: Locale = "lv"): Promise<PromiseUI[]> {
    const getCachedPromises = unstable_cache(
        () => getPromisesFromDb(locale),
        [`promises-${locale}`],
        { revalidate: 1, tags: ['promises'] }
    );
    return getCachedPromises();
}

export async function getPromiseById(
    id: string,
    locale: Locale = "lv"
): Promise<PromiseUI | null> {
    try {
        const p = await prisma.promise.findUnique({
            where: { id },
            include: {
                politician: { include: { party: true } },
                party: true,
                coalitionParties: true,
                category: true,
                sources: true,
                evidence: true,
            },
        });

        if (!p) return null;

        return mapPromiseToUI(p, locale);
    } catch (error) {
        console.error("Error fetching promise by id:", error);
        return null;
    }
}

export async function getPromiseBySlug(
    categorySlug: string,
    promiseSlug: string,
    locale: Locale = "lv"
): Promise<PromiseUI | null> {
    try {
        const p = await prisma.promise.findFirst({
            where: {
                slug: promiseSlug,
                category: { slug: categorySlug },
            },
            include: {
                politician: { include: { party: true } },
                party: true,
                coalitionParties: true,
                category: true,
                sources: true,
                evidence: true,
            },
        });

        if (!p) return null;

        return mapPromiseToUI(p, locale);
    } catch (error) {
        console.error("Error fetching promise by slug:", error);
        return null;
    }
}

export async function getPromisesByPolitician(
    politicianSlug: string,
    locale: Locale = "lv"
): Promise<PromiseUI[]> {
    try {
        const politician = await prisma.politician.findUnique({
            where: { slug: politicianSlug },
        });

        if (!politician) return [];

        const promises = await prisma.promise.findMany({
            where: { politicianId: politician.id },
            include: {
                politician: { include: { party: true } },
                party: true,
                coalitionParties: true,
                category: true,
                sources: true,
            },
            orderBy: { updatedAt: "desc" },
        });

        return promises.map((p) => mapPromiseToUI(p, locale));
    } catch (error) {
        console.error("Error fetching promises by politician:", error);
        return [];
    }
}

export async function getPromisesByParty(
    partySlug: string,
    locale: Locale = "lv"
): Promise<PromiseUI[]> {
    try {
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
                party: true,
                coalitionParties: true,
                category: true,
                sources: true,
            },
            orderBy: { updatedAt: "desc" },
        });

        return promises.map((p) => mapPromiseToUI(p, locale));
    } catch (error) {
        console.error("Error fetching promises by party:", error);
        return [];
    }
}

export async function getPromisesByCategory(
    categorySlug: string,
    locale: Locale = "lv"
): Promise<PromiseUI[]> {
    try {
        const promises = await prisma.promise.findMany({
            where: { category: { slug: categorySlug } },
            include: {
                politician: { include: { party: true } },
                party: true,
                coalitionParties: true,
                category: true,
                sources: true,
            },
            orderBy: { updatedAt: "desc" },
        });

        return promises.map((p) => mapPromiseToUI(p, locale));
    } catch (error) {
        console.error("Error fetching promises by category:", error);
        return [];
    }
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
                    partyLogoUrl: pol.party?.logoUrl || undefined,
                    role: pol.role ? getLocalizedText(pol.role, locale) : undefined,
                    isInOffice: pol.isActive,
                    totalPromises,
                    keptPromises,
                    keptPercentage:
                        totalPromises > 0 ? Math.round((keptPromises / totalPromises) * 100) : 0,
                    abbreviation: pol.party ? (partyAbbreviations[pol.party.slug] || pol.party.slug.toUpperCase()) : undefined,
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

type CategoryWithStats = CategoryUI & {
    stats: {
        total: number;
        kept: number;
        partiallyKept: number;
        inProgress: number;
        broken: number;
        cancelled: number;
    }
};

const getCategoriesFromDb = async (locale: Locale): Promise<CategoryWithStats[]> => {
    try {
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
            const partiallyKept = cat.promises.filter((p) => p.status === "PARTIAL").length;
            const inProgress = cat.promises.filter((p) => p.status === "IN_PROGRESS").length;
            const broken = cat.promises.filter((p) => p.status === "NOT_KEPT").length;
            const cancelled = cat.promises.filter((p) => (p.status as string) === "ABANDONED" || (p.status as string) === "CANCELLED").length;

            return {
                id: cat.slug,
                slug: cat.slug,
                name: getLocalizedText(cat.name, locale),
                description: cat.description ? getLocalizedText(cat.description, locale) : undefined,
                imageUrl: cat.imageUrl || undefined,
                stats: {
                    total,
                    kept,
                    partiallyKept,
                    inProgress,
                    broken,
                    cancelled,
                }
            };
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        // Attempt to log to AuditLog for production debugging
        try {
            await prisma.auditLog.create({
                data: {
                    action: "error_fetch_categories",
                    entityType: "System",
                    adminEmail: "system@internal",
                    details: { message: error instanceof Error ? error.message : String(error) }
                }
            });
        } catch {
            // Ignore logging errors
        }
        return [];
    }
};

export async function getCategories(locale: Locale = "lv"): Promise<CategoryWithStats[]> {
    const getCachedCategories = unstable_cache(
        () => getCategoriesFromDb(locale),
        [`categories-${locale}`],
        { revalidate: 1, tags: ['categories'] }
    );
    return getCachedCategories();
}

export async function getRandomPromises(count: number, excludeId?: string, locale: Locale = 'lv'): Promise<PromiseUI[]> {
    const promises = await prisma.promise.findMany({
        where: excludeId ? { id: { not: excludeId } } : undefined,
        take: count * 2,
        include: {
            politician: { include: { party: true } },
            party: true,
            coalitionParties: true,
            category: true,
            sources: true
        }
    });

    // Simple shuffle
    const shuffled = promises.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return selected.map((p) => mapPromiseToUI(p, locale));
}

export async function getCategoryBySlug(
    slug: string,
    locale: Locale = "lv"
): Promise<CategoryUI | null> {
    try {
        const category = await prisma.category.findUnique({
            where: { slug },
        });

        if (!category) return null;

        return {
            id: category.slug, // id as slug
            slug: category.slug,
            name: getLocalizedText(category.name, locale),
            description: category.description ? getLocalizedText(category.description, locale) : undefined,
            imageUrl: category.imageUrl || undefined,
        };
    } catch (error) {
        console.error("Error fetching category by slug:", error);
        return null;
    }
}

// ========== STATS ==========

export async function getPromiseStats() {
    try {
        const promises = await prisma.promise.findMany();

        const total = promises.length;
        const kept = promises.filter((p) => p.status === "KEPT").length;
        const partiallyKept = promises.filter((p) => p.status === "PARTIAL").length;
        const inProgress = promises.filter((p) => p.status === "IN_PROGRESS").length;
        const broken = promises.filter((p) => p.status === "NOT_KEPT").length;
        const cancelled = 0;

        return {
            total,
            kept,
            partiallyKept,
            inProgress,
            broken,
            cancelled,
            keptPercentage: total > 0 ? Math.round((kept / total) * 100) : 0,
            brokenPercentage: total > 0 ? Math.round((broken / total) * 100) : 0,
        };
    } catch (error) {
        console.error("Error fetching promise stats:", error);
        return {
            total: 0,
            kept: 0,
            partiallyKept: 0,
            inProgress: 0,
            broken: 0,
            cancelled: 0,
            keptPercentage: 0,
            brokenPercentage: 0,
        };
    }
}
