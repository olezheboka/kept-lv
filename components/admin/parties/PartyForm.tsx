"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { FormActions } from "@/components/admin/FormActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/ImageUpload";

const COALITION_OPTIONS = [
    {
        value: true,
        label: "In coalition",
        description: "Part of the government",
        icon: CheckCircle2,
        colorClass: "text-green-500",
        bgClass: "bg-green-100",
    },
    {
        value: false,
        label: "Opposition",
        description: "Not in government",
        icon: XCircle,
        colorClass: "text-gray-500",
        bgClass: "bg-gray-100",
    },
];

interface Party {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    isCoalition: boolean;
    code?: string | null; // e.g. "ZZS"
}

interface PartyFormProps {
    initialData?: Party | null;
    onSuccess: () => void;
    onCancel: () => void;
    parties?: Party[]; // Pass if needed for logic, though mainly self-references here
}

export function PartyForm({ initialData, onSuccess, onCancel }: PartyFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [origin, setOrigin] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        code: "",
        description: "",
        logoUrl: "",
        websiteUrl: "",
        isCoalition: false,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                slug: initialData.slug || "",
                code: initialData.code || "",
                description: initialData.description || "",
                logoUrl: initialData.logoUrl || "",
                websiteUrl: initialData.websiteUrl || "",
                isCoalition: initialData.isCoalition || false,
            });
        } else {
            setFormData({
                name: "",
                slug: "",
                code: "",
                description: "",
                logoUrl: "",
                websiteUrl: "",
                isCoalition: false,
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
        if (!formData.name.trim()) newErrors.name = "Party name cannot be blank";
        if (!formData.slug.trim()) newErrors.slug = "Slug cannot be blank";
        if (!formData.logoUrl.trim()) newErrors.logoUrl = "Logo is required";
        if (!formData.websiteUrl.trim()) newErrors.websiteUrl = "Website URL is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setErrors({}); // Clear previous errors

        try {
            const url = initialData
                ? `/api/parties/${initialData.id}`
                : "/api/parties";

            const method = initialData ? "PUT" : "POST";

            // Normalize URL: add protocol if missing
            let formattedWebsiteUrl = formData.websiteUrl.trim();
            if (formattedWebsiteUrl && !/^https?:\/\//i.test(formattedWebsiteUrl)) {
                formattedWebsiteUrl = `https://${formattedWebsiteUrl}`;
            }

            const bodyData = {
                ...formData,
                websiteUrl: formattedWebsiteUrl
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            if (res.ok) {
                router.refresh();
                onSuccess();
            } else {
                const data = await res.json();

                // Handle Zod validation errors
                if (data.details && Array.isArray(data.details)) {
                    const serverErrors: { [key: string]: string } = {};
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data.details.forEach((err: any) => {
                        // path is usually ["field_name"]
                        const field = err.path[0];
                        if (field) {
                            serverErrors[field] = err.message;
                        }
                    });
                    setErrors(serverErrors);
                } else if (data.error) {
                    // Generic error
                    setErrors({ form: data.error });
                } else {
                    setErrors({ form: "Something went wrong" });
                }
            }
        } catch (error) {
            console.error(error);
            setErrors({ form: "An unexpected error occurred" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
                <FormError message={errors.form} />

                {/* Basic Info */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-semibold">
                        Party name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        placeholder="e.g. Jaunā Vienotība"
                        className={cn("bg-background", errors.name && "border-destructive focus-visible:ring-destructive")}
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
                        placeholder="jauna-vienotiba"
                        className={cn("font-mono text-sm bg-background", errors.slug && "border-destructive focus-visible:ring-destructive")}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <FormError message={errors.slug} />
                        <span>
                            {origin ? `${origin}/parties/${formData.slug || "[slug]"}` : `http://localhost:3000/parties/${formData.slug || "[slug]"}`}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground font-semibold">
                        Description
                    </Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="Brief description..."
                        className="bg-background"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-foreground font-semibold">Party logo <span className="text-destructive">*</span></Label>
                        <div className={cn("border rounded-md p-4 bg-gray-50/50 flex items-center justify-center", errors.logoUrl && "border-destructive")}>
                            <ImageUpload
                                value={formData.logoUrl}
                                onChange={(url) => {
                                    setFormData({ ...formData, logoUrl: url });
                                    if (errors.logoUrl) setErrors({ ...errors, logoUrl: "" });
                                }}
                                disabled={loading}
                                className="w-24 h-24 aspect-square object-contain"
                            />
                        </div>
                        <FormError message={errors.logoUrl} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="websiteUrl" className="text-foreground font-semibold">Website URL <span className="text-destructive">*</span></Label>
                        <Input
                            id="websiteUrl"
                            type="text"
                            value={formData.websiteUrl}
                            onChange={(e) => {
                                setFormData({ ...formData, websiteUrl: e.target.value });
                                if (errors.websiteUrl) setErrors({ ...errors, websiteUrl: "" });
                            }}
                            placeholder="https://example.com"
                            className={cn("bg-background", errors.websiteUrl && "border-destructive focus-visible:ring-destructive")}
                        />
                        <FormError message={errors.websiteUrl} />
                    </div>
                </div>

                <div className="pt-2">
                    <h2 className="text-lg font-bold text-foreground mb-4">Coalition status</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {COALITION_OPTIONS.map((option) => {
                            const isSelected = formData.isCoalition === option.value;
                            const Icon = option.icon;

                            return (
                                <div
                                    key={String(option.value)}
                                    onClick={() => setFormData({ ...formData, isCoalition: option.value })}
                                    className={cn(
                                        "relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                                        isSelected
                                            ? "border-blue-500 bg-card shadow-sm"
                                            : "border-border hover:border-gray-300 dark:hover:border-gray-700 bg-card/50"
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
            </div>

            <FormActions
                loading={loading}
                onCancel={onCancel}
                submitLabel={initialData ? "Update" : "Create"}
            />
        </form>
    );
}
