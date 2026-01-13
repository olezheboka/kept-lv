"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function EditPartyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        logoUrl: "",
        websiteUrl: "",
        isCoalition: false,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/parties/${id}`);

                if (!res.ok) {
                    alert("Failed to load party data");
                    return;
                }

                const partyData = await res.json();

                setFormData({
                    name: partyData.name || "",
                    slug: partyData.slug || "",
                    description: partyData.description || "",
                    logoUrl: partyData.logoUrl || "",
                    websiteUrl: partyData.websiteUrl || "",
                    isCoalition: partyData.isCoalition || false,
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
                description: formData.description || null,
                logoUrl: formData.logoUrl,
                websiteUrl: formData.websiteUrl,
                isCoalition: formData.isCoalition,
            };

            const res = await fetch(`/api/parties/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/admin/parties");
                router.refresh();
            } else {
                const error = await res.json();
                alert("Failed to update: " + JSON.stringify(error));
            }
        } catch (error) {
            alert("Failed to update party");
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
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/parties"
                        className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
                        title="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Party</h1>
                        <p className="text-sm text-muted-foreground mt-1">Update party details.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-foreground">Basic Info</h2>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    placeholder="Party name"
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
                                    placeholder="party-slug"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                placeholder="Brief description about the party..."
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.isCoalition}
                                    onChange={(e) => setFormData({ ...formData, isCoalition: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <div>
                                    <div className="text-sm font-medium text-foreground">In Coalition</div>
                                    <div className="text-xs text-muted-foreground">Is this party currently in the government coalition?</div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-foreground">Media & Links</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Party Logo <span className="text-red-500">*</span>
                            </label>
                            <ImageUpload
                                value={formData.logoUrl}
                                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Website URL <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                required
                                value={formData.websiteUrl}
                                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Link
                        href="/admin/parties"
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
                        {saving ? "Saving Changes..." : "Update Party"}
                    </button>
                </div>
            </form>
        </div>
    );
}
