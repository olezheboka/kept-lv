import { ScrollText, Eye, Pencil } from "lucide-react";
import Link from "next/link";

// Reusable card for Top Entities (Politicians, Parties, Categories)
interface TopEntity {
    name: string;
    count: number;
    slug: string;
}

interface TopEntitiesCardProps {
    title: string;
    totalCount: number;
    topEntities: TopEntity[];
    emptyText: string;
    basePath: string;
}

function TopEntitiesCard({ title, totalCount, topEntities, emptyText, basePath }: TopEntitiesCardProps) {
    return (
        <div className="bg-white rounded-lg border border-g-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-g-gray-100">
                <h2 className="text-base font-semibold text-g-gray-900">{title}</h2>
            </div>

            <div className="p-6 flex flex-col flex-1">
                {/* Total Count */}
                <div className="mb-8">
                    <h3 className="text-5xl font-bold text-g-gray-900 tracking-tight">{totalCount}</h3>
                </div>

                {/* Top 3 List */}
                <div className="flex-1 flex flex-col">
                    <p className="text-xs font-medium text-g-gray-400 uppercase tracking-wide mb-2">Most Active</p>
                    <div className="space-y-2">
                        {topEntities.map((item, idx) => (
                            <Link
                                key={idx}
                                href={`${basePath}/${item.slug}`}
                                target="_blank"
                                className="flex justify-between items-center group hover:bg-g-gray-50 -mx-2 px-2 py-1 rounded-md transition-colors"
                                title={`View ${item.name}`}
                            >
                                <span className="text-sm font-medium text-g-gray-900 truncate pr-4 flex-1 group-hover:text-g-blue-600 transition-colors">
                                    {item.name}
                                </span>
                                <span className="text-xs text-g-gray-500 whitespace-nowrap bg-g-gray-100 px-2 py-1 rounded-full group-hover:bg-white border border-transparent group-hover:border-g-gray-200 transition-all">
                                    {item.count} promises
                                </span>
                            </Link>
                        ))}
                        {topEntities.length === 0 && (
                            <p className="text-xs text-g-gray-400 italic">{emptyText}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Stats Interface matching page.tsx return
interface DashboardStatsData {
    totalPromises: number;
    recentPromises: any[];
    totalPoliticians: number;
    totalParties: number;
    totalCategories: number;
    topPoliticians: TopEntity[];
    topParties: TopEntity[];
    topCategories: TopEntity[];
}

interface TotalPromisesCardProps {
    stats: {
        totalPromises: number;
        recentPromises: any[];
    };
}

export function TotalPromisesCard({ stats }: TotalPromisesCardProps) {
    const { totalPromises, recentPromises } = stats;

    // Function to format date for URL
    const formatDateForUrl = (date: Date | string) => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <div className="bg-white rounded-lg border border-g-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-g-gray-100">
                <h2 className="text-base font-semibold text-g-gray-900">Total promises</h2>
            </div>

            <div className="p-6 flex flex-col flex-1">
                {/* Main Stat */}
                <div className="mb-8">
                    <h3 className="text-5xl font-bold text-g-gray-900 tracking-tight">{totalPromises}</h3>
                </div>

                {/* Recently Added Section */}
                <div className="flex-1 flex flex-col">
                    <p className="text-xs font-medium text-g-gray-400 uppercase tracking-wide mb-4">Recently Added</p>
                    <div className="space-y-4">
                        {recentPromises.slice(0, 3).map((promise) => {
                            const dateSlug = formatDateForUrl(promise.dateOfPromise || promise.createdAt);
                            const publicUrl = `/promises/${promise.category?.slug || 'uncategorized'}/${dateSlug}-${promise.slug}`;

                            return (
                                <div key={promise.id} className="flex items-start justify-between group">
                                    <div className="flex-1 pr-4 min-w-0">
                                        <div className="text-sm font-medium text-g-gray-900 truncate" title={promise.title}>
                                            {promise.title}
                                        </div>
                                        <div className="text-xs text-g-gray-400 mt-0.5 truncate">
                                            {promise.politician?.name || 'Unknown Politician'}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={publicUrl}
                                            target="_blank"
                                            title="View Public Page"
                                            className="p-1.5 text-g-gray-400 hover:text-g-blue-600 hover:bg-g-blue-50 rounded transition-colors"
                                        >
                                            <Eye size={16} />
                                        </Link>
                                        <Link
                                            href={`/admin/promises/${promise.id}`}
                                            title="Edit Promise"
                                            className="p-1.5 text-g-gray-400 hover:text-g-blue-600 hover:bg-g-blue-50 rounded transition-colors"
                                        >
                                            <Pencil size={16} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                        {recentPromises.length === 0 && (
                            <p className="text-xs text-g-gray-400 italic">No recently added promises</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TotalPoliticiansCard({ stats }: { stats: DashboardStatsData }) {
    return (
        <TopEntitiesCard
            title="Total politicians"
            totalCount={stats.totalPoliticians}
            topEntities={stats.topPoliticians}
            emptyText="No politicians active"
            basePath="/politicians"
        />
    );
}

export function TotalPartiesCard({ stats }: { stats: DashboardStatsData }) {
    return (
        <TopEntitiesCard
            title="Total parties"
            totalCount={stats.totalParties}
            topEntities={stats.topParties}
            emptyText="No parties active"
            basePath="/parties"
        />
    );
}

export function TotalCategoriesCard({ stats }: { stats: DashboardStatsData }) {
    return (
        <TopEntitiesCard
            title="Total categories"
            totalCount={stats.totalCategories}
            topEntities={stats.topCategories}
            emptyText="No categories active"
            basePath="/categories"
        />
    );
}

// Legacy component
export function DashboardStats({ stats }: { stats: any }) {
    return null;
}
