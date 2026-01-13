"use client";


import { useTranslations } from "next-intl";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";

interface Party {
    id: string;
    name: string;
}

export default function EditPoliticianPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const t = useTranslations("admin");
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [parties, setParties] = useState<Party[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        role: "",
        bio: "",
        education: "",
        isActive: true,
        partyId: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [partiesRes, politicianRes] = await Promise.all([
                    fetch("/api/parties"),
                    fetch(`/api/politicians/${id}`)
                ]);

                if (!politicianRes.ok) {
                    alert("Failed to load politician data");
                    return;
                }

                const partiesData = await partiesRes.json();
                const politicianData = await politicianRes.json();

                setParties(partiesData);


                setFormData({
                    name: politicianData.name || "",
                    slug: politicianData.slug || "",
                    role: politicianData.role || "",
                    bio: typeof politicianData.bio === 'string' ? politicianData.bio : politicianData.bio?.lv || "",
                    education: politicianData.education || "",
                    isActive: politicianData.isActive,
                    partyId: politicianData.partyId || "",
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
                role: formData.role || null,
                bio: formData.bio || null,
                education: formData.education || null,
                isActive: formData.isActive,
                partyId: formData.partyId || null,
            };

            const res = await fetch(`/api/politicians/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/admin/politicians");
                router.refresh();
            } else {
                const error = await res.json();
                alert("Failed to update: " + JSON.stringify(error));
            }
        } catch (error) {
            alert("Failed to update politician");
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
                        href="/admin/politicians"
                        className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
                        title="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("edit")} Politician</h1>
                        <p className="text-sm text-muted-foreground mt-1">Update politician details.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-foreground">Basic Info</h2>
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
                                placeholder="Jānis Bērziņš"
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
                                placeholder="janis-berzins"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Position (Role) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="e.g. Health Minister"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Education
                            </label>
                            <input
                                type="text"
                                value={formData.education}
                                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="e.g. PhD in Economics"
                            />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="inOffice"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="inOffice" className="text-sm font-medium text-foreground cursor-pointer">
                                In Office / In Charge
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-foreground">Affiliation</h2>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Party
                        </label>
                        <select
                            value={formData.partyId}
                            onChange={(e) => setFormData({ ...formData, partyId: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                            <option value="">Independent (No Party)</option>
                            {parties.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-foreground">Biography</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Bio
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Biogrāfija..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Link
                        href="/admin/politicians"
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
                        {saving ? "Saving Changes..." : "Update Politician"}
                    </button>
                </div>
            </form>
        </div>
    );
}
