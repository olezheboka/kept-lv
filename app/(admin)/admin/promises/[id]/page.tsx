"use client";

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
    name: string;
}

export default function EditPromisePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [politicians, setPoliticians] = useState<Politician[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "IN_PROGRESS",
        explanation: "",
        dateOfPromise: "",
        statusUpdatedAt: "",
        politicianId: "",
        categoryId: "",
        sourceType: "VIDEO",
        sourceUrl: "",
        sourceTitle: "",
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

                const source = promiseData.sources?.[0] || {};

                setFormData({
                    title: typeof promiseData.title === 'string' ? promiseData.title : promiseData.title?.lv || "",
                    description: typeof promiseData.description === 'string' ? promiseData.description : promiseData.description?.lv || "",
                    status: promiseData.status,
                    explanation: typeof promiseData.explanation === 'string' ? promiseData.explanation : promiseData.explanation?.lv || "",
                    dateOfPromise: promiseData.dateOfPromise ? new Date(promiseData.dateOfPromise).toISOString().split('T')[0] : "",
                    statusUpdatedAt: promiseData.statusUpdatedAt ? new Date(promiseData.statusUpdatedAt).toISOString().split('T')[0] : "",
                    politicianId: promiseData.politicianId,
                    categoryId: promiseData.categoryId,
                    sourceType: source.type || "VIDEO",
                    sourceUrl: source.url || "",
                    sourceTitle: typeof source.title === 'string' ? source.title : source.title?.lv || "",
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
                title: formData.title,
                description: formData.description || null,
                status: formData.status,
                explanation: formData.explanation || null,
                dateOfPromise: new Date(formData.dateOfPromise).toISOString(),
                statusUpdatedAt: formData.statusUpdatedAt ? new Date(formData.statusUpdatedAt).toISOString() : null,
                politicianId: formData.politicianId,
                categoryId: formData.categoryId,
                sources: formData.sourceUrl
                    ? [{
                        type: formData.sourceType,
                        url: formData.sourceUrl,
                        title: formData.sourceTitle || null,
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
                        title="Atpakaļ"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Labot Solījumu</h1>
                        <p className="text-sm text-muted-foreground mt-1">Atjauniniet solījuma informāciju un statusu.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Promise Text */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-foreground">Pamatinformācija</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Nosaukums <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                placeholder="Solījuma virsraksts..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Apraksts
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Detalizēts apraksts..."
                            />
                        </div>
                    </div>
                </div>

                {/* Details - 2 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <h2 className="text-base font-semibold text-foreground">Metadati</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Politiķis <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.politicianId}
                                    onChange={(e) => setFormData({ ...formData, politicianId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="">Izvēlieties politiķi...</option>
                                    {politicians.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Kategorija <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="">Izvēlieties kategoriju...</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Solījuma datums <span className="text-red-500">*</span>
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
                        <h2 className="text-base font-semibold text-foreground">Statuss</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Pašreizējais statuss
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="IN_PROGRESS">Procesā</option>
                                    <option value="KEPT">Izpildīts</option>
                                    <option value="NOT_KEPT">Neizpildīts</option>
                                    <option value="PARTIAL">Daļēji izpildīts</option>
                                    <option value="ABANDONED">Pamests</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Statusa atjaunināšanas datums
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
                    <h2 className="text-base font-semibold text-foreground">Avots</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Tips
                            </label>
                            <select
                                value={formData.sourceType}
                                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            >
                                <option value="VIDEO">Video</option>
                                <option value="ARTICLE">Raksts</option>
                                <option value="INTERVIEW">Intervija</option>
                                <option value="SOCIAL_MEDIA">Sociālie tīkli</option>
                                <option value="DOCUMENT">Dokuments</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                URL
                            </label>
                            <input
                                type="url"
                                value={formData.sourceUrl}
                                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Nosaukums
                            </label>
                            <input
                                type="text"
                                value={formData.sourceTitle}
                                onChange={(e) => setFormData({ ...formData, sourceTitle: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Avota nosaukums..."
                            />
                        </div>
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="text-base font-semibold text-foreground">Paskaidrojums</h2>
                    <p className="text-sm text-muted-foreground -mt-4 mb-4">Kāpēc šis solījums ir izpildīts, neizpildīts vai procesā?</p>
                    <textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Paskaidrojums..."
                    />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Link
                        href="/admin/promises"
                        className="px-4 py-2 rounded-lg border border-input bg-background text-sm font-medium hover:bg-muted transition-colors"
                    >
                        Atcelt
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {saving ? "Saglabāt izmaiņas" : "Atjaunināt Solījumu"}
                    </button>
                </div>
            </form>
        </div>
    );
}
