/** A filter button: ink when chosen, a hairline otherwise. */
export const chipClass = (active: boolean) =>
  `inline-flex items-center px-4 py-2.5 text-[15px] border transition-colors whitespace-nowrap ${
    active ? 'bg-foreground text-background border-foreground' : 'border-border text-foreground hover:border-foreground'
  }`;

/** The label in front of a row of filter buttons. */
export const chipLabelClass = 'text-sm text-muted-foreground w-28';
