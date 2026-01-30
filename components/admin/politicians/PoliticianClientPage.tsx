"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { Search, Eye, Pencil, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
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

interface Politician {
    id: string;
    name: string;
    slug: string;
    role?: string | null;
    bio?: string | null;
    education?: string | null;
    imageUrl?: string | null;
    isActive: boolean;
    isInOffice?: boolean;
    partyId?: string | null;
    party?: { name: string; id: string } | null;
    updatedAt: string | Date;
    _count: { promises: number };
    searchText?: string;
}

interface PoliticianClientPageProps {
    initialPoliticians: Politician[];
}

const ITEMS_PER_PAGE = 30;

export default function PoliticianClientPage({ initialPoliticians }: PoliticianClientPageProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [selectedParties, setSelectedParties] = useState<string[]>([]);


    const [showInOffice, setShowInOffice] = useState(false);

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

    // Pre-compute searchable text
    const politiciansWithSearchText = useMemo(() => {
        return initialPoliticians.map(p => ({
            ...p,
            searchText: (
                p.name + " " +
                (p.party?.name || "") + " " +
                (p.role || "") + " " +
                (p.education || "")
            ).toLowerCase()
        }));
    }, [initialPoliticians]);

    // Extract unique options for filters
    const partyOptions = useMemo(() => {
        const distinct = new Map<string, string>();
        initialPoliticians.forEach(p => {
            if (p.party) {
                distinct.set(p.party.id, p.party.name);
            }
        });
        return Array.from(distinct.entries())
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [initialPoliticians]);



    // Filter politicians
    const filteredPoliticians = useMemo(() => {
        let result = politiciansWithSearchText;

        if (selectedParties.length > 0) {
            result = result.filter(p => p.partyId && selectedParties.includes(p.partyId));
        }



        if (showInOffice) {
            result = result.filter(p => p.isInOffice ?? p.isActive);
        }

        if (localSearchQuery) {
            const query = localSearchQuery.toLowerCase();
            result = result.filter(p => p.searchText.includes(query));
        }

        return result;
    }, [politiciansWithSearchText, localSearchQuery, selectedParties, showInOffice]);

    // Sort politicians
    const sortedPoliticians = useMemo(() => {
        const sortable = [...filteredPoliticians];
        if (sortConfig !== null) {
            sortable.sort((a, b) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let aValue: any = a[sortConfig.key as keyof Politician];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let bValue: any = b[sortConfig.key as keyof Politician];

                // Handle nested/special properties
                if (sortConfig.key === 'party') {
                    aValue = a.party?.name || "";
                    bValue = b.party?.name || "";
                } else if (sortConfig.key === 'promises') {
                    aValue = a._count.promises;
                    bValue = b._count.promises;
                } else if (sortConfig.key === 'isActive') {
                    aValue = (a.isInOffice ?? a.isActive) ? 1 : 0;
                    bValue = (b.isInOffice ?? b.isActive) ? 1 : 0;
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
    }, [filteredPoliticians, sortConfig]);

    // Pagination calculations
    const totalPages = Math.ceil(sortedPoliticians.length / ITEMS_PER_PAGE);
    const paginatedPoliticians = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedPoliticians.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedPoliticians, currentPage]);

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
                title="Politicians"
                description="Manage politicians, their profiles, and affiliations."
                count={filteredPoliticians.length}
                breadcrumbs={[
                    { label: "Overview", href: "/admin" },
                    { label: "Politicians" },
                ]}
            />

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-[350px]">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search politicians..."
                            value={localSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="bg-white pl-9"
                        />
                    </div>
                </div>

                <div className="w-full sm:w-[250px]">
                    <MultiSelectDropdown
                        options={partyOptions}
                        selected={selectedParties}
                        onChange={setSelectedParties}
                        placeholder="Select parties"
                    />
                </div>



                <div className="flex items-center space-x-2 pb-2.5">
                    <Switch
                        id="in-office-filter"
                        checked={showInOffice}
                        onCheckedChange={setShowInOffice}
                    />
                    <Label htmlFor="in-office-filter" className="cursor-pointer font-normal whitespace-nowrap">
                        Tikai amatā esošie
                    </Label>
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
                                    POLITICIAN
                                    {getSortIcon('name')}
                                </div>
                            </TableHead>
                            <TableHead className="w-[10%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3 text-center">
                                <div
                                    className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('isActive')}
                                >
                                    IN OFFICE
                                    {getSortIcon('isActive')}
                                </div>
                            </TableHead>
                            <TableHead className="w-[15%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('party')}
                                >
                                    PARTY
                                    {getSortIcon('party')}
                                </div>
                            </TableHead>
                            <TableHead className="w-[15%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('role')}
                                >
                                    POSITION
                                    {getSortIcon('role')}
                                </div>
                            </TableHead>
                            <TableHead className="w-[10%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3 text-center">
                                <div
                                    className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('promises')}
                                >
                                    PROMISES
                                    {getSortIcon('promises')}
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
                        {paginatedPoliticians.map((politician) => (
                            <TableRow key={politician.id} className="group hover:bg-gray-50 border-gray-200">
                                <TableCell className="align-middle py-4 pl-6">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium text-gray-900 text-sm">
                                            {politician.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="align-middle py-4 text-center">
                                    {(politician.isInOffice ?? politician.isActive) ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-transparent font-normal shadow-none px-2 py-0.5 text-xs">
                                            Yes
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent font-normal shadow-none px-2 py-0.5 text-xs">
                                            No
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="align-middle py-4">
                                    {politician.party ? (
                                        <Badge variant="secondary" className="font-normal border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs">
                                            {politician.party.name}
                                        </Badge>
                                    ) : (
                                        <span className="text-gray-500 text-xs">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="align-middle py-4 text-xs text-gray-600">
                                    {politician.role || "—"}
                                </TableCell>
                                <TableCell className="align-middle py-4 text-center font-medium text-xs text-gray-900">
                                    {politician._count.promises}
                                </TableCell>
                                <TableCell className="align-middle py-4 text-gray-500 text-[10px] whitespace-nowrap">
                                    {new Date(politician.updatedAt).toLocaleString("lv-LV", {
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
                                            href={`/politicians/${politician.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View Public Page"
                                            className="p-1.5 rounded-md text-black hover:bg-gray-100 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/admin/politicians/${politician.id}`}
                                            title="Edit"
                                            className="p-1.5 rounded-md text-black hover:bg-gray-100 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <div title="Delete">
                                            <DeleteButton
                                                id={politician.id}
                                                type="politicians"
                                                variant="icon"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {paginatedPoliticians.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No politicians found.
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
