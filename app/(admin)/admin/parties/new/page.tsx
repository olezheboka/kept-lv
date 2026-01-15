import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PartyForm } from "@/components/admin/parties/PartyForm";
import { redirect } from "next/navigation";

export default function NewPartyPage() {
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
                title="Create Party"
                description="Add a new political party."
                breadcrumbs={[
                    { label: "Parties", href: "/admin/parties" },
                    { label: "Create" },
                ]}
            />

            <Card>
                <CardContent className="p-6">
                    <PartyForm
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
