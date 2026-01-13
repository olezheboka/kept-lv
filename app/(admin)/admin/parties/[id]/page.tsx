"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";

export default function EditPartyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        color: "#3B82F6",
        logoUrl: "",
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
                    color: partyData.color || "#3B82F6",
                    logoUrl: partyData.logoUrl || "",
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
                color: formData.color,
                logoUrl: formData.logoUrl || null,
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
        <div className="max-w-xl mx-auto space-y-8">
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
                    <h2 className="text-base font-semibold text-foreground">Party Details</h2>
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
                                placeholder="Partijas nosaukums"
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Color <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-input shrink-0">
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Logo URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="https://..."
                                />
                            </div>
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
