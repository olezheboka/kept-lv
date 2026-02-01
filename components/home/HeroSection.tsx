"use client";

import { TypewriterText } from "@/components/ui/typewriter-text";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gray-50/50 border-b border-border/50">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="container-wide py-7 md:py-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1
                            className="flex flex-col gap-2 font-bold text-foreground mb-6 leading-tight"
                            aria-label="Seko līdzi politiskajiem solījumiem"
                        >
                            <span className="text-4xl md:text-5xl lg:text-6xl text-foreground/90">Seko līdzi</span>
                            <span className="text-4xl md:text-5xl lg:text-6xl text-primary h-[1.2em] flex items-center justify-center">
                                <TypewriterText
                                    words={["politiķu", "amatpersonu", "koalīcijas", "politisko partiju", "valdības", "ierēdņu"]}
                                />
                            </span>
                            <span className="text-4xl md:text-5xl lg:text-6xl text-foreground/90">solījumiem</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance mt-8">
                            Neatkarīga un objektīva platforma, kas atspoguļo solījumu izpildi.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

