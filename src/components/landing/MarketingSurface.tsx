import React from "react";
import "./marketing.css";

/** Every page using landing navigation/content owns the required stylesheet and scope.
 *  Keep this off invitation demo/renderer routes. */
export function MarketingSurface({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`saas-scope rh-product rh-marketing min-h-screen ${className}`}>{children}</div>;
}
