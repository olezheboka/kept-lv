"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, TrendingUp } from "lucide-react";
import { slugify } from "@/lib/utils";
import { SLUG_ICON_MAP } from "@/lib/categoryIcons";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/categories/${id}`);

                if (!res.ok) {
                    alert("Failed to load category data");
                    return;
                }

                const categoryData = await res.json();

                setFormData({
                    name: categoryData.name || "",
                    slug: categoryData.slug || "",
                    description: categoryData.description || "",
                });

                setLoading(false);
            } catch (error) {
                console.error(error);
                alert("An error occurred while loading data");
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (formData.name && !formData.slug) {
            setFormData((prev) => ({ ...prev, slug: slugify(formData.name) }));
        }
    }, [formData.name]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                name: formData.name,
                slug: formData.slug || slugify(formData.name),
                description: formData.description,
            };

            const res = await fetch(`/api/categories/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/admin/categories");
                router.refresh();
            } else {
                const error = await res.json();
                alert("Failed to update: " + JSON.stringify(error));
            }
        } catch (error) {
            alert("Failed to update category");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/categories"
                        className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
                        title="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit {formData.name || "Category"}</h1>
                        <p className="text-sm text-muted-foreground mt-1">Update category details.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-foreground">Category Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Category name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Slug <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="category-slug"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px]"
                                placeholder="Brief description of the category..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-foreground mb-6">Icon</h2>
                    <div className="max-w-md">
                        <div className="p-4 border border-border rounded-xl bg-muted/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                    {(() => {
                                        // Try lookup by current slug (or generated from name)
                                        const currentSlug = formData.slug || slugify(formData.name);
                                        const IconComponent = SLUG_ICON_MAP[currentSlug] || TrendingUp;
                                        return <IconComponent className="w-6 h-6" />;
                                    })()}
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-foreground">Icon Preview</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        The icon is determined automatically by the slug.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            Icons are mapped to the category slug (e.g. "agriculture" &rarr; Wheat icon).
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Link
                        href="/admin/categories"
                        className="px-4 py-2 rounded-lg border border-input bg-background text-sm font-medium hover:bg-muted transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {saving ? "Saving Changes..." : "Update Category"}
                    </button>
                </div>
            </form>
        </div>
    );
}
