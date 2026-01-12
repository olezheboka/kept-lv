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
    const circumference = 2 * Math.PI * 70; // r=70
    const strokeDashoffset = circumference - (keptPercentage / 100) * circumference;

    const handleStatusClick = (status: PromiseStatus | 'all') => {
        if (onFilterChange) {
            onFilterChange(status);
        }
    };

    if (stats.total === 0) {
        return (
            <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
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
                <div className="lg:w-5/12 p-8 border-b lg:border-b-0 lg:border-r border-border/50 bg-gradient-to-br from-muted to-background flex flex-col items-center justify-center text-center">
                    <div className="relative w-48 h-48 mb-6">
                        {/* Circular Progress */}
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Track Background (Darker for contrast) */}
                            <circle
                                cx="96"
                                cy="96"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="14"
                                fill="transparent"
                                className="text-border"
                            />
                            {/* Track (Inner Grey) */}
                            <circle
                                cx="96"
                                cy="96"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-muted-foreground/20"
                            />
                            {/* Progress (Green) */}
                            <circle
                                cx="96"
                                cy="96"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="text-status-kept transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-3xl font-bold text-foreground">
                                {Math.round(keptPercentage)}%
                            </span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Izpildīti</span>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground">
                        {stats.kept} <span className="text-muted-foreground font-normal">no {stats.total} solījumiem</span>
                    </h3>
                </div>

                {/* Right: Status Grid */}
                <div className="lg:w-7/12 p-8 bg-background">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 h-full content-center">
                        {/* All Promises */}
                        <button
                            onClick={() => handleStatusClick('all')}
                            className={`
                                flex flex-col p-4 rounded-xl border transition-all text-left group
                                ${filterStatus === 'all'
                                    ? 'bg-primary/5 border-primary ring-1 ring-primary'
                                    : 'bg-background border-border/50 hover:bg-muted/50 hover:border-border'}
                            `}
                        >
                            <div className="mb-3 p-2 w-fit rounded-lg bg-primary/10 text-primary">
                                <List className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">
                                Visi solījumi
                            </span>
                            <span className="text-2xl font-bold text-foreground">
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
                                        flex flex-col p-4 rounded-xl border transition-all text-left group
                                        ${isActive
                                            ? 'bg-accent/5 border-accent ring-1 ring-accent'
                                            : 'bg-background border-border/50 hover:bg-muted/50 hover:border-border'}
                                    `}
                                >
                                    <div className={`mb-3 p-2 w-fit rounded-lg ${config.bg} bg-opacity-20`}>
                                        <Icon className={`h-5 w-5 ${config.color}`} />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 group-hover:text-foreground transition-colors">
                                        {STATUS_CONFIG[status].label}
                                    </span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-bold text-foreground">
                                            {count}
                                        </span>
                                        <span className="text-sm font-medium text-muted-foreground">
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
