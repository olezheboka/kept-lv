import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Plus, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getParties() {
  return prisma.party.findMany({
    include: {
      _count: { select: { politicians: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminPartiesPage() {
  /* No translations needed */
  const parties = await getParties();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Manage Parties</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage political parties and colors.</p>
        </div>
        <Link
          href="/admin/parties/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New
        </Link>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Color
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Politicians
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {parties.map((party) => (
              <tr key={party.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 align-top font-medium text-foreground">
                  {(party.name as any)}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: party.color }}
                    />
                    <span className="text-muted-foreground font-mono text-xs uppercase">{party.color}</span>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">
                  {party._count.politicians}
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/parties/${party.id}`}
                      className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={party.id} type="parties" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {parties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No parties found</p>
            <p className="text-sm text-muted-foreground/60 w-64 mt-1">Get started by adding a new party.</p>
          </div>
        )}
      </div>
    </div>
  );
}
