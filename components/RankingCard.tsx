"use client";

import { useState } from 'react';
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

interface RankingCardProps {
    title: string;
    type: 'politician' | 'party';
    data: RankingItem[];
}

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
                    {topItems.map((item, index) => {
                        const party = item.partyId ? getPartyById(item.partyId) : undefined;

                        return (
                            <div key={item.id} className="flex items-center gap-3 relative">
                                <div className="flex-shrink-0 w-6 flex justify-center">
                                    {getRankIcon(index)}
                                </div>

                                <div className="flex-shrink-0">
                                    <Avatar className="h-10 w-10 border border-border">
                                        {/* For Politicians: use Party logic for avatar if needed, or politician photo if we had it. 
                        Plan said replace politician photos with party logos. 
                        But data helper returns politician.photoUrl as item.avatarUrl. 
                        Let's check if we should show party logo for politician too or stick to plan. 
                        The user asked to "Replace politician photos with party logos" globally. 
                        Let's simulate that here: if type is politician, show party logo instead of user photo if available?
                        Or better, use the PartyBadge style logic from PromiseCard.
                    */}
                                        {type === 'politician' && party ? (
                                            <>
                                                {/* If we want party logo instead of face */}
                                                {party.logoUrl ? (
                                                    <AvatarImage src={party.logoUrl} alt={party.name} />
                                                ) : null}
                                                <AvatarFallback
                                                    className="text-[10px] font-bold text-white uppercase"
                                                    style={{ backgroundColor: party.color }}
                                                >
                                                    {party.abbreviation}
                                                </AvatarFallback>
                                            </>
                                        ) : (
                                            // Type party
                                            <>
                                                {item.avatarUrl ? (
                                                    <AvatarImage src={item.avatarUrl} alt={item.name} />
                                                ) : null}
                                                <AvatarFallback
                                                    className="text-[10px] font-bold text-white uppercase"
                                                    style={{ backgroundColor: item.color }}
                                                >
                                                    {type === 'party' ? item.abbreviation || item.name[0] : item.name[0]}
                                                </AvatarFallback>
                                            </>
                                        )}
                                    </Avatar>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium truncate">{item.name}</span>
                                        {type === 'politician' && party && (
                                            <PartyBadge party={party} className="h-4 px-1 text-[9px]" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress value={item.keptPercentage} className="h-1.5 flex-1" indicatorClassName={cn(
                                            viewMode === 'percentage' ? "bg-status-kept" : "bg-muted-foreground/30"
                                        )} />
                                    </div>
                                </div>

                                <div className="flex-shrink-0 text-right min-w-[3rem]">
                                    {viewMode === 'percentage' ? (
                                        <span className="text-sm font-bold text-status-kept">{item.keptPercentage}%</span>
                                    ) : (
                                        <span className="text-sm font-bold text-foreground">{item.keptPromises}<span className="text-muted-foreground font-normal text-xs">/{item.totalPromises}</span></span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-auto pt-4 border-t border-border/50 text-center">
                    <Link href={type === 'politician' ? "/politicians" : "/parties"}>
                        <button className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mx-auto transition-colors">
                            Skatīt visus <ArrowRight className="h-3 w-3" />
                        </button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};
