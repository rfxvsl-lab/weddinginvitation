"use client";

import React, { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";

/** Smooth scroll dimatikan untuk pengguna yang meminta gerak dikurangi. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.05, wheelMultiplier: 1 }}>
      {children as any}
    </ReactLenis>
  );
}
