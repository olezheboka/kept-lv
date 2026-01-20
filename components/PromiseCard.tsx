"use client";

import { memo } from 'react';
import { useLocale } from 'next-intl';

// import { CATEGORIES } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
// import { PartyBadge } from './PartyBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Link from 'next/link';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PromiseUI, PartyUI, PoliticianUI } from '@/lib/db';
import { getPromiseUrl } from '@/lib/promise-url';
import { CoalitionLogoStack } from '@/components/ui/coalition-logo-stack';
import { EntityBadge } from '@/components/ui/entity-badge';
import Image from 'next/image';
import { PartyAvatar } from '@/components/ui/party-avatar';
import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface PromiseCardProps {
  promise: PromiseUI;
  index?: number;
  hideLastUpdated?: boolean;
  politician?: PoliticianUI;
  party?: PartyUI;
}

const PromiseCardComponent = ({ promise }: PromiseCardProps) => {
  const locale = useLocale();
  // const category = CATEGORIES.find(c => c.id === promise.categorySlug);

  const isCoalition = promise.type === 'COALITION';
  const isParty = promise.type === 'PARTY';

  // Helper to get initials from full name (e.g., "Krišjānis Kariņš" -> "KK")
  const getInitials = (name: string | undefined | null): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  };

  // Helper to render Tooltip Content (with avatar and optional link)
  const renderTooltipContent = (
    avatar: React.ReactNode,
    name: string | undefined | null,
    linkUrl?: string,
    subtext?: string
  ) => (
    <HoverCardContent
      side="top"
      className="p-1 w-auto min-w-[180px] rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
    >
      <HoverCardArrow className="fill-white/80 dark:fill-black/80" width={12} height={6} />
      <div className="flex items-center gap-2 p-1.5">
        <div className="relative w-8 h-8 shrink-0">
          {avatar}
        </div>
        <div className="flex flex-col">
          {linkUrl ? (
            <Link
              href={linkUrl}
              className="text-sm font-medium leading-none text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              {name || "?"}
            </Link>
          ) : (
            <span className="text-sm font-medium leading-none">{name || "?"}</span>
          )}
          {subtext && <span className="text-[10px] text-muted-foreground leading-none mt-0.5">{subtext}</span>}
        </div>
      </div>
    </HoverCardContent>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link href={getPromiseUrl(promise)} className="block h-full" suppressHydrationWarning>
        <Card className="group relative h-full flex flex-col overflow-hidden border-border/50 bg-card hover:shadow-elevated hover:border-border transition-all duration-300 cursor-pointer">
          <CardContent className="p-5 pt-8 flex flex-col h-full">
            {/* Status Badge - Absolute Top Right */}
            <div className="absolute top-0 right-0">
              <StatusBadge status={promise.status} className="rounded-none rounded-bl-lg" />
            </div>

            {/* Author & Party - Name on LEFT, Avatar on RIGHT */}
            <div className="flex flex-col gap-3 mb-4 pt-1">
              <div className="flex items-center justify-between gap-4 w-full">
                {/* Name & Description - LEFT */}
                <div className="flex flex-col min-w-0 justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground leading-none truncate">
                      {isCoalition
                        ? "Koalīcija"
                        : (isParty ? promise.partyName : promise.politicianName)
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0">
                    {/* Description / Subtitle */}
                    <span className="text-xs text-muted-foreground truncate leading-tight">
                      {isCoalition
                        ? "Koalīcijas solījums"
                        : (isParty
                          ? "Partijas programma"
                          : (
                            <>
                              <span className="truncate max-w-[200px]">{promise.politicianRole}</span>
                              {promise.politicianIsInOffice && (
                                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-[10px] font-medium text-muted-foreground">
                                  Amatā
                                </span>
                              )}
                            </>
                          )
                        )
                      }
                    </span>
                  </div>
                </div>

                {/* Avatar / Logo - Only for Coalition (2+ parties) */}
                {isCoalition && (promise.coalitionParties?.length ?? 0) >= 2 && (
                  <CoalitionLogoStack
                    parties={promise.coalitionParties || []}
                    size="lg"
                    className="flex-shrink-0"
                    locale={locale as "lv" | "en" | "ru"}
                  />
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-base text-foreground leading-snug mb-4 line-clamp-3 group-hover:text-accent transition-colors flex-1">
              {promise.title}
            </h3>

            {/* FooterContainer - pushed to bottom */}
            <div className="mt-auto space-y-3">
              {/* Footer: Timeline */}
              <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                <Calendar size={12} className="text-muted-foreground/70" />
                <span>Solīts <span className="font-medium text-foreground">{format(new Date(promise.datePromised), 'dd.MM.yyyy')}</span></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export const PromiseCard = memo(PromiseCardComponent);
