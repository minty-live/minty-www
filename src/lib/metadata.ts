import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * One page's metadata: its own title, description, canonical and social card. Next replaces a
 * parent's `openGraph` / `twitter` objects rather than merging them, so each page gets the whole
 * card here instead of only the fields that differ - and its canonical and og:url point at
 * ITSELF, never the homepage (which is what the layout's defaults would say).
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  /** The page's own name; the layout's template adds " | Daily Minty". */
  title: string;
  description: string;
  /** '/' or '/pricing' - no trailing slash. */
  path: string;
}): Metadata {
  const url = path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
  const socialTitle =
    path === "/" ? `${siteConfig.name} — ${siteConfig.tagline}` : `${title} | ${siteConfig.name}`;
  const images = [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }];
  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: siteConfig.name,
      url,
      title: socialTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [siteConfig.ogImage],
      creator: siteConfig.social.twitter,
    },
  };
}
