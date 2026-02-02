"use client";

import { format } from "date-fns";
import {
    Timeline,
    TimelineItem,
    TimelineBadge,
    TimelineConnector,
    TimelineContent,
} from "@/components/ui/timeline";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, CheckCircle2, Clock, XCircle, Ban } from "lucide-react";
import { PromiseTimelineEntry } from "@/lib/db";

interface PromiseTimelineProps {
    history: PromiseTimelineEntry[];
    createdAt: string; // Promise creation date
}

const HalfCircleIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" stroke="none" />
        <line x1="12" x2="12" y1="2" y2="22" stroke="currentColor" />
    </svg>
);

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'kept':
            return CheckCircle2;
        case 'partially-kept':
            return HalfCircleIcon;
        case 'pending':
            return Clock;
        case 'broken':
            return XCircle;
        case 'cancelled':
            return Ban;
        default:
            return Clock;
    }
};

const getStatusColorClass = (status: string) => {
    switch (status) {
        case 'kept':
            return 'text-[hsl(var(--status-kept))]';
        case 'partially-kept':
            return 'text-[hsl(var(--status-partially))]';
        case 'pending':
            return 'text-[hsl(var(--status-pending))]';
        case 'broken':
            return 'text-[hsl(var(--status-broken))]';
        case 'cancelled':
            return 'text-gray-500';
        default:
            return 'text-muted-foreground';
    }
};


export function PromiseTimeline({ history, createdAt }: PromiseTimelineProps) {
    // Sort history by date desc (newest first)
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Hronoloģija</h3>
            <Timeline>
                {sortedHistory.map((entry, index) => {
                    const isLatest = index === 0;
                    const Icon = getStatusIcon(entry.newStatus);
                    return (
                        <TimelineItem key={entry.id}>
                            <TimelineConnector />
                            <TimelineBadge className="bg-background border-none shadow-none p-0">
                                <Icon
                                    size={16}
                                    className={`${getStatusColorClass(entry.newStatus)} ${!isLatest ? 'opacity-60' : ''}`}
                                    strokeWidth={2.5}
                                />
                            </TimelineBadge>
                            <TimelineContent className={!isLatest ? "opacity-60 saturate-50" : ""}>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(entry.changedAt), "dd.MM.yyyy")}
                                    </span>
                                    <span className={`text-sm text-foreground ${isLatest ? 'font-bold' : 'font-medium'}`}>
                                        {entry.oldStatus ? (
                                            <div className="flex items-center gap-1">
                                                <span>Statuss mainīts uz</span>
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                <StatusBadge status={entry.newStatus as any} size="sm" showIcon={true} />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <span>Statuss atjaunots uz</span>
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                <StatusBadge status={entry.newStatus as any} size="sm" showIcon={true} />
                                            </div>
                                        )}
                                    </span>
                                </div>
                                {/* Note removed per request */}
                            </TimelineContent>
                        </TimelineItem>
                    );
                })}

                {/* Always show "Promise Created" at the very end */}
                {(() => {
                    const isCreationActive = sortedHistory.length === 0;
                    return (
                        <TimelineItem>
                            <TimelineBadge className="bg-background border-none shadow-none p-0">
                                <Clock
                                    size={16}
                                    className={`${getStatusColorClass('pending')} ${!isCreationActive ? 'opacity-60' : ''}`}
                                    strokeWidth={2.5}
                                />
                            </TimelineBadge>
                            <TimelineContent className={!isCreationActive ? "opacity-60 saturate-50" : ""}>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-muted-foreground">{format(new Date(createdAt), "dd.MM.yyyy")}</span>
                                    <span className={`text-sm text-foreground flex items-center gap-1 ${isCreationActive ? 'font-bold' : 'font-medium'}`}>
                                        <span>Solījums reģistrēts</span>
                                        <StatusBadge status="pending" size="sm" showIcon={true} />
                                    </span>
                                </div>
                            </TimelineContent>
                        </TimelineItem>
                    );
                })()}
            </Timeline>
        </div>
    );
}
