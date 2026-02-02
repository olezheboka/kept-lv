"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/StatusBadge';
import { PromiseCard } from '@/components/PromiseCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Share2, Calendar, Tag, Link2, MessageCircle, Send, Copy, FileText } from 'lucide-react';
import { SLUG_ICON_MAP } from '@/lib/categoryIcons';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { PromiseUI, PoliticianUI, PartyUI, CategoryUI } from '@/lib/db';
import { PromiseTimeline } from '@/components/PromiseTimeline';


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
    const { toast } = useToast();

    const isCoalition = promise?.type === 'COALITION';
    const isParty = promise?.type === 'PARTY';

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Saite nokopēta",
                description: "Saite veiksmīgi nokopēta starpliktuvē",
                duration: 4000,
                variant: "success",
            });
        }
    };

    const handleShareWhatsApp = () => {
        if (typeof window !== 'undefined') {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent(`${promise?.title || 'Solījums'} - ${politician?.name || ''}`);
            window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
        }
    };

    const handleShareTelegram = () => {
        if (typeof window !== 'undefined') {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent(`${promise?.title || 'Solījums'} - ${politician?.name || ''}`);
            window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
        }
    };



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
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-8 w-full">
                    {/* Main Column */}
                    <div className="flex-1 min-w-0 space-y-8">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="w-full"
                        >
                            {/* Header Section: Category, Date, Share */}
                            <div className="mb-6">
                                {/* Row 1: Category + Date + Share Button */}
                                <div className="flex items-center justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground/70">
                                        {/* Date first */}
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            <span>{format(new Date(promise.datePromised), 'dd.MM.yyyy')}</span>
                                        </div>

                                        {/* Category with proper icon */}
                                        {category && (() => {
                                            const CategoryIcon = SLUG_ICON_MAP[category.slug] || FileText;
                                            return (
                                                <Link
                                                    href={`/categories/${category.slug}`}
                                                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                                    suppressHydrationWarning
                                                >
                                                    <CategoryIcon className="h-4 w-4" />
                                                    <span>{category.name}</span>
                                                </Link>
                                            );
                                        })()}
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 h-9 px-3 border-border hover:bg-muted"
                                            >
                                                <Share2 className="h-4 w-4" />
                                                <span>Dalīties</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={handleCopyLink}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                <span>Kopēt saiti</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleShareWhatsApp}>
                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                <span>WhatsApp</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleShareTelegram}>
                                                <Send className="mr-2 h-4 w-4" />
                                                <span>Telegram</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Row 2: Promisor */}
                                <div className="flex items-center gap-3 mb-4">
                                    {isCoalition ? (
                                        <span className="text-muted-foreground font-semibold">
                                            {(promise.coalitionParties || []).map((p, idx) => (
                                                <span key={p.id}>
                                                    <Link
                                                        href={`/parties/${p.slug || p.id}`}
                                                        className="hover:text-primary transition-colors"
                                                        suppressHydrationWarning
                                                    >
                                                        {p.name}
                                                    </Link>
                                                    {idx < (promise.coalitionParties?.length || 0) - 1 && ', '}
                                                </span>
                                            ))}
                                        </span>
                                    ) : isParty && party ? (
                                        <Link
                                            href={`/parties/${party.id}`}
                                            className="text-muted-foreground font-semibold hover:text-primary transition-colors"
                                            suppressHydrationWarning
                                        >
                                            {party.name}
                                        </Link>
                                    ) : politician ? (
                                        <Link
                                            href={`/politicians/${politician.id}`}
                                            className="text-muted-foreground font-semibold hover:text-primary transition-colors"
                                            suppressHydrationWarning
                                        >
                                            {politician.name}
                                        </Link>
                                    ) : null}
                                </div>

                                {/* Row 3: Title */}
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                                    {promise.title}
                                </h1>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                {promise.description && (
                                    <p className="text-base md:text-lg text-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                                        {promise.description}
                                    </p>
                                )}

                                {/* Promise Source (Manifesto) */}
                                {(() => {
                                    const source = promise.sources?.find(s => s.type === "MANIFESTO");
                                    if (source) return (
                                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                                            <Link2 className="h-4 w-4 opacity-70" />
                                            <span className="opacity-70 font-semibold">Avots:</span>
                                            <a
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:underline text-primary text-base"
                                            >
                                                {source.title || extractDomain(source.url)}
                                            </a>
                                        </div>
                                    );
                                })()}
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
                                    promise.status === 'pending' ? "bg-status-pending-bg border-status-pending/30" :
                                        promise.status === 'broken' ? "bg-status-broken-bg border-status-broken/30" :
                                            "bg-[#F4F5F7] border-[#C9CED7]"
                                }`}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-start">
                                        <StatusBadge status={promise.status} size="lg" variant="solid" />
                                    </div>
                                    {promise.statusJustification && (
                                        <div className="text-base md:text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                                            <span className="font-bold block mb-2 text-foreground/80">Pamatojums:</span>
                                            {promise.statusJustification}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-black/5 text-sm text-foreground/70">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 opacity-70" />
                                            <span className="opacity-70">Atjaunināts:</span>
                                            <span className="font-medium">{format(new Date(promise.statusUpdatedAt), 'dd.MM.yyyy')}</span>
                                        </div>
                                        {(() => {
                                            // 1. Try Promise Evidence (New schema)
                                            if (promise.evidence && promise.evidence.length > 0) {
                                                const e = promise.evidence[0];
                                                return (
                                                    <>
                                                        <div className="hidden sm:block w-px h-3 bg-foreground/20"></div>
                                                        <div className="flex items-center gap-2">
                                                            <Link2 className="h-3.5 w-3.5 opacity-70" />
                                                            <span className="opacity-70">Avots:</span>
                                                            <a
                                                                href={e.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-medium hover:underline text-primary"
                                                            >
                                                                {extractDomain(e.url)}
                                                            </a>
                                                        </div>
                                                    </>
                                                );
                                            }

                                            // 2. Legacy Fallback: Try finding it in Sources (any non-manifesto)
                                            const legacyEvidence = promise.sources?.find(s => s.type !== "MANIFESTO");

                                            if (legacyEvidence) return (
                                                <>
                                                    <div className="hidden sm:block w-px h-3 bg-foreground/20"></div>
                                                    <div className="flex items-center gap-2">
                                                        <Link2 className="h-3.5 w-3.5 opacity-70" />
                                                        <span className="opacity-70">Avots:</span>
                                                        <a
                                                            href={legacyEvidence.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-medium hover:underline text-primary"
                                                        >
                                                            {legacyEvidence.title || extractDomain(legacyEvidence.url)}
                                                        </a>
                                                    </div>
                                                </>
                                            );
                                            return null;
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                            className="mb-8"
                        >
                            <PromiseTimeline
                                history={promise.statusHistory || []}
                                createdAt={promise.datePromised}
                            />
                        </motion.div>

                        {promise.tags && promise.tags.length > 0 && (
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
                                                <Link
                                                    key={tag}
                                                    href={`/promises?q=${encodeURIComponent(tag)}`}
                                                    className="px-2 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                                >
                                                    #{tag}
                                                </Link>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}


                    </div>

                    {/* Sidebar: Always Render (with fallback content if needed) */}
                    <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
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
