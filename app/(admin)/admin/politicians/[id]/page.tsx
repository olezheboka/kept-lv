import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PoliticianForm } from "@/components/admin/politicians/PoliticianForm";
import { redirect, notFound } from "next/navigation";

export default async function EditPoliticianPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [politician, parties] = await Promise.all([
        prisma.politician.findUnique({
            where: { id },
            include: {
                jobs: true,
                educationEntries: true,
            },
        }),
        prisma.party.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
    ]);

    if (!politician) {
        notFound();
    }

    async function handleSuccess() {
        "use server";
        redirect("/admin/politicians");
    }

    async function handleCancel() {
        "use server";
        redirect("/admin/politicians");
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit politician"
                description={`Editing: ${politician.name}`}
                breadcrumbs={[
                    { label: "Politicians", href: "/admin/politicians" },
                    { label: "Edit" },
                ]}
            />

            <Card>
                <CardContent className="p-6">
                    <PoliticianForm
                        initialData={politician}
                        parties={parties}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
