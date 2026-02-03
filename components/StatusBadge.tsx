import { PromiseStatus, STATUS_CONFIG } from '@/lib/types';
import { CheckCircle2, CircleDot, Clock, XCircle, HelpCircle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

const HalfCircleIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" stroke="none" />
    <line x1="12" x2="12" y1="2" y2="22" stroke="currentColor" />
  </svg>
);
interface StatusBadgeProps {
  status: PromiseStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  variant?: 'subtle' | 'solid';
  className?: string;
}

const iconMap = {
  CheckCircle2,
  CircleDot,
  Clock,
  XCircle,
  HelpCircle,
  Ban,
  Contrast: HalfCircleIcon,
};

export const StatusBadge = ({ status, size = 'md', showIcon = true, variant = 'subtle', className }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];
  const IconComponent = iconMap[config.icon as keyof typeof iconMap];
  const statusClass = variant === 'subtle' ? config.className : `${config.className}-${variant}`;

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
    <span className={cn('status-badge whitespace-nowrap', statusClass, sizeClasses[size], className)}>
      {showIcon && IconComponent && (
        <IconComponent size={iconSizes[size]} className="flex-shrink-0" />
      )}
      <span>{config.label}</span>
    </span>
  );
};
