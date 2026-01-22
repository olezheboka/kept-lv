import Link from "next/link";
import { PromiseCard } from "@/components/PromiseCard";
import { Button } from "@/components/ui/button";
import { RankingCard } from "@/components/RankingCard";
import { QuoteTypewriter } from "@/components/QuoteTypewriter";
import { HeroSection } from "@/components/home/HeroSection";
import { CTASection } from "@/components/home/CTASection";
import {
    getFeaturedPromises,
    getPoliticianRankings,
    getPartyRankings,
} from "@/lib/db";
import {
    ArrowRight,
    Quote,
    ExternalLink,
} from "lucide-react";

// export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function Index() {
    const [featuredPromises, politicianRankings, partyRankings] = await Promise.all([
        getFeaturedPromises("lv", 3),
        getPoliticianRankings(),
        getPartyRankings(),
    ]);

    return (
        <div className="flex flex-col bg-background">
            {/* Hero Section */}
            <HeroSection />

            {/* Featured Promises */}
            <section className="pt-6 pb-10 md:pt-8 md:pb-14">
                <div className="container-wide">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <h2 className="text-xl md:text-3xl font-bold text-foreground mb-2">
                                Aktuālie solījumi
                            </h2>

                        </div>
                        <Link href="/promises" suppressHydrationWarning>
                            <Button variant="ghost" className="hidden md:flex gap-2 hover:bg-primary hover:text-primary-foreground">
                                Skatīt visus <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {featuredPromises.map((promise, index) => (
                            <PromiseCard key={promise.id} promise={promise} index={index} hideLastUpdated={true} />
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link href="/promises" suppressHydrationWarning>
                            <Button variant="outline" className="gap-2">
                                Skatīt visus solījumus <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Leaderboards */}
            <section className="py-10 md:py-14 bg-muted/30 border-y border-border/50">
                <div className="container-wide">
                    <div className="grid md:grid-cols-2 gap-8">
                        <RankingCard
                            title="Uzticamākie politiķi"
                            type="politician"
                            data={politicianRankings}
                        />
                        <RankingCard
                            title="Uzticamākās partijas"
                            type="party"
                            data={partyRankings}
                        />
                    </div>
                </div>
            </section>

            {/* Trust Context Section */}
            <section className="py-8 md:py-10 bg-primary/5">
                <div className="container-wide">
                    <div className="max-w-4xl mx-auto">
                        <blockquote className="relative">
                            <Quote className="absolute -top-2 -left-2 md:-top-4 md:-left-4 h-8 w-8 md:h-12 md:w-12 text-primary/20" />
                            <QuoteTypewriter />
                            <footer className="mt-4 pl-8 md:pl-12">
                                <a
                                    href="https://lvportals.lv/skaidrojumi/346761-aptauja-tikai-13-iedzivotaju-uzskata-ka-var-ietekmet-valdibas-lemumus-2022"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
                                    suppressHydrationWarning
                                >
                                    — LV Portāls, 2022
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <CTASection />
        </div>
    );
}
