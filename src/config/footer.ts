
import { siteConfig } from './site';

export interface FooterChildLink {
  key: string; label: string; href: string;
  external?: boolean; enabled: boolean;
}
export interface FooterLink {
  key: string; label: string; href: string;
  external?: boolean; style: 'text' | 'button'; enabled: boolean;
  children?: FooterChildLink[];
}

export const footerLinks: FooterLink[] = [
  { key: 'terms', label: 'Terms', href: siteConfig.termsUrl, external: true, style: 'text', enabled: true },
  { key: 'privacy', label: 'Privacy', href: siteConfig.privacyUrl, external: true, style: 'text', enabled: true },
  { key: 'contact', label: 'Contact', href: `mailto:${siteConfig.contactEmail}`, style: 'text', enabled: true },
  { key: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@DailyMinty', external: true, style: 'text', enabled: true },
  { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/dailymintyglobal/', external: true, style: 'text', enabled: true },
];

export function getVisibleFooterLinks(): FooterLink[] {
  return footerLinks
    .filter((l) => l.enabled)
    .map((l) => ({ ...l, children: l.children?.filter((c) => c.enabled) }));
}