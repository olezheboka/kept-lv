import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PromiseForm } from "@/components/admin/promises/PromiseForm";
import { redirect } from "next/navigation";

export default async function NewPromisePage() {
    const [politicians, categories, parties] = await Promise.all([
        prisma.politician.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
        prisma.category.findMany({
            select: { id: true, name: true, slug: true },
            orderBy: { name: "asc" },
        }),
        prisma.party.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
    ]);

    async function handleSuccess() {
        "use server";
        redirect("/admin/promises");
    }

    async function handleCancel() {
        "use server";
        redirect("/admin/promises");
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Create Promise"
                description="Add a new promise record."
                breadcrumbs={[
                    { label: "Promises", href: "/admin/promises" },
                    { label: "Create Request" },
                ]}
            />

            <Card>
                <CardContent className="p-6">
                    <PromiseForm
                        politicians={politicians}
                        parties={parties}
                        categories={categories}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
