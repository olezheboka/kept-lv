"use client";

import { useState, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Filter, SlidersHorizontal, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { PoliticianWithStats, PartyUI } from '@/lib/db';
import { useDebounce } from '@/hooks/use-debounce';

const ITEMS_PER_PAGE = 30;

interface PoliticiansClientProps {
    politicians: PoliticianWithStats[];
    parties: PartyUI[];
}

interface FilterPanelProps {
    showInOffice: boolean;
    setShowInOffice: (val: boolean) => void;
    parties: PartyUI[];
    selectedParties: string[];
    toggleParty: (partyId: string) => void;

    // hasActiveFilters: boolean;
    // clearFilters: () => void;
}

const FilterPanel = memo(({
    showInOffice,
    setShowInOffice,
    parties,
    selectedParties,
    toggleParty,
    // hasActiveFilters,
    // clearFilters,
}: FilterPanelProps) => (
    <div className="space-y-6">
        {/* In Office Filter */}
        <div>
            <h4 className="font-semibold text-foreground mb-3">Statuss</h4>
            <div className="flex items-center space-x-2">
                <Switch
                    id="in-office-filter"
                    checked={showInOffice}
                    onCheckedChange={setShowInOffice}
                />
                <Label htmlFor="in-office-filter" className="cursor-pointer font-normal">
                    Tikai amatā esošie
                </Label>
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

        {/* Clear Filters - Hidden in FilterPanel, shown separately in mobile sheet */}
    </div>
));

FilterPanel.displayName = 'FilterPanel';

export function PoliticiansClient({ politicians, parties }: PoliticiansClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Derived state from URL
    const currentPage = Number(searchParams.get('page')) || 1;
    const selectedParties = useMemo(() => searchParams.get('party')?.split(',').filter(Boolean) || [], [searchParams]);
    const showInOffice = searchParams.get('inOffice') === 'true';
    const sortBy = searchParams.get('sort') || 'kept-percentage-desc';
    const searchQuery = searchParams.get('q') || '';

    // Local state only for search input
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    // Debounce search query updates
    const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

    // Helper to update URL with new params
    const updateUrl = useCallback((newParams: URLSearchParams) => {
        const queryString = newParams.toString();
        const url = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(url, { scroll: false });
    }, [pathname, router]);

    // Update local state immediately
    const handleSearchChange = (value: string) => {
        setLocalSearchQuery(value);
    };

    // Helper to get party by ID
    // const getPartyById = (partyId: string | undefined) => parties.find(p => p.id === partyId);

    // Helper to get promises by politician
    // Helper to get promises by politician removed as stats are pre-calculated

    const filteredPoliticians = useMemo(() => {
        let result = [...politicians];

        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
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
        result.sort((a, b) => {
            const aPercentage = a.stats.total > 0 ? (a.stats.kept / a.stats.total) * 100 : 0;
            const bPercentage = b.stats.total > 0 ? (b.stats.kept / b.stats.total) * 100 : 0;
            const aKept = a.stats.kept;
            const bKept = b.stats.kept;

            if (sortBy === 'kept-percentage-asc') {
                return aPercentage - bPercentage;
            } else if (sortBy === 'kept-percentage-desc') {
                return bPercentage - aPercentage;
            } else if (sortBy === 'kept-count-asc') {
                return aKept - bKept;
            } else if (sortBy === 'kept-count-desc') {
                return bKept - aKept;
            }
            return 0;
        });

        return result;
    }, [debouncedSearchQuery, selectedParties, showInOffice, sortBy, politicians]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredPoliticians.length / ITEMS_PER_PAGE);
    const paginatedPoliticians = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPoliticians.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredPoliticians, currentPage]);



    const toggleParty = useCallback((partyId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const current = new Set(params.get('party')?.split(',').filter(Boolean) || []);

        if (current.has(partyId)) current.delete(partyId);
        else current.add(partyId);

        if (current.size > 0) params.set('party', Array.from(current).join(','));
        else params.delete('party');

        params.delete('page'); // Reset pagination
        updateUrl(params);
    }, [searchParams, updateUrl]);

    const handleInOfficeChange = useCallback((checked: boolean) => {
        const params = new URLSearchParams(searchParams.toString());
        if (checked) params.set('inOffice', 'true');
        else params.delete('inOffice');
        params.delete('page'); // Reset pagination
        updateUrl(params);
    }, [searchParams, updateUrl]);

    const clearFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('party');
        params.delete('inOffice');
        params.delete('q');
        params.delete('page');
        setLocalSearchQuery('');
        updateUrl(params);
    }, [searchParams, updateUrl]);

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value !== 'kept-percentage-desc') params.set('sort', value);
        else params.delete('sort');
        params.delete('page'); // Reset pagination
        updateUrl(params);
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page > 1) params.set('page', page.toString());
        else params.delete('page');
        updateUrl(params);
    };

    const hasActiveFilters = selectedParties.length > 0 || showInOffice || !!debouncedSearchQuery;

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
                                        showInOffice={showInOffice}
                                        setShowInOffice={handleInOfficeChange}
                                        parties={parties}
                                        selectedParties={selectedParties}
                                        toggleParty={toggleParty}

                                    />
                                    {hasActiveFilters && (
                                        <Button variant="outline" onClick={clearFilters} className="w-full mt-4">
                                            Notīrīt filtrus
                                        </Button>
                                    )}
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
                                        placeholder="Meklēt politiķus..."
                                        value={localSearchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
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
                                    <SheetContent side="left" className="w-80 flex flex-col">
                                        <SheetHeader>
                                            <SheetTitle>Filtri</SheetTitle>
                                        </SheetHeader>
                                        <div className="mt-6 overflow-y-auto flex-1">
                                            <FilterPanel
                                                showInOffice={showInOffice}
                                                setShowInOffice={handleInOfficeChange}
                                                parties={parties}
                                                selectedParties={selectedParties}
                                                toggleParty={toggleParty}

                                            />
                                        </div>
                                        <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border space-y-2">
                                            <SheetClose asChild>
                                                <Button className="w-full">Piemērot filtrus</Button>
                                            </SheetClose>
                                            {hasActiveFilters && (
                                                <Button variant="outline" onClick={clearFilters} className="w-full">
                                                    Notīrīt filtrus
                                                </Button>
                                            )}
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                {/* Sort */}
                                <div className="relative w-full md:w-auto min-w-[200px]">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                        className="appearance-none h-10 pl-3 pr-10 w-full rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="kept-percentage-desc">% izpildīts ↓</option>
                                        <option value="kept-percentage-asc">% izpildīts ↑</option>
                                        <option value="kept-count-desc"># izpildīts ↓</option>
                                        <option value="kept-count-asc"># izpildīts ↑</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {hasActiveFilters && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {!!debouncedSearchQuery && (
                                        <button
                                            onClick={() => handleSearchChange('')}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-foreground hover:bg-muted/80"
                                        >
                                            <Search className="h-3 w-3" />
                                            {debouncedSearchQuery}
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                    {showInOffice && (
                                        <button
                                            onClick={() => handleInOfficeChange(false)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-foreground hover:bg-muted/80"
                                        >
                                            Tikai amatā
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
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
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium ml-2"
                                    >
                                        Notīrīt visus
                                    </button>
                                </div>
                            )}

                            {/* Results Count */}
                            <p className="text-sm text-muted-foreground mb-6">
                                Atrasti {filteredPoliticians.length} politiķi
                                {totalPages > 1 && ` • Lapa ${currentPage} no ${totalPages}`}
                            </p>

                            {/* Politicians Grid */}
                            {paginatedPoliticians.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                        {paginatedPoliticians.map((politician, index) => {
                                            const keptCount = politician.stats.kept;
                                            const partiallyKeptCount = politician.stats.partiallyKept;
                                            const inProgressCount = politician.stats.pending;
                                            const brokenCount = politician.stats.broken;
                                            const cancelledCount = politician.stats.cancelled;
                                            const total = politician.stats.total;

                                            return (
                                                <motion.div
                                                    key={politician.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.4, delay: index * 0.03 }}
                                                >
                                                    <Link href={`/politicians/${politician.slug}`}>
                                                        <Card className="group overflow-hidden border-border/50 hover:shadow-elevated hover:border-border transition-all duration-300">
                                                            <CardContent className="p-5">
                                                                <div className="flex flex-col gap-1 mb-4">
                                                                    <div className="flex items-center gap-2 flex-wrap max-w-full">
                                                                        <h3 className="text-sm font-semibold text-foreground leading-tight truncate group-hover:text-accent transition-colors">
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
                                                                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
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
                                                                                className="h-full bg-status-pending"
                                                                                style={{ width: `${(inProgressCount / total) * 100}%` }}
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
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-2 mt-8">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                <span className="hidden sm:inline ml-1">Iepriekšējā</span>
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum: number;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={currentPage === pageNum ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className="w-10"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                <span className="hidden sm:inline mr-1">Nākamā</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Card className="border-border/50">
                                    <CardContent className="py-16 text-center text-muted-foreground">
                                        Nav atrasti politiķi ar izvēlētajiem filtriem.
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
