"use client";

import { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PromiseCard } from '@/components/PromiseCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CATEGORIES, PromiseStatus, STATUS_CONFIG } from '@/lib/types';
import { Search, Filter, X, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PromiseUI, PartyUI } from '@/lib/db';
import { useDebounce } from '@/hooks/use-debounce';

const STATUSES: PromiseStatus[] = ['kept', 'partially-kept', 'in-progress', 'broken', 'cancelled'];
const ITEMS_PER_PAGE = 30;

interface PromisesClientProps {
    initialPromises: PromiseUI[];
    parties: PartyUI[];
}

interface FilterPanelProps {
    selectedStatuses: PromiseStatus[];
    toggleStatus: (status: PromiseStatus) => void;
    parties: PartyUI[];
    selectedParties: string[];
    toggleParty: (partyId: string) => void;
    selectedCategories: string[];
    toggleCategory: (categoryId: string) => void;
    // hasActiveFilters: boolean;
    // clearFilters: () => void;
}

const FilterPanel = memo(({
    selectedStatuses,
    toggleStatus,
    parties,
    selectedParties,
    toggleParty,
    selectedCategories,
    toggleCategory,
    // hasActiveFilters,
    // clearFilters
}: FilterPanelProps) => (
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

        {/* Clear Filters - Hidden in FilterPanel, shown separately in mobile sheet */}
    </div>
));

FilterPanel.displayName = 'FilterPanel';

