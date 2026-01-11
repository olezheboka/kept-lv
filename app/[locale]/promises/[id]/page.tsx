"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/StatusBadge';
import { PartyBadge } from '@/components/PartyBadge';
import { PromiseCard } from '@/components/PromiseCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPromiseById, getPoliticianById, getPartyById, getPromisesByPolitician, getPromisesByCategory } from '@/lib/data';
import { CATEGORIES } from '@/lib/types';
import { Clock, ExternalLink, ArrowLeft, Share2, Calendar, User, Info, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { lv } from 'date-fns/locale';

const PromiseDetail = () => {
    const params = useParams();
    const id = params?.id as string;
    const promise = id ? getPromiseById(id) : undefined;

    if (!promise) {
        return (
            <div className="flex flex-col bg-background min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Solījums nav atrasts</h1>
                    <Link href="/promises">
                        <Button>Atpakaļ uz solījumiem</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const politician = getPoliticianById(promise.politicianId);
    const party = getPartyById(promise.partyId);
    const category = CATEGORIES.find(c => c.id === promise.category);

    const relatedByPolitician = getPromisesByPolitician(promise.politicianId)
        .filter(p => p.id !== promise.id)
        .slice(0, 2);

    const relatedByCategory = getPromisesByCategory(promise.category)
        .filter(p => p.id !== promise.id && !relatedByPolitician.find(r => r.id === p.id))
        .slice(0, 2);

    return (
        <div className="flex flex-col bg-background">
            {/* Breadcrumb */}
            <div className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-4">
                    <Link
                        href="/promises"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Atpakaļ uz solījumiem
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-wide py-8 md:py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Header Section: Author & Date */}
                            {politician && party && (
                                <div className="mb-8 border-b border-border/50 pb-6">
                                    <div className="flex flex-col gap-1.5 mb-2">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/politicians/${politician.id}`} className="group inline-flex items-center gap-2">
                                                <h2 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                                                    {politician.name}
                                                </h2>
                                            </Link>
                                            <PartyBadge party={party} size="sm" showFullName />
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {politician.role}
                                        </span>
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

                        {/* Related Promises */}
                        {(relatedByPolitician.length > 0 || relatedByCategory.length > 0) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                            >
                                <h2 className="text-xl font-bold text-foreground mb-4">Saistītie solījumi</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[...relatedByPolitician, ...relatedByCategory].slice(0, 4).map((related, index) => (
                                        <PromiseCard key={related.id} promise={related} index={index} />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Justification (Moved to Sidebar) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <Card className="border-border/50 shadow-sm border-l-4 border-l-primary/20">
                                <CardHeader className="space-y-4 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            Status
                                        </CardTitle>
                                        <StatusBadge status={promise.status} />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-sm text-foreground leading-relaxed">
                                        <span className="font-medium block mb-2 text-muted-foreground">Pamatojums:</span>
                                        {promise.statusJustification}
                                        {promise.sources.map((source, index) => (
                                            <a
                                                key={index}
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center h-5 px-1.5 ml-1 text-[10px] font-bold tracking-wide uppercase rounded bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-colors align-middle -translate-y-0.5"
                                                title={source.title}
                                            >
                                                {source.publication}
                                            </a>
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-1 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Atjaunināts:</span>
                                            <span className="font-medium">{format(new Date(promise.statusUpdatedAt), 'dd.MM.yyyy')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Avots:</span>
                                            <span className="font-medium">{promise.statusUpdatedBy}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Meta Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            <Card className="border-border/50">
                                <CardContent className="p-5 space-y-4">
                                    {/* Removed Date/Election info as it is now in Context card */}

                                    {promise.tags.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
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
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Share */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            <Card className="border-border/50">
                                <CardContent className="p-5">
                                    <Button variant="outline" className="w-full gap-2">
                                        <Share2 className="h-4 w-4" />
                                        Dalīties
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromiseDetail;
