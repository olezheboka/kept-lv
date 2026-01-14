"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Plus, Tag, Search, Pencil } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";

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

export default function CategoryClientPage({ initialCategories }: CategoryClientPageProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleCreateSuccess = () => {
        setIsCreateOpen(false);
        // Router refresh handled in form, but good to be safe
        router.refresh();
    };

    const handleEditSuccess = () => {
        setEditingCategory(null);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Categories"
                description="Manage promise categories and themes."
                breadcrumbs={[
                    { label: "Overview", href: "/admin" },
                    { label: "Categories" },
                ]}
                actions={
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Category
                    </Button>
                }
            />

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-[720px] lg:max-w-[1200px] w-full p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Create new category</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 pt-2">
                        <CategoryForm
                            onSuccess={handleCreateSuccess}
                            onCancel={() => setIsCreateOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                <DialogContent className="max-w-[720px] lg:max-w-[1200px] w-full p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Edit category</DialogTitle>
                        <DialogDescription>
                            Make changes to the category details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 pt-2">
                        {editingCategory && (
                            <CategoryForm
                                initialData={editingCategory}
                                onSuccess={handleEditSuccess}
                                onCancel={() => setEditingCategory(null)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-9 bg-background"
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Icon</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="hidden md:table-cell">Description</TableHead>
                            <TableHead>Promises</TableHead>
                            <TableHead className="w-[130px]">Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialCategories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>
                                    {category.imageUrl ? (
                                        <div className="relative w-8 h-8 rounded-md overflow-hidden bg-muted border">
                                            <img
                                                src={category.imageUrl}
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center border">
                                            <Tag className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium text-foreground">
                                    {category.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {category.slug}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs hidden md:table-cell max-w-[200px] truncate">
                                    {category.description || "—"}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {category._count.promises}
                                </TableCell>
                                <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                                    {new Date(category.updatedAt).toLocaleDateString("lv-LV", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                            onClick={() => setEditingCategory(category)}
                                        >
                                            Edit
                                        </Button>
                                        <DeleteButton id={category.id} type="categories" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {initialCategories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
