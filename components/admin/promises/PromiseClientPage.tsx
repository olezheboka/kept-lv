"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Plus, Search, Eye, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
}

interface PromiseClientPageProps {
    initialPromises: PromiseData[];
}

export default function PromiseClientPage({ initialPromises }: PromiseClientPageProps) {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const sortedPromises = useMemo(() => {
        let sortablePromises = [...initialPromises];
        if (sortConfig !== null) {
            sortablePromises.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof PromiseData];
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
    }, [initialPromises, sortConfig]);

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

    return (
        <div className="space-y-6">
            {/* Custom Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Promises</h1>
                        <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-100">
                            {initialPromises.length}
                        </Badge>
                    </div>
                    <Link href="/admin/promises/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium">
                            <Plus className="w-4 h-4" />
                            Add Promise
                        </Button>
                    </Link>
                </div>
                <p className="text-muted-foreground text-sm">
                    Track and manage political promises
                </p>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#F9FAFB] border-b border-gray-100">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[35%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3 pl-6">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('title')}
                                >
                                    TITLE
                                    {getSortIcon('title')}
                                </div>
                            </TableHead>
                            <TableHead className="w-[8%] font-medium text-xs uppercase tracking-wider text-gray-500 py-3">
                                <div
                                    className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group select-none"
                                    onClick={() => requestSort('category')}
                                >
                                    CATEGORY
                                    {getSortIcon('category')}
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
                            <TableHead className="text-right py-3 pr-6"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedPromises.map((promise) => {
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
                                        <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md px-2.5">
                                            {(promise.category as any)?.name || 'General'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="align-middle py-4">
                                        <Badge
                                            className={cn(
                                                "font-medium rounded-full px-3 py-0.5 shadow-none",
                                                statusBadgeClass
                                            )}
                                        >
                                            {statusLabel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="align-middle py-4 text-gray-500 text-xs whitespace-nowrap">
                                        {promise.statusUpdatedAt ? new Date(promise.statusUpdatedAt).toLocaleString("lv-LV", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false
                                        }) : "—"}
                                    </TableCell>
                                    <TableCell className="align-middle py-4 text-gray-500 text-xs whitespace-nowrap">
                                        {new Date(promise.updatedAt).toLocaleString("lv-LV", {
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
                        {sortedPromises.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No promises found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

