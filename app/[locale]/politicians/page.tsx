"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PartyBadge } from '@/components/PartyBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { politicians, parties, getPartyById, getPromisesByPolitician } from '@/lib/data';
import { Search, ArrowUpDown } from 'lucide-react';

const Politicians = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedParties, setSelectedParties] = useState<string[]>([]);
    const [showInOffice, setShowInOffice] = useState(false);
    const [sortBy, setSortBy] = useState('default');

    const filteredPoliticians = useMemo(() => {
        let result = [...politicians];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.role.toLowerCase().includes(query)
            );
        }

        if (selectedParties.length > 0) {
            result = result.filter(p => p.partyId && selectedParties.includes(p.partyId));
        }

        if (showInOffice) {
            result = result.filter(p => p.isInOffice);
        }

        // Sorting
        if (sortBy !== 'default') {
            result.sort((a, b) => {
                const aPromises = getPromisesByPolitician(a.id);
                const aKept = aPromises.filter(p => p.status === 'kept').length;
                const aTotal = aPromises.length;
                const aPercentage = aTotal > 0 ? (aKept / aTotal) * 100 : 0;

                const bPromises = getPromisesByPolitician(b.id);
                const bKept = bPromises.filter(p => p.status === 'kept').length;
                const bTotal = bPromises.length;
                const bPercentage = bTotal > 0 ? (bKept / bTotal) * 100 : 0;

                if (sortBy === 'kept-percentage') {
                    // Sort by percentage descending
                    return bPercentage - aPercentage;
                } else if (sortBy === 'kept-count') {
                    // Sort by count descending
                    return bKept - aKept;
                }
                return 0;
            });
        }

        return result;
    }, [searchQuery, selectedParties, showInOffice, sortBy]);

    return (
        <div className="flex flex-col bg-background">
            {/* Page Header */}
            <section className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-8 md:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            Politiķi
                        </h1>
                        <p className="text-muted-foreground">
                            Sekojiet līdzi {politicians.length} Latvijas politiķu solījumiem
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-8">
                <div className="container-wide">
                    {/* Filters */}
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
                        <div className="relative w-full sm:flex-1 sm:max-w-md">
                            <Input
                                type="search"
                                placeholder="Meklēt politiķi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="w-full sm:w-[250px]">
                            <MultiSelectDropdown
                                options={parties.map(p => ({ label: p.name, value: p.id, color: p.color }))}
                                selected={selectedParties}
                                onChange={setSelectedParties}
                                placeholder="Visas partijas"
                            />
                        </div>

                        <div className="flex flex-row justify-between items-center w-full sm:w-auto gap-4 flex-wrap">
                            <div className="flex-1 sm:flex-none sm:w-[200px]">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger>
                                        <div className="flex items-center gap-2">
                                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Kārtot pēc" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Bez kārtošanas</SelectItem>
                                        <SelectItem value="kept-percentage">% izpildīts</SelectItem>
                                        <SelectItem value="kept-count"># izpildīts</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2 whitespace-nowrap">
                                <Switch id="in-office" checked={showInOffice} onCheckedChange={setShowInOffice} />
                                <Label htmlFor="in-office" className="cursor-pointer">Tikai amatā</Label>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <p className="text-sm text-muted-foreground mb-6">
                        Atrasti {filteredPoliticians.length} politiķi
                    </p>

                    {/* Politicians Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredPoliticians.map((politician, index) => {
                            const party = getPartyById(politician.partyId);
                            const politicianPromises = getPromisesByPolitician(politician.id);
                            const keptCount = politicianPromises.filter(p => p.status === 'kept').length;
                            const brokenCount = politicianPromises.filter(p => p.status === 'broken').length;
                            const inProgressCount = politicianPromises.filter(p => p.status === 'in-progress').length;
                            const total = politicianPromises.length;

                            return (
                                <motion.div
                                    key={politician.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.03 }}
                                >
                                    <Link href={`/politicians/${politician.id}`}>
                                        <Card className="group overflow-hidden border-border/50 hover:shadow-elevated hover:border-border transition-all duration-300">
                                            <CardContent className="p-5">
                                                <div className="flex flex-col gap-1 mb-4">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-semibold text-foreground text-lg leading-tight group-hover:text-accent transition-colors truncate">
                                                            {politician.name}
                                                        </h3>
                                                        {party && (
                                                            <PartyBadge
                                                                party={party}
                                                                size="sm"
                                                                className="opacity-90 hover:opacity-100"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 min-w-0 text-sm text-muted-foreground w-full">
                                                        <TooltipProvider>
                                                            <Tooltip delayDuration={300}>
                                                                <TooltipTrigger asChild>
                                                                    <span className="truncate cursor-default hover:text-foreground transition-colors">
                                                                        {politician.role}
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="bottom" className="max-w-[300px]">
                                                                    {politician.role}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        {politician.isInOffice && (
                                                            <span className="flex-shrink-0 px-2 py-0.5 bg-muted/60 text-muted-foreground text-xs font-medium rounded-full whitespace-nowrap">
                                                                Amatā
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>



                                                {/* Stats Bar */}
                                                {total > 0 && (
                                                    <div>
                                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                                            <span>{total} solījumi</span>
                                                            <span>{Math.round((keptCount / total) * 100)}% izpildīti</span>
                                                        </div>
                                                        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                                                            {keptCount > 0 && (
                                                                <div
                                                                    className="h-full bg-status-kept"
                                                                    style={{ width: `${(keptCount / total) * 100}%` }}
                                                                />
                                                            )}
                                                            {inProgressCount > 0 && (
                                                                <div
                                                                    className="h-full bg-status-progress"
                                                                    style={{ width: `${(inProgressCount / total) * 100}%` }}
                                                                />
                                                            )}
                                                            {brokenCount > 0 && (
                                                                <div
                                                                    className="h-full bg-status-broken"
                                                                    style={{ width: `${(brokenCount / total) * 100}%` }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Politicians;
