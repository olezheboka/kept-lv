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
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black text-white">Jauns Solījums</h1>
        <Link
          href="/admin/promises"
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Atpakaļ
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Promise Text */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Solījuma informācija</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nosaukums
              </label>
              <textarea
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Solījuma virsraksts..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Apraksts (neobligāts)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Pilns apraksts..."
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Detaļas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Politiķis
              </label>
              <select
                required
                value={formData.politicianId}
                onChange={(e) => setFormData({ ...formData, politicianId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              >
                <option value="">Izvēlieties politiķi...</option>
                {politicians.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kategorija
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              >
                <option value="">Izvēlieties kategoriju...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Statuss
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              >
                <option value="IN_PROGRESS">Procesā</option>
                <option value="KEPT">Izpildīts</option>
                <option value="NOT_KEPT">Neizpildīts</option>
                <option value="PARTIAL">Daļēji izpildīts</option>
                <option value="ABANDONED">Pamests</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Datums
              </label>
              <input
                type="date"
                required
                value={formData.dateOfPromise}
                onChange={(e) => setFormData({ ...formData, dateOfPromise: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Statusa atjaunināšanas datums
              </label>
              <input
                type="date"
                value={formData.statusUpdatedAt}
                onChange={(e) => setFormData({ ...formData, statusUpdatedAt: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Source */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Avots (Neobligāts)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Avota tips
              </label>
              <select
                value={formData.sourceType}
                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              >
                <option value="VIDEO">Video</option>
                <option value="ARTICLE">Raksts</option>
                <option value="INTERVIEW">Intervija</option>
                <option value="SOCIAL_MEDIA">Sociālie tīkli</option>
                <option value="DOCUMENT">Dokuments</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL
              </label>
              <input
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Avota nosaukums
              </label>
              <input
                type="text"
                value={formData.sourceTitle}
                onChange={(e) => setFormData({ ...formData, sourceTitle: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Avota nosaukums..."
              />
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Paskaidrojums (Neobligāts)</h2>
          <textarea
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
              text-white placeholder-gray-500 focus:bg-white/20 transition-all"
            placeholder="Kāpēc statuss ir šāds?..."
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/promises"
            className="px-6 py-3 rounded-lg bg-white/10 text-white font-bold
              hover:bg-white/20 transition-all"
          >
            Atcelt
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600
              text-white font-bold hover:shadow-lg transition-all
              disabled:opacity-50"
          >
            {loading ? "Veido..." : "Izveidot Solījumu"}
          </button>
        </div>
      </form>
    </div>
  );
}
