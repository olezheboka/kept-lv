
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPromisesByCategory } from '@/lib/db';
import { CATEGORIES } from '@/lib/types';
import { CategoryDetailClient } from '@/components/CategoryDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

const CategoryDetailPage = async ({ params }: PageProps) => {
    const { id } = await params;
    const category = CATEGORIES.find(c => c.id === id);

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
