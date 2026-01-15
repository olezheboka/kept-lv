import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PoliticianForm } from "@/components/admin/politicians/PoliticianForm";
import { redirect } from "next/navigation";

export default async function NewPoliticianPage() {
    const parties = await prisma.party.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

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
                title="Create Politician"
                description="Add a new politician."
                breadcrumbs={[
                    { label: "Politicians", href: "/admin/politicians" },
                    { label: "Create" },
                ]}
            />

            <Card>
                <CardContent className="p-6">
                    <PoliticianForm
                        parties={parties}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
