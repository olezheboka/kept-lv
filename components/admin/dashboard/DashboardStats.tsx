import { ScrollText, Users, Landmark, Folder } from "lucide-react";

interface DashboardStatsProps {
    stats: {
        totalPromises: number;
        totalPoliticians: number;
        totalParties: number;
        totalCategories: number;
    };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat Card 1 */}
            <div className="bg-white p-5 rounded-lg border border-g-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-medium text-g-gray-500 uppercase tracking-wide">Total Promises</p>
                        <h3 className="mt-1 text-2xl font-bold text-g-gray-900 tracking-tight">{stats.totalPromises}</h3>
                    </div>
                    <div className="p-2 bg-g-blue-50 text-g-blue-600 rounded-md">
                        <ScrollText width={20} />
                    </div>
                </div>
                <p className="mt-2 text-xs text-g-gray-500">Active tracking</p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white p-5 rounded-lg border border-g-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-medium text-g-gray-500 uppercase tracking-wide">Total Politicians</p>
                        <h3 className="mt-1 text-2xl font-bold text-g-gray-900 tracking-tight">{stats.totalPoliticians}</h3>
                    </div>
                    <div className="p-2 bg-g-blue-50 text-g-blue-600 rounded-md">
                        <Users width={20} />
                    </div>
                </div>
                <p className="mt-2 text-xs text-g-gray-500">In database</p>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white p-5 rounded-lg border border-g-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-medium text-g-gray-500 uppercase tracking-wide">Total Parties</p>
                        <h3 className="mt-1 text-2xl font-bold text-g-gray-900 tracking-tight">{stats.totalParties}</h3>
                    </div>
                    <div className="p-2 bg-g-blue-50 text-g-blue-600 rounded-md">
                        <Landmark width={20} />
                    </div>
                </div>
                <p className="mt-2 text-xs text-g-gray-500">Registered</p>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-white p-5 rounded-lg border border-g-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-medium text-g-gray-500 uppercase tracking-wide">Total Categories</p>
                        <h3 className="mt-1 text-2xl font-bold text-g-gray-900 tracking-tight">{stats.totalCategories}</h3>
                    </div>
                    <div className="p-2 bg-g-blue-50 text-g-blue-600 rounded-md">
                        <Folder width={20} />
                    </div>
                </div>
                <p className="mt-2 text-xs text-g-gray-500">For organization</p>
            </div>
        </div>
    );
}
