
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { PartyWithStats } from '@/lib/db';
import { getPlainTextFromLexical } from '@/lib/lexical-utils';

interface PartyCardProps {
    party: PartyWithStats;
}

export function PartyCard({ party }: PartyCardProps) {
    const keptCount = party.stats.kept;
    const partiallyKeptCount = party.stats.partiallyKept;
    const inProgressCount = party.stats.pending;
    const brokenCount = party.stats.broken;
    const cancelledCount = party.stats.cancelled;
    const total = party.stats.total;

    return (
        <Link href={`/parties/${party.id}`} className="block h-full">
            <Card className="group overflow-hidden border-border/50 hover:shadow-elevated hover:border-border transition-all duration-300 h-full">
                <CardContent className="p-5">
                    {/* Party Header - Politician Card Style */}
                    <div className="flex flex-col mb-4">
                        <div className="flex items-center gap-2 flex-wrap max-w-full">
                            <h3 className="text-sm font-semibold text-foreground leading-none truncate group-hover:text-accent transition-colors">
                                {party.name}
                            </h3>
                        </div>

                        <div className="flex items-center gap-2 mt-0">
                            {party.description && (
                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {getPlainTextFromLexical(party.description)}
                                </span>
                            )}
                            {party.isInCoalition ? (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-[10px] font-medium text-muted-foreground">
                                    Koalīcijā
                                </span>
                            ) : (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-[10px] font-medium text-muted-foreground">
                                    Opozīcijā
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats Bar (Always Visible) */}
                    <div className="mt-auto">
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
