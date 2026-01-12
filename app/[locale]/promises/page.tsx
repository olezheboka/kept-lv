"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { PromiseCard } from '@/components/PromiseCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { promises, parties, getPoliticianById } from '@/lib/data';
import { CATEGORIES, PromiseStatus, STATUS_CONFIG } from '@/lib/types';
import { Search, Filter, Grid3X3, List, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

const STATUSES: PromiseStatus[] = ['kept', 'partially-kept', 'in-progress', 'broken', 'not-rated'];

const PromisesContent = () => {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    useEffect(() => {
        const query = searchParams.get('q');
        if (query !== null) {
            setSearchQuery(query);
        }
    }, [searchParams]);
    const [selectedStatuses, setSelectedStatuses] = useState<PromiseStatus[]>([]);
    const [selectedParties, setSelectedParties] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'updated' | 'date' | 'views'>('updated');

    const filteredPromises = useMemo(() => {
        let result = [...promises];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => {
                const politician = getPoliticianById(p.politicianId);
                const politicianName = politician ? politician.name.toLowerCase() : '';

                return (
                    p.title.toLowerCase().includes(query) ||
                    p.fullText.toLowerCase().includes(query) ||
                    p.tags.some(t => t.toLowerCase().includes(query)) ||
                    politicianName.includes(query)
                );
            });
        }

        // Status filter
        if (selectedStatuses.length > 0) {
            result = result.filter(p => selectedStatuses.includes(p.status));
        }

        // Party filter
        if (selectedParties.length > 0) {
            result = result.filter(p => selectedParties.includes(p.partyId));
        }

        // Category filter
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }

        // Sorting
        switch (sortBy) {
            case 'updated':
                result.sort((a, b) => new Date(b.statusUpdatedAt).getTime() - new Date(a.statusUpdatedAt).getTime());
                break;
            case 'date':
                result.sort((a, b) => new Date(b.datePromised).getTime() - new Date(a.datePromised).getTime());
                break;
            case 'views':
                result.sort((a, b) => b.viewCount - a.viewCount);
                break;
        }

        return result;
    }, [searchQuery, selectedStatuses, selectedParties, selectedCategories, sortBy]);

    const toggleStatus = (status: PromiseStatus) => {
        setSelectedStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const toggleParty = (partyId: string) => {
        setSelectedParties(prev =>
            prev.includes(partyId)
                ? prev.filter(p => p !== partyId)
                : [...prev, partyId]
        );
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        );
    };

    const clearFilters = () => {
        setSelectedStatuses([]);
        setSelectedParties([]);
        setSelectedCategories([]);
        setSearchQuery('');
    };

    const hasActiveFilters = selectedStatuses.length > 0 || selectedParties.length > 0 || selectedCategories.length > 0 || searchQuery;

    const FilterPanel = () => (
        <div className="space-y-6">
            {/* Status Filter */}
            <div>
                <h4 className="font-semibold text-foreground mb-3">Statuss</h4>
                <div className="space-y-2">
                    {STATUSES.map(status => (
                        <label key={status} className="flex items-center gap-3 cursor-pointer group">
                            <Checkbox
                                checked={selectedStatuses.includes(status)}
                                onCheckedChange={() => toggleStatus(status)}
                            />
                            <StatusBadge status={status} size="sm" />
                        </label>
                    ))}
                </div>
            </div>

            {/* Party Filter */}
            <div>
                <h4 className="font-semibold text-foreground mb-3">Partija</h4>
                <div className="space-y-2">
                    {parties.map(party => (
                        <label key={party.id} className="flex items-center gap-3 cursor-pointer group">
                            <Checkbox
                                checked={selectedParties.includes(party.id)}
                                onCheckedChange={() => toggleParty(party.id)}
                            />
                            <span className="text-sm text-foreground">{party.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Category Filter */}
            <div>
                <h4 className="font-semibold text-foreground mb-3">Kategorija</h4>
                <div className="space-y-2">
                    {CATEGORIES.map(category => (
                        <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                            <Checkbox
                                checked={selectedCategories.includes(category.id)}
                                onCheckedChange={() => toggleCategory(category.id)}
                            />
                            <span className="text-sm text-foreground">{category.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                    Notīrīt filtrus
                </Button>
            )}
        </div>
    );

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
                            Visi solījumi
                        </h1>
                        <p className="text-muted-foreground">
                            Pārlūkojiet un filtrējiet {promises.length} politiķu solījumus
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filters & Content */}
            <section className="py-8">
                <div className="container-wide">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <Card className="sticky top-24 border-border/50">
                                <CardContent className="p-5">
                                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Filtri
                                    </h3>
                                    <FilterPanel />
                                </CardContent>
                            </Card>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                            {/* Search & Sort Bar */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Input
                                        type="search"
                                        placeholder="Meklēt solījumus..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>

                                {/* Mobile Filter Button */}
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="lg:hidden gap-2">
                                            <SlidersHorizontal className="h-4 w-4" />
                                            Filtri
                                            {hasActiveFilters && (
                                                <span className="w-2 h-2 rounded-full bg-accent" />
                                            )}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-80">
                                        <SheetHeader>
                                            <SheetTitle>Filtri</SheetTitle>
                                        </SheetHeader>
                                        <div className="mt-6">
                                            <FilterPanel />
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                {/* Sort & View */}
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as any)}
                                            className="appearance-none h-10 pl-3 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                        >
                                            <option value="updated">Pēdējie atjaunināti</option>
                                            <option value="date">Datums</option>
                                            <option value="views">Populārākie</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>

                                    <div className="flex items-center border border-input rounded-lg overflow-hidden">
                                        <Button
                                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                            size="icon"
                                            className="h-10 w-10 rounded-none"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <Grid3X3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                            size="icon"
                                            className="h-10 w-10 rounded-none"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters */}
                            {hasActiveFilters && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {selectedStatuses.map(status => (
                                        <button
                                            key={status}
                                            onClick={() => toggleStatus(status)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-foreground hover:bg-muted/80"
                                        >
                                            {STATUS_CONFIG[status].label}
                                            <X className="h-3 w-3" />
                                        </button>
                                    ))}
                                    {selectedParties.map(partyId => {
                                        const party = parties.find(p => p.id === partyId);
                                        return party ? (
                                            <button
                                                key={partyId}
                                                onClick={() => toggleParty(partyId)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-foreground hover:bg-muted/80"
                                            >
                                                {party.abbreviation}
                                                <X className="h-3 w-3" />
                                            </button>
                                        ) : null;
                                    })}
                                    {selectedCategories.map(catId => {
                                        const cat = CATEGORIES.find(c => c.id === catId);
                                        return cat ? (
                                            <button
                                                key={catId}
                                                onClick={() => toggleCategory(catId)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-foreground hover:bg-muted/80"
                                            >
                                                {cat.name}
                                                <X className="h-3 w-3" />
                                            </button>
                                        ) : null;
                                    })}
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-accent hover:underline"
                                    >
                                        Notīrīt visus
                                    </button>
                                </div>
                            )}

                            {/* Results Count */}
                            <p className="text-sm text-muted-foreground mb-6">
                                Atrasti {filteredPromises.length} solījumi
                            </p>

                            {/* Promise Grid */}
                            {filteredPromises.length > 0 ? (
                                <div className={viewMode === 'grid'
                                    ? 'grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                                    : 'space-y-4'
                                }>
                                    {filteredPromises.map((promise, index) => (
                                        <PromiseCard key={promise.id} promise={promise} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <Card className="border-border/50">
                                    <CardContent className="py-16 text-center">
                                        <p className="text-muted-foreground">
                                            Nav atrasti solījumi ar izvēlētajiem filtriem.
                                        </p>
                                        <Button variant="outline" onClick={clearFilters} className="mt-4">
                                            Notīrīt filtrus
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const PromisesPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PromisesContent />
        </Suspense>
    );
};

export default PromisesPage;
