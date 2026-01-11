import { Promise } from '@/lib/types';
import { getPartyById, getPoliticianById } from '@/lib/data';
import { CATEGORIES } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { PartyBadge } from './PartyBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Eye } from 'lucide-react';
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
          <CardContent className="p-5">
            {/* Header with Status & Category */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <StatusBadge status={promise.status} />
              {category && (
                <span className="text-xs text-muted-foreground font-medium">
                  {category.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground leading-snug mb-3 line-clamp-2 group-hover:text-accent transition-colors">
              {promise.title}
            </h3>

            {/* Politician Info */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                <AvatarImage src={politician.photoUrl} alt={politician.name} />
                <AvatarFallback className="text-xs bg-muted">
                  {politician.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {politician.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {politician.role}
                </p>
              </div>
              <PartyBadge party={party} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar size={12} />
                <span>{new Date(promise.datePromised).toLocaleDateString('lv-LV')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye size={12} />
                <span>{promise.viewCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Updated indicator */}
            <p className="text-[10px] text-muted-foreground mt-2">
              Atjaunots {formatDistanceToNow(new Date(promise.statusUpdatedAt), { addSuffix: true })}
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
