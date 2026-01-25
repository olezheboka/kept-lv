"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, PieChart, User, Folder, Building2, Layers, Ban } from "lucide-react";

import { FormActions } from "@/components/admin/FormActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/ui/form-error";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { TagInput } from "@/components/ui/tag-input";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";

interface Politician {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
    slug?: string;
}

interface Party {
    id: string;
    name: string;
}

interface Source {
    type: "VIDEO" | "ARTICLE" | "DOCUMENT" | "SOCIAL_MEDIA" | "INTERVIEW" | "MANIFESTO" | "GOVERNMENT_DOC";
    url: string;
    title?: string | null;
}

type PromiseType = "INDIVIDUAL" | "PARTY" | "COALITION";

interface PromiseData {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    status: "pending" | "kept" | "broken" | "partially-kept" | "cancelled";
    explanation?: string | null;
    dateOfPromise: string | Date;
    statusUpdatedAt?: string | Date | null;
    type?: PromiseType;
    politicianId?: string | null;
    partyId?: string | null;
    categoryId: string;
    tags: string[];
    sources?: Source[];
    coalitionParties?: Party[];
}

export interface PromiseFormProps {
    initialData?: PromiseData | null;
    politicians: Politician[];
    parties: Party[];
    categories: Category[];
    onSuccess: () => void;
    onCancel: () => void;
    readOnly?: boolean; // Add readOnly support for strict type checking in parent if needed, though mostly unused
}

type StatusType = "pending" | "kept" | "broken" | "partially-kept" | "cancelled";

const STATUS_OPTIONS: {
    value: StatusType;
    label: string;
    description: string;
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
}[] = [
        {
            value: "pending",
            label: "Pending",
            description: "Active work",
            icon: Loader2,
            colorClass: "text-blue-500",
            bgClass: "bg-blue-100",
        },
        {
            value: "partially-kept",
            label: "Partially",
            description: "Compromised",
            icon: PieChart,
            colorClass: "text-yellow-500",
            bgClass: "bg-yellow-100",
        },
        {
            value: "kept",
            label: "Kept",
            description: "Fulfilled",
            icon: CheckCircle2,
            colorClass: "text-green-500",
            bgClass: "bg-green-100",
        },
        {
            value: "broken",
            label: "Not Kept",
            description: "Cancelled",
            icon: XCircle,
            colorClass: "text-red-500",
            bgClass: "bg-red-100",
        },
        {
            value: "cancelled",
            label: "Cancelled",
            description: "Promise cancelled",
            icon: Ban,
            colorClass: "text-slate-500",
            bgClass: "bg-slate-100",
        },
    ];

