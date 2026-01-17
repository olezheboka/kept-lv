"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Tag, Search, Pencil, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    updatedAt: Date | string;
    _count: { promises: number };
}

interface CategoryClientPageProps {
    initialCategories: Category[];
}

const ITEMS_PER_PAGE = 30;

export default function CategoryClientPage({ initialCategories }: CategoryClientPageProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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

    // Filter categories
    const filteredCategories = useMemo(() => {
        let result = initialCategories;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(query) ||
                (c.description && c.description.toLowerCase().includes(query)) ||
                c.slug.includes(query)
            );
        }

        return result;
    }, [initialCategories, searchQuery]);

    // Sort categories
    const sortedCategories = useMemo(() => {
        let sortable = [...filteredCategories];
        if (sortConfig !== null) {
            sortable.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof Category];
                let bValue: any = b[sortConfig.key as keyof Category];

                if (sortConfig.key === 'promises') {
                    aValue = a._count.promises;
                    bValue = b._count.promises;
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
        return sortable;
    }, [filteredCategories, sortConfig]);

    // Pagination calculations
    const totalPages = Math.ceil(sortedCategories.length / ITEMS_PER_PAGE);
    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedCategories.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedCategories, currentPage]);


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
                title="Categories"
                description="Manage promise categories and themes."
                count={filteredCategories.length}
                breadcrumbs={[
                    { label: "Overview", href: "/admin" },
                    { label: "Categories" },
                ]}

            />

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-[350px]">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search categories..."
                            value={localSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="bg-white pl-9"
                        />
                    </div>
                </div>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#F9FAFB] border-b border-gray-100">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[30%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3 pl-6">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('name')}
                                >
                                    NAME
                                    {getSortIcon('name')}
                                </div>
                            </TableHead>
                            <TableHead className="hidden md:table-cell font-medium text-xs uppercase tracking-wider text-gray-500 py-3">Description</TableHead>
                            <TableHead className="w-[10%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3 text-center">
                                <div
                                    className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('promises')}
                                >
                                    PROMISES
                                    {getSortIcon('promises')}
                                </div>
                            </TableHead>
                            <TableHead className="w-[15%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('updatedAt')}
                                >
                                    UPDATED
                                    {getSortIcon('updatedAt')}
                                </div>
                            </TableHead>
                            <TableHead className="text-right font-medium text-xs uppercase tracking-wider text-gray-500 py-3 pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedCategories.map((category) => (
                            <TableRow key={category.id} className="group hover:bg-gray-50 border-gray-200">
                                <TableCell className="align-middle py-4 pl-6 font-medium text-gray-900 text-sm">
                                    {category.name}
                                </TableCell>
                                <TableCell className="align-middle py-4 text-muted-foreground text-xs hidden md:table-cell max-w-[200px] truncate">
                                    {category.description || "—"}
                                </TableCell>
                                <TableCell className="align-middle py-4 text-center font-medium text-xs text-gray-900">
                                    {category._count.promises}
                                </TableCell>
                                <TableCell className="align-middle py-4 text-gray-500 text-[10px] whitespace-nowrap">
                                    {new Date(category.updatedAt).toLocaleString("lv-LV", {
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
                                            href={`/categories/${category.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View Public Page"
                                            className="p-1.5 rounded-md text-black hover:bg-gray-100 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link href={`/admin/categories/${category.id}`}
                                            title="Edit"
                                            className="p-1.5 rounded-md text-black hover:bg-gray-100 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <div title="Delete">
                                            <DeleteButton
                                                id={category.id}
                                                type="categories"
                                                variant="icon"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {paginatedCategories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No categories found.
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
