import { Party } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PartyBadgeProps {
  party: Party;
  size?: 'sm' | 'md' | 'lg';
  showFullName?: boolean;
  className?: string;
}

export const PartyBadge = ({ party, size = 'sm', showFullName = false, className }: PartyBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium bg-muted text-muted-foreground',
        sizeClasses[size],
        className
      )}
    >
      <span>{showFullName ? party.name : party.abbreviation}</span>
    </span>
  );
};
