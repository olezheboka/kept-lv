import Link from "next/link";
import { cn } from "@/lib/utils";
import { PartyAvatar } from "./party-avatar";
import {
    HoverCard,
    HoverCardArrow,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Party {
    id: string;
    slug: string;
    name: { lv: string; en: string; ru: string } | string;
    logoUrl?: string | null;
    color: string;
    abbreviation: string;
}

interface CoalitionLogoStackProps {
    parties: Party[];
    size?: "sm" | "md" | "lg";
    className?: string;
    locale: "lv" | "en" | "ru";
}

export function CoalitionLogoStack({
    parties,
    size = "md",
    className,
    locale
}: CoalitionLogoStackProps) {
    // Negative margin to create overlap. 
    // Reduced overlap as requested.
    const overlapClasses = {
        sm: "-ml-1",
        md: "-ml-1.5",
        lg: "-ml-2",
    };

    // Max number of visible logos before showing +N
    const MAX_VISIBLE = 3;
    const visibleParties = parties.slice(0, MAX_VISIBLE);
    const overflowCount = parties.length - MAX_VISIBLE;

    return (
        <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div
                    className={cn("flex items-center pl-1 cursor-default", className)}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    {visibleParties.map((party, index) => {
                        const name = typeof party.name === 'string' ? party.name : party.name[locale];
                        return (
                            <div
                                key={party.id}
                                className={cn(
                                    "relative shrink-0 transition-transform",
                                    index > 0 && overlapClasses[size]
                                )}
                                style={{ zIndex: visibleParties.length - index }}
                            >
                                <PartyAvatar
                                    abbreviation={party.abbreviation || party.slug.substring(0, 3)}
                                    size={size}
                                    name={name}
                                    color={party.color}
                                    className="ring-2 ring-background border-transparent"
                                />
                            </div>
                        );
                    })}

                    {overflowCount > 0 && (
                        <div
                            className={cn(
                                "relative flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold shrink-0 ring-2 ring-background border border-border/50",
                                size === 'sm' && "h-5 w-5 text-[8px]",
                                size === 'md' && "h-7 w-7 text-[9px]",
                                size === 'lg' && "h-8 w-8 text-[11px]",
                                overlapClasses[size]
                            )}
                            style={{ zIndex: 0 }}
                        >
                            +{overflowCount}
                        </div>
                    )}
                </div>
            </HoverCardTrigger>
            <HoverCardContent
                side="top"
                className="p-1 w-auto min-w-[180px] rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            >
                <HoverCardArrow className="fill-white/80 dark:fill-black/80" width={12} height={6} />
                <div className="flex flex-col gap-0.5 p-1">
                    {parties.map((party) => {
                        const name = typeof party.name === 'string' ? party.name : party.name[locale];
                        return (
                            <div key={party.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                <PartyAvatar
                                    abbreviation={party.abbreviation}
                                    size="md"
                                    className="w-8 h-8 text-[10px]"
                                    color={party.color}
                                />
                                <Link
                                    href={`/parties/${party.slug}`}
                                    className="text-sm font-medium leading-none text-foreground"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {name}
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
