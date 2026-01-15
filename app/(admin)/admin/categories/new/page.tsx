import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { redirect } from "next/navigation";

export default function NewCategoryPage() {
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
                title="Create Category"
                description="Add a new category."
                breadcrumbs={[
                    { label: "Categories", href: "/admin/categories" },
                    { label: "Create" },
                ]}
            />

            <Card>
                <CardContent className="p-6">
                    <CategoryForm
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
