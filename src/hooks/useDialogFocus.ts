'use client';
import { useEffect, useRef, type RefObject } from 'react';
import { manageDialogFocus } from '../lib/dialogFocus';

export function useDialogFocus(enabled: boolean, element: RefObject<HTMLElement | null>,
  onEscape: () => void, initial?: RefObject<HTMLElement | null>) {
  const escape = useRef(onEscape);
  escape.current = onEscape;
  useEffect(() => {
    if (!enabled || !element.current) return;
    return manageDialogFocus(element.current, {
      onEscape: () => escape.current(), initialFocus: () => initial?.current || null,
    });
  }, [enabled, element, initial]);
}
