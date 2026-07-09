import type { SVGProps } from "react";

export const APP_NAME = "BAT MENU";
export const APP_TAGLINE = "Smart Digital Menus For Every Food Business";

export function BatLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...props} aria-label="BAT MENU logo">
      <defs>
        <linearGradient id="bat-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4D98A" />
          <stop offset="1" stopColor="#B98A2E" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="none" stroke="url(#bat-g)" strokeWidth="1.2" opacity="0.55" />
      {/* Stylized bat wings — original mark */}
      <path
        d="M32 22c2.5-3 5.5-4 9-4 3 0 5 1 6 3-2 0-3 1-3 3 0 2 1 3 3 4-4 3-8 4-12 3-1 2-2 3-3 3s-2-1-3-3c-4 1-8 0-12-3 2-1 3-2 3-4 0-2-1-3-3-3 1-2 3-3 6-3 3.5 0 6.5 1 9 4z"
        fill="url(#bat-g)"
      />
      <circle cx="30" cy="26" r="0.9" fill="#0B0B0F" />
      <circle cx="34" cy="26" r="0.9" fill="#0B0B0F" />
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <BatLogo className="h-7 w-7" />
      <span className="font-display text-lg tracking-tight">
        <span className="gold-text">BAT</span>{" "}
        <span className="text-foreground/90">MENU</span>
      </span>
    </div>
  );
}
