"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Users, BookOpen, Shield, ArrowRight } from 'lucide-react';

// Reusing About content as seen in Lovable app configuration
// In a real scenario, this might need distinct content
const Methodology = () => {
    const values = [
        {
            icon: CheckCircle2,
            title: 'Objektivitāte',
            description: 'Mēs novērtējam solījumus, balstoties uz faktiem un avotiem, nevis politiskajām simpātijām.'
        },
        {
            icon: Users,
            title: 'Pārredzamība',
            description: 'Visa mūsu metodoloģija un avoti ir publiski pieejami. Ikviens var pārbaudīt mūsu secinājumus.'
        },
        {
            icon: BookOpen,
            title: 'Izglītība',
            description: 'Mēs palīdzam iedzīvotājiem saprast politiskos procesus un pieņemt informētus lēmumus.'
        },
        {
            icon: Shield,
            title: 'Neatkarība',
            description: 'Kept ir neatkarīga platforma bez politiskās vai komerciālās ietekmes.'
        }
    ];

    return (
        <div className="flex flex-col bg-background">
            {/* Hero */}
            <section className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-12 md:py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-3xl"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Mūsu metodoloģija
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Kā mēs uzraugām un novērtējam Latvijas politiķu solījumus.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-12 md:py-20">
                <div className="container-wide">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="text-3xl font-bold text-foreground mb-6">
                                Vērtēšanas kritēriji
                            </h2>
                            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                                Mēs izmantojam stingrus kritērijus, lai noteiktu solījumu statusu. Katrs solījums tiek pārbaudīts pret publiski pieejamiem dokumentiem, likumprojektiem un valdības lēmumiem.
                            </p>
                            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                                Platforma tiek regulāri atjaunināta, un mēs cieši sadarbojamies ar ekspertiem un pilsonisko sabiedrību, lai nodrošinātu datu precizitāti.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="relative"
                        >
                            <div className="aspect-[4/3] bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl md:text-8xl font-bold text-accent mb-2">100%</div>
                                    <div className="text-lg text-muted-foreground">Caurspīdīgums</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-12 md:py-20 bg-surface-muted border-y border-border/50">
                <div className="container-wide">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            Mūsu principi
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Kā mēs nodrošinām objektivitāti
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <Card className="border-border/50 h-full">
                                        <CardContent className="p-6">
                                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                                            <p className="text-sm text-muted-foreground">{value.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Methodology;
