"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Search, Eye, Pencil, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface PromiseData {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    status: string;
    explanation?: string | null;
    dateOfPromise: Date | string;
    statusUpdatedAt?: Date | string | null;
    politicianId: string;
    categoryId: string;
    tags: string[];
    politician: { name: string };
    category: { name: string; slug: string };
    updatedAt: Date | string;
    createdAt: Date | string;
    searchText?: string; // Add optional property for optimization
}

interface PromiseClientPageProps {
    initialPromises: PromiseData[];
}

import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";

const ITEMS_PER_PAGE = 30;

export default function PromiseClientPage({ initialPromises }: PromiseClientPageProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Search State
    const searchQuery = searchParams.get('q') || '';
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Derived state from URL for Pagination
    const currentPage = Number(searchParams.get('page')) || 1;

    // Sync local search query when URL changes
    useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    // Handle search input change with debounce
    const handleSearchChange = (value: string) => {
        setLocalSearchQuery(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set('q', value);
            } else {
                params.delete('q');
            }
            params.delete('page'); // Reset pagination on search
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }, 300);
    };

    // Extract unique options for filters
    const authorOptions = useMemo(() => {
        const distinct = new Map();
        initialPromises.forEach(p => {
            if (p.politician) {
                distinct.set(p.politicianId, { label: p.politician.name, value: p.politicianId });
            }
        });
        return Array.from(distinct.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [initialPromises]);

    const categoryOptions = useMemo(() => {
        const distinct = new Map();
        initialPromises.forEach(p => {
            if (p.category) {
                distinct.set(p.categoryId, { label: p.category.name, value: p.categoryId });
            }
        });
        return Array.from(distinct.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [initialPromises]);

    // Pre-compute searchable text for optimization
    const promisesWithSearchText = useMemo(() => {
        return initialPromises.map(p => ({
            ...p,
            searchText: (
                p.title + " " +
                p.status + " " +
                p.politician.name + " " +
                (p.description || "") + " " +
                (p.explanation || "") + " " +
                p.tags.join(" ")
            ).toLowerCase()
        }));
    }, [initialPromises]);

    // Filter promises
    const filteredPromises = useMemo(() => {
        let result = promisesWithSearchText;

        if (selectedAuthors.length > 0) {
            result = result.filter(p => selectedAuthors.includes(p.politicianId));
        }

        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.categoryId));
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => p.searchText.includes(query));
        }

        return result;
    }, [promisesWithSearchText, selectedAuthors, selectedCategories, searchQuery]);

    // Sort promises
    const sortedPromises = useMemo(() => {
        const sortablePromises = [...filteredPromises];
        if (sortConfig !== null) {
            sortablePromises.sort((a, b) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let aValue: any = a[sortConfig.key as keyof PromiseData];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let bValue: any = b[sortConfig.key as keyof PromiseData];

                // Handle nested properties
                if (sortConfig.key === 'politician') {
                    aValue = a.politician.name;
                    bValue = b.politician.name;
                } else if (sortConfig.key === 'category') {
                    aValue = a.category.name;
                    bValue = b.category.name;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortablePromises;
    }, [filteredPromises, sortConfig]);

    // Pagination calculations
    const totalPages = Math.ceil(sortedPromises.length / ITEMS_PER_PAGE);
    const paginatedPromises = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedPromises.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedPromises, currentPage]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
        }
        if (sortConfig.direction === 'asc') {
            return <ArrowUp className="w-3 h-3 text-gray-900" />;
        }
        return <ArrowDown className="w-3 h-3 text-gray-900" />;
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page > 1) params.set('page', page.toString());
        else params.delete('page');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Promises"
                description="Track and manage political promises"
                count={filteredPromises.length}
                breadcrumbs={[
                    { label: "Overview", href: "/admin" },
                    { label: "Promises" },
                ]}
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-[350px]">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search promises..."
                            value={localSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="bg-white pl-9"
                        />
                    </div>
                </div>
                <div className="w-full sm:w-[250px]">
                    <MultiSelectDropdown
                        options={authorOptions}
                        selected={selectedAuthors}
                        onChange={setSelectedAuthors}
                        placeholder="Select authors"
                        searchPlaceholder="Filter authors..."
                        emptyMessage="No authors found"
                        className="w-full bg-white"
                    />
                </div>
                <div className="w-full sm:w-[250px]">
                    <MultiSelectDropdown
                        options={categoryOptions}
                        selected={selectedCategories}
                        onChange={setSelectedCategories}
                        placeholder="Select categories"
                        searchPlaceholder="Filter categories..."
                        emptyMessage="No categories found"
                        className="w-full bg-white"
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#F9FAFB] border-b border-gray-100">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[45%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3 pl-6">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('title')}
                                >
                                    TITLE
                                    {getSortIcon('title')}
                                </div>
                            </TableHead>
                            <TableHead className="min-w-[150px] font-medium text-xs uppercase tracking-wider text-gray-500 py-3">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('status')}
                                >
                                    STATUS
                                    {getSortIcon('status')}
                                </div>
                            </TableHead>
                            <TableHead className="font-medium text-xs uppercase tracking-wider text-gray-500 py-3">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('statusUpdatedAt')}
                                >
                                    STATUS UPDATE
                                    {getSortIcon('statusUpdatedAt')}
                                </div>
                            </TableHead>
                            <TableHead className="font-medium text-xs uppercase tracking-wider text-gray-500 py-3">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('updatedAt')}
                                >
                                    UPDATED
                                    {getSortIcon('updatedAt')}
                                </div>
                            </TableHead>
                            <TableHead className="font-medium text-xs uppercase tracking-wider text-gray-500 py-3">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('createdAt')}
                                >
                                    ADDED
                                    {getSortIcon('createdAt')}
                                </div>
                            </TableHead>
                            <TableHead className="text-right font-medium text-xs uppercase tracking-wider text-gray-500 py-3 pr-6">
                                ACTIONS
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedPromises.map((promise) => {
                            // Status Styles Mapping
                            let statusBadgeClass = "bg-gray-100 text-gray-700 hover:bg-gray-100"; // Default Not Rated
                            if (promise.status === "KEPT") statusBadgeClass = "bg-green-500 text-white hover:bg-green-600 border-transparent";
                            if (promise.status === "IN_PROGRESS") statusBadgeClass = "bg-blue-500 text-white hover:bg-blue-600 border-transparent";
                            if (promise.status === "PARTIAL") statusBadgeClass = "bg-orange-500 text-white hover:bg-orange-600 border-transparent";
                            if (promise.status === "NOT_KEPT") statusBadgeClass = "bg-red-500 text-white hover:bg-red-600 border-transparent";
                            if (promise.status === "ABANDONED") statusBadgeClass = "bg-red-500 text-white hover:bg-red-600 border-transparent";
                            if (promise.status === "NOT_RATED") statusBadgeClass = "bg-gray-200 text-gray-700 hover:bg-gray-300 border-transparent";

                            const statusLabel = promise.status === 'ABANDONED' ? 'Not Kept' :
                                promise.status === 'PARTIAL' ? 'Partially Kept' :
                                    promise.status === 'IN_PROGRESS' ? 'In Progress' :
                                        promise.status === 'NOT_RATED' ? 'Not Rated' :
                                            promise.status === 'KEPT' ? 'Kept' :
                                                promise.status === 'NOT_KEPT' ? 'Not Kept' : promise.status;

                            return (
                                <TableRow key={promise.id} className="group hover:bg-gray-50 border-gray-200">
                                    <TableCell className="align-middle py-4 pl-6">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-gray-900 line-clamp-1 text-sm">
                                                {promise.title}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {promise.politician.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-middle py-4">
                                        <Badge
                                            className={cn(
                                                "font-medium rounded-full px-2 py-0 text-[10px] shadow-none h-5 leading-none flex items-center justify-center w-fit",
                                                statusBadgeClass
                                            )}
                                        >
                                            {statusLabel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="align-middle py-4 text-gray-500 text-[10px] whitespace-nowrap">
                                        {promise.statusUpdatedAt ? new Date(promise.statusUpdatedAt).toLocaleString("lv-LV", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false
                                        }) : "—"}
                                    </TableCell>
                                    <TableCell className="align-middle py-4 text-gray-500 text-[10px] whitespace-nowrap">
                                        {new Date(promise.updatedAt).toLocaleString("lv-LV", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false
                                        })}
                                    </TableCell>
                                    <TableCell className="align-middle py-4 text-gray-500 text-[10px] whitespace-nowrap">
                                        {new Date(promise.createdAt).toLocaleString("lv-LV", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false
                                        })}
                                    </TableCell>
                                    <TableCell className="align-middle py-4 text-right pr-6">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={(() => {
                                                    const date = new Date(promise.dateOfPromise);
                                                    const day = date.getDate().toString().padStart(2, '0');
                                                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                                    const year = date.getFullYear();
                                                    const dateSlug = `${day}-${month}-${year}`;
                                                    return `/promises/${promise.category.slug}/${dateSlug}-${promise.slug}`;
                                                })()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="View Public Page"
                                                className="p-1.5 rounded-md text-black hover:bg-gray-100 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                href={`/admin/promises/${promise.id ?? '#'}`}
                                                title="Edit"
                                                className="p-1.5 rounded-md text-black hover:bg-gray-100 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <div title="Delete">
                                                <DeleteButton
                                                    id={promise.id}
                                                    type="promises"
                                                    variant="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {paginatedPromises.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No promises found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 pb-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Previous</span>
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
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