export function PromisesClient({ initialPromises, parties }: PromisesClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Derived state from URL
    const currentPage = Number(searchParams.get('page')) || 1;
    const selectedStatuses = useMemo(() => searchParams.get('status')?.split(',').filter(Boolean) as PromiseStatus[] || [], [searchParams]);
    const selectedParties = useMemo(() => searchParams.get('party')?.split(',').filter(Boolean) || [], [searchParams]);
    const selectedCategories = useMemo(() => searchParams.get('category')?.split(',').filter(Boolean) || [], [searchParams]);
    const sortBy = (searchParams.get('sort') as string) || 'updated-desc';
    const searchQuery = searchParams.get('q') || '';

    // Local state only for search input to avoid stuttering
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    // Sync local search query when URL changes (e.g. back button)
    useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    // Helper to update URL with new params
    const updateUrl = useCallback((newParams: URLSearchParams) => {
        const queryString = newParams.toString();
        const url = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(url, { scroll: false });
    }, [pathname, router]);

    // Debounce search query updates to URL
    const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

    // We no longer sync search query to URL 'on the fly' to prevent glitches.
    // The URL is only used for initial state.
    // If we wanted to, we could sync only on page exit or specific actions, but user requested removal.

    // Update local state immediately
    const handleSearchChange = (value: string) => {
        setLocalSearchQuery(value);
    };

    const filteredPromises = useMemo(() => {
        let result = [...initialPromises];

        // Search filter
        // Search filter - uses debounced local state instead of URL param
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            result = result.filter(p => {
                return (
                    p.title.toLowerCase().includes(query) ||
                    p.fullText.toLowerCase().includes(query) ||
                    (p.politicianName && p.politicianName.toLowerCase().includes(query)) ||
                    (p.politicianRole && p.politicianRole.toLowerCase().includes(query)) ||
                    (p.partyName && p.partyName.toLowerCase().includes(query)) ||
                    p.tags.some(t => t.toLowerCase().includes(query))
                );
            });
        }

        // Status filter
        if (selectedStatuses.length > 0) {
            result = result.filter(p => selectedStatuses.includes(p.status));
        }

        // Party filter
        if (selectedParties.length > 0) {
            result = result.filter(p => {
                // Check direct party association (Individual/Party)
                if (p.partyId && selectedParties.includes(p.partyId)) return true;

                // Check coalition parties
                if (p.type === 'COALITION' && p.coalitionParties) {
                    return p.coalitionParties.some(cp => selectedParties.includes(cp.slug));
                }

                return false;
            });
        }

        // Category filter
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.categorySlug));
        }

        // Sorting
        switch (sortBy) {
            case 'updated-desc':
                result.sort((a, b) => new Date(b.statusUpdatedAt).getTime() - new Date(a.statusUpdatedAt).getTime());
                break;
            case 'updated-asc':
                result.sort((a, b) => new Date(a.statusUpdatedAt).getTime() - new Date(b.statusUpdatedAt).getTime());
                break;
            case 'date-desc':
                result.sort((a, b) => new Date(b.datePromised).getTime() - new Date(a.datePromised).getTime());
                break;
            case 'date-asc':
                result.sort((a, b) => new Date(a.datePromised).getTime() - new Date(b.datePromised).getTime());
                break;
        }

        return result;
    }, [debouncedSearchQuery, selectedStatuses, selectedParties, selectedCategories, sortBy, initialPromises]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredPromises.length / ITEMS_PER_PAGE);
    const paginatedPromises = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPromises.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredPromises, currentPage]);

    // View mode local state
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const toggleStatus = useCallback((status: PromiseStatus) => {
        const params = new URLSearchParams(searchParams.toString());
        const current = new Set(params.get('status')?.split(',').filter(Boolean) || []);

        if (current.has(status)) current.delete(status);
        else current.add(status);

        if (current.size > 0) params.set('status', Array.from(current).join(','));
        else params.delete('status');

        params.delete('page'); // Reset pagination
        updateUrl(params);
    }, [searchParams, updateUrl]);

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

    const toggleCategory = useCallback((categoryId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const current = new Set(params.get('category')?.split(',').filter(Boolean) || []);

        if (current.has(categoryId)) current.delete(categoryId);
        else current.add(categoryId);

        if (current.size > 0) params.set('category', Array.from(current).join(','));
        else params.delete('category');

        params.delete('page'); // Reset pagination
        updateUrl(params);
    }, [searchParams, updateUrl]);

    const clearFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('status');
        params.delete('party');
        params.delete('category');
        params.delete('q');
        params.delete('page');
        setLocalSearchQuery('');
        updateUrl(params);
    }, [searchParams, updateUrl]);

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value !== 'updated-desc') params.set('sort', value);
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

    const hasActiveFilters = selectedStatuses.length > 0 || selectedParties.length > 0 || selectedCategories.length > 0 || !!debouncedSearchQuery;

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
                            Pārlūkojiet un filtrējiet {initialPromises.length} politiķu solījumus
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filters & Content */}
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
                                        selectedStatuses={selectedStatuses}
                                        toggleStatus={toggleStatus}
                                        parties={parties}
                                        selectedParties={selectedParties}
                                        toggleParty={toggleParty}
                                        selectedCategories={selectedCategories}
                                        toggleCategory={toggleCategory}
                                    // hasActiveFilters={hasActiveFilters}
                                    // clearFilters={clearFilters}
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
                                        placeholder="Meklēt solījumus..."
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
                                                selectedStatuses={selectedStatuses}
                                                toggleStatus={toggleStatus}
                                                parties={parties}
                                                selectedParties={selectedParties}
                                                toggleParty={toggleParty}
                                                selectedCategories={selectedCategories}
                                                toggleCategory={toggleCategory}
                                            // hasActiveFilters={hasActiveFilters}
                                            // clearFilters={clearFilters}
                                            />
                                        </div>
                                        {hasActiveFilters && (
                                            <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border">
                                                <Button variant="outline" onClick={clearFilters} className="w-full">
                                                    Notīrīt filtrus
                                                </Button>
                                            </div>
                                        )}
                                    </SheetContent>
                                </Sheet>

                                {/* Sort */}
                                <div className="relative w-full md:w-auto min-w-[200px]">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                        className="appearance-none h-10 pl-3 pr-10 w-full rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="updated-desc">Pēdējie atjaunināti ↓</option>
                                        <option value="updated-asc">Pēdējie atjaunināti ↑</option>
                                        <option value="date-desc">Datums ↓</option>
                                        <option value="date-asc">Datums ↑</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            {/* Active Filters */}
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
                                        className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium ml-2"
                                    >
                                        Notīrīt visus
                                    </button>
                                </div>
                            )}

                            {/* Results Count */}
                            <p className="text-sm text-muted-foreground mb-6">
                                Atrasti {filteredPromises.length} solījumi
                                {totalPages > 1 && ` • Lapa ${currentPage} no ${totalPages}`}
                            </p>

                            {paginatedPromises.length > 0 ? (
                                <>
                                    <div className={viewMode === 'grid'
                                        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                                        : 'space-y-4'
                                    }>
                                        {paginatedPromises.map((promise, index) => (
                                            <PromiseCard key={promise.id} promise={promise} index={index} />
                                        ))}
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
            </section >
        </div >
    );
}
