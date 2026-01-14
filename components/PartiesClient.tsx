"use client";

import { useState, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Search, SlidersHorizontal, ChevronDown, X, Users } from 'lucide-react';
import type { PartyUI, PoliticianUI, PromiseUI } from '@/lib/db';

interface PartiesClientProps {
    parties: PartyUI[];
    politicians: PoliticianUI[];
    promises: PromiseUI[];
}

interface FilterPanelProps {
    filterCoalition: boolean;
    setFilterCoalition: (val: boolean) => void;
    filterOpposition: boolean;
    setFilterOpposition: (val: boolean) => void;
    hasActiveFilters: boolean;
    clearFilters: () => void;
}

const FilterPanel = memo(({
    filterCoalition,
    setFilterCoalition,
    filterOpposition,
    setFilterOpposition,
    hasActiveFilters,
    clearFilters,
}: FilterPanelProps) => (
    <div className="space-y-6">
        {/* Coalition/Opposition Filter */}
        <div>
            <h4 className="font-semibold text-foreground mb-3">Statuss</h4>
            <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox
                        checked={filterCoalition}
                        onCheckedChange={(c) => setFilterCoalition(!!c)}
                    />
                    <span className="text-sm text-foreground">Koalīcijā</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox
                        checked={filterOpposition}
                        onCheckedChange={(c) => setFilterOpposition(!!c)}
                    />
                    <span className="text-sm text-foreground">Opozīcijā</span>
                </label>
            </div>
        </div>

        {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="w-full">
                Notīrīt filtrus
            </Button>
        )}
    </div>
));

FilterPanel.displayName = 'FilterPanel';

