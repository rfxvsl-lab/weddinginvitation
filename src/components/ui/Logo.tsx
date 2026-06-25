import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  isLink?: boolean;
}

export const Logo = ({ className = "", isLink = true }: LogoProps) => {
  const content = (
    <div className={`flex items-center group ${className}`}>
      <img
        src="/logo-navbar.png"
        alt="RuangHadir.net"
        className="h-10 w-auto object-contain group-hover:opacity-90 transition-opacity duration-200"
      />
    </div>
  );

  if (isLink) {
    return <Link href="/">{content}</Link>;
  }

  return content;
};
