import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PartyForm } from "@/components/admin/parties/PartyForm";
import { redirect, notFound } from "next/navigation";

export default async function EditPartyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const party = await prisma.party.findUnique({
        where: { id },
    });

    if (!party) {
        notFound();
    }

    async function handleSuccess() {
        "use server";
        redirect("/admin/parties");
    }

    async function handleCancel() {
        "use server";
        redirect("/admin/parties");
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Party"
                description={`Editing: ${party.name}`}
                breadcrumbs={[
                    { label: "Parties", href: "/admin/parties" },
                    { label: "Edit" },
                ]}
            />

            <Card>
                <CardContent className="p-6">
                    <PartyForm
                        initialData={party}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
