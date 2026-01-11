"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PromiseCard } from "@/components/PromiseCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    getFeaturedPromises,
    getPoliticianRankings,
    getPartyRankings,
} from "@/lib/data";
import { RankingCard } from "@/components/RankingCard";
import {
    ArrowRight,
    Quote,
    Lightbulb,
    AlertCircle,
} from "lucide-react";

const Index = () => {
    const featuredPromises = getFeaturedPromises().slice(0, 4);

    return (
        <div className="flex flex-col bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gray-50/50 border-b border-border/50">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                <div className="container-wide py-10 md:py-12 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className=""
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
                                Sekojam līdzi Latvijas politiķu <span className="bg-[linear-gradient(180deg,#9E1B34_0%,#9E1B34_55%,#ffffff_55%,#ffffff_65%,#9E1B34_65%,#9E1B34_100%)] bg-clip-text text-transparent decoration-clone pb-2 drop-shadow-sm">solījumiem</span>.
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                                Pārredzama un objektīva platforma, kas parāda valdības solījumu izpildi
                            </p>
                        </motion.div>


                    </div>
                </div>

            </section>

            {/* Featured Promises */}
            <section className="pt-8 pb-16 md:pt-12 md:pb-20">
                <div className="container-wide">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                                Aktuālie solījumi
                            </h2>

                        </div>
                        <Link href="/promises">
                            <Button variant="ghost" className="hidden md:flex gap-2">
                                Skatīt visus <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {featuredPromises.map((promise, index) => (
                            <PromiseCard key={promise.id} promise={promise} index={index} />
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link href="/promises">
                            <Button variant="outline" className="gap-2">
                                Skatīt visus solījumus <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Leaderboards */}
            <section className="py-16 md:py-20 bg-muted/30 border-y border-border/50">
                <div className="container-wide">
                    <div className="grid md:grid-cols-2 gap-8">
                        <RankingCard
                            title="Uzticamākie politiķi"
                            type="politician"
                            data={getPoliticianRankings()}
                        />
                        <RankingCard
                            title="Uzticamākās partijas"
                            type="party"
                            data={getPartyRankings()}
                        />
                    </div>
                </div>
            </section>

            {/* Trust Context Section */}
            <section className="py-12 md:py-16 bg-primary/5">
                <div className="container-wide">
                    <div className="max-w-4xl mx-auto">
                        <blockquote className="relative">
                            <Quote className="absolute -top-2 -left-2 md:-top-4 md:-left-4 h-8 w-8 md:h-12 md:w-12 text-primary/20" />
                            <p className="text-base md:text-lg lg:text-xl text-foreground/90 leading-relaxed pl-8 md:pl-12 italic">
                                Latvijas sabiedrības uzticēšanās politiskajiem institūtiem un politiķiem ir viena no zemākajām Eiropas Savienībā. Politiskajām partijām uzticas tikai <strong className="text-foreground not-italic">12,51%</strong> Latvijas iedzīvotāju, kas ir divas reizes zemāks rādītājs nekā vidēji OECD valstīs (<strong className="text-foreground not-italic">24,5%</strong>). Parlamentam uzticas <strong className="text-foreground not-italic">28,72%</strong> iedzīvotāju, bet valdībai — tikai <strong className="text-foreground not-italic">24,5%</strong>.
                            </p>
                            <footer className="mt-4 pl-8 md:pl-12">
                                <a
                                    href="https://lvportals.lv/skaidrojumi/346761-aptauja-tikai-13-iedzivotaju-uzskata-ka-var-ietekmet-valdibas-lemumus-2022"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    — LV Portāls, 2022
                                </a>
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-card border-t border-border">
                <div className="container-wide">
                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                        {/* Suggest Promise */}
                        <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 flex flex-col items-start hover:border-primary/20 transition-colors">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                <Lightbulb className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">
                                Ieteikt solījumu
                            </h3>
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                Zini solījumu, kas šeit trūkst? Iesniedz to mums izskatīšanai un palīdzi veidot pilnīgāku ainu par politisko atbildību.
                            </p>
                            <Link href="mailto:info@kept.lv?subject=Jauns%20solījums" className="mt-auto">
                                <Button size="lg" className="font-semibold">
                                    Iesniegt priekšlikumu
                                </Button>
                            </Link>
                        </div>

                        {/* Report Issue */}
                        <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 flex flex-col items-start hover:border-destructive/20 transition-colors">
                            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-6">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">
                                Paziņot par problēmu
                            </h3>
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                Pamanīji neprecizitāti datos vai tehnisku kļūdu? Dod mums ziņu, lai varam to pēc iespējas ātrāk novērst.
                            </p>
                            <Link href="mailto:support@kept.lv?subject=Kļūda%20vai%20problēma" className="mt-auto">
                                <Button size="lg" variant="outline" className="font-semibold hover:text-destructive hover:border-destructive/50">
                                    Ziņot par kļūdu
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Index;
