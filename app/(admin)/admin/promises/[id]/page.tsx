import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PromiseForm } from "@/components/admin/promises/PromiseForm";
import { redirect, notFound } from "next/navigation";

export default async function EditPromisePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [promise, politicians, categories] = await Promise.all([
        prisma.promise.findUnique({
            where: { id },
            include: {
                sources: true,
            }
        }),
        prisma.politician.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
        prisma.category.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
    ]);

    if (!promise) {
        notFound();
    }

    // Transform to match PromiseData interface expected by PromiseForm
    // Note: The form expects specific mapping for status enums if they differ
    const formattedPromise = {
        ...promise,
        status: promise.status as any, // Form handles normalization
        slug: promise.slug || "",
    };

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
                title="Edit Promise"
                description={`Editing promise: ${promise.title}`}
                breadcrumbs={[
                    { label: "Promises", href: "/admin/promises" },
                    { label: "Edit" },
                ]}
            />

            <Card>
                <CardContent className="p-6">
                    <PromiseForm
                        initialData={formattedPromise}
                        politicians={politicians}
                        categories={categories}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
