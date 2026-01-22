import { Suspense } from "react";
import { getCategories } from "@/lib/db";
import { CategoriesClient } from "@/components/CategoriesClient";

interface PageProps {
    params: Promise<{ locale: string }>;
}

export const dynamic = 'force-dynamic';

export default async function CategoriesPage({ params }: PageProps) {
    const { locale } = await params;
    const categories = await getCategories(locale as "lv" | "en" | "ru");

    return (
        <CategoriesClient categories={categories} />
    );
}
