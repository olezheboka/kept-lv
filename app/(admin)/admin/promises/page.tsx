import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Plus, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

async function getPromises() {
  return prisma.promise.findMany({
    include: {
      politician: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminPromisesPage() {
  /* No translations needed */
  const promises = await getPromises();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Manage Promises</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all promise entries.</p>
        </div>
        <Link
          href="/admin/promises/new"
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
              <th className="px-4 py-3 font-medium text-muted-foreground w-[40%]">
                Promise
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Politician
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Category
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground w-[120px]">
                Last Updated
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {promises.map((promise) => (
              <tr key={promise.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-foreground line-clamp-2">
                    {promise.title}
                  </p>
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">
                  {promise.politician.name}
                </td>
                <td className="px-4 py-3 align-top">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                    ${promise.status === "KEPT" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      promise.status === "NOT_KEPT" ? "bg-red-50 text-red-700 border-red-200" :
                        promise.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          promise.status === "PARTIAL" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                    {promise.status}
                  </span>
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">
                  {promise.category.name}
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground text-sm">
                  {new Date(promise.updatedAt).toLocaleString("lv-LV", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/promises/${promise.id}`}
                      className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={promise.id} type="promises" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {promises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No promises found</p>
            <p className="text-sm text-muted-foreground/60 w-64 mt-1">Get started by creating a new promise entry.</p>
          </div>
        )}
      </div>
    </div>
  );
}
