
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PoliticianWithStats } from '@/lib/db';

interface PoliticianCardProps {
    politician: PoliticianWithStats;
}

export function PoliticianCard({ politician }: PoliticianCardProps) {
    const keptCount = politician.stats.kept;
    const partiallyKeptCount = politician.stats.partiallyKept;
    const inProgressCount = politician.stats.pending;
    const brokenCount = politician.stats.broken;
    const cancelledCount = politician.stats.cancelled;
    const total = politician.stats.total;

    return (
        <Link href={`/politicians/${politician.slug}`}>
            <Card className="group overflow-hidden border-border/50 hover:shadow-elevated hover:border-border transition-all duration-300">
                <CardContent className="p-5">
                    <div className="flex flex-col mb-4">
                        <div className="flex items-center gap-2 flex-wrap max-w-full">
                            <h3 className="text-sm font-semibold text-foreground leading-none truncate group-hover:text-accent transition-colors">
                                {politician.name}
                            </h3>
                        </div>

                        <div className="flex items-center gap-2 mt-0">
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <span className="text-xs text-muted-foreground truncate max-w-[200px] hover:text-foreground transition-colors">
                                            {politician.role}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-[300px]">
                                        {politician.role}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {politician.isInOffice && (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-[10px] font-medium text-muted-foreground">
                                    Amatā
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                            <span>{total} solījumi</span>
                            <span>{total > 0 ? Math.round((keptCount / total) * 100) : 0}% izpildīti</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                            {inProgressCount > 0 && (
                                <div
                                    className="h-full bg-status-pending"
                                    style={{ width: `${(inProgressCount / total) * 100}%` }}
                                />
                            )}
                            {partiallyKeptCount > 0 && (
                                <div
                                    className="h-full bg-status-partially"
                                    style={{ width: `${(partiallyKeptCount / total) * 100}%` }}
                                />
                            )}
                            {keptCount > 0 && (
                                <div
                                    className="h-full bg-status-kept"
                                    style={{ width: `${(keptCount / total) * 100}%` }}
                                />
                            )}
                            {brokenCount > 0 && (
                                <div
                                    className="h-full bg-status-broken"
                                    style={{ width: `${(brokenCount / total) * 100}%` }}
                                />
                            )}
                            {cancelledCount > 0 && (
                                <div
                                    className="h-full bg-status-unrated-bar"
                                    style={{ width: `${(cancelledCount / total) * 100}%` }}
                                />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
