"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/StatusBadge';
import { PartyBadge } from '@/components/PartyBadge';
import { PromiseCard } from '@/components/PromiseCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPromiseById, getPoliticianById, getPartyById, getPromisesByPolitician, getPromisesByCategory } from '@/lib/data';
import { CATEGORIES } from '@/lib/types';
import { Clock, ExternalLink, ArrowLeft, Share2, Calendar, User, Tag, Info } from 'lucide-react';
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
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {category && (
                                    <span className="text-sm text-muted-foreground font-medium flex items-center gap-2 p-1.5 bg-muted rounded-md px-3">
                                        {category.name}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                                {promise.title}
                            </h1>

                            {/* Context Card */}
                            <Card className="border-border/50 bg-muted/20">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex flex-wrap gap-6 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-accent" />
                                            <span className="text-muted-foreground">Solīja:</span>
                                            <span className="font-medium text-foreground">{politician?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-accent" />
                                            <span className="text-muted-foreground">Kad:</span>
                                            <span className="font-medium text-foreground">
                                                {format(new Date(promise.datePromised), 'dd. MMMM, yyyy', { locale: lv })}
                                            </span>
                                        </div>
                                    </div>

                                    {promise.importance && (
                                        <div className="pt-2 border-t border-border/50">
                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Kāpēc tas ir svarīgi?</h4>
                                            <p className="text-foreground leading-relaxed">
                                                {promise.importance}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quote Block */}
                            <blockquote className="border-l-4 border-accent pl-6 py-2 italic text-lg text-muted-foreground bg-muted/30 rounded-r-lg pr-6">
                                "{promise.fullText}"
                                {promise.sources.map((source, index) => (
                                    <a
                                        key={index}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center h-5 px-1.5 ml-1 text-[10px] font-bold tracking-wide uppercase rounded bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-colors align-middle -translate-y-0.5 not-italic"
                                        title={source.title}
                                    >
                                        {source.publication}
                                    </a>
                                ))}
                            </blockquote>
                        </motion.div>

                        {/* Status Justification */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <Card className="border-border/50">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        Statusa pamatojums
                                    </CardTitle>
                                    <StatusBadge status={promise.status} />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-foreground leading-relaxed inline">
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
                                    </p>
                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                                        <span>
                                            Atjaunināts: {format(new Date(promise.statusUpdatedAt), 'dd. MMMM, yyyy', { locale: lv })}
                                        </span>
                                        <span>•</span>
                                        <span>{promise.statusUpdatedBy}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Sources */}
                        {promise.sources.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <Card className="border-border/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Avoti</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {promise.sources.map((source, index) => (
                                            <a
                                                key={index}
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                                            >
                                                <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 group-hover:text-accent" />
                                                <div>
                                                    <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                                                        {source.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {source.publication} • {format(new Date(source.date), 'dd.MM.yyyy')}
                                                    </p>
                                                </div>
                                            </a>
                                        ))}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

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
                        {/* Politician Card */}
                        {politician && party && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                            >
                                <Card className="border-border/50">
                                    <CardContent className="p-5">
                                        <Link href={`/politicians/${politician.id}`} className="group">
                                            <div className="flex items-center gap-4 mb-4">
                                                <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                                                    <AvatarImage src={politician.photoUrl} alt={politician.name} />
                                                    <AvatarFallback className="text-lg">
                                                        {politician.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                                                        {politician.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {politician.role}
                                                    </p>
                                                    {politician.isInOffice ? (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-status-kept-bg text-status-kept text-xs font-medium rounded-full">
                                                            Amatā
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                                                            Bijušais
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <PartyBadge party={party} size="md" showFullName />
                                        </Link>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

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
