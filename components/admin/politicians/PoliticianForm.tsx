"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
    inOffice: boolean;
    bio?: string | null;
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
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        partyId: "",
        role: "Member of Parliament",
        email: "",
        inOffice: true,
        bio: "",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                slug: initialData.slug || "",
                partyId: initialData.partyId || "",
                role: initialData.role || "Member of Parliament",
                email: "",
                inOffice: initialData.inOffice ?? true,
                bio: initialData.bio || "",
            });
        } else {
            setFormData({
                name: "",
                slug: "",
                partyId: "",
                role: "Member of Parliament",
                email: "",
                inOffice: true,
                bio: "",
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
        if (!formData.name.trim()) newErrors.name = "Politician name cannot be blank";
        if (!formData.slug.trim()) newErrors.slug = "Slug cannot be blank";
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-semibold">
                        Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        placeholder="e.g. Edgars Rinkēvičs"
                        className={cn(errors.name && "border-[#cf222e] focus-visible:ring-[#cf222e]")}
                    />
                    <FormError message={errors.name} />
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
                            placeholder="edgars-rinkevics"
                            className={cn("font-mono text-sm", errors.slug && "border-[#cf222e] focus-visible:ring-[#cf222e]")}
                        />
                        <FormError message={errors.slug} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="party" className="text-foreground font-semibold">
                            Party <span className="text-destructive">*</span>
                        </Label>
                        <SearchableSelect
                            options={partyOptions}
                            value={formData.partyId || ""}
                            onChange={(val) => {
                                setFormData({ ...formData, partyId: val });
                                if (errors.partyId) setErrors({ ...errors, partyId: "" });
                            }}
                            placeholder="Select Party..."
                            searchPlaceholder="Search parties..."
                            className={cn(errors.partyId && "border-[#cf222e] focus-visible:ring-[#cf222e] ring-[#cf222e]")}
                        />
                        <FormError message={errors.partyId} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-foreground font-semibold">
                            Role / Position
                        </Label>
                        <Input
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground font-semibold">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="official@saeima.lv"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio" className="text-foreground font-semibold">Biography</Label>
                    <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        placeholder="Brief biography..."
                    />
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/20">
                    <Checkbox
                        id="inOffice"
                        checked={formData.inOffice}
                        onCheckedChange={(checked) => setFormData({ ...formData, inOffice: checked as boolean })}
                    />
                    <div>
                        <Label htmlFor="inOffice" className="cursor-pointer font-medium">Currently in Office</Label>
                        <p className="text-xs text-muted-foreground">
                            Check if this politician is currently holding this position.
                        </p>
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
