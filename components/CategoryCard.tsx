
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import type { CategoryWithStats } from '@/lib/db';
import { SLUG_ICON_MAP } from '@/lib/categoryIcons';
import { getPlainTextFromLexical } from '@/lib/lexical-utils';

interface CategoryCardProps {
    category: CategoryWithStats;
}

export function CategoryCard({ category }: CategoryCardProps) {
    const { total, kept, partiallyKept, pending, broken, cancelled } = category.stats;

    return (
        <Link href={`/categories/${category.slug}`} className="block h-full">
            <Card className="group overflow-hidden border-border/50 hover:shadow-elevated hover:border-border transition-all duration-300 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                    {/* Header Step */}
                    <div className="flex items-center gap-4 mb-6">
                        {/* Icon */}
                        <div className="shrink-0">
                            {category.imageUrl ? (
                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={category.imageUrl}
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    {(() => {
                                        const IconComponent = SLUG_ICON_MAP[category.slug] || TrendingUp;
                                        return <IconComponent className="h-6 w-6" />;
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground leading-tight group-hover:text-accent transition-colors mb-1">
                                {category.name}
                            </h3>
                            {category.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {getPlainTextFromLexical(category.description)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Stats Bar (Always Visible) */}
                    <div className="mt-auto">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                            <span>{total} solījumi</span>
                            <span>{total > 0 ? Math.round((kept / total) * 100) : 0}% izpildīti</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                            {pending > 0 && (
                                <div
                                    className="h-full bg-status-pending"
                                    style={{ width: `${(pending / total) * 100}%` }}
                                />
                            )}
                            {partiallyKept > 0 && (
                                <div
                                    className="h-full bg-status-partially"
                                    style={{ width: `${(partiallyKept / total) * 100}%` }}
                                />
                            )}
                            {kept > 0 && (
                                <div
                                    className="h-full bg-status-kept"
                                    style={{ width: `${(kept / total) * 100}%` }}
                                />
                            )}
                            {broken > 0 && (
                                <div
                                    className="h-full bg-status-broken"
                                    style={{ width: `${(broken / total) * 100}%` }}
                                />
                            )}
                            {cancelled > 0 && (
                                <div
                                    className="h-full bg-status-unrated-bar"
                                    style={{ width: `${(cancelled / total) * 100}%` }}
                                />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
