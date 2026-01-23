
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPromisesByCategory, getCategoryBySlug } from '@/lib/db';
import { CategoryDetailClient } from '@/components/CategoryDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

import { notFound } from 'next/navigation';

// export const revalidate = 60;
export const dynamic = 'force-dynamic';

const CategoryDetailPage = async ({ params }: PageProps) => {
    const { id } = await params;
    let category;
    let promises;

    try {
        category = await getCategoryBySlug(id);

        if (category) {
            promises = await getPromisesByCategory(category.id);
        }
    } catch (error) {
        console.error(`Error loading category ${id}:`, error);
        throw error;
    }

    if (!category) {
        notFound();
    }

    return (
        <CategoryDetailClient category={category} promises={promises!} />
    );
};

export default CategoryDetailPage;
