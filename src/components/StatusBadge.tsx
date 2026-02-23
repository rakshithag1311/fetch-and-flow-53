import { cn } from '@/lib/utils';

interface Props {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  Open: 'bg-success text-success-foreground',
  Closed: 'bg-destructive text-destructive-foreground',
  New: 'bg-info text-info-foreground',
  Accepted: 'bg-info text-info-foreground',
  Preparing: 'bg-warning text-warning-foreground',
  Ready: 'bg-success text-success-foreground',
  Rejected: 'bg-destructive text-destructive-foreground',
  'In Stock': 'bg-success text-success-foreground',
  'Out of Stock': 'bg-destructive text-destructive-foreground',
};

const StatusBadge = ({ status, className }: Props) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', statusStyles[status] || 'bg-muted text-muted-foreground', className)}>
    {status}
  </span>
);

export default StatusBadge;
