"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

interface Politician {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: { lv: string; en: string; ru: string };
}

export default function EditPromisePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const t = useTranslations("admin");
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [politicians, setPoliticians] = useState<Politician[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState({
        titleLv: "",
        titleEn: "",
        titleRu: "",
        descriptionLv: "",
        descriptionEn: "",
        descriptionRu: "",
        status: "IN_PROGRESS",
        explanationLv: "",
        explanationEn: "",
        explanationRu: "",
        dateOfPromise: "",
        statusUpdatedAt: "",
        politicianId: "",
        categoryId: "",
        sourceType: "VIDEO",
        sourceUrl: "",
        sourceTitleLv: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [politiciansRes, categoriesRes, promiseRes] = await Promise.all([
                    fetch("/api/politicians"),
                    fetch("/api/categories"),
                    fetch(`/api/promises/${id}`)
                ]);

                if (!promiseRes.ok) {
                    alert("Failed to load promise data");
                    return;
                }

                const politiciansData = await politiciansRes.json();
                const categoriesData = await categoriesRes.json();
                const promiseData = await promiseRes.json();

                setPoliticians(politiciansData);
                setCategories(categoriesData);

                // Map promise data to form
                const title = promiseData.title as any || {};
                const description = promiseData.description as any || {};
                const explanation = promiseData.explanation as any || {};
                const source = promiseData.sources?.[0] || {};

                setFormData({
                    titleLv: title.lv || "",
                    titleEn: title.en || "",
                    titleRu: title.ru || "",
                    descriptionLv: description.lv || "",
                    descriptionEn: description.en || "",
                    descriptionRu: description.ru || "",
                    status: promiseData.status,
                    explanationLv: explanation.lv || "",
                    explanationEn: explanation.en || "",
                    explanationRu: explanation.ru || "",
                    dateOfPromise: promiseData.dateOfPromise ? new Date(promiseData.dateOfPromise).toISOString().split('T')[0] : "",
                    statusUpdatedAt: promiseData.statusUpdatedAt ? new Date(promiseData.statusUpdatedAt).toISOString().split('T')[0] : "",
                    politicianId: promiseData.politicianId,
                    categoryId: promiseData.categoryId,
                    sourceType: source.type || "VIDEO",
                    sourceUrl: source.url || "",
                    sourceTitleLv: (source.title as any)?.lv || "",
                });

                setLoading(false);
            } catch (error) {
                console.error(error);
                alert("An error occurred while loading data");
            }
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                title: { lv: formData.titleLv, en: formData.titleEn, ru: formData.titleRu },
                description: formData.descriptionLv
                    ? { lv: formData.descriptionLv, en: formData.descriptionEn, ru: formData.descriptionRu }
                    : null,
                status: formData.status,
                explanation: formData.explanationLv
                    ? { lv: formData.explanationLv, en: formData.explanationEn, ru: formData.explanationRu }
                    : null,
                dateOfPromise: new Date(formData.dateOfPromise).toISOString(),
                statusUpdatedAt: formData.statusUpdatedAt ? new Date(formData.statusUpdatedAt).toISOString() : null,
                politicianId: formData.politicianId,
                categoryId: formData.categoryId,
                sources: formData.sourceUrl
                    ? [{
                        type: formData.sourceType,
                        url: formData.sourceUrl,
                        title: formData.sourceTitleLv ? { lv: formData.sourceTitleLv, en: "", ru: "" } : null,
                    }]
                    : [],
            };

            const res = await fetch(`/api/promises/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/admin/promises");
                router.refresh();
            } else {
                const error = await res.json();
                alert("Failed to update: " + JSON.stringify(error));
            }
        } catch (error) {
            alert("Failed to update promise");
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
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/promises"
                        className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
                        title="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("edit")} Promise</h1>
                        <p className="text-sm text-muted-foreground mt-1">Update promise details and status.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Promise Text */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-foreground">Basic Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Latvian Title <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                value={formData.titleLv}
                                onChange={(e) => setFormData({ ...formData, titleLv: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                placeholder="Solījuma virsraksts latviešu valodā..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                English Title
                            </label>
                            <textarea
                                value={formData.titleEn}
                                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                placeholder="Promise title in English..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                Russian Title
                            </label>
                            <textarea
                                value={formData.titleRu}
                                onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                placeholder="Заголовок обещания на русском..."
                            />
                        </div>
                    </div>
                </div>

                {/* Descriptions */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-foreground">Detailed Description</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Latvian Description
                            </label>
                            <textarea
                                value={formData.descriptionLv}
                                onChange={(e) => setFormData({ ...formData, descriptionLv: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Detalizēts apraksts..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                English Description
                            </label>
                            <textarea
                                value={formData.descriptionEn}
                                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Full description..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                Russian Description
                            </label>
                            <textarea
                                value={formData.descriptionRu}
                                onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Полное описание..."
                            />
                        </div>
                    </div>
                </div>

                {/* Details - 2 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <h2 className="text-base font-semibold text-foreground">Metadata</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Politician <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.politicianId}
                                    onChange={(e) => setFormData({ ...formData, politicianId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="">Select politician...</option>
                                    {politicians.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="">Select category...</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name.lv || c.name.en}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Date of Promise <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.dateOfPromise}
                                    onChange={(e) => setFormData({ ...formData, dateOfPromise: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <h2 className="text-base font-semibold text-foreground">Status & Validation</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Current Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="KEPT">Kept</option>
                                    <option value="NOT_KEPT">Not Kept</option>
                                    <option value="PARTIAL">Partial</option>
                                    <option value="ABANDONED">Abandoned</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Status Updated At
                                </label>
                                <input
                                    type="date"
                                    value={formData.statusUpdatedAt}
                                    onChange={(e) => setFormData({ ...formData, statusUpdatedAt: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Source */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-foreground">Source Evidence</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Source Type
                            </label>
                            <select
                                value={formData.sourceType}
                                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            >
                                <option value="VIDEO">Video</option>
                                <option value="ARTICLE">Article</option>
                                <option value="INTERVIEW">Interview</option>
                                <option value="SOCIAL_MEDIA">Social Media</option>
                                <option value="DOCUMENT">Document</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Source URL
                            </label>
                            <input
                                type="url"
                                value={formData.sourceUrl}
                                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-foreground">Explanation / Justification</h2>
                    <p className="text-sm text-muted-foreground -mt-4 mb-4">Why is this promise considered kept, not kept, or in progress?</p>
                    <textarea
                        value={formData.explanationLv}
                        onChange={(e) => setFormData({ ...formData, explanationLv: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Paskaidrojums latviešu valodā..."
                    />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Link
                        href="/admin/promises"
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
                        {saving ? "Saving Changes..." : "Update Promise"}
                    </button>
                </div>
            </form>
        </div>
    );
}
