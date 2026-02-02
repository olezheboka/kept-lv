import { prisma, withRetry } from "./prisma";
import { Prisma, Party, Source, Evidence } from "@prisma/client";
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

export interface PartyWithStats extends PartyUI {
    stats: {
        total: number;
        kept: number;
        partiallyKept: number;
        pending: number;
        broken: number;
        cancelled: number;
    }
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
    jobs?: {
        title: string;
        company?: string;
        years: string;
    }[];
    educationEntries?: {
        degree: string;
        institution: string;
        year: string;
    }[];
}

export interface PoliticianWithStats extends PoliticianUI {
    stats: {
        total: number;
        kept: number;
        partiallyKept: number;
        pending: number;
        broken: number;
        cancelled: number;
    }
}

export interface PromiseTimelineEntry {
    id: string;
    oldStatus: string | null;
    newStatus: string;
    changedAt: string;
    changedBy: string | null;
    note: string | null;
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
    status: "kept" | "partially-kept" | "pending" | "broken" | "cancelled";
    statusJustification: string;
    statusUpdatedAt: string;
    statusUpdatedBy: string;
    category: string;
    description?: string;
    importance?: string;
    deadline?: string;
    tags: string[];
    sources: { title: string; url: string; publication: string; date: string; type: string }[];
    evidence: { title: string; url: string; publication: string; date: string; type: string }[];
    viewCount: number;
    featured: boolean;
    statusHistory: PromiseTimelineEntry[];
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

const getPartiesFromDb = async (locale: Locale): Promise<PartyWithStats[]> => {
    // 1. Fetch parties
    const parties = await withRetry(() => prisma.party.findMany({
        orderBy: { createdAt: "asc" },
        include: {
            politicians: {
                select: { id: true }
            },
            coalitionPromises: {
                select: { status: true }
            }
        }
    }));

    // 2. Fetch aggregation for all politicians
    // Since we only track stats for promises linked to politicians of the party
    // We group by politicianId
    const [promiseStats, partyPromiseStats] = await Promise.all([
        withRetry(() => prisma.promise.groupBy({
            by: ["politicianId", "status"],
            _count: { status: true },
            where: { politicianId: { not: null } }
        })),
        withRetry(() => prisma.promise.groupBy({
            by: ["partyId", "status"],
            _count: { status: true },
            where: { partyId: { not: null } }
        }))
    ]);

    // 3. Map aggregates to a dictionary for O(1) lookup
    const politicianStats = new Map<string, Record<string, number>>();
    promiseStats.forEach(stat => {
        if (!stat.politicianId) return;
        const current = politicianStats.get(stat.politicianId) || {};
        current[stat.status] = (current[stat.status] || 0) + (stat._count?.status || 0);
        politicianStats.set(stat.politicianId, current);
    });

    const partyStatsMap = new Map<string, Record<string, number>>();
    partyPromiseStats.forEach(stat => {
        if (!stat.partyId) return;
        const current = partyStatsMap.get(stat.partyId) || {};
        current[stat.status] = (current[stat.status] || 0) + (stat._count?.status || 0);
        partyStatsMap.set(stat.partyId, current);
    });

    // 4. Aggregate per party
    return parties.map((party) => {
        let kept = 0, partiallyKept = 0, pending = 0, broken = 0, cancelled = 0;

        // Add politician promises
        party.politicians.forEach(pol => {
            const stats = politicianStats.get(pol.id);
            if (stats) {
                kept += stats["KEPT"] || 0;
                partiallyKept += stats["PARTIAL"] || 0;
                pending += stats["PENDING"] || 0;
                broken += stats["NOT_KEPT"] || 0;
                cancelled += stats["CANCELLED"] || 0;
            }
        });

        // Add direct party promises
        const pStats = partyStatsMap.get(party.id);
        if (pStats) {
            kept += pStats["KEPT"] || 0;
            partiallyKept += pStats["PARTIAL"] || 0;
            pending += pStats["PENDING"] || 0;
            broken += pStats["NOT_KEPT"] || 0;
            cancelled += pStats["CANCELLED"] || 0;
        }

        // Add coalition promises
        party.coalitionPromises.forEach(p => {
            // Map DB status to our counters
            // Note: using direct mapping or switch - status comes as Enum
            if (p.status === "KEPT") kept++;
            else if (p.status === "PARTIAL") partiallyKept++;
            else if (p.status === "PENDING") pending++;
            else if (p.status === "NOT_KEPT") broken++;
            else if (p.status === "CANCELLED") cancelled++;
        });

        const total = kept + partiallyKept + pending + broken + cancelled;

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
            stats: {
                total,
                kept,
                partiallyKept,
                pending,
                broken,
                cancelled
            }
        };
    });
};

