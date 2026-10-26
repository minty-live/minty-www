import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant =
  "primary" | "waitlist" | "pill-dark" | "white" | "ghost" | "text" | "outline-white";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

interface LinkButtonProps extends BaseProps {
  href: string;
  external?: boolean;
  type?: never;
  onClick?: never;
  disabled?: never;
}

interface NativeButtonProps extends BaseProps {
  href?: never;
  external?: never;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

type ButtonProps = LinkButtonProps | NativeButtonProps;

const variantStyles: Record<ButtonVariant, string> = {
  // The Primary CTA: Minty Action, its hover and pressed tones (Part 13; tokens in globals.css).
  primary: "bg-cta text-white hover:bg-cta-hover active:bg-cta-pressed",
  // The same CTA with the "alive" pulse, for the one Join Waitlist a section leads with.
  waitlist:
    "btn-alive bg-cta text-white shadow-[0_10px_28px_rgba(60,188,195,0.38)] hover:bg-cta-hover active:bg-cta-pressed",
  "pill-dark": "bg-ink text-white hover:bg-[#1a3e4d] hover:-translate-y-px",
  white: "bg-white text-ink shadow-minty-sm hover:-translate-y-px hover:shadow-minty-md",
  ghost: "bg-white text-ink border border-line hover:border-ink-soft hover:-translate-y-px",
  text: "bg-transparent text-ink hover:text-teal-deep",
  "outline-white":
    "bg-transparent text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.7)] hover:bg-white/10 hover:shadow-[inset_0_0_0_1.5px_white]",
};

// Every size is at least 44px tall (the touch target) with at least a 14px label.
const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-11 px-[18px] py-[10px] text-sm",
  md: "px-[26px] py-[14px] text-[15px]",
  lg: "px-9 py-[18px] text-base",
  xl: "px-9 py-5 text-[clamp(20px,2.4vw,28px)] font-bold",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold no-underline cursor-pointer border-0 font-sans transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export default function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(baseStyles, sizeStyles[size], variantStyles[variant], className);

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a href={props.href} className={classes} rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type || "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={cn(classes, props.disabled && "opacity-60 cursor-not-allowed")}
    >
      {children}
    </button>
  );
}
