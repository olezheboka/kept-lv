import { Party } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PartyBadgeProps {
  party: Party;
  size?: 'sm' | 'md';
  showFullName?: boolean;
}

export const PartyBadge = ({ party, size = 'sm', showFullName = false }: PartyBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size]
      )}
      style={{ 
        backgroundColor: `${party.color}15`,
        color: party.color,
      }}
    >
      <span 
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: party.color }}
      />
      <span>{showFullName ? party.name : party.abbreviation}</span>
    </span>
  );
};