export async function getParties(locale: Locale = "lv"): Promise<PartyWithStats[]> {
    const getCachedParties = unstable_cache(
        () => getPartiesFromDb(locale),
        [`parties-stats-${locale}`],
        { revalidate: 60, tags: ['parties'] }
    );
    return getCachedParties();
}

export async function getPartyBySlug(
    slug: string,
    locale: Locale = "lv"
): Promise<PartyUI | null> {
    const party = await withRetry(() => prisma.party.findFirst({
        where: { slug },
    }));

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
}

// ========== POLITICIANS ==========

const getPoliticiansFromDb = async (locale: Locale): Promise<PoliticianWithStats[]> => {
    const [politicians, promiseStats] = await Promise.all([
        withRetry(() => prisma.politician.findMany({
            include: {
                party: true,
                jobs: { orderBy: { createdAt: 'desc' } },
                educationEntries: { orderBy: { createdAt: 'desc' } },
            },
            orderBy: { createdAt: "asc" },
        })),
        withRetry(() => prisma.promise.groupBy({
            by: ["politicianId", "status"],
            _count: { status: true },
            where: { politicianId: { not: null } }
        }))
    ]);

    // Map stats
    const statsMap = new Map<string, Record<string, number>>();
    promiseStats.forEach(stat => {
        if (!stat.politicianId) return;
        const current = statsMap.get(stat.politicianId) || {};
        current[stat.status] = (current[stat.status] || 0) + (stat._count?.status || 0);
        statsMap.set(stat.politicianId, current);
    });

    return politicians.map((pol) => {
        const stats = statsMap.get(pol.id) || {};
        const kept = stats["KEPT"] || 0;
        const partiallyKept = stats["PARTIAL"] || 0;
        const pending = stats["PENDING"] || 0;
        const broken = stats["NOT_KEPT"] || 0;
        const cancelled = stats["CANCELLED"] || 0;
        const total = kept + partiallyKept + pending + broken + cancelled;

        return {
            id: pol.slug,
            slug: pol.slug,
            name: pol.name,
            role: pol.role ? getLocalizedText(pol.role, locale) : "",
            partyId: pol.party?.slug,
            photoUrl: pol.imageUrl || "",
            isInOffice: pol.isActive,
            roleStartDate: undefined,
            roleEndDate: undefined,
            jobs: pol.jobs.map(j => ({
                title: j.title,
                company: j.company || undefined,
                years: j.years
            })),
            educationEntries: pol.educationEntries.map(e => ({
                degree: e.degree,
                institution: e.institution,
                year: e.year
            })),
            stats: {
                total,
                kept,
                partiallyKept,
                pending,
                broken,
                cancelled
            }
        };
    });
};

export async function getPoliticians(locale: Locale = "lv"): Promise<PoliticianWithStats[]> {
    const getCachedPoliticians = unstable_cache(
        () => getPoliticiansFromDb(locale),
        [`politicians-stats-${locale}`],
        { revalidate: 60, tags: ['politicians'] }
    );
    return getCachedPoliticians();
}

export async function getPoliticianBySlug(
    slug: string,
    locale: Locale = "lv"
): Promise<PoliticianUI | null> {
    const pol = await withRetry(() => prisma.politician.findFirst({
        where: { slug },
        include: {
            party: true,
            jobs: { orderBy: { createdAt: 'desc' } },
            educationEntries: { orderBy: { createdAt: 'desc' } },
        },
    }));

    if (!pol) return null;

    return {
        id: pol.slug,
        slug: pol.slug,
        name: pol.name,
        role: pol.role ? getLocalizedText(pol.role, locale) : "",
        partyId: pol.party?.slug,
        photoUrl: pol.imageUrl || "",
        isInOffice: pol.isActive,
        roleStartDate: undefined,
        roleEndDate: undefined,
        jobs: pol.jobs.map(j => ({
            title: j.title,
            company: j.company || undefined,
            years: j.years
        })),
        educationEntries: pol.educationEntries.map(e => ({
            degree: e.degree,
            institution: e.institution,
            year: e.year
        })),
    };
}

