
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPromisesByCategory, getCategoryBySlug } from '@/lib/db';
import { CategoryDetailClient } from '@/components/CategoryDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

import { notFound } from 'next/navigation';

export const revalidate = 60;

const CategoryDetailPage = async ({ params }: PageProps) => {
    const { id } = await params;
    const category = await getCategoryBySlug(id);

    if (!category) {
        notFound();
    }

    const promises = await getPromisesByCategory(category.id);

    return (
        <CategoryDetailClient category={category} promises={promises} />
    );
};

export default CategoryDetailPage;
