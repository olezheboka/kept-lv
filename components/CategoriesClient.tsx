"use client";

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CategoryWithStats } from '@/lib/db';
import { TrendingUp, ChevronLeft, ChevronRight, Search, ChevronDown, X } from 'lucide-react';
import { SLUG_ICON_MAP } from '@/lib/categoryIcons';
import { useDebounce } from '@/hooks/use-debounce';

interface CategoriesClientProps {
    categories: CategoryWithStats[];
}

const ITEMS_PER_PAGE = 30;

export const CategoriesClient = ({ categories }: CategoriesClientProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Derived state from URL
    const currentPage = Number(searchParams.get('page')) || 1;
    const sortBy = searchParams.get('sort') || 'alphabetical-asc';
    const searchQuery = searchParams.get('q') || '';

    // Local state for search input
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

    // Sync debounced search to URL
    useMemo(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
        else params.delete('q');
        params.delete('page'); // Reset pagination on search

        // Only update if the query actually changed
        const currentQ = searchParams.get('q') || '';
        if (currentQ !== debouncedSearchQuery) {
            updateUrl(params);
        }
    }, [debouncedSearchQuery, searchParams, updateUrl]);

    // Filtered and sorted categories
    const filteredCategories = useMemo(() => {
        let result = [...categories];

        // Search
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(query) ||
                (c.description && c.description.toLowerCase().includes(query))
            );
        }

        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'alphabetical-asc':
                    return a.name.localeCompare(b.name, 'lv');
                case 'alphabetical-desc':
                    return b.name.localeCompare(a.name, 'lv');
                case 'promises-asc':
                    return a.stats.total - b.stats.total;
                case 'promises-desc':
                    return b.stats.total - a.stats.total;
                default:
                    return 0;
            }
        });

        return result;
    }, [categories, debouncedSearchQuery, sortBy]);

    const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCategories, currentPage]);

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value !== 'alphabetical-asc') params.set('sort', value);
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

    const clearSearch = useCallback(() => {
        setLocalSearchQuery('');
        const params = new URLSearchParams(searchParams.toString());
        params.delete('q');
        params.delete('page');
        updateUrl(params);
    }, [searchParams, updateUrl]);

    const hasActiveFilters = !!debouncedSearchQuery;

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
                            Kategorijas
                        </h1>
                        <p className="text-muted-foreground">
                            Pārlūkojiet solījumus pēc politikas jomas
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-8 md:py-12">
                <div className="container-wide">
                    {/* Search & Sort Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Input
                                type="search"
                                placeholder="Meklēt kategorijas..."
                                value={localSearchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>

                        {/* Sort */}
                        <div className="relative w-full md:w-auto min-w-[200px]">
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="appearance-none h-10 pl-3 pr-10 w-full rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="alphabetical-asc">A↑Z</option>
                                <option value="alphabetical-desc">Z↓A</option>
                                <option value="promises-asc"># solījumi ↑</option>
                                <option value="promises-desc"># solījumi ↓</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {!!debouncedSearchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-foreground hover:bg-muted/80"
                                >
                                    <Search className="h-3 w-3" />
                                    {debouncedSearchQuery}
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                            <button
                                onClick={clearSearch}
                                className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium ml-2"
                            >
                                Notīrīt visus
                            </button>
                        </div>
                    )}

                    {/* Results Count */}
                    <p className="text-sm text-muted-foreground mb-6">
                        Atrastas {filteredCategories.length} kategorijas
                        {totalPages > 1 && ` • Lapa ${currentPage} no ${totalPages}`}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {paginatedCategories.map((category, index) => {
                            const { total, kept, partiallyKept, pending, broken, cancelled } = category.stats;

                            return (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.03 }}
                                >
                                    <Link href={`/categories/${category.slug}`} className="block h-full">
                                        <Card className="group overflow-hidden border-border/50 hover:shadow-elevated hover:border-border transition-all duration-300 h-full">
                                            <CardContent className="p-6 flex flex-col h-full">
                                                {/* Header Step */}
                                                <div className="flex items-center gap-4 mb-6">
                                                    {/* Icon */}
                                                    <div className="shrink-0">
                                                        {category.imageUrl ? (
                                                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={category.imageUrl}
                                                                    alt={category.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                                                {(() => {
                                                                    const IconComponent = SLUG_ICON_MAP[category.slug] || TrendingUp;
                                                                    return <IconComponent className="h-6 w-6" />;
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-foreground leading-tight group-hover:text-accent transition-colors mb-1">
                                                            {category.name}
                                                        </h3>
                                                        {category.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                                {category.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stats Bar (Always Visible) */}
                                                <div className="mt-auto">
                                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                                                        <span>{total} solījumi</span>
                                                        <span>{total > 0 ? Math.round((kept / total) * 100) : 0}% izpildīti</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                                                        {kept > 0 && (
                                                            <div
                                                                className="h-full bg-status-kept"
                                                                style={{ width: `${(kept / total) * 100}%` }}
                                                            />
                                                        )}
                                                        {partiallyKept > 0 && (
                                                            <div
                                                                className="h-full bg-status-partially"
                                                                style={{ width: `${(partiallyKept / total) * 100}%` }}
                                                            />
                                                        )}
                                                        {pending > 0 && (
                                                            <div
                                                                className="h-full bg-status-progress"
                                                                style={{ width: `${(pending / total) * 100}%` }}
                                                            />
                                                        )}
                                                        {broken > 0 && (
                                                            <div
                                                                className="h-full bg-status-broken"
                                                                style={{ width: `${(broken / total) * 100}%` }}
                                                            />
                                                        )}
                                                        {cancelled > 0 && (
                                                            <div
                                                                className="h-full bg-status-unrated-bar"
                                                                style={{ width: `${(cancelled / total) * 100}%` }}
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

                    {/* Empty state */}
                    {paginatedCategories.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Nav atrasta neviena kategorija</p>
                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearSearch} className="mt-4">
                                    Notīrīt meklēšanu
                                </Button>
                            )}
                        </div>
                    )}

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
                </div>
            </section>
        </div>
    );
};
