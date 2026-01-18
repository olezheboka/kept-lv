"use client";

import { memo } from 'react';

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

interface PromiseCardProps {
  promise: PromiseUI;
  index?: number;
  hideLastUpdated?: boolean;
  politician?: PoliticianUI;
  party?: PartyUI;
}

const PromiseCardComponent = ({ promise }: PromiseCardProps) => {
  // const category = CATEGORIES.find(c => c.id === promise.categorySlug);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link href={getPromiseUrl(promise)} className="block h-full" suppressHydrationWarning>
        <Card className="group h-full flex flex-col overflow-hidden border-border/50 bg-card hover:shadow-elevated hover:border-border transition-all duration-300 cursor-pointer">
          <CardContent className="p-5 relative pt-8 flex flex-col h-full">
            {/* Status Badge - Absolute Top Right */}
            <div className="absolute top-0 right-0">
              <StatusBadge status={promise.status} className="rounded-none rounded-bl-lg" />
            </div>

            {/* Author & Party - Top Left */}
            <div className="flex flex-col gap-1 mb-4 pt-1 pr-8">
              <div className="flex items-center gap-2 flex-wrap max-w-full">
                <span className="text-sm font-semibold text-foreground leading-tight truncate">
                  {promise.politicianName}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0">
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {promise.politicianRole}
                </span>
                {promise.politicianIsInOffice && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
                    Amatā
                  </span>
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
