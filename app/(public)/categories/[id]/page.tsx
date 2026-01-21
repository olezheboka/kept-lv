
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPromisesByCategory, getCategoryBySlug } from '@/lib/db';
import { CategoryDetailClient } from '@/components/CategoryDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

const CategoryDetailPage = async ({ params }: PageProps) => {
    const { id } = await params;
    const category = await getCategoryBySlug(id);

    if (!category) {
        return (
            <div className="flex flex-col bg-background min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Kategorija nav atrasta</h1>
                    <Link href="/categories">
                        <Button>Atpakaļ uz kategorijām</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const promises = await getPromisesByCategory(category.id);

    return (
        <CategoryDetailClient category={category} promises={promises} />
    );
};

export default CategoryDetailPage;
