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
}

export const PromiseCard = ({ promise, index = 0 }: PromiseCardProps) => {
  const politician = getPoliticianById(promise.politicianId);
  const party = getPartyById(promise.partyId);
  const category = CATEGORIES.find(c => c.id === promise.category);

  if (!politician || !party) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/promises/${promise.id}`}>
        <Card className="group overflow-hidden border-border/50 bg-card hover:shadow-elevated hover:border-border transition-all duration-300 cursor-pointer">
          <CardContent className="p-5 relative pt-8">
            {/* Status Badge - Absolute Top Right */}
            <div className="absolute top-0 right-0">
              <StatusBadge status={promise.status} className="rounded-none rounded-bl-lg" />
            </div>

            {/* Author & Party - Top Left */}
            <div className="flex flex-col gap-1 mb-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {politician.name}
                </span>
                <PartyBadge party={party} />
              </div>
              <span className="text-xs text-muted-foreground whitespace-normal">
                {politician.role}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg text-foreground leading-snug mb-4 line-clamp-2 group-hover:text-accent transition-colors">
              {promise.title}
            </h3>

            {/* Footer: Timeline */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50 gap-2">
              {/* Date Promised */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Solīts</span>
                <div className="flex items-center gap-1.5 text-xs text-foreground">
                  <Calendar size={12} className="text-muted-foreground" />
                  <span>{new Date(promise.datePromised).toLocaleDateString('lv-LV')}</span>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex flex-col gap-0.5 text-right">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Termiņš</span>
                <div className="flex items-center gap-1.5 text-xs text-foreground justify-end">
                  <span className="font-medium">
                    {promise.deadline
                      ? new Date(promise.deadline).toLocaleDateString('lv-LV')
                      : '—'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Updated indicator */}
            <p className="text-[10px] text-muted-foreground mt-2">
              Atjaunots {formatDistanceToNow(new Date(promise.statusUpdatedAt), { addSuffix: true, locale: require('date-fns/locale').lv })}
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
