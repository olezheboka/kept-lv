import { PromiseStatus, STATUS_CONFIG } from '@/lib/types';
import { CheckCircle2, CircleDot, Clock, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: PromiseStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const iconMap = {
  CheckCircle2,
  CircleDot,
  Clock,
  XCircle,
  HelpCircle,
};

export const StatusBadge = ({ status, size = 'md', showIcon = true }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  const IconComponent = iconMap[config.icon as keyof typeof iconMap];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };
  
  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <span className={cn('status-badge', config.className, sizeClasses[size])}>
      {showIcon && IconComponent && (
        <IconComponent size={iconSizes[size]} className="flex-shrink-0" />
      )}
      <span>{config.label}</span>
    </span>
  );
};
