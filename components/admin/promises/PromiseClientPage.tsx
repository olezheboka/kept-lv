"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Plus, Search } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PromiseForm } from "@/components/admin/promises/PromiseForm";

interface Politician {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
}

interface Source {
    type: "VIDEO" | "TEXT" | "IMAGE";
    url: string;
    title?: string | null;
}

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
    sources?: Source[];
    politician: { name: string };
    category: { name: string };
    updatedAt: Date | string;
}

interface PromiseClientPageProps {
    initialPromises: PromiseData[];
    politicians: Politician[];
    categories: Category[];
}

export default function PromiseClientPage({ initialPromises, politicians, categories }: PromiseClientPageProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPromise, setEditingPromise] = useState<PromiseData | null>(null);

    const handleCreateSuccess = () => {
        setIsCreateOpen(false);
        router.refresh();
    };

    const handleEditSuccess = () => {
        setEditingPromise(null);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Promises"
                description="Manage and track all promise entries across politicians."
                breadcrumbs={[
                    { label: "Overview", href: "/admin" },
                    { label: "Promises" },
                ]}
                actions={
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Promise
                    </Button>
                }
            />

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-[720px] lg:max-w-[1200px] w-full p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Add New Promise</DialogTitle>
                        <DialogDescription>
                            Record a new commitment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 pt-2 h-[80vh] overflow-y-auto">
                        <PromiseForm
                            politicians={politicians}
                            categories={categories}
                            onSuccess={handleCreateSuccess}
                            onCancel={() => setIsCreateOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingPromise} onOpenChange={(open) => !open && setEditingPromise(null)}>
                <DialogContent className="max-w-[720px] lg:max-w-[1200px] w-full p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Edit Promise</DialogTitle>
                        <DialogDescription>
                            Update promise details and status.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 pt-2 h-[80vh] overflow-y-auto">
                        {editingPromise && (
                            <PromiseForm
                                key={editingPromise.id}
                                initialData={editingPromise as any}
                                politicians={politicians}
                                categories={categories}
                                onSuccess={handleEditSuccess}
                                onCancel={() => setEditingPromise(null)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search promises..."
                        className="pl-9 bg-background"
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Promise</TableHead>
                            <TableHead>Politician</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="w-[120px]">Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialPromises.map((promise) => (
                            <TableRow key={promise.id}>
                                <TableCell className="align-top py-3">
                                    <span className="font-medium text-foreground line-clamp-2 leading-snug">
                                        {promise.title}
                                    </span>
                                </TableCell>
                                <TableCell className="align-top py-3 text-muted-foreground">
                                    {promise.politician.name}
                                </TableCell>
                                <TableCell className="align-top py-3">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "font-normal border-0",
                                            promise.status === "KEPT" && "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
                                            (promise.status === "NOT_KEPT" || promise.status === "ABANDONED") && "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
                                            promise.status === "IN_PROGRESS" && "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10",
                                            promise.status === "PARTIAL" && "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
                                            promise.status === "NOT_RATED" && "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10"
                                        )}
                                    >
                                        {promise.status === 'ABANDONED' ? 'Not Kept' : promise.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="align-top py-3 text-muted-foreground">
                                    {(promise.category as any)?.name || '—'}
                                </TableCell>
                                <TableCell className="align-top py-3 text-muted-foreground text-sm whitespace-nowrap">
                                    {new Date(promise.updatedAt).toLocaleDateString("lv-LV", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })}
                                </TableCell>
                                <TableCell className="align-top py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                            onClick={() => setEditingPromise(promise)}
                                        >
                                            Edit
                                        </Button>
                                        <DeleteButton id={promise.id} type="promises" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {initialPromises.length === 0 && (
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
