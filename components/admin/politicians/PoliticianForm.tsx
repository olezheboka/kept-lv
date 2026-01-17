"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Loader2, Flag, GraduationCap, Briefcase, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/ui/form-error";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

interface Party {
    id: string;
    name: string;
}

interface Politician {
    id: string;
    name: string;
    slug: string;
    partyId?: string | null;
    role?: string | null;
    isActive: boolean;
    bio?: string | null;
    education?: string | null;
}

interface PoliticianFormProps {
    initialData?: Politician | null;
    parties: Party[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function PoliticianForm({ initialData, parties, onSuccess, onCancel }: PoliticianFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [origin, setOrigin] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        partyId: "",
        role: "Member of Parliament",
        isActive: true,
        bio: "",
        education: "",
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
    }, []);

    // Initialize form data
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                slug: initialData.slug || "",
                partyId: initialData.partyId || "",
                role: initialData.role || "Member of Parliament",
                isActive: initialData.isActive ?? true,
                bio: initialData.bio || "",
                education: initialData.education || "",
            });
        }
    }, [initialData]);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Auto-generate slug from name only in create mode or if slug is empty
    useEffect(() => {
        if (!initialData && formData.name && !formData.slug) {
            setFormData((prev) => ({ ...prev, slug: slugify(formData.name) }));
        }
    }, [formData.name, formData.slug, initialData]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = "Full name is required";
        if (!formData.slug.trim()) newErrors.slug = "Slug is required";
        if (!formData.partyId) newErrors.partyId = "Party is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const url = initialData
                ? `/api/politicians/${initialData.id}`
                : "/api/politicians";

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

    const partyOptions = parties.map(p => ({ label: p.name, value: p.id }));

    // Status options matching PromiseForm design
    const STATUS_OPTIONS = [
        {
            value: true,
            label: "In office",
            description: "Currently active",
            icon: CheckCircle2,
            colorClass: "text-green-500",
            bgClass: "bg-green-100",
        },
        {
            value: false,
            label: "Not in office",
            description: "Former politician",
            icon: XCircle,
            colorClass: "text-gray-500",
            bgClass: "bg-gray-100",
        }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">

                {/* Basic Info */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-semibold">
                        Full name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        placeholder="e.g. Edgars Rinkēvičs"
                        className={cn("bg-background", errors.name && "border-destructive focus-visible:ring-destructive")}
                    />
                    <FormError message={errors.name} />
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
                        placeholder="edgars-rinkevics"
                        className={cn("font-mono text-sm bg-background", errors.slug && "border-destructive focus-visible:ring-destructive")}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <FormError message={errors.slug} />
                        <span>
                            {origin ? `${origin}/politicians/${formData.slug || "[slug]"}` : `http://localhost:3000/politicians/${formData.slug || "[slug]"}`}
                        </span>
                    </div>
                </div>

                {/* Affiliation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="party" className="text-foreground font-semibold">
                            Party <span className="text-destructive">*</span>
                        </Label>
                        <SearchableSelect
                            options={partyOptions}
                            value={formData.partyId}
                            onChange={(val) => {
                                setFormData({ ...formData, partyId: val });
                                if (errors.partyId) setErrors({ ...errors, partyId: "" });
                            }}
                            placeholder="Select Party"
                            searchPlaceholder="Search parties..."
                            icon={Flag}
                            className={cn(errors.partyId && "border-destructive focus-visible:ring-destructive ring-destructive")}
                        />
                        <FormError message={errors.partyId} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-foreground font-semibold">
                            Position
                        </Label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="pl-9 bg-background"
                                placeholder="Member of Parliament"
                            />
                        </div>
                    </div>
                </div>

                {/* Bio & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-foreground font-semibold">Biography</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={5}
                            placeholder="Brief biography or background information..."
                            className="resize-none bg-background min-h-[120px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="education" className="text-foreground font-semibold">Education</Label>
                        <div className="relative">
                            <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Textarea
                                id="education"
                                value={formData.education}
                                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                placeholder="University of Latvia, Master's degree in Law..."
                                className="pl-9 bg-background min-h-[120px] resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="pt-2">
                    <h2 className="text-lg font-bold text-foreground mb-4">Current status</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {STATUS_OPTIONS.map((option) => {
                            const isSelected = formData.isActive === option.value;
                            const Icon = option.icon;

                            return (
                                <div
                                    key={option.label}
                                    onClick={() => setFormData({ ...formData, isActive: option.value })}
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

            </div>

            <div className="flex gap-3 pt-4">
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
