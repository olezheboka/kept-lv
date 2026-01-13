import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Plus, Users } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getPoliticians() {
  return prisma.politician.findMany({
    include: {
      party: { select: { name: true, color: true } },
      _count: { select: { promises: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminPoliticiansPage() {
  const t = await getTranslations({ locale: "lv", namespace: "admin" });
  const politicians = await getPoliticians();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("managePoliticians")}</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage politicians and their affiliations.</p>
        </div>
        <Link
          href="/admin/politicians/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t("addNew")}
        </Link>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground w-[200px]">
                Name
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Position
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Party
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground w-[100px]">
                Updated
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-center">
                Promises
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {politicians.map((politician) => (
              <tr key={politician.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 align-top font-medium text-foreground">
                  {politician.name}
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">
                  {politician.role || "-"}
                </td>
                <td className="px-4 py-3 align-top">
                  {politician.party ? (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: (politician.party.color as any) }}
                    >
                      {(politician.party.name as any)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      Independent
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground whitespace-nowrap">
                  {new Date(politician.updatedAt).toLocaleDateString("lv-LV", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground text-center">
                  {politician._count.promises}
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/politicians/${politician.id}`}
                      className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={politician.id} type="politicians" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {politicians.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No politicians found</p>
            <p className="text-sm text-muted-foreground/60 w-64 mt-1">Get started by adding a new politician.</p>
          </div>
        )}
      </div>
    </div>
  );
}
