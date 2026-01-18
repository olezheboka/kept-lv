import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatusBreakdownProps {
    stats: {
        totalPromises: number;
        keptPromises: number;
        partialPromises: number;
        inProgressPromises: number;
        notKeptPromises: number;
        notRatedPromises: number;
        keptRateTrend?: number;
    };
}

export function StatusBreakdown({ stats }: StatusBreakdownProps) {
    const {
        totalPromises,
        keptPromises,
        partialPromises,
        inProgressPromises,
        notKeptPromises,
        notRatedPromises,
        keptRateTrend = 0
    } = stats;

    const total = totalPromises || 1;

    // Calculate percentages
    const keptPct = (keptPromises / total) * 100;
    const partialPct = (partialPromises / total) * 100;
    const inProgressPct = (inProgressPromises / total) * 100;
    const notKeptPct = (notKeptPromises / total) * 100;
    const notRatedPct = (notRatedPromises / total) * 100;

    const items = [
        { label: "Kept", count: keptPromises, pct: keptPct, color: "#22c55e" },
        { label: "Partially kept", count: partialPromises, pct: partialPct, color: "#facc15" },
        { label: "In progress", count: inProgressPromises, pct: inProgressPct, color: "#3b82f6" },
        { label: "Not kept", count: notKeptPromises, pct: notKeptPct, color: "#ef4444" },
        { label: "Not rated", count: notRatedPromises, pct: notRatedPct, color: "#d1d5db" },
    ];

    // SVG Donut chart calculations
    const size = 180;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    // Calculate stroke dash arrays for each segment
    let currentOffset = 0;
    const segments = items.map((item) => {
        const dashLength = (item.pct / 100) * circumference;
        const segment = {
            ...item,
            dashArray: `${dashLength} ${circumference - dashLength}`,
            dashOffset: -currentOffset,
        };
        currentOffset += dashLength;
        return segment;
    });

    // Trend display
    const trendIsPositive = keptRateTrend > 0;
    const trendIsNegative = keptRateTrend < 0;
    const trendColor = trendIsPositive ? "text-green-500" : trendIsNegative ? "text-red-500" : "text-gray-400";
    const TrendIcon = trendIsPositive ? TrendingUp : trendIsNegative ? TrendingDown : Minus;

    return (
        <div className="bg-white rounded-lg border border-g-gray-200 shadow-sm overflow-hidden">
            {/* Heading - matching RecentActivity style */}
            <div className="px-6 py-4 border-b border-g-gray-100">
                <h2 className="text-base font-semibold text-g-gray-900">Promise status breakdown</h2>
            </div>

            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Donut Chart */}
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="relative">
                            <svg width={size} height={size} className="transform -rotate-90">
                                {/* Background circle */}
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    fill="none"
                                    stroke="#f3f4f6"
                                    strokeWidth={strokeWidth}
                                />
                                {/* Segments */}
                                {segments.map((segment, idx) => (
                                    segment.pct > 0 && (
                                        <circle
                                            key={idx}
                                            cx={center}
                                            cy={center}
                                            r={radius}
                                            fill="none"
                                            stroke={segment.color}
                                            strokeWidth={strokeWidth}
                                            strokeDasharray={segment.dashArray}
                                            strokeDashoffset={segment.dashOffset}
                                            strokeLinecap="butt"
                                        />
                                    )
                                ))}
                            </svg>
                            {/* Center text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-gray-900">{Math.round(keptPct)}%</span>
                                <span className="text-sm font-medium text-green-500 uppercase tracking-wider">Kept</span>
                            </div>
                        </div>

                        {/* 30-day trend indicator */}
                        <div className={`flex items-center gap-1 mt-3 ${trendColor}`}>
                            <TrendIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">
                                {trendIsPositive ? "+" : ""}{keptRateTrend}% vs 30 days ago
                            </span>
                        </div>
                    </div>

                    {/* Right: Breakdown Legend */}
                    <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                            <h3 className="text-base font-semibold text-gray-900">Breakdown</h3>
                            <span className="text-sm text-gray-500">{totalPromises} Total items</span>
                        </div>

                        {/* Status list */}
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm text-gray-700">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-400">{item.count} items</span>
                                        <span className="text-sm font-semibold text-gray-900 w-10 text-right">{Math.round(item.pct)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

