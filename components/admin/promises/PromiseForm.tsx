"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/ui/form-error";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { TagInput } from "@/components/ui/tag-input";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Politician {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
}

interface Source {
    type: "VIDEO" | "ARTICLE" | "DOCUMENT" | "SOCIAL_MEDIA" | "INTERVIEW" | "TEXT" | "IMAGE";
    url: string;
    title?: string | null;
}

interface PromiseData {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    status: "in-progress" | "kept" | "broken" | "partially-kept" | "not-rated";
    explanation?: string | null;
    dateOfPromise: string | Date;
    statusUpdatedAt?: string | Date | null;
    politicianId: string;
    categoryId: string;
    tags: string[];
    sources?: Source[];
}

interface PromiseFormProps {
    initialData?: PromiseData | null;
    politicians: Politician[];
    categories: Category[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function PromiseForm({ initialData, politicians, categories, onSuccess, onCancel }: PromiseFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);


    // Normalize status from DB (UPPERCASE/Underscore) to Frontend (kebab-case)
    const normalizeStatus = (status: string | undefined): "in-progress" | "kept" | "broken" | "partially-kept" | "not-rated" => {
        if (!status) return "in-progress";

        // Check if it's already a valid kebab-case status
        if (["in-progress", "kept", "broken", "partially-kept", "not-rated"].includes(status)) {
            return status as any;
        }

        const map: Record<string, string> = {
            "IN_PROGRESS": "in-progress",
            "KEPT": "kept",
            "NOT_KEPT": "broken",
            "PARTIAL": "partially-kept",
            "ABANDONED": "broken",
            "BROKEN": "broken",
            "NOT_RATED": "not-rated"
        };

        return (map[status] || "in-progress") as any;
    };

    const [formData, setFormData] = useState(() => {
        if (initialData) {
            const source = initialData.sources?.[0];
            return {
                title: initialData.title || "",
                slug: initialData.slug || "",
                description: initialData.description || "",
                status: normalizeStatus(initialData.status),
                explanation: initialData.explanation || "",
                dateOfPromise: initialData.dateOfPromise ? new Date(initialData.dateOfPromise).toISOString().split('T')[0] : "",
                statusUpdatedAt: initialData.statusUpdatedAt ? new Date(initialData.statusUpdatedAt).toISOString().split('T')[0] : "",
                politicianId: initialData.politicianId || "",
                categoryId: initialData.categoryId || "",
                sourceType: source?.type || "VIDEO",
                sourceUrl: source?.url || "",
                sourceTitle: source?.title || "",
                tags: Array.isArray(initialData.tags) ? initialData.tags : [],
            };
        }
        return {
            title: "",
            slug: "",
            description: "",
            status: "in-progress" as const,
            explanation: "",
            dateOfPromise: "",
            statusUpdatedAt: "",
            politicianId: "",
            categoryId: "",
            sourceType: "VIDEO" as const,
            sourceUrl: "",
            sourceTitle: "",
            tags: [] as string[],
        };
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Reset form if initialData changes (for when dialog reopens with new data if component persists)
    useEffect(() => {
        if (initialData) {
            const source = initialData.sources?.[0];
            setFormData({
                title: initialData.title || "",
                slug: initialData.slug || "",
                description: initialData.description || "",
                status: normalizeStatus(initialData.status),
                explanation: initialData.explanation || "",
                dateOfPromise: initialData.dateOfPromise ? new Date(initialData.dateOfPromise).toISOString().split('T')[0] : "",
                statusUpdatedAt: initialData.statusUpdatedAt ? new Date(initialData.statusUpdatedAt).toISOString().split('T')[0] : "",
                politicianId: initialData.politicianId || "",
                categoryId: initialData.categoryId || "",
                sourceType: source?.type || "VIDEO",
                sourceUrl: source?.url || "",
                sourceTitle: source?.title || "",
                tags: Array.isArray(initialData.tags) ? initialData.tags : [],
            });
        }
    }, [initialData]);

    // Auto-generate slug from title only in create mode or if slug is empty
    useEffect(() => {
        if (!initialData && formData.title && !formData.slug) {
            setFormData((prev) => ({ ...prev, slug: slugify(formData.title) }));
        }
    }, [formData.title, formData.slug, initialData]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.title.trim()) newErrors.title = "Title cannot be blank";
        if (!formData.slug.trim()) newErrors.slug = "Slug cannot be blank";
        if (!formData.description.trim()) newErrors.description = "Description cannot be blank";
        if (!formData.politicianId) newErrors.politicianId = "Politician is required";
        if (!formData.categoryId) newErrors.categoryId = "Category is required";
        if (!formData.dateOfPromise) newErrors.dateOfPromise = "Date of promise is required";
        if (!formData.status) newErrors.status = "Status is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            // Map frontend status (kebab-case) to Backend Enum (UPPERCASE)
            const statusMap: Record<string, string> = {
                "in-progress": "IN_PROGRESS",
                "kept": "KEPT",
                "broken": "NOT_KEPT", // User requested NOT_KEPT consistency
                "partially-kept": "PARTIAL",
                "not-rated": "NOT_RATED"
            };

            const payload = {
                title: formData.title,
                slug: formData.slug || slugify(formData.title),
                description: formData.description || null,
                status: statusMap[formData.status] || "IN_PROGRESS",
                explanation: formData.explanation || null,
                dateOfPromise: new Date(formData.dateOfPromise).toISOString(),
                statusUpdatedAt: formData.statusUpdatedAt ? new Date(formData.statusUpdatedAt).toISOString() : null,
                politicianId: formData.politicianId,
                categoryId: formData.categoryId,
                tags: formData.tags,
                sources: formData.sourceUrl
                    ? [{
                        type: formData.sourceType,
                        url: formData.sourceUrl,
                        title: formData.sourceTitle || null,
                    }]
                    : [],
            };

            const url = initialData
                ? `/api/promises/${initialData.id}`
                : "/api/promises";

            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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

    const politicianOptions = politicians.map(p => ({ label: p.name, value: p.id }));
    const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground font-semibold">
                        Promise Title <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        id="title"
                        value={formData.title}
                        onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value });
                            if (errors.title) setErrors({ ...errors, title: "" });
                        }}
                        rows={2}
                        placeholder="What was promised?"
                        className={cn("resize-none", errors.title && "border-[#cf222e] focus-visible:ring-[#cf222e]")}
                    />
                    <FormError message={errors.title} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            placeholder="promi-se-slug"
                            className={cn("font-mono text-sm", errors.slug && "border-[#cf222e] focus-visible:ring-[#cf222e]")}
                        />
                        <FormError message={errors.slug} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags" className="text-foreground font-semibold">Tags</Label>
                        <TagInput
                            value={formData.tags}
                            onChange={(tags) => setFormData({ ...formData, tags })}
                            placeholder="Add tag... (Enter or Comma)"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground font-semibold">
                        Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => {
                            setFormData({ ...formData, description: e.target.value });
                            if (errors.description) setErrors({ ...errors, description: "" });
                        }}
                        rows={4}
                        placeholder="Detailed description..."
                        className={cn(errors.description && "border-[#cf222e] focus-visible:ring-[#cf222e]")}
                    />
                    <FormError message={errors.description} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="politician" className="text-foreground font-semibold">Politician <span className="text-destructive">*</span></Label>
                        <SearchableSelect
                            options={politicianOptions}
                            value={formData.politicianId}
                            onChange={(val) => {
                                setFormData({ ...formData, politicianId: val });
                                if (errors.politicianId) setErrors({ ...errors, politicianId: "" });
                            }}
                            placeholder="Select politician..."
                            searchPlaceholder="Search politicians..."
                            className={cn(errors.politicianId && "border-[#cf222e] focus-visible:ring-[#cf222e] ring-[#cf222e]")}
                        />
                        <FormError message={errors.politicianId} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-foreground font-semibold">Category <span className="text-destructive">*</span></Label>
                        <SearchableSelect
                            options={categoryOptions}
                            value={formData.categoryId}
                            onChange={(val) => {
                                setFormData({ ...formData, categoryId: val });
                                if (errors.categoryId) setErrors({ ...errors, categoryId: "" });
                            }}
                            placeholder="Select category..."
                            searchPlaceholder="Search categories..."
                            className={cn(errors.categoryId && "border-[#cf222e] focus-visible:ring-[#cf222e] ring-[#cf222e]")}
                        />
                        <FormError message={errors.categoryId} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date" className="text-foreground font-semibold">Date of Promise <span className="text-destructive">*</span></Label>
                    <Input
                        id="date"
                        type="date"
                        value={formData.dateOfPromise}
                        onChange={(e) => {
                            setFormData({ ...formData, dateOfPromise: e.target.value });
                            if (errors.dateOfPromise) setErrors({ ...errors, dateOfPromise: "" });
                        }}
                        className={cn("w-full md:w-1/2", errors.dateOfPromise && "border-[#cf222e] focus-visible:ring-[#cf222e]")}
                    />
                    <FormError message={errors.dateOfPromise} />
                </div>

                <div className="p-4 bg-muted/20 rounded-lg space-y-4 border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="font-semibold">Current Status <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        status: value as any,
                                        statusUpdatedAt: prev.statusUpdatedAt || new Date().toISOString().split('T')[0]
                                    }));
                                    if (errors.status) setErrors({ ...errors, status: "" });
                                }}
                            >
                                <SelectTrigger
                                    className={cn(
                                        errors.status && "border-[#cf222e] focus-visible:ring-[#cf222e] ring-[#cf222e]"
                                    )}
                                >
                                    <SelectValue placeholder="Select status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="kept">Kept</SelectItem>
                                    <SelectItem value="broken">Not Kept</SelectItem>
                                    <SelectItem value="partially-kept">Partially Kept</SelectItem>
                                    <SelectItem value="not-rated">Not Rated</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormError message={errors.status} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="statusDate" className="font-semibold">Status Updated At</Label>
                            <Input
                                id="statusDate"
                                type="date"
                                value={formData.statusUpdatedAt}
                                onChange={(e) => setFormData({ ...formData, statusUpdatedAt: e.target.value })}
                                className="bg-background"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="explanation" className="font-semibold">Explanation</Label>
                        <Textarea
                            id="explanation"
                            value={formData.explanation}
                            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                            rows={3}
                            placeholder="Why this status?"
                            className="bg-background"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-foreground font-semibold">Source Evidence</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            value={formData.sourceUrl}
                            onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                            placeholder="https://source-url.com"
                        />
                        <Input
                            value={formData.sourceTitle}
                            onChange={(e) => setFormData({ ...formData, sourceTitle: e.target.value })}
                            placeholder="Source Title (e.g. Video Interview)"
                        />
                    </div>
                </div>

            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
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
