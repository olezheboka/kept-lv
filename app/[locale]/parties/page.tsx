"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { parties, getPromisesByParty, politicians } from '@/lib/data';
import { Users } from 'lucide-react';

const Parties = () => {
    return (
        <div className="flex flex-col bg-background">
            {/* Page Header */}
            <section className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-8 md:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            Partijas
                        </h1>
                        <p className="text-muted-foreground">
                            {parties.length} Latvijas politiskās partijas un to solījumi
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Parties Grid */}
            <section className="py-8 md:py-12">
                <div className="container-wide">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {parties.map((party, index) => {
                            const partyPromises = getPromisesByParty(party.id);
                            const partyPoliticians = politicians.filter(p => p.partyId === party.id);
                            const keptCount = partyPromises.filter(p => p.status === 'kept').length;
                            const brokenCount = partyPromises.filter(p => p.status === 'broken').length;
                            const inProgressCount = partyPromises.filter(p => p.status === 'in-progress').length;
                            const total = partyPromises.length;

                            return (
                                <motion.div
                                    key={party.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                >
                                    <Link href={`/parties/${party.id}`} className="block h-full">
                                        <Card className="group overflow-hidden border-border/50 hover:shadow-elevated hover:border-border transition-all duration-300 h-full">
                                            <CardContent className="p-6">
                                                {/* Party Header */}
                                                <div className="flex items-start gap-4 mb-6">
                                                    <div
                                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                                                        style={{ backgroundColor: party.color }}
                                                    >
                                                        {party.abbreviation}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors text-lg">
                                                            {party.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {party.isInCoalition ? (
                                                                <span className="px-2 py-0.5 bg-status-kept-bg text-status-kept text-xs font-medium rounded-full">
                                                                    Koalīcijā
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                                                                    Opozīcijā
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                                                        <div className="text-2xl font-bold text-foreground">{party.mpCount}</div>
                                                        <div className="text-xs text-muted-foreground">Deputāti</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                                                        <div className="text-2xl font-bold text-foreground">{total}</div>
                                                        <div className="text-xs text-muted-foreground">Solījumi</div>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                {total > 0 && (
                                                    <div>
                                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                                            <span>Solījumu izpilde</span>
                                                            <span>{Math.round((keptCount / total) * 100)}%</span>
                                                        </div>
                                                        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                                                            {keptCount > 0 && (
                                                                <div
                                                                    className="h-full bg-status-kept"
                                                                    style={{ width: `${(keptCount / total) * 100}%` }}
                                                                />
                                                            )}
                                                            {inProgressCount > 0 && (
                                                                <div
                                                                    className="h-full bg-status-progress"
                                                                    style={{ width: `${(inProgressCount / total) * 100}%` }}
                                                                />
                                                            )}
                                                            {brokenCount > 0 && (
                                                                <div
                                                                    className="h-full bg-status-broken"
                                                                    style={{ width: `${(brokenCount / total) * 100}%` }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Politicians count */}
                                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
                                                    <Users className="h-4 w-4" />
                                                    <span>{partyPoliticians.length} politiķi</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Parties;
