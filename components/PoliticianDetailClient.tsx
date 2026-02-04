"use client";

import { useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { motion } from 'framer-motion';
import { PromiseCard } from '@/components/PromiseCard';
import { PerformanceCard } from '@/components/PerformanceCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PromiseStatus, STATUS_CONFIG } from '@/lib/types';
import { Briefcase, GraduationCap } from 'lucide-react';
import { PoliticianUI, PartyUI, PromiseUI } from '@/lib/db';

interface PoliticianDetailClientProps {
    politician: PoliticianUI;
    party: PartyUI | null;
    promises: PromiseUI[];
}



export const PoliticianDetailClient = ({ politician, party, promises }: PoliticianDetailClientProps) => {
    const [filterStatus, setFilterStatus] = useState<PromiseStatus | 'all'>('all');

    if (!politician) {
        return (
            <div className="flex flex-col bg-background min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Politiķis nav atrasta</h1>
                    <BackButton />
                </div>
            </div>
        );
    }

    const filteredPromises = promises.filter(p =>
        filterStatus === 'all' ? true : p.status === filterStatus
    );

    // Stats calculation
    const stats = {
        total: promises.length,
        kept: promises.filter(p => p.status === 'kept').length,
        partiallyKept: promises.filter(p => p.status === 'partially-kept').length,
        pending: promises.filter(p => p.status === 'pending').length,
        broken: promises.filter(p => p.status === 'broken').length,
        cancelled: promises.filter(p => p.status === 'cancelled').length,
    };

    return (
        <div className="flex flex-col bg-background">
            {/* Breadcrumb */}
            <div className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-4">
                    <BackButton variant="link" />
                </div>
            </div>

            {/* Hero */}
            <section className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-8 md:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col md:flex-row md:items-start gap-6"
                    >
                        <div className="flex-1 text-left">
                            {/* Row 1: Name */}
                            <div className="flex flex-wrap items-center justify-start gap-4 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                    {politician.name}
                                </h1>
                            </div>

                            {/* Row 2: Role + Amatā Badge */}
                            <div className="flex flex-wrap items-center justify-start gap-3 text-lg text-muted-foreground">
                                <span>
                                    {politician.role}
                                    {party && <span className="text-muted-foreground"> • {party.name}</span>}
                                </span>
                                {politician.isInOffice ? (
                                    <span className="px-2.5 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                                        Amatā
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                                        Bijušais
                                    </span>
                                )}
                            </div>

                            {/* Row 3: Bio */}
                            {/* Row 3: Experience & Education */}
                            <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Experience */}
                                {politician.jobs && politician.jobs.length > 0 && (
                                    <div className="flex flex-col gap-3 h-full">
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-primary" />
                                            Experience
                                        </h3>
                                        <div className="flex flex-col gap-3 flex-1">
                                            {politician.jobs.map((job, i) => (
                                                <div key={i} className="p-3 bg-card rounded-lg border border-border/50 text-sm h-full">
                                                    <div className="font-medium text-foreground">
                                                        {job.title}
                                                        {job.company && <span className="font-normal text-muted-foreground text-sm"> • {job.company}</span>}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">{job.years}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {politician.educationEntries && politician.educationEntries.length > 0 && (
                                    <div className="flex flex-col gap-3 h-full">
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            <GraduationCap className="w-5 h-5 text-primary" />
                                            Education
                                        </h3>
                                        <div className="flex flex-col gap-3 flex-1">
                                            {politician.educationEntries.map((edu, i) => (
                                                <div key={i} className="p-3 bg-card rounded-lg border border-border/50 text-sm h-full">
                                                    <div className="font-medium text-foreground">
                                                        {edu.degree}
                                                        <span className="font-normal text-muted-foreground text-sm"> • {edu.institution}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {edu.year}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section >

            {/* Performance Section */}
            < section className="py-4 border-b border-border/50" >
                <div className="container-wide">
                    <PerformanceCard
                        stats={stats}
                        filterStatus={filterStatus}
                        onFilterChange={setFilterStatus}
                    />
                </div>
            </section >

            {/* Promises List */}
            < section className="py-8 md:py-12" >
                <div className="container-wide">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                        {filterStatus === 'all' ? 'Visi solījumi' : STATUS_CONFIG[filterStatus].label}
                        <span className="text-muted-foreground font-normal text-lg">
                            ({filteredPromises.length})
                        </span>
                    </h2>

                    {filteredPromises.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredPromises.map((promise, index) => (
                                <PromiseCard key={promise.id} promise={promise} index={index} />
                            ))}
                        </div>
                    ) : (
                        <Card className="border-border/50">
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    {filterStatus === 'all'
                                        ? 'Šim politiķim nav reģistrētu solījumu.'
                                        : `Nav atrasti solījumi ar statusu "${STATUS_CONFIG[filterStatus].label}".`}
                                </p>
                                {filterStatus !== 'all' && (
                                    <Button variant="outline" onClick={() => setFilterStatus('all')} className="mt-4">
                                        Rādīt visus solījumus
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section >
        </div >
    );
};