export function PartiesClient({ parties, politicians, promises }: PartiesClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCoalition, setFilterCoalition] = useState(false);
    const [filterOpposition, setFilterOpposition] = useState(false);
    const [sortBy, setSortBy] = useState('alphabetical-asc');

    // Helper to get promises by party
    const getPromisesByParty = (partyId: string) =>
        promises.filter(p => p.partyId === partyId);

    // Helper to get politicians by party
    const getPoliticiansByParty = (partyId: string) =>
        politicians.filter(p => p.partyId === partyId);

    const filteredParties = useMemo(() => {
        let result = [...parties];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.abbreviation.toLowerCase().includes(query)
            );
        }

        // Filters
        if (filterCoalition || filterOpposition) {
            result = result.filter(p => {
                if (filterCoalition && p.isInCoalition) return true;
                if (filterOpposition && !p.isInCoalition) return true;
                return false;
            });
        }

        // Sorting
        result.sort((a, b) => {
            const aPromises = getPromisesByParty(a.id);
            const aTotal = aPromises.length;
            const aKept = aPromises.filter(p => p.status === 'kept').length;
            const aPercentage = aTotal > 0 ? (aKept / aTotal) * 100 : 0;

            const bPromises = getPromisesByParty(b.id);
            const bTotal = bPromises.length;
            const bKept = bPromises.filter(p => p.status === 'kept').length;
            const bPercentage = bTotal > 0 ? (bKept / bTotal) * 100 : 0;

            switch (sortBy) {
                case 'alphabetical-asc':
                    return a.name.localeCompare(b.name);
                case 'alphabetical-desc':
                    return b.name.localeCompare(a.name);
                case 'mps-asc':
                    return a.mpCount - b.mpCount;
                case 'mps-desc':
                    return b.mpCount - a.mpCount;
                case 'kept-percentage-asc':
                    return aPercentage - bPercentage;
                case 'kept-percentage-desc':
                    return bPercentage - aPercentage;
                case 'kept-count-asc':
                    return aKept - bKept;
                case 'kept-count-desc':
                    return bKept - aKept;
                default:
                    return 0;
            }
        });

        return result;
    }, [parties, searchQuery, filterCoalition, filterOpposition, sortBy, promises]);

    const clearFilters = () => {
        setSearchQuery('');
        setFilterCoalition(false);
        setFilterOpposition(false);
    };

    const hasActiveFilters = !!searchQuery || filterCoalition || filterOpposition;

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
                            Partijas
                        </h1>
                        <p className="text-muted-foreground">
                            {parties.length} Latvijas politiskās partijas un to solījumi
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-8">
                <div className="container-wide">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block w-72 flex-shrink-0">
                            <Card className="sticky top-24 border-border/50">
                                <CardContent className="p-5">
                                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Filtri
                                    </h3>
                                    <FilterPanel
                                        filterCoalition={filterCoalition}
                                        setFilterCoalition={setFilterCoalition}
                                        filterOpposition={filterOpposition}
                                        setFilterOpposition={setFilterOpposition}
                                        hasActiveFilters={hasActiveFilters}
                                        clearFilters={clearFilters}
                                    />
                                </CardContent>
                            </Card>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                            {/* Search & Sort Bar */}
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Input
                                        type="search"
                                        placeholder="Meklēt partijas..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>

                                {/* Mobile Filter Button */}
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="lg:hidden gap-2 w-full md:w-auto">
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
                                        <div className="mt-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                                            <FilterPanel
                                                filterCoalition={filterCoalition}
                                                setFilterCoalition={setFilterCoalition}
                                                filterOpposition={filterOpposition}
                                                setFilterOpposition={setFilterOpposition}
                                                hasActiveFilters={hasActiveFilters}
                                                clearFilters={clearFilters}
                                            />
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                {/* Sort */}
                                <div className="relative w-full md:w-auto min-w-[200px]">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none h-10 pl-3 pr-10 w-full rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="alphabetical-asc">A↑Z</option>
                                        <option value="alphabetical-desc">Z↓A</option>
                                        <option value="mps-asc">1↑99</option>
                                        <option value="mps-desc">99↓1</option>
                                        <option value="kept-percentage-asc">% izpildīts ↑</option>
                                        <option value="kept-percentage-desc">% izpildīts ↓</option>
                                        <option value="kept-count-asc"># izpildīts ↑</option>
                                        <option value="kept-count-desc"># izpildīts ↓</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {hasActiveFilters && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {filterCoalition && (
                                        <button
                                            onClick={() => setFilterCoalition(false)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-foreground hover:bg-muted/80"
                                        >
                                            Koalīcijā
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                    {filterOpposition && (
                                        <button
                                            onClick={() => setFilterOpposition(false)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-foreground hover:bg-muted/80"
                                        >
                                            Opozīcijā
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
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
                                Atrastas {filteredParties.length} partijas
                            </p>

                            {filteredParties.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {filteredParties.map((party, index) => {
                                        const partyPromises = getPromisesByParty(party.id);
                                        const partyPoliticians = getPoliticiansByParty(party.id);
                                        const keptCount = partyPromises.filter(p => p.status === 'kept').length;
                                        const partiallyKeptCount = partyPromises.filter(p => p.status === 'partially-kept').length;
                                        const inProgressCount = partyPromises.filter(p => p.status === 'in-progress').length;
                                        const brokenCount = partyPromises.filter(p => p.status === 'broken').length;
                                        const notRatedCount = partyPromises.filter(p => p.status === 'not-rated').length;
                                        const total = partyPromises.length;

                                        return (
                                            <motion.div
                                                key={party.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                            >
                                                <Link href={`/parties/${party.id}`} className="block h-full">
                                                    <Card className="group overflow-hidden border-border/50 hover:shadow-elevated hover:border-border transition-all duration-300 h-full">
                                                        <CardContent className="p-6">
                                                            {/* Party Header - Politician Card Style */}
                                                            <div className="flex flex-col gap-1 mb-4">
                                                                <div className="flex items-center gap-2 flex-wrap max-w-full">
                                                                    <h3 className="text-sm font-semibold text-foreground leading-tight truncate group-hover:text-accent transition-colors">
                                                                        {party.name}
                                                                    </h3>
                                                                    {/* Party badge removed */}
                                                                </div>

                                                                <div className="flex items-center gap-2 mt-0">
                                                                    {party.description && (
                                                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                                            {party.description}
                                                                        </span>
                                                                    )}
                                                                    {party.isInCoalition ? (
                                                                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
                                                                            Koalīcijā
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
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
                                                                    {keptCount > 0 && (
                                                                        <div
                                                                            className="h-full bg-status-kept"
                                                                            style={{ width: `${(keptCount / total) * 100}%` }}
                                                                        />
                                                                    )}
                                                                    {partiallyKeptCount > 0 && (
                                                                        <div
                                                                            className="h-full bg-status-partially"
                                                                            style={{ width: `${(partiallyKeptCount / total) * 100}%` }}
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
                                                                    {notRatedCount > 0 && (
                                                                        <div
                                                                            className="h-full bg-status-unrated"
                                                                            style={{ width: `${(notRatedCount / total) * 100}%` }}
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Politicians count (Optional - keeping generic icon style for now or removing if strictly following politician card which has no extra footer) */}
                                                            {/* Removed User icon footer to match PoliticianCard exact style which ends with progress bar */}
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Card className="border-border/50">
                                    <CardContent className="py-16 text-center">
                                        <p className="text-muted-foreground">
                                            Nav atrastas partijas ar izvēlētajiem filtriem.
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
}
