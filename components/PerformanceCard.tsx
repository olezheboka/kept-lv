"use client";

import { Card, CardContent } from '@/components/ui/card';
import { PromiseStatus, STATUS_CONFIG } from '@/lib/types';
import { CheckCircle2, Clock, XCircle, CircleDot, HelpCircle, List } from 'lucide-react';

const STATUSES: PromiseStatus[] = ['kept', 'partially-kept', 'in-progress', 'broken', 'not-rated'];

interface Stats {
    total: number;
    kept: number;
    partiallyKept: number;
    inProgress: number;
    broken: number;
    notRated: number;
}

interface PerformanceCardProps {
    stats: Stats;
    filterStatus?: PromiseStatus | 'all';
    onFilterChange?: (status: PromiseStatus | 'all') => void;
}

export const PerformanceCard = ({ stats, filterStatus = 'all', onFilterChange }: PerformanceCardProps) => {
    // Calculate percentage for circular progress
    const keptPercentage = stats.total > 0 ? (stats.kept / stats.total) * 100 : 0;
    // Radius increased to 56 (was 48) to take more space
    const radius = 56;
    const circumference = 2 * Math.PI * radius;

    // Ensure strokeDashoffset calculation is correct
    // strokeDasharray is circumference
    // strokeDashoffset is amount to HIDE. So if 33% kept, we show 33%. Hide 67%.
    // offset = circumference - (percent / 100) * circumference

    const handleStatusClick = (status: PromiseStatus | 'all') => {
        if (onFilterChange) {
            onFilterChange(status);
        }
    };

    if (stats.total === 0) {
        return (
            <Card className="border-border/50">
                <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Dati tiek apkopoti...
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-border/50">
            <div className="flex flex-col lg:flex-row">
                {/* Left: Hero (Kept Promises) */}
                <div className="lg:w-5/12 p-4 border-b lg:border-b-0 lg:border-r border-border/50 bg-gradient-to-br from-muted to-background flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Efektivitātes rādītājs</h3>
                    <div className="relative w-32 h-32 mb-2">
                        {/* Circular Progress */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                            {/* Track Background (Darker for contrast - visible if total is 0 or gaps) */}
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="16"
                                fill="transparent"
                                className="text-border"
                            />

                            {/* Computed Segments */}
                            {(() => {
                                const segments = [
                                    { key: 'kept', value: stats.kept, color: 'text-status-kept' },
                                    { key: 'partially-kept', value: stats.partiallyKept, color: 'text-status-partially' },
                                    { key: 'in-progress', value: stats.inProgress, color: 'text-status-progress' },
                                    { key: 'broken', value: stats.broken, color: 'text-status-broken' },
                                    { key: 'not-rated', value: stats.notRated, color: 'text-[#D1D5DC]' },
                                ];

                                let accumulatedPercentage = 0;

                                return segments.map((segment) => {
                                    if (segment.value === 0) return null;

                                    const percentage = (segment.value / stats.total) * 100;
                                    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                                    const strokeDashoffset = -1 * (accumulatedPercentage / 100) * circumference;

                                    accumulatedPercentage += percentage;

                                    return (
                                        <circle
                                            key={segment.key}
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={strokeDasharray}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap={percentage < 100 ? "butt" : "round"} // Butt caps for seamless segments
                                            className={`${segment.color} transition-all duration-1000 ease-out`}
                                        />
                                    );
                                });
                            })()}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-3xl font-bold text-foreground leading-none">
                                {Math.round(keptPercentage)}%
                            </span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Izpildīti</span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-foreground">
                        {stats.kept} <span className="text-muted-foreground font-normal">no {stats.total} solījumiem</span>
                    </h3>
                </div>

                {/* Right: Status Grid */}
                <div className="lg:w-7/12 p-4 bg-background">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 h-full content-center">
                        {/* All Promises */}
                        <button
                            onClick={() => handleStatusClick('all')}
                            className={`
                                flex flex-col p-2 rounded-lg border transition-all text-left group
                                ${filterStatus === 'all'
                                    ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 ring-1 ring-blue-500'
                                    : 'bg-background border-border/50 hover:bg-muted/50 hover:border-border'}
                            `}
                        >
                            <div className="mb-1.5 p-1 w-fit rounded-md bg-primary/10 text-primary">
                                <List className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5 group-hover:text-primary transition-colors truncate w-full">
                                Visi solījumi
                            </span>
                            <span className="text-lg font-bold text-foreground">
                                {stats.total}
                            </span>
                        </button>

                        {/* Other Statuses */}
                        {STATUSES.map((status) => {
                            const config = {
                                'kept': { icon: CheckCircle2, color: 'text-status-kept', bg: 'bg-status-kept-bg' },
                                'partially-kept': { icon: CircleDot, color: 'text-status-partially', bg: 'bg-status-partially-bg' },
                                'in-progress': { icon: Clock, color: 'text-status-progress', bg: 'bg-status-progress-bg' },
                                'broken': { icon: XCircle, color: 'text-status-broken', bg: 'bg-status-broken-bg' },
                                'not-rated': { icon: HelpCircle, color: 'text-status-unrated', bg: 'bg-status-unrated-bg' },
                            }[status as string] || { icon: HelpCircle, color: 'text-status-unrated', bg: 'bg-status-unrated-bg' };

                            const Icon = config.icon;
                            const count = stats[status === 'partially-kept' ? 'partiallyKept' : status === 'in-progress' ? 'inProgress' : status === 'not-rated' ? 'notRated' : status];
                            const isActive = filterStatus === status;

                            return (
                                <button
                                    key={status}
                                    onClick={() => handleStatusClick(status)}
                                    className={`
                                        flex flex-col p-2 rounded-lg border transition-all text-left group
                                        ${isActive
                                            ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 ring-1 ring-blue-500'
                                            : 'bg-background border-border/50 hover:bg-muted/50 hover:border-border'}
                                    `}
                                >
                                    <div className={`mb-1.5 p-1 w-fit rounded-full flex items-center justify-center ${status === 'not-rated' ? 'bg-[#F4F5F7] text-[#66758B]' : `${config.bg} bg-opacity-20`}`}>
                                        <Icon className={`h-3.5 w-3.5 ${status === 'not-rated' ? 'text-[#66758B]' : config.color}`} />
                                    </div>
                                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5 group-hover:text-foreground transition-colors truncate w-full">
                                        {STATUS_CONFIG[status].label}
                                    </span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold text-foreground">
                                            {count}
                                        </span>
                                        <span className="text-[10px] font-medium text-muted-foreground">
                                            / {stats.total}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Card>
    );
};
