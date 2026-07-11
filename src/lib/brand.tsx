import type { SVGProps } from "react";

export const APP_NAME = "BAT MENU";
export const APP_TAGLINE = "Smart Digital Menus For Every Food Business";

export function BatLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...props} aria-label="BAT MENU logo" fill="none">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      <path
        d="M32 22c2.5-3 5.5-4 9-4 3 0 5 1 6 3-2 0-3 1-3 3 0 2 1 3 3 4-4 3-8 4-12 3-1 2-2 3-3 3s-2-1-3-3c-4 1-8 0-12-3 2-1 3-2 3-4 0-2-1-3-3-3 1-2 3-3 6-3 3.5 0 6.5 1 9 4z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-foreground ${className ?? ""}`}>
      <BatLogo className="h-7 w-7" />
      <span className="font-display text-xl tracking-tight">
        BAT <span className="opacity-70">MENU</span>
      </span>
    </div>
  );
}
