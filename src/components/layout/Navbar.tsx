'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { navLinks, type NavLink } from '@/config/nav';
import { cn } from '@/lib/utils';
import Container from '@/components/ui/Container';
import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { siteConfig } from '@/config/site';

function navLinkClass(variant?: 'text' | 'primary' | 'dark'): string {
  // Every target is at least 44px tall; buttons are radius 12, never pills (Part 14).
  if (variant === 'primary') {
    return 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cta text-white text-sm font-semibold px-[18px] py-[10px] hover:bg-cta-hover active:bg-cta-pressed transition-colors duration-150 ml-1';
  }
  if (variant === 'dark') {
    return 'inline-flex min-h-11 items-center justify-center rounded-xl bg-ink text-white text-sm font-semibold px-[18px] py-[10px] hover:bg-[#1a3e4d] transition-colors duration-150 ml-1';
  }
  return 'inline-flex min-h-11 items-center text-ink no-underline px-[14px] py-2 rounded-xl font-semibold text-sm hover:bg-ink/6 transition-colors';
}

function isActive(pathname: string, link: NavLink): boolean {
  if (link.href === '/' && pathname === '/') return true;
  if (link.href !== '/' && link.href !== '#' && pathname.startsWith(link.href)) return true;
  if (link.children) {
    return link.children.some((c) => c.enabled && pathname.startsWith(c.href));
  }
  return false;
}

export default function Navbar() {
  const pathname = usePathname();
  const visible = navLinks.filter((l) => l.enabled);
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav className="relative top-0 z-50 bg-white border-b border-ink/6" aria-label="Primary">
      <Container className="flex items-center justify-between py-5 md:py-10 max-w-[1440px] px-4 md:px-6">
        <Link href="/" className="inline-flex items-center" aria-label="Daily Minty home">
          <Image
            src="/brand/minty-logo-v2.webp"
            alt="Daily Minty"
            width={60}
            height={44}
            preload
            className="h-11 w-auto block"
          />
        </Link>

        <button
          type="button"
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink hover:bg-ink/6"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <Icon name={isOpen ? 'close' : 'menu'} />
        </button>
        <div className="hidden md:flex gap-1.5 items-center">
          {visible.map((link) => {
            const active = isActive(pathname, link);

            // Resources dropdown
            if (link.children) {
              return (
                <div key={link.key} className="relative group">
                  <button
                    type="button"
                    className={cn(
                      navLinkClass(link.variant),
                      'flex items-center gap-1 select-none',
                      active && 'bg-ink/8'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className="ml-0.5 inline-block w-2 h-2 border-r-2 border-b-2 border-current rotate-45 -translate-y-px transition-transform group-hover:rotate-225 group-focus-within:rotate-225"
                    />
                  </button>
                  {/* Opens on hover and on keyboard focus (focus-within), so its links are
                      reached with Tab. A plain list of links - not role="menu", which promises
                      arrow-key navigation this does not have. */}
                  <div
                    className={cn(
                      'absolute top-full left-1/2 -translate-x-1/2 translate-y-1.5 min-w-[200px]',
                      'bg-white border border-ink/10 rounded-2xl shadow-minty-lg p-2 z-60',
                      'opacity-0 invisible pointer-events-none transition-all duration-150',
                      'group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0',
                      'group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:translate-y-0',
                      'before:content-[""] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2'
                    )}
                  >
                    {link.children.filter((c) => c.enabled).map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block min-h-11 px-3.5 py-3 rounded-[10px] text-sm font-semibold text-ink hover:bg-teal/10 hover:text-teal-deep transition-colors"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            const className = cn(
              navLinkClass(link.variant),
              active && link.variant !== 'primary' && link.variant !== 'dark' && 'bg-ink/8'
            );

            if (link.external) {
              return (
                <a key={link.key} href={link.href} className={className} rel="noopener noreferrer">
                  {link.label}
                </a>
              );
            }

            return (
              <Link
                key={link.key}
                href={link.href}
                className={className}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </Container>

      {isOpen && (
        <div id="mobile-menu" className="md:hidden absolute top-full left-0 w-full bg-white border-b border-ink/10 p-4 flex flex-col gap-3 shadow-lg z-60">

          {visible
            .filter((link) => link.key !== 'get-started' && link.key !== 'login')
            .map((link) => {
              const hasChildren = link.children && link.children.length > 0;
              const isDropdownOpen = openDropdown === link.key;

              return (
                <div key={link.key}>
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(isDropdownOpen ? null : link.key)}
                        aria-expanded={isDropdownOpen}
                        className="w-full text-left px-4 py-3 rounded-xl font-semibold text-ink hover:bg-ink/5 transition-colors flex items-center justify-between"
                      >
                        <span>{link.label}</span>
                        <span aria-hidden className={`text-sm transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>
                      {isDropdownOpen && (
                        <div className="pl-4 flex flex-col gap-2 mt-1">
                          {link.children!.filter((c) => c.enabled).map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => {
                                setIsOpen(false);
                                setOpenDropdown(null);
                              }}
                              className="block px-4 py-3 rounded-lg font-semibold text-ink text-sm hover:bg-teal/10 hover:text-teal-deep transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-xl font-semibold text-ink hover:bg-ink/5 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              );
            })}

          <div className="flex flex-col gap-3 mt-4">
            <a
              href={siteConfig.waitlistUrl}
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="bg-cta text-white px-6 py-3 rounded-xl font-semibold text-center hover:bg-cta-hover active:bg-cta-pressed transition-colors no-underline"
            >
              Join Waitlist
            </a>
            {/* An external address (the Minty app), so a plain <a>, not next/link. */}
            <a
              href={siteConfig.loginUrl}
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="bg-ink-deep text-white px-6 py-3 rounded-xl font-semibold text-center hover:bg-[#1a5569] transition-colors no-underline"
            >
              Log In
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}