"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RankingItem } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getPartyById } from '@/lib/data';
import { PartyBadge } from './PartyBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { motion } from "framer-motion";

interface RankingCardProps {
    title: string;
    type: 'politician' | 'party';
    data: RankingItem[];
}

const RankingRow = ({ item, index, viewMode, type, getRankIcon }: {
    item: RankingItem;
    index: number;
    viewMode: 'percentage' | 'count';
    type: 'politician' | 'party';
    getRankIcon: (index: number) => React.ReactNode;
}) => {
    const [progress, setProgress] = useState(0);

    // Animate progress bar on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(item.keptPercentage);
        }, 200 + index * 100);
        return () => clearTimeout(timer);
    }, [item.keptPercentage, index]);

    const party = type === 'party'
        ? getPartyById(item.id)
        : (item.partyId ? getPartyById(item.partyId) : undefined);

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center gap-4 relative py-2 min-h-[3.5rem]"
        >
            <div className="flex-shrink-0 w-6 flex justify-center">
                {getRankIcon(index)}
            </div>

            <div className="flex-shrink-0">
                {/* No avatar for both politician and party in new style */}
                {null}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="mb-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-sm leading-tight">
                        <span className="font-semibold text-foreground truncate">{item.name}</span>
                        {party && (
                            <PartyBadge
                                party={party}
                                size="sm"
                                className="opacity-90 flex-shrink-0 scale-90 origin-left"
                            />
                        )}
                    </div>
                    {type === 'politician' && item.role && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full mt-0.5">
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <span className="truncate cursor-default hover:text-foreground transition-colors max-w-[150px]">
                                            {item.role}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-[250px]">
                                        {item.role}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {item.isInOffice && (
                                <span className="flex-shrink-0 px-1.5 py-0 bg-muted/60 text-muted-foreground text-[10px] font-medium rounded-full whitespace-nowrap border border-border/50">
                                    Amatā
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <Progress value={progress} className="h-1.5 w-full transition-all duration-1000 ease-out" indicatorClassName={cn(
                    viewMode === 'percentage' ? "bg-status-kept" : "bg-muted-foreground/30"
                )} />
            </div>

            <div className="flex-shrink-0 text-right min-w-[3rem]">
                {viewMode === 'percentage' ? (
                    <span className="text-sm font-bold text-status-kept">{item.keptPercentage}%</span>
                ) : (
                    <span className="text-sm font-bold text-foreground">{item.keptPromises}<span className="text-muted-foreground font-normal text-xs">/{item.totalPromises}</span></span>
                )}
            </div>
        </motion.div>
    );
};

export const RankingCard = ({ title, type, data }: RankingCardProps) => {
    const [viewMode, setViewMode] = useState<'percentage' | 'count'>('percentage');

    const sortedData = [...data].sort((a, b) => {
        if (viewMode === 'percentage') {
            return b.keptPercentage - a.keptPercentage || b.keptPromises - a.keptPromises;
        }
        return b.keptPromises - a.keptPromises || b.keptPercentage - a.keptPercentage;
    });

    const topItems = sortedData.slice(0, 5);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Trophy className="h-4 w-4 text-yellow-500" />;
            case 1:
                return <Medal className="h-4 w-4 text-gray-400" />;
            case 2:
                return <Medal className="h-4 w-4 text-amber-600" />;
            default:
                return <span className="text-sm font-medium text-muted-foreground w-4 text-center">{index + 1}</span>;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="h-full"
        >
            <Card className="border-border/50 h-full flex flex-col">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'percentage' | 'count')} className="w-auto">
                        <TabsList className="h-8 p-0.5">
                            <TabsTrigger value="percentage" className="h-7 text-xs px-2.5">%</TabsTrigger>
                            <TabsTrigger value="count" className="h-7 text-xs px-2.5">#</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-0">
                    <div className="space-y-4 mb-6">
                        {topItems.map((item, index) => (
                            <RankingRow
                                key={`${item.id}-${viewMode}`} // Force re-mount on mode switch to re-play animation
                                item={item}
                                index={index}
                                viewMode={viewMode}
                                type={type}
                                getRankIcon={getRankIcon}
                            />
                        ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-border/50 text-center">
                        <Link href={type === 'politician' ? "/politicians" : "/parties"} suppressHydrationWarning>
                            <button className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mx-auto transition-colors" suppressHydrationWarning>
                                Skatīt visus <ArrowRight className="h-3 w-3" />
                            </button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
