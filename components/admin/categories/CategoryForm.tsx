"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Loader2, TrendingUp } from "lucide-react";
import { SLUG_ICON_MAP } from "@/lib/categoryIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
}

interface CategoryFormProps {
    initialData?: Category | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                slug: initialData.slug || "",
                description: initialData.description || "",
            });
        } else {
            setFormData({
                name: "",
                slug: "",
                description: "",
            });
        }
    }, [initialData]);

    // Auto-generate slug from name only in create mode or if slug is empty
    useEffect(() => {
        if (!initialData && formData.name && !formData.slug) {
            setFormData((prev) => ({ ...prev, slug: slugify(formData.name) }));
        }
    }, [formData.name, formData.slug, initialData]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = "Category name cannot be blank";
        if (!formData.slug.trim()) newErrors.slug = "Slug cannot be blank";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const url = initialData
                ? `/api/categories/${initialData.id}`
                : "/api/categories";

            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.refresh();
                onSuccess();
            } else {
                const error = await res.json();
                alert("Failed to save: " + JSON.stringify(error));
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-semibold">
                        Category Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        placeholder="e.g. Economics"
                        className={cn(errors.name && "border-[#cf222e] focus-visible:ring-[#cf222e]")}
                    />
                    <FormError message={errors.name} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug" className="text-foreground font-semibold">
                        Slug <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => {
                            setFormData({ ...formData, slug: e.target.value });
                            if (errors.slug) setErrors({ ...errors, slug: "" });
                        }}
                        placeholder="economics"
                        className={cn("font-mono text-sm", errors.slug && "border-[#cf222e] focus-visible:ring-[#cf222e]")}
                    />
                    <FormError message={errors.slug} />
                    <p className="text-xs text-muted-foreground">
                        URL-friendly identifier.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground font-semibold">
                        Add a description
                    </Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="min-h-[120px] resize-y"
                        placeholder="Brief description of the category..."
                    />
                </div>

                <div className="pt-2">
                    <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/40">
                        <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center text-primary shrink-0">
                            {(() => {
                                const currentSlug = formData.slug || slugify(formData.name);
                                const IconComponent = SLUG_ICON_MAP[currentSlug] || TrendingUp;
                                return <IconComponent className="w-5 h-5" />;
                            })()}
                        </div>
                        <div>
                            <h4 className="text-sm font-medium">Icon Preview</h4>
                            <p className="text-xs text-muted-foreground">Automatically mapped from slug.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="min-w-[100px]"
                >
                    {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                    {initialData ? "Update" : "Create"}
                </Button>
            </div>
        </form>
    );
}
