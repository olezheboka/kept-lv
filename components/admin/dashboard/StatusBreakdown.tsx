
interface StatusBreakdownProps {
    stats: {
        totalPromises: number;
        keptPromises: number;
        inProgressPromises: number;
        notKeptPromises: number;
    };
}

export function StatusBreakdown({ stats }: StatusBreakdownProps) {
    const { totalPromises, keptPromises, inProgressPromises, notKeptPromises } = stats;

    const total = totalPromises || 1;
    const keptPct = (keptPromises / total) * 100;
    const inProgressPct = (inProgressPromises / total) * 100;
    const notKeptPct = (notKeptPromises / total) * 100;

    // Calculate remainders for demo purposes to match visual style if data is missing,
    // but strictly we only have real data for Kept, InProgress, NotKept.
    // We'll treat the remainder as 'Not Rated' for now.
    const remainderCount = totalPromises - (keptPromises + inProgressPromises + notKeptPromises);
    const remainderPct = (remainderCount / total) * 100;

    // Ideally we would split "Partially Kept" out if we had that status in DB.
    // For now, we will just show the statuses we have + Not Rated.

    const items = [
        { label: "Kept", count: keptPromises, pct: keptPct, color: "bg-green-500" },
        // { label: "Partially Kept", count: 0, pct: 0, color: "bg-yellow-500" }, // Hidden until we have data
        { label: "In Progress", count: inProgressPromises, pct: inProgressPct, color: "bg-g-blue-600" },
        { label: "Not Kept", count: notKeptPromises, pct: notKeptPct, color: "bg-red-500" },
        { label: "Not Rated", count: remainderCount, pct: remainderPct, color: "bg-g-gray-300" },
    ];

    return (
        <div className="bg-white rounded-lg border border-g-gray-200 shadow-sm p-6 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-g-gray-900 mb-6">Promise Status Breakdown</h2>

            <div className="space-y-6 flex-1">
                {/* Bar Chart Visualization */}
                <div className="h-3 w-full rounded-full flex overflow-hidden">
                    {items.map((item, idx) => (
                        item.pct > 0 && <div key={idx} className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    ))}
                </div>

                {/* List Layout */}
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                <span className="text-sm font-medium text-g-gray-700">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-g-gray-900">{item.count}</span>
                                <span className="text-sm text-g-gray-500 w-12 text-right">{item.pct.toFixed(1)}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-6 mt-6 border-t border-g-gray-100 flex justify-between items-center">
                <span className="font-semibold text-g-gray-500">Total Promises</span>
                <span className="font-bold text-xl text-g-gray-900">{totalPromises}</span>
            </div>
        </div>
    );
}
