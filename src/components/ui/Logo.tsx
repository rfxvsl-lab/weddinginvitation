import React from "react";
import Link from "next/link";

/**
 * Logo system — RuangHadir.net
 *
 * variant:
 *  - "lockup"     : logo + tipografi horizontal (navbar) → /logo-navbar.png
 *  - "mark"       : logo saja, tanpa tipografi           → /logo-mark.png
 *  - "typography" : logo display besar dengan tipografi  → /logo-browser.png
 *
 * invert: versi putih untuk permukaan gelap (brightness-0 invert).
 * isLink: bungkus dengan <Link href="/"> (default true).
 */
type LogoVariant = "lockup" | "mark" | "typography";

interface LogoProps {
  variant?: LogoVariant;
  invert?: boolean;
  isLink?: boolean;
  className?: string;
  /** Tailwind height class untuk override default, mis. "h-16" */
  height?: string;
}

const SRC: Record<LogoVariant, string> = {
  lockup: "/logo-navbar.png",
  mark: "/logo-mark.png",
  typography: "/logo-browser.png",
};

const DEFAULT_HEIGHT: Record<LogoVariant, string> = {
  lockup: "h-10",
  mark: "h-12",
  typography: "h-28",
};

export const Logo = ({
  variant = "lockup",
  invert = false,
  isLink = true,
  className = "",
  height,
}: LogoProps) => {
  const content = (
    <div
      className={`flex items-center group ${invert ? "brightness-0 invert" : ""} ${className}`}
    >
      <img
        src={SRC[variant]}
        alt="RuangHadir.net"
        className={`${height || DEFAULT_HEIGHT[variant]} w-auto object-contain group-hover:opacity-90 transition-opacity duration-200`}
      />
    </div>
  );

  if (isLink) {
    return <Link href="/">{content}</Link>;
  }

  return content;
};
