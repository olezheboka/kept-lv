import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { redirect, notFound } from "next/navigation";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        notFound();
    }

    async function handleSuccess() {
        "use server";
        redirect("/admin/categories");
    }

    async function handleCancel() {
        "use server";
        redirect("/admin/categories");
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Category"
                description={`Editing: ${category.name}`}
                breadcrumbs={[
                    { label: "Categories", href: "/admin/categories" },
                    { label: "Edit" },
                ]}
            />

            <Card>
                <CardContent className="p-6">
                    <CategoryForm
                        initialData={category}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