export async function getPoliticiansByPartySlug(
    partySlug: string,
    locale: Locale = "lv"
): Promise<PoliticianWithStats[]> {
    const party = await withRetry(() => prisma.party.findFirst({
        where: { slug: partySlug },
    }));

    if (!party) return [];

    const [politicians, promiseStats] = await Promise.all([
        withRetry(() => prisma.politician.findMany({
            where: { partyId: party.id },
            include: {
                party: true,
                jobs: { orderBy: { createdAt: 'desc' } },
                educationEntries: { orderBy: { createdAt: 'desc' } },
            },
            orderBy: { name: "asc" },
        })),
        withRetry(() => prisma.promise.groupBy({
            by: ["politicianId", "status"],
            _count: { status: true },
            where: { politicianId: { not: null } }
        }))
    ]);

    // Map stats
    const statsMap = new Map<string, Record<string, number>>();
    promiseStats.forEach(stat => {
        if (!stat.politicianId) return;
        const current = statsMap.get(stat.politicianId) || {};
        current[stat.status] = (current[stat.status] || 0) + (stat._count?.status || 0);
        statsMap.set(stat.politicianId, current);
    });

    return politicians.map((pol) => {
        const stats = statsMap.get(pol.id) || {};
        const kept = stats["KEPT"] || 0;
        const partiallyKept = stats["PARTIAL"] || 0;
        const pending = stats["PENDING"] || 0;
        const broken = stats["NOT_KEPT"] || 0;
        const cancelled = stats["CANCELLED"] || 0;
        const total = kept + partiallyKept + pending + broken + cancelled;

        return {
            id: pol.slug,
            slug: pol.slug,
            name: pol.name,
            role: pol.role ? getLocalizedText(pol.role, locale) : "",
            partyId: pol.party?.slug,
            photoUrl: pol.imageUrl || "",
            isInOffice: pol.isActive,
            roleStartDate: undefined,
            roleEndDate: undefined,
            jobs: pol.jobs.map(j => ({
                title: j.title,
                company: j.company || undefined,
                years: j.years
            })),
            educationEntries: pol.educationEntries.map(e => ({
                degree: e.degree,
                institution: e.institution,
                year: e.year
            })),
            stats: {
                total,
                kept,
                partiallyKept,
                pending,
                broken,
                cancelled
            }
        };
    });
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
        statusUpdatedBy: "solījums.lv Team",
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
            type: s.type,
        })),
        evidence: p.evidence ? p.evidence.map((e: Evidence) => ({
            title: "",
            url: e.url,
            publication: "",
            date: e.createdAt.toISOString().split("T")[0],
            type: e.type,
        })) : [],
        viewCount: 0,
        featured: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        statusHistory: p.statusHistory ? p.statusHistory.map((h: any) => ({
            id: h.id,
            oldStatus: h.oldStatus ? mapStatusToUI(h.oldStatus) : null,
            newStatus: mapStatusToUI(h.newStatus),
            changedAt: h.changedAt.toISOString(),
            changedBy: h.changedBy,
            note: h.note
        })) : [],
    };
}

const getPromisesFromDb = async (locale: Locale): Promise<PromiseUI[]> => {
    const promises = await withRetry(() => prisma.promise.findMany({
        include: {
            politician: { include: { party: true } },
            party: true,
            coalitionParties: true,
            category: true,
            sources: true,
        },
        orderBy: { updatedAt: "desc" },
    }));

    return promises.map((p) => mapPromiseToUI(p, locale));
};

export async function getPromises(locale: Locale = "lv"): Promise<PromiseUI[]> {
    const getCachedPromises = unstable_cache(
        () => getPromisesFromDb(locale),
        [`promises-${locale}`],
        { revalidate: 60, tags: ['promises'] }
    );
    return getCachedPromises();
}

export async function getPromiseById(
    id: string,
    locale: Locale = "lv"
): Promise<PromiseUI | null> {
    const p = await withRetry(() => prisma.promise.findFirst({
        where: { id },
        include: {
            politician: { include: { party: true } },
            party: true,
            coalitionParties: true,
            category: true,
            sources: true,
            evidence: true,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            statusHistory: { orderBy: [{ changedAt: 'desc' }, { id: 'desc' }] },
        },
    }));

    if (!p) return null;

    return mapPromiseToUI(p, locale);
}

export async function getPromiseBySlug(
    categorySlug: string,
    promiseSlug: string,
    locale: Locale = "lv"
): Promise<PromiseUI | null> {
    const p = await withRetry(() => prisma.promise.findFirst({
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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            statusHistory: { orderBy: [{ changedAt: 'desc' }, { id: 'desc' }] },
        },
    }));

    if (!p) return null;

    return mapPromiseToUI(p, locale);
}

