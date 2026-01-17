"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { Search, Pencil, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Party {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    isCoalition: boolean;
    updatedAt: string | Date;
    _count: { politicians: number };
}

interface PartyClientPageProps {
    initialParties: Party[];
}

const ITEMS_PER_PAGE = 30;

export default function PartyClientPage({ initialParties }: PartyClientPageProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [showCoalitionOnly, setShowCoalitionOnly] = useState(false);

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

    // Filter parties
    const filteredParties = useMemo(() => {
        let result = initialParties;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

        if (showCoalitionOnly) {
            result = result.filter(p => p.isCoalition);
        }

        return result;
    }, [initialParties, searchQuery, showCoalitionOnly]);



    // Sort parties
    const sortedParties = useMemo(() => {
        let sortable = [...filteredParties];
        if (sortConfig !== null) {
            sortable.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof Party];
                let bValue: any = b[sortConfig.key as keyof Party];

                if (sortConfig.key === 'politicians') {
                    aValue = a._count.politicians;
                    bValue = b._count.politicians;
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
    }, [filteredParties, sortConfig]);

    // Pagination calculations
    const totalPages = Math.ceil(sortedParties.length / ITEMS_PER_PAGE);
    const paginatedParties = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedParties.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedParties, currentPage]);

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
                title="Parties"
                description="Manage political parties and their details."
                count={filteredParties.length}
                breadcrumbs={[
                    { label: "Overview", href: "/admin" },
                    { label: "Parties" },
                ]}
            />

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-[350px]">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search parties..."
                            value={localSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="bg-white pl-9"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 pb-2.5">
                    <Switch
                        id="coalition-filter"
                        checked={showCoalitionOnly}
                        onCheckedChange={setShowCoalitionOnly}
                    />
                    <Label htmlFor="coalition-filter" className="cursor-pointer font-normal whitespace-nowrap">
                        Tikai koalīcijā
                    </Label>
                </div>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#F9FAFB] border-b border-gray-100">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[40%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3 pl-6">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('name')}
                                >
                                    NAME
                                    {getSortIcon('name')}
                                </div>
                            </TableHead>
                            <TableHead className="w-[15%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('isCoalition')}
                                >
                                    COALITION
                                    {getSortIcon('isCoalition')}
                                </div>
                            </TableHead>
                            <TableHead className="w-[15%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3 text-center">
                                <div
                                    className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('politicians')}
                                >
                                    POLITICIANS
                                    {getSortIcon('politicians')}
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
                            <TableHead className="text-right font-medium text-xs uppercase tracking-wider text-gray-500 py-3 pr-6">
                                ACTIONS
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedParties.map((party) => (
                            <TableRow key={party.id} className="group hover:bg-gray-50 border-gray-200">
                                <TableCell className="align-middle py-4 pl-6">
                                    <span className="font-medium text-gray-900 text-sm">
                                        {party.name}
                                    </span>
                                </TableCell>
                                <TableCell className="align-middle py-4">
                                    {party.isCoalition ? (
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 border-0 font-normal hover:bg-emerald-100">Yes</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10 border-0 font-normal hover:bg-gray-100">No</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="align-middle py-4 text-center font-medium text-xs text-gray-900">
                                    {party._count.politicians}
                                </TableCell>
                                <TableCell className="align-middle py-4 text-gray-500 text-[10px] whitespace-nowrap">
                                    {new Date(party.updatedAt).toLocaleString("lv-LV", {
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
                                            href={`/parties/${party.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View Public Page"
                                            className="p-1.5 rounded-md text-black hover:bg-gray-100 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/admin/parties/${party.id}`}
                                            title="Edit"
                                            className="p-1.5 rounded-md text-black hover:bg-gray-100 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <div title="Delete">
                                            <DeleteButton
                                                id={party.id}
                                                type="parties"
                                                variant="icon"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {paginatedParties.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No parties found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {
                totalPages > 1 && (
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
                )
            }
        </div >
    );
}
