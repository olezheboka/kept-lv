import { Party } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PartyBadgeProps {
  party: Party;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFullName?: boolean;
  className?: string;
  variant?: 'badge' | 'avatar';
}

export const PartyBadge = ({
  party,
  size = 'sm',
  showFullName = false,
  className,
  variant = 'badge'
}: PartyBadgeProps) => {
  if (variant === 'avatar') {
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs rounded-md',
      md: 'h-10 w-10 text-sm rounded-lg',
      lg: 'h-12 w-12 text-base rounded-xl',
      xl: 'h-14 w-14 text-lg rounded-2xl',
    };

    return (
      <div
        className={cn(
          "flex items-center justify-center text-foreground/80 bg-muted font-bold overflow-hidden shadow-sm shrink-0",
          sizeClasses[size],
          className
        )}
      >
        {party.logoUrl ? (
          <img src={party.logoUrl} alt={party.name} className="h-full w-full object-cover" />
        ) : (
          <span>{party.abbreviation}</span>
        )}
      </div>
    );
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
    xl: 'px-4 py-2 text-base',
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