export async function getPromisesByPolitician(
    politicianSlug: string,
    locale: Locale = "lv",
    limit?: number
): Promise<PromiseUI[]> {
    const politician = await withRetry(() => prisma.politician.findFirst({
        where: { slug: politicianSlug },
    }));

    if (!politician) return [];

    const promises = await withRetry(() => prisma.promise.findMany({
        where: { politicianId: politician.id },
        include: {
            politician: { include: { party: true } },
            party: true,
            coalitionParties: true,
            category: true,
            sources: true,
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
    }));

    return promises.map((p) => mapPromiseToUI(p, locale));
}

export async function getPromisesByParty(
    partySlug: string,
    locale: Locale = "lv",
    limit?: number
): Promise<PromiseUI[]> {
    const party = await withRetry(() => prisma.party.findFirst({
        where: { slug: partySlug },
        include: { politicians: true },
    }));

    if (!party) return [];

    const politicianIds = party.politicians.map((p) => p.id);

    const promises = await withRetry(() => prisma.promise.findMany({
        where: {
            OR: [
                { politicianId: { in: politicianIds } },
                { partyId: party.id },
                { coalitionParties: { some: { id: party.id } } }
            ]
        },
        include: {
            politician: { include: { party: true } },
            party: true,
            coalitionParties: true,
            category: true,
            sources: true,
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
    }));

    return promises.map((p) => mapPromiseToUI(p, locale));
}

export async function getPromisesByCategory(
    categorySlug: string,
    locale: Locale = "lv",
    limit?: number
): Promise<PromiseUI[]> {
    const promises = await withRetry(() => prisma.promise.findMany({
        where: { category: { slug: categorySlug } },
        include: {
            politician: { include: { party: true } },
            party: true,
            coalitionParties: true,
            category: true,
            sources: true,
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
    }));

    return promises.map((p) => mapPromiseToUI(p, locale));
}

/**
 * Get related promises with priority-based matching:
 * 1st: same politician/party/coalition + same category + shared tags
 * 2nd: same politician/party/coalition + same category
 * 3rd: same category OR shared tag
 * 4th: same politician/party/coalition only
 */
export async function getRelatedPromises(
    currentPromise: PromiseUI,
    locale: Locale = "lv",
    limit: number = 3
): Promise<PromiseUI[]> {
    // Fetch all promises (we'll filter and score in memory for flexibility)
    const allPromises = await getPromises(locale);

    // Filter out the current promise
    const candidates = allPromises.filter(p => p.id !== currentPromise.id);

    if (candidates.length === 0) return [];

    // Helper to check if promises share the same "owner" (politician, party, or coalition)
    const hasSameOwner = (p: PromiseUI): boolean => {
        // Same politician
        if (currentPromise.politicianId && p.politicianId === currentPromise.politicianId) {
            return true;
        }
        // Same party (for PARTY type promises)
        if (currentPromise.partyId && p.partyId === currentPromise.partyId) {
            return true;
        }
        // Same coalition (check if coalition parties overlap)
        if (currentPromise.coalitionParties && currentPromise.coalitionParties.length > 0 &&
            p.coalitionParties && p.coalitionParties.length > 0) {
            const currentCoalitionIds = new Set(currentPromise.coalitionParties.map(cp => cp.id));
            const hasOverlap = p.coalitionParties.some(cp => currentCoalitionIds.has(cp.id));
            if (hasOverlap) return true;
        }
        return false;
    };

    // Helper to check if promises share category
    const hasSameCategory = (p: PromiseUI): boolean => {
        return p.categorySlug === currentPromise.categorySlug;
    };

    // Helper to check if promises share tags
    const hasSharedTags = (p: PromiseUI): boolean => {
        if (!currentPromise.tags || currentPromise.tags.length === 0) return false;
        if (!p.tags || p.tags.length === 0) return false;
        const currentTags = new Set(currentPromise.tags.map(t => t.toLowerCase()));
        return p.tags.some(t => currentTags.has(t.toLowerCase()));
    };

    // Score each candidate based on priority
    const scored = candidates.map(p => {
        let score = 0;
        const sameOwner = hasSameOwner(p);
        const sameCategory = hasSameCategory(p);
        const sharedTags = hasSharedTags(p);

        // Priority 1: same owner + same category + shared tags (highest score)
        if (sameOwner && sameCategory && sharedTags) {
            score = 4;
        }
        // Priority 2: same owner + same category
        else if (sameOwner && sameCategory) {
            score = 3;
        }
        // Priority 3: same category OR shared tag
        else if (sameCategory || sharedTags) {
            score = 2;
        }
        // Priority 4: same owner only
        else if (sameOwner) {
            score = 1;
        }

        return { promise: p, score };
    });

    // Filter out promises with score 0 (no relation at all)
    const related = scored
        .filter(s => s.score > 0)
        .sort((a, b) => {
            // Sort by score descending, then by date descending
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.promise.statusUpdatedAt).getTime() - new Date(a.promise.statusUpdatedAt).getTime();
        })
        .slice(0, limit)
        .map(s => s.promise);

    return related;
}

export async function getFeaturedPromises(
    locale: Locale = "lv",
    limit: number = 4
): Promise<PromiseUI[]> {
    const getCachedFeaturedPromises = unstable_cache(
        async () => {
            const promises = await withRetry(() => prisma.promise.findMany({
                take: limit,
                orderBy: { updatedAt: "desc" },
                include: {
                    politician: { include: { party: true } },
                    party: true,
                    coalitionParties: true,
                    category: true,
                    sources: true,
                },
            }));
            return promises.map((p) => mapPromiseToUI(p, locale));
        },
        [`featured-promises-${locale}-${limit}`],
        { revalidate: 60, tags: ['promises', 'featured'] }
    );

    return getCachedFeaturedPromises();
}



// ========== RANKINGS ==========

export async function getPoliticianRankings(
    locale: Locale = "lv"
): Promise<RankingItem[]> {
    const getCachedPoliticianRankings = unstable_cache(
        async () => {
            // Parallel fetch: Politicians and Promise stats
            const [politicians, promiseStats] = await Promise.all([
                withRetry(() => prisma.politician.findMany({
                    include: {
                        party: true,
                    },
                })),
                withRetry(() => prisma.promise.groupBy({
                    by: ["politicianId", "status"],
                    _count: {
                        status: true,
                    },
                    where: {
                        politicianId: { not: null },
                    },
                })),
            ]);

            // Create a map for fast lookup: politicianId -> { total, kept }
            const statsMap = new Map<string, { total: number; kept: number }>();

            promiseStats.forEach((stat) => {
                if (!stat.politicianId) return;
                const current = statsMap.get(stat.politicianId) || { total: 0, kept: 0 };

                current.total += stat._count.status;
                if (stat.status === "KEPT") {
                    current.kept += stat._count.status;
                }

                statsMap.set(stat.politicianId, current);
            });

            const rankings = politicians
                .map((pol) => {
                    const stats = statsMap.get(pol.id) || { total: 0, kept: 0 };

                    return {
                        id: pol.slug,
                        name: pol.name,
                        avatarUrl: pol.imageUrl || undefined,
                        partyId: pol.party?.slug,
                        partyLogoUrl: pol.party?.logoUrl || undefined,
                        role: pol.role ? getLocalizedText(pol.role, locale) : undefined,
                        isInOffice: pol.isActive,
                        totalPromises: stats.total,
                        keptPromises: stats.kept,
                        keptPercentage:
                            stats.total > 0 ? Math.round((stats.kept / stats.total) * 100) : 0,
                        abbreviation: pol.party ? (partyAbbreviations[pol.party.slug] || pol.party.slug.toUpperCase()) : undefined,
                    };
                })
                .filter((item) => item.totalPromises > 0)
                .sort((a, b) => b.keptPercentage - a.keptPercentage);

            return rankings;
        },
        [`politician-rankings-${locale}`],
        { revalidate: 3600, tags: ['rankings', 'politicians'] }
    );

    return getCachedPoliticianRankings();
}

export async function getPartyRankings(locale: Locale = "lv"): Promise<RankingItem[]> {
    const getCachedPartyRankings = unstable_cache(
        async () => {
            const parties = await withRetry(() => prisma.party.findMany({
                include: {
                    politicians: {
                        include: {
                            promises: {
                                select: { status: true }
                            },
                        },
                    },
                    // Include party-level promises (type: PARTY)
                    partyPromises: {
                        select: { status: true }
                    },
                    // Include coalition promises where this party participates
                    coalitionPromises: {
                        select: { status: true }
                    },
                },
            }));

            const rankings = parties
                .map((party) => {
                    // Aggregate all promise types:
                    // 1. Individual promises from politicians
                    const politicianPromises = party.politicians.flatMap((p) => p.promises);
                    // 2. Direct party promises (type: PARTY)
                    const partyPromises = party.partyPromises || [];
                    // 3. Coalition promises where this party participates
                    const coalitionPromises = party.coalitionPromises || [];

                    const allPromises = [...politicianPromises, ...partyPromises, ...coalitionPromises];
                    const totalPromises = allPromises.length;
                    const keptPromises = allPromises.filter((p) => p.status === "KEPT").length;

                    return {
                        id: party.slug,
                        name: getLocalizedText(party.name, locale),
                        avatarUrl: party.logoUrl || undefined,
                        abbreviation: partyAbbreviations[party.slug] || party.slug.toUpperCase(),
                        isInCoalition: party.isCoalition,
                        totalPromises,
                        keptPromises,
                        keptPercentage:
                            totalPromises > 0 ? Math.round((keptPromises / totalPromises) * 100) : 0,
                    };
                })
                .filter((item) => item.totalPromises > 0)
                .sort((a, b) => b.keptPercentage - a.keptPercentage);

            return rankings;
        },
        [`party-rankings-${locale}`],
        { revalidate: 3600, tags: ['rankings', 'parties'] }
    );

    return getCachedPartyRankings();
}

// ========== CATEGORIES ==========

export type CategoryWithStats = CategoryUI & {
    stats: {
        total: number;
        kept: number;
        partiallyKept: number;
        pending: number;
        broken: number;
        cancelled: number;
    }
};

const getCategoriesFromDb = async (locale: Locale): Promise<CategoryWithStats[]> => {
    // 1. Fetch categories
    const categories = await withRetry(() => prisma.category.findMany({
        orderBy: { slug: "asc" },
        include: {
            _count: {
                select: { promises: true }
            }
        }
    }));

    // 2. Fetch aggregation for statuses
    // Group by categoryId and status
    const promiseStats = await withRetry(() => prisma.promise.groupBy({
        by: ["categoryId", "status"],
        _count: { status: true }
    }));

    // 3. Map to dictionary
    const categoryStats = new Map<string, Record<string, number>>();
    promiseStats.forEach(stat => {
        if (!stat.categoryId) return;
        const current = categoryStats.get(stat.categoryId) || {};
        current[stat.status] = (current[stat.status] || 0) + (stat._count?.status || 0);
        categoryStats.set(stat.categoryId, current);
    });

    return categories.map((cat) => {
        const stats = categoryStats.get(cat.id) || {};
        const kept = stats["KEPT"] || 0;
        const partiallyKept = stats["PARTIAL"] || 0;
        const pending = stats["PENDING"] || 0;
        const broken = stats["NOT_KEPT"] || 0;
        const cancelled = stats["CANCELLED"] || 0;
        const total = kept + partiallyKept + pending + broken + cancelled;

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
                pending,
                broken,
                cancelled,
            }
        };
    });
};

