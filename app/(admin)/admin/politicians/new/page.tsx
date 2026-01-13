"use client";


import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils";

interface Party {
  id: string;
  name: string;
}

export default function NewPoliticianPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState<Party[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    // imageUrl: "", // Removed from UI
    role: "", // Position
    bio: "",
    education: "",
    isActive: true, // In Office
    partyId: "",
  });

  useEffect(() => {
    fetch("/api/parties").then((r) => r.json()).then(setParties);
  }, []);

  useEffect(() => {
    if (formData.name && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: slugify(formData.name) }));
    }
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      const res = await fetch("/api/politicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/politicians");
        router.refresh();
      } else {
        const error = await res.json();
        alert("Failed to create: " + JSON.stringify(error));
      }
    } catch (error) {
      alert("Failed to create politician");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("addNew")} Politician</h1>
          <p className="text-muted-foreground mt-1">Create a new politician profile.</p>
        </div>
        <Link href="/admin/politicians" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-6">Basic Info</h2>
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
                Party
              </label>
              <select
                value={formData.partyId}
                onChange={(e) => setFormData({ ...formData, partyId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              >
                <option value="">No Party / Independent</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
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

            <div className="flex items-center gap-2 pt-8">
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

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-6">Biography</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={5}
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
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? "Creating..." : "Create Politician"}
          </button>
        </div>
      </form>
    </div>
  );
}
