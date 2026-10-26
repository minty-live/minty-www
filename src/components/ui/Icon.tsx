import type { SVGProps } from 'react';
import { ICON_PATHS, type IconName } from './iconPaths';

/**
 * A Material Symbols Rounded glyph (weight 400), drawn inline in `currentColor`, so it takes the
 * text colour of its parent. Size it with width/height classes (it defaults to 24px, the glyphs'
 * design size). Decorative unless given a `title`: hidden from screen readers by default, as
 * the label belongs to the button or link around it.
 */
export default function Icon({
  name,
  title,
  ...props
}: { name: IconName; title?: string } & Omit<SVGProps<SVGSVGElement>, 'children'>) {
  return (
    <svg
      viewBox="0 -960 960 960"
      width={24}
      height={24}
      fill="currentColor"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

export type { IconName };
