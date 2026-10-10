/** Shared by the header and the mobile menu. */

export interface NavItem {
  key: string;
  path: string;
  /** The service's characters: 合同 contract, 合规 compliance, 合作 cooperation. */
  glyph?: string;
}

/** The three services in the dropdown, each with a one-line caption. */
export const SERVICES: NavItem[] = [
  { key: 'menu.deals', path: '/services/deal-structuring/', glyph: '合同' },
  { key: 'menu.kyc', path: '/services/compliance-kyc/', glyph: '合规' },
  { key: 'menu.coo', path: '/services/fractional-coo/', glyph: '合作' },
];

export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export const linkClass = (isActive: boolean) =>
  `whitespace-nowrap text-foreground underline-offset-[6px] decoration-1 hover:underline ${focusRing} ${
    isActive ? 'underline decoration-accent decoration-2' : ''
  }`;

