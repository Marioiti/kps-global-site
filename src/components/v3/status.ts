import type { MandateEntry } from '@/content';

const STATUS_CLASS: Record<MandateEntry['status'], string> = {
  open: 'text-status-green',
  'in-work': 'text-status-amber',
  closed: 'text-muted-foreground',
};

/** A mandate's status in words, in the colour of check results. */
export const statusClass = (status: MandateEntry['status']) => STATUS_CLASS[status];
