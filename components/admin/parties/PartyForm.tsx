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
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Switch } from "@/components/ui/switch";

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

export function PartyForm({ initialData, parties, onSuccess, onCancel }: PartyFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const url = initialData
                ? `/api/parties/${initialData.id}`
                : "/api/parties";

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
                        Party Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        placeholder="e.g. Jaunā Vienotība"
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
                            placeholder="jauna-vienotiba"
                            className={cn("font-mono text-sm", errors.slug && "border-[#cf222e] focus-visible:ring-[#cf222e]")}
                        />
                        <FormError message={errors.slug} />
                    </div>
                    <p className="text-xs text-muted-foreground">Unique identifier linked to URL.</p>
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
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-foreground font-semibold">Party Logo</Label>
                    <div className="border rounded-md p-4 bg-muted/20">
                        <ImageUpload
                            value={formData.logoUrl}
                            onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="websiteUrl" className="text-foreground font-semibold">Website URL</Label>
                    <Input
                        id="websiteUrl"
                        type="url"
                        required
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        placeholder="https://example.com"
                    />
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/20">
                    <Switch
                        id="isCoalition"
                        checked={formData.isCoalition}
                        onCheckedChange={(checked) => setFormData({ ...formData, isCoalition: checked })}
                        className="data-[state=checked]:bg-blue-600"
                    />
                    <div>
                        <Label htmlFor="isCoalition" className="cursor-pointer font-medium">In Coalition</Label>
                        <p className="text-xs text-muted-foreground">
                            Toggle on if this party is part of the government coalition.
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