export async function getCategories(locale: Locale = "lv"): Promise<CategoryWithStats[]> {
    const getCachedCategories = unstable_cache(
        () => getCategoriesFromDb(locale),
        [`categories-${locale}`],
        { revalidate: 60, tags: ['categories'] }
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
    const category = await withRetry(() => prisma.category.findFirst({
        where: { slug },
    }));

    if (!category) return null;

    return {
        id: category.slug,
        slug: category.slug,
        name: getLocalizedText(category.name, locale),
        description: category.description ? getLocalizedText(category.description, locale) : undefined,
        imageUrl: category.imageUrl || undefined,
    };
}

// ========== STATS ==========

export async function getPromiseStats() {
    const promises = await withRetry(() => prisma.promise.findMany({
        select: { status: true }
    }));

    const total = promises.length;
    const kept = promises.filter((p) => p.status === "KEPT").length;
    const partiallyKept = promises.filter((p) => p.status === "PARTIAL").length;
    const pending = promises.filter((p) => p.status === "PENDING").length;
    const broken = promises.filter((p) => p.status === "NOT_KEPT").length;
    const cancelled = promises.filter((p) => p.status === "CANCELLED").length;

    return {
        total,
        kept,
        partiallyKept,
        pending,
        broken,
        cancelled,
        keptPercentage: total > 0 ? Math.round((kept / total) * 100) : 0,
        brokenPercentage: total > 0 ? Math.round((broken / total) * 100) : 0,
    };
}
