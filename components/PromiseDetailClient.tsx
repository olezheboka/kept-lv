"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/StatusBadge';
import { PartyBadge } from '@/components/PartyBadge';
import { PromiseCard } from '@/components/PromiseCard';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from '@/components/ui/card';
import { Clock, ArrowLeft, Share2, Calendar, User, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { PromiseUI, PoliticianUI, PartyUI, CategoryUI } from '@/lib/db';
import { CATEGORIES } from '@/lib/types';

interface PromiseDetailClientProps {
    promise: PromiseUI | null;
    politician: PoliticianUI | null;
    party: PartyUI | null;
    category: CategoryUI | undefined;
    relatedByPolitician: PromiseUI[];
    relatedByCategory: PromiseUI[];
}

const extractDomain = (url: string) => {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
};

export const PromiseDetailClient = ({
    promise,
    politician,
    party,
    category,
    relatedByPolitician,
    relatedByCategory
}: PromiseDetailClientProps) => {

    console.log("PromiseDetailClient Debug:", promise?.id);
    console.log("Related Pol:", relatedByPolitician.length);
    console.log("Related Cat:", relatedByCategory.length);

    if (!promise) {
        return (
            <div className="flex flex-col bg-background min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Solījums nav atrasts</h1>
                    <Link href="/promises" suppressHydrationWarning>
                        <Button>Atpakaļ uz solījumiem</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // We always assume a sidebar now due to random promises filling the gap
    // But check just in case to show empty sidebar if needed (though requirement says always 2 col)

    return (
        <div className="flex flex-col bg-background">
            {/* Breadcrumb */}
            <div className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-4">
                    <Link
                        href="/promises"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        suppressHydrationWarning
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Atpakaļ uz solījumiem
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-wide py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
                    {/* Main Column */}
                    <div className="flex-1 min-w-0 space-y-8">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="w-full"
                        >
                            {/* Header Section: Author & Date */}
                            {politician && party && (
                                <div className="mb-6 pb-6 border-b border-border/50">
                                    <div className="flex flex-col md:flex-row items-start gap-6">
                                        <div className="flex-1 text-left">
                                            <div className="flex flex-col gap-1 w-full">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Link href={`/politicians/${politician.id}`} className="group inline-block" suppressHydrationWarning>
                                                        <h2 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-accent transition-colors leading-tight">
                                                            {politician.name}
                                                        </h2>
                                                    </Link>
                                                    <PartyBadge
                                                        party={party}
                                                        size="md"
                                                        className="opacity-90 flex-shrink-0 mt-1"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3 text-base text-muted-foreground min-w-0 w-full mt-1">
                                                    <TooltipProvider>
                                                        <Tooltip delayDuration={300}>
                                                            <TooltipTrigger asChild>
                                                                <span className="truncate cursor-default hover:text-foreground transition-colors max-w-[200px] md:max-w-[400px]">
                                                                    {politician.role}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="bottom" className="max-w-[300px]">
                                                                {politician.role}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    {politician.isInOffice && (
                                                        <span className="flex-shrink-0 px-2.5 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full whitespace-nowrap">
                                                            Amatā
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Promise Content Section */}
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
                                    <h3 className="font-semibold text-muted-foreground uppercase tracking-wider">
                                        Solījums
                                    </h3>

                                    <span className="text-muted-foreground/30">•</span>

                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span className="font-medium text-foreground">
                                            {format(new Date(promise.datePromised), 'dd.MM.yyyy')}
                                        </span>
                                    </div>

                                    {category && (
                                        <>
                                            <span className="text-muted-foreground/30">•</span>
                                            <span className="text-xs text-muted-foreground/70">
                                                {category.name}
                                            </span>
                                        </>
                                    )}

                                    <Button variant="ghost" size="sm" className="ml-auto gap-2 text-muted-foreground hover:text-foreground hover:bg-muted h-8 px-2">
                                        <Share2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Dalīties</span>
                                    </Button>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                                    {promise.title}
                                </h1>

                                {promise.description && (
                                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                        {promise.description}
                                    </p>
                                )}


                            </div>
                        </motion.div>



                        {/* Sources Removed */}

                        {/* Status Justification (Moved to Main Column) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="mb-8"
                        >
                            <Card className={`shadow-sm border transition-colors w-full ${promise.status === 'kept' ? "bg-status-kept-bg border-status-kept/30" :
                                promise.status === 'partially-kept' ? "bg-status-partially-bg border-status-partially/30" :
                                    promise.status === 'in-progress' ? "bg-status-progress-bg border-status-progress/30" :
                                        promise.status === 'broken' ? "bg-status-broken-bg border-status-broken/30" :
                                            "bg-status-unrated-bg border-status-unrated/30"
                                }`}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-start">
                                        <StatusBadge status={promise.status} size="lg" variant="solid" />
                                    </div>
                                    <div className="text-lg text-foreground leading-relaxed">
                                        <span className="font-bold block mb-2 text-foreground/80">Pamatojums:</span>
                                        {promise.statusJustification}
                                        {promise.sources.map((source, index) => (
                                            <a
                                                key={index}
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center h-5 px-1.5 ml-1 text-[10px] font-bold tracking-wide uppercase rounded bg-white/50 hover:bg-white text-foreground/70 hover:text-foreground transition-colors align-middle -translate-y-0.5 border border-black/5"
                                                title={source.title}
                                                suppressHydrationWarning
                                            >
                                                {source.publication}
                                            </a>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-black/5 text-xs text-foreground/70">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 opacity-70" />
                                            <span className="opacity-70">Atjaunināts:</span>
                                            <span className="font-medium">{format(new Date(promise.statusUpdatedAt), 'dd.MM.yyyy')}</span>
                                        </div>
                                        {promise.sources.length > 0 && (
                                            <>
                                                <div className="hidden sm:block w-px h-3 bg-foreground/20"></div>
                                                <div className="flex items-center gap-2">
                                                    <span className="opacity-70">Avots:</span>
                                                    <a
                                                        href={promise.sources[0].url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium hover:underline text-primary"
                                                    >
                                                        {promise.sources[0].title || extractDomain(promise.sources[0].url)}
                                                    </a>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Meta Info (Tags) */}
                        {promise.tags.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="mb-6"
                            >
                                <Card className="border-border/50">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <Tag className="h-4 w-4" />
                                            <span>Tēmturi:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {promise.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}


                    </div>

                    {/* Sidebar: Always Render (with fallback content if needed) */}
                    <div className="w-full lg:w-[480px] flex-shrink-0 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            <h2 className="text-lg font-bold text-foreground mb-4">Saistītie solījumi</h2>
                            <div className="flex flex-col gap-4">
                                {[...relatedByPolitician, ...relatedByCategory].slice(0, 3).map((related, index) => (
                                    <PromiseCard key={related.id} promise={related} index={index} />
                                ))}

                                {/* If somehow we still have 0, we could show a message, but logic ensures fallback */}
                                {[...relatedByPolitician, ...relatedByCategory].length === 0 && (
                                    <p className="text-sm text-muted-foreground">Nav saistīto solījumu.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
