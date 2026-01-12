"use client";

import { CATEGORIES } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { PartyBadge } from './PartyBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PromiseUI, PartyUI, PoliticianUI } from '@/lib/db';

interface PromiseCardProps {
  promise: PromiseUI;
  index?: number;
  hideLastUpdated?: boolean;
  politician?: PoliticianUI;
  party?: PartyUI;
}

export const PromiseCard = ({ promise, index = 0, hideLastUpdated = false }: PromiseCardProps) => {
  const category = CATEGORIES.find(c => c.id === promise.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full"
    >
      <Link href={`/promises/${promise.id}`} className="block h-full" suppressHydrationWarning>
        <Card className="group h-full flex flex-col overflow-hidden border-border/50 bg-card hover:shadow-elevated hover:border-border transition-all duration-300 cursor-pointer">
          <CardContent className="p-5 relative pt-8 flex flex-col h-full">
            {/* Status Badge - Absolute Top Right */}
            <div className="absolute top-0 right-0">
              <StatusBadge status={promise.status} className="rounded-none rounded-bl-lg" />
            </div>

            {/* Author & Party - Top Left */}
            <div className="flex flex-col gap-1 mb-4 pt-1 pr-8">
              <div className="flex items-center gap-2 flex-wrap max-w-full">
                <span className="text-base font-semibold text-foreground leading-tight truncate">
                  {promise.politicianName}
                </span>
                {promise.partyLogoUrl ? (
                  <div className="h-6 w-auto min-w-[24px] relative flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={promise.partyLogoUrl}
                      alt={promise.partyAbbreviation}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                ) : (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-muted text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {promise.partyAbbreviation}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0">
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {promise.politicianRole}
                </span>
                {promise.politicianIsInOffice && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-[10px] font-medium text-muted-foreground">
                    Amatā
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg text-foreground leading-snug mb-4 line-clamp-3 group-hover:text-accent transition-colors flex-1">
              {promise.title}
            </h3>

            {/* FooterContainer - pushed to bottom */}
            <div className="mt-auto space-y-3">
              {/* Footer: Timeline */}
              <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                <Calendar size={14} className="text-muted-foreground/70" />
                <span>Solīts <span className="font-medium text-foreground">{new Date(promise.datePromised).toLocaleDateString('lv-LV')}</span></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
