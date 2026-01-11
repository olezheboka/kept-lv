import { Promise } from '@/lib/types';
import { getPartyById, getPoliticianById } from '@/lib/data';
import { CATEGORIES } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { PartyBadge } from './PartyBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface PromiseCardProps {
  promise: Promise;
  index?: number;
  hideLastUpdated?: boolean;
}

export const PromiseCard = ({ promise, index = 0, hideLastUpdated = false }: PromiseCardProps) => {
  const politician = getPoliticianById(promise.politicianId);
  const party = getPartyById(promise.partyId);
  const category = CATEGORIES.find(c => c.id === promise.category);

  if (!politician || !party) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full"
    >
      <Link href={`/promises/${promise.id}`} className="block h-full">
        <Card className="group h-full flex flex-col overflow-hidden border-border/50 bg-card hover:shadow-elevated hover:border-border transition-all duration-300 cursor-pointer">
          <CardContent className="p-5 relative pt-8 flex flex-col h-full">
            {/* Status Badge - Absolute Top Right */}
            <div className="absolute top-0 right-0">
              <StatusBadge status={promise.status} className="rounded-none rounded-bl-lg" />
            </div>

            {/* Author & Party - Top Left */}
            <div className="flex flex-col gap-1 mb-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-foreground">
                  {politician.name}
                </span>
                <PartyBadge party={party} />
              </div>
              <span className="text-xs text-muted-foreground/70 whitespace-normal">
                {politician.role}
              </span>
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

              {/* Updated indicator */}
              {!hideLastUpdated && (
                <p className="text-[10px] text-muted-foreground">
                  Atjaunots {formatDistanceToNow(new Date(promise.statusUpdatedAt), { addSuffix: true, locale: require('date-fns/locale').lv })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
