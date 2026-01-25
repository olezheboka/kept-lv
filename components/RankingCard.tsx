"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from "framer-motion";
import type { RankingItem, PartyUI } from '@/lib/db';

interface RankingCardProps {
    title: string;
    type: 'politician' | 'party';
    data: RankingItem[];
    parties?: PartyUI[];
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



    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center gap-4 relative py-2 min-h-[3.5rem] group"
        >
            <div className="flex-shrink-0 w-6 flex justify-center">
                {getRankIcon(index)}
            </div>

            <div className="flex-shrink-0">
                {null}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="mb-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-sm leading-tight">
                        <Link
                            href={type === 'politician' ? `/politicians/${item.id}` : `/parties/${item.id}`}
                            className="font-semibold text-foreground truncate hover:underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all"
                            suppressHydrationWarning
                        >
                            {item.name}
                        </Link>
                        {/* Logo rendering for both Politician and Party */}
                        {/* Party badge removed */}
                    </div>
                    {type === 'politician' && item.role && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full mt-0.5">
                            <span className="truncate max-w-[150px]">
                                {item.role}
                            </span>
                            {item.isInOffice && (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
                                    Amatā
                                </span>
                            )}
                        </div>
                    )}
                    {type === 'party' && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full mt-0.5">
                            {item.isInCoalition ? (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
                                    Koalīcijā
                                </span>
                            ) : (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
                                    Opozīcijā
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <Progress
                    value={progress}
                    className="h-1.5 w-full transition-all duration-1000 ease-out"
                    indicatorClassName="bg-status-kept"
                    aria-label={`Procenti izpildīto solījumu: ${item.keptPercentage}%`}
                />
            </div>

            <div className="flex-shrink-0 text-right min-w-[3rem]">
                {viewMode === 'percentage' ? (
                    <span className="text-sm font-bold text-foreground">{item.keptPercentage}%</span>
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
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 1:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 2:
                return <Medal className="h-5 w-5 text-amber-600" />;
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
                            <TabsTrigger value="percentage" className="h-7 text-sm px-2.5">%</TabsTrigger>
                            <TabsTrigger value="count" className="h-7 text-sm px-2.5">#</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-0">
                    <div className="space-y-4 mb-6">
                        {topItems.map((item, index) => (
                            <RankingRow
                                key={`${item.id}-${viewMode}`}
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
                            <Button variant="ghost" className="gap-2 hover:bg-primary hover:text-primary-foreground w-full sm:w-auto">
                                Skatīt visus <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
