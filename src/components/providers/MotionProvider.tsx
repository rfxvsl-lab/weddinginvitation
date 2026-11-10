'use client';

import React from 'react';
import { MotionConfig } from 'motion/react';

/**
 * reducedMotion="user": untuk pengguna dengan preferensi "kurangi gerak",
 * animasi transform/layout dari Motion dimatikan (opacity tetap berjalan),
 * sehingga konten tetap muncul tanpa gerakan besar.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
