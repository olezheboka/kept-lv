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

export const StatusBadge = ({ status, size = 'md', showIcon = true, className }: StatusBadgeProps & { className?: string }) => {
  // ... inside return ...
  <span className={cn('status-badge whitespace-nowrap', config.className, sizeClasses[size], className)}>
    {showIcon && IconComponent && (
      <IconComponent size={iconSizes[size]} className="flex-shrink-0" />
    )}
    <span>{config.label}</span>
  </span>
  );
};
