import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { ConfigForm } from "@/components/admin/config/ConfigForm";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function getConfig() {
    try {
        // @ts-ignore - SystemConfig is generated but TS server might not see it yet
        const configs = await prisma.systemConfig.findMany();
        return configs.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
    } catch (error) {
        console.error("Failed to fetch system config:", error);
        return {};
    }
}

export default async function ConfigPage() {
    const config = await getConfig();

    const initialData = {
        siteName: config.siteName || "solījums.lv",
        title: config.title || "Solījums.lv - Seko līdzi varas pārstāvju solījumiem un to izpildei",
        description: config.description || "Neatkarīga un objektīva platforma, kas atspoguļo valdības solījumu izpildi.",
        ogImageUrl: config.ogImageUrl || "",
        faviconUrl: config.faviconUrl || "",
        keywords: config.keywords || "",
        twitterHandle: config.twitterHandle || "",
        googleVerificationId: config.googleVerificationId || "",
    };

    async function handleSuccess() {
        "use server";
        redirect("/admin/config");
    }

    async function handleCancel() {
        "use server";
        redirect("/admin");
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Configuration"
                description="Manage system settings and metadata."
                breadcrumbs={[
                    { label: "Configuration" },
                ]}
            />

            <Card>
                <CardContent className="p-6">
                    <ConfigForm
                        initialData={initialData}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