export function PromiseForm({ initialData, politicians, parties, categories, onSuccess, onCancel }: PromiseFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
    }, []);


    // Normalize status from DB (UPPERCASE/Underscore) to Frontend (kebab-case)
    const normalizeStatus = (status: string | undefined): StatusType => {
        if (!status) return "pending";

        // Check if it's already a valid kebab-case status
        if (["pending", "kept", "broken", "partially-kept", "cancelled"].includes(status)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return status as any;
        }

        const map: Record<string, string> = {
            "PENDING": "pending",
            "IN_PROGRESS": "pending", // Backward compatibility
            "KEPT": "kept",
            "NOT_KEPT": "broken",
            "PARTIAL": "partially-kept",
            "BROKEN": "broken",
            "CANCELLED": "cancelled"
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (map[status] || "pending") as any;
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

                type: initialData.type || "INDIVIDUAL",
                politicianId: initialData.politicianId || "",
                partyId: initialData.partyId || "",
                coalitionPartyIds: initialData.coalitionParties ? initialData.coalitionParties.map(p => p.id) : [],

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
            status: "pending" as StatusType,
            explanation: "",
            dateOfPromise: "",
            statusUpdatedAt: "",

            type: "INDIVIDUAL" as PromiseType,
            politicianId: "",
            partyId: "",
            coalitionPartyIds: [] as string[],

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

                type: initialData.type || "INDIVIDUAL",
                politicianId: initialData.politicianId || "",
                partyId: initialData.partyId || "",
                coalitionPartyIds: initialData.coalitionParties ? initialData.coalitionParties.map(p => p.id) : [],

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

        // Conditional validation based on Type
        if (formData.type === "INDIVIDUAL" && !formData.politicianId) {
            newErrors.politicianId = "Politician is required for individual promises";
        }
        if (formData.type === "PARTY" && !formData.partyId) {
            newErrors.partyId = "Party is required for party promises";
        }
        if (formData.type === "COALITION" && formData.coalitionPartyIds.length < 2) {
            newErrors.coalitionPartyIds = "At least 2 parties are required for a coalition promise";
        }

        if (!formData.categoryId) newErrors.categoryId = "Category is required";
        if (!formData.dateOfPromise) newErrors.dateOfPromise = "Date of promise is required";
        if (!formData.status) newErrors.status = "Status is required";
        if (!formData.statusUpdatedAt) newErrors.statusUpdatedAt = "Status Updated At is required";

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
                "pending": "PENDING",
                "kept": "KEPT",
                "broken": "NOT_KEPT",
                "partially-kept": "PARTIAL",
                "cancelled": "CANCELLED"
            };

            const payload = {
                title: formData.title,
                slug: formData.slug || slugify(formData.title),
                description: formData.description || null,
                status: statusMap[formData.status] || "PENDING",
                explanation: formData.explanation || null,
                dateOfPromise: new Date(formData.dateOfPromise).toISOString(),
                statusUpdatedAt: formData.statusUpdatedAt ? new Date(formData.statusUpdatedAt).toISOString() : null,

                type: formData.type,
                // Only send relevant ID based on type
                politicianId: formData.type === "INDIVIDUAL" ? formData.politicianId : null,
                partyId: formData.type === "PARTY" ? formData.partyId : null,
                coalitionPartyIds: formData.type === "COALITION" ? formData.coalitionPartyIds : [],

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
    const partyOptions = parties.map(p => ({ label: p.name, value: p.id }));
    const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));

    // For multi-select
    const multiSelectPartyOptions = parties.map(p => ({ label: p.name, value: p.id }));

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Promisor Type Selection */}
                    <div className="space-y-3">
                        <Label className="text-foreground font-semibold">Promisor Type</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                {
                                    value: "INDIVIDUAL",
                                    label: "Individual",
                                    description: "Specific politician",
                                    icon: User,
                                    colorClass: "text-blue-500",
                                    bgClass: "bg-blue-100",
                                },
                                {
                                    value: "PARTY",
                                    label: "Party",
                                    description: "Entire party pledge",
                                    icon: Building2,
                                    colorClass: "text-purple-500",
                                    bgClass: "bg-purple-100",
                                },
                                {
                                    value: "COALITION",
                                    label: "Coalition",
                                    description: "Joint agreement",
                                    icon: Layers,
                                    colorClass: "text-orange-500",
                                    bgClass: "bg-orange-100",
                                }
                            ].map((option) => {
                                const isSelected = formData.type === option.value;
                                const Icon = option.icon;

                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => setFormData({ ...formData, type: option.value as PromiseType })}
                                        className={cn(
                                            "relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                                            isSelected
                                                ? "border-blue-500 bg-white dark:bg-slate-950 shadow-sm"
                                                : "border-border hover:border-gray-300 dark:hover:border-gray-700 bg-white/50"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={cn("p-2 rounded-lg", option.bgClass)}>
                                                <Icon className={cn("w-5 h-5", option.colorClass)} />
                                            </div>
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border flex items-center justify-center",
                                                isSelected ? "border-blue-500" : "border-gray-300"
                                            )}>
                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="font-semibold text-sm text-foreground">{option.label}</p>
                                            <p className="text-xs text-muted-foreground">{option.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Conditional Inputs based on Type */}
                    <div className="min-h-[90px]">
                        {formData.type === "INDIVIDUAL" && (
                            <div className="space-y-2">
                                <Label htmlFor="politician" className="text-foreground font-semibold">Promisor (Politician) <span className="text-destructive">*</span></Label>
                                <SearchableSelect
                                    options={politicianOptions}
                                    value={formData.politicianId}
                                    onChange={(val) => {
                                        setFormData({ ...formData, politicianId: val });
                                        if (errors.politicianId) setErrors({ ...errors, politicianId: "" });
                                    }}
                                    placeholder="Select politician"
                                    searchPlaceholder="Search politicians..."
                                    icon={User}
                                    className={cn(errors.politicianId && "border-destructive focus-visible:ring-destructive ring-destructive")}
                                />
                                <FormError message={errors.politicianId} />
                            </div>
                        )}

                        {formData.type === "PARTY" && (
                            <div className="space-y-2">
                                <Label htmlFor="party" className="text-foreground font-semibold">Promisor (Party) <span className="text-destructive">*</span></Label>
                                <SearchableSelect
                                    options={partyOptions}
                                    value={formData.partyId}
                                    onChange={(val) => {
                                        setFormData({ ...formData, partyId: val });
                                        if (errors.partyId) setErrors({ ...errors, partyId: "" });
                                    }}
                                    placeholder="Select party"
                                    searchPlaceholder="Search parties..."
                                    icon={Building2}
                                    className={cn(errors.partyId && "border-destructive focus-visible:ring-destructive ring-destructive")}
                                />
                                <FormError message={errors.partyId} />
                            </div>
                        )}

                        {formData.type === "COALITION" && (
                            <div className="space-y-2">
                                <Label className="text-foreground font-semibold">Coalition parties (at least 2) <span className="text-destructive">*</span></Label>
                                <MultiSelectDropdown
                                    options={multiSelectPartyOptions}
                                    selected={formData.coalitionPartyIds}
                                    onChange={(selected) => {
                                        setFormData({ ...formData, coalitionPartyIds: selected });
                                        if (errors.coalitionPartyIds) setErrors({ ...errors, coalitionPartyIds: "" });
                                    }}
                                    placeholder="Select parties..."
                                    searchPlaceholder="Search parties..."
                                    className={cn(errors.coalitionPartyIds && "border-destructive focus-visible:ring-destructive ring-destructive")}
                                />
                                <FormError message={errors.coalitionPartyIds} />
                            </div>
                        )}
                    </div>
                </div>


                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground font-semibold">
                        Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value });
                            if (errors.title) setErrors({ ...errors, title: "" });
                        }}
                        placeholder="Clear, concise statement of the promise"
                        className={cn("bg-background", errors.title && "border-destructive focus-visible:ring-destructive")}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <FormError message={errors.title} />
                        <span>{formData.title.length}/200 characters</span>
                    </div>
                </div>

                {/* Slug */}
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
                        placeholder="url-friendly-identifier"
                        className={cn("font-mono text-sm bg-background", errors.slug && "border-destructive focus-visible:ring-destructive")}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground break-all">
                        <FormError message={errors.slug} />
                        <span>
                            {(() => {
                                const selectedCategory = categories.find(c => c.id === formData.categoryId);
                                const categorySlug = selectedCategory?.slug || "general";

                                // Format date as dd-mm-yyyy from YYYY-MM-DD string to avoid timezone issues
                                const date = formData.dateOfPromise
                                    ? formData.dateOfPromise.split('-').reverse().join('-')
                                    : "[dd-mm-yyyy]";

                                const slug = formData.slug || "[slug]";

                                return origin
                                    ? `${origin}/promises/${categorySlug}/${date}-${slug}`
                                    : "URL will be generated";
                            })()}
                        </span>
                    </div>
                </div>

                {/* Description */}
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
                        placeholder="Detailed explanation of the promise"
                        className={cn("resize-none bg-background", errors.description && "border-destructive focus-visible:ring-destructive")}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <FormError message={errors.description} />
                        <span>{formData.description.length}/2000 characters</span>
                    </div>
                </div>

                {/* Category (Full Width now) */}
                <div className="space-y-2">
                    <Label htmlFor="category" className="text-foreground font-semibold">Category <span className="text-destructive">*</span></Label>
                    <SearchableSelect
                        options={categoryOptions}
                        value={formData.categoryId}
                        onChange={(val) => {
                            setFormData({ ...formData, categoryId: val });
                            if (errors.categoryId) setErrors({ ...errors, categoryId: "" });
                        }}
                        placeholder="Select category"
                        searchPlaceholder="Search categories..."
                        icon={Folder}
                        className={cn(errors.categoryId && "border-destructive focus-visible:ring-destructive ring-destructive")}
                    />
                    <FormError message={errors.categoryId} />
                </div>


                {/* Date & Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-foreground font-semibold">Promise given <span className="text-destructive">*</span></Label>
                        <DatePicker
                            date={formData.dateOfPromise ? new Date(formData.dateOfPromise) : undefined}
                            setDate={(date) => {
                                setFormData({ ...formData, dateOfPromise: date ? date.toISOString().split('T')[0] : "" });
                                if (errors.dateOfPromise) setErrors({ ...errors, dateOfPromise: "" });
                            }}
                            className={cn(errors.dateOfPromise && "border-destructive ring-destructive focus-visible:ring-destructive")}
                        />
                        <FormError message={errors.dateOfPromise} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags" className="text-foreground font-semibold">Tags</Label>
                        <TagInput
                            value={formData.tags}
                            onChange={(tags) => setFormData({ ...formData, tags })}
                            placeholder="economy, jobs, taxes (comma-separated)"
                        />
                    </div>
                </div>

                <div className="pt-4 pb-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-foreground">Current status</h2>
                    </div>

                    <div className="bg-gradient-to-br from-green-50/30 to-green-100/30 dark:from-green-950/10 dark:to-green-900/10 rounded-xl border p-6 shadow-sm space-y-8">
                        {/* Status Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            {STATUS_OPTIONS.map((option) => {
                                const isSelected = formData.status === option.value;
                                const Icon = option.icon;

                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                status: option.value,
                                                statusUpdatedAt: prev.statusUpdatedAt || new Date().toISOString().split('T')[0]
                                            }));
                                            if (errors.status) setErrors({ ...errors, status: "" });
                                        }}
                                        className={cn(
                                            "relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                                            isSelected
                                                ? "border-blue-500 bg-white dark:bg-slate-950 shadow-sm"
                                                : "border-border hover:border-gray-300 dark:hover:border-gray-700 bg-white/50"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={cn("p-2 rounded-lg", option.bgClass)}>
                                                <Icon className={cn("w-5 h-5", option.colorClass)} />
                                            </div>
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border flex items-center justify-center",
                                                isSelected ? "border-blue-500" : "border-gray-300"
                                            )}>
                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="font-semibold text-sm text-foreground">{option.label}</p>
                                            <p className="text-xs text-muted-foreground">{option.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <FormError message={errors.status} />

                        {/* Status Details */}
                        <div className="space-y-6 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="explanation" className="font-semibold text-foreground">Justification</Label>
                                <Textarea
                                    id="explanation"
                                    value={formData.explanation}
                                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                    rows={6}
                                    placeholder="Provide a detailed justification for the status change. Explain the context, reasoning, and any relevant details supporting this status."
                                    className="bg-background resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-foreground font-semibold">Evidence link</Label>
                                    <Input
                                        value={formData.sourceUrl}
                                        onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                                        placeholder="https://news.example.com/article"
                                        className="bg-background"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="statusDate" className="font-semibold text-foreground">
                                        Status updated <span className="text-destructive">*</span>
                                    </Label>
                                    <DatePicker
                                        date={formData.statusUpdatedAt ? new Date(formData.statusUpdatedAt) : undefined}
                                        setDate={(date) => {
                                            setFormData({ ...formData, statusUpdatedAt: date ? date.toISOString().split('T')[0] : "" });
                                            if (errors.statusUpdatedAt) setErrors({ ...errors, statusUpdatedAt: "" });
                                        }}
                                        className={cn(errors.statusUpdatedAt && "border-destructive ring-destructive focus-visible:ring-destructive")}
                                    />
                                    <FormError message={errors.statusUpdatedAt} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <FormActions
                loading={loading}
                onCancel={onCancel}
                submitLabel={initialData ? "Update" : "Create"}
            />
        </form>
    );
}
