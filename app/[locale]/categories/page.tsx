
import { getCategories } from "@/lib/db";
import { CategoriesClient } from "@/components/CategoriesClient";

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function CategoriesPage({ params }: PageProps) {
    const { locale } = await params;
    const categories = await getCategories(locale as "lv" | "en" | "ru");

    return <CategoriesClient categories={categories} />;
}
