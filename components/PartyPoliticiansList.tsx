"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PoliticianWithStats } from '@/lib/db';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PartyPoliticiansListProps {
    politicians: PoliticianWithStats[];
}

export function PartyPoliticiansList({ politicians }: PartyPoliticiansListProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const INITIAL_COUNT = 9;

    if (politicians.length === 0) return null;

    const displayedPoliticians = isExpanded ? politicians : politicians.slice(0, INITIAL_COUNT);
    const hasMore = politicians.length > INITIAL_COUNT;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    Partijas biedri
                    <span className="text-muted-foreground font-normal text-lg">
                        ({politicians.length})
                    </span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode='popLayout'>
                    {displayedPoliticians.map((pol) => (
                        <motion.div
                            key={pol.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            layout
                        >
                            <Link href={`/politicians/${pol.slug}`}>
                                <Card className="hover:bg-accent/50 transition-colors border-border/50 h-full group">
                                    <CardContent className="p-5">
                                        <div className="flex flex-col gap-1 mb-4">
                                            <div className="flex items-center gap-2 flex-wrap max-w-full">
                                                <h3 className="text-sm font-semibold text-foreground leading-tight truncate group-hover:text-accent transition-colors">
                                                    {pol.name}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-2 mt-0">
                                                <TooltipProvider>
                                                    <Tooltip delayDuration={300}>
                                                        <TooltipTrigger asChild>
                                                            <span className="text-xs text-muted-foreground truncate max-w-[200px] hover:text-foreground transition-colors">
                                                                {pol.role}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" className="max-w-[300px]">
                                                            {pol.role}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                {pol.isInOffice && (
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
                                                        Amatā
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                                                <span>{pol.stats.total} solījumi</span>
                                                <span>{pol.stats.total > 0 ? Math.round((pol.stats.kept / pol.stats.total) * 100) : 0}% izpildīti</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                                                {pol.stats.pending > 0 && (
                                                    <div
                                                        className="h-full bg-status-pending"
                                                        style={{ width: `${(pol.stats.pending / pol.stats.total) * 100}%` }}
                                                    />
                                                )}
                                                {pol.stats.partiallyKept > 0 && (
                                                    <div
                                                        className="h-full bg-status-partially"
                                                        style={{ width: `${(pol.stats.partiallyKept / pol.stats.total) * 100}%` }}
                                                    />
                                                )}
                                                {pol.stats.kept > 0 && (
                                                    <div
                                                        className="h-full bg-status-kept"
                                                        style={{ width: `${(pol.stats.kept / pol.stats.total) * 100}%` }}
                                                    />
                                                )}
                                                {pol.stats.broken > 0 && (
                                                    <div
                                                        className="h-full bg-status-broken"
                                                        style={{ width: `${(pol.stats.broken / pol.stats.total) * 100}%` }}
                                                    />
                                                )}
                                                {pol.stats.cancelled > 0 && (
                                                    <div
                                                        className="h-full bg-status-unrated-bar"
                                                        style={{ width: `${(pol.stats.cancelled / pol.stats.total) * 100}%` }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {hasMore && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="gap-2 min-w-[200px]"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                Rādīt mazāk
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                Rādīt visus ({politicians.length})
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
