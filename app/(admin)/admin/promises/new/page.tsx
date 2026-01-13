"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Politician {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function NewPromisePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    // API endpoints might return localized objects still if not updated yet, 
    // but schema change pushed them to be strings. 
    // Assuming API endpoints for fetch('/api/politicians') etc return simplified objects now.
    fetch("/api/politicians").then((r) => r.json()).then(setPoliticians);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      const res = await fetch("/api/promises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/promises");
        router.refresh();
      } else {
        const error = await res.json();
        alert("Failed to create: " + JSON.stringify(error));
      }
    } catch (error) {
      alert("Failed to create promise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Jauns Solījums</h1>
          <p className="text-muted-foreground mt-1">Izveidot jaunu solījumu.</p>
        </div>
        <Link
          href="/admin/promises"
          className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          ← Atpakaļ
        </Link>
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
                Apraksts <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Detalizēts apraksts..."
              />
            </div>
          </div>
        </div>

        {/* Metadati - Full Width */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-semibold text-foreground">Metadati</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Status, Source & Explanation - Combined */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
            <h2 className="text-base font-semibold text-foreground">Statuss, Avots un Paskaidrojums</h2>
          </div>

          {/* Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Pašreizējais statuss <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    status: newStatus,
                    // Auto-set date to today if empty when changing status
                    statusUpdatedAt: prev.statusUpdatedAt || new Date().toISOString().split('T')[0]
                  }));
                }}
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

          {/* Source Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border/50">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Avota URL
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
                Avota nosaukums
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

          {/* Explanation */}
          <div className="pt-2 border-t border-border/50">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Paskaidrojums
            </label>
            <p className="text-sm text-muted-foreground mb-2">Kāpēc šis solījums ir izpildīts, neizpildīts vai procesā?</p>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Paskaidrojums..."
            />
          </div>
        </div>   {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/admin/promises"
            className="px-4 py-2 rounded-lg border border-input bg-background text-sm font-medium hover:bg-muted transition-colors"
          >
            Atcelt
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? "Veido..." : "Izveidot Solījumu"}
          </button>
        </div>
      </form>
    </div>
  );
}
