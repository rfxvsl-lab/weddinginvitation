import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/** A real mobile viewport for media queries, viewport units and fixed overlays. */
const IFRAME_SRCDOC =
  '<!DOCTYPE html><html lang="id"><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body></body></html>';

export default function IframePreview({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);
  const setupDocument = useCallback(() => {
    const doc = frameRef.current?.contentDocument ?? frameRef.current?.contentWindow?.document;
    if (!doc?.body) {
      // Document not ready yet (a src-less iframe can expose an empty document
      // with no body); retry on the next frame instead of giving up.
      requestAnimationFrame(setupDocument);
      return;
    }
    doc.documentElement.lang = 'id';
    doc.documentElement.style.height = '100%';
    Object.assign(doc.body.style, { margin: '0', padding: '0', minHeight: '100%', height: '100%', background: 'transparent', overflowX: 'hidden' });
    setIframeBody(previous => previous === doc.body ? previous : doc.body);
  }, []);

  useEffect(setupDocument, [setupDocument]);

  useEffect(() => {
    if (!iframeBody) return;
    const head = iframeBody.ownerDocument.head;
    const sourceHead = frameRef.current?.ownerDocument.head;
    if (!sourceHead) return;
    const copies = new Map<Element, Element>();
    const syncStyles = () => {
      const sources = new Set(sourceHead.querySelectorAll('style, link[rel="stylesheet"]'));
      for (const [source, copy] of copies) {
        if (!sources.has(source)) { copy.remove(); copies.delete(source); }
      }
      for (const source of sources) {
        const previous = copies.get(source);
        if (previous?.isEqualNode(source)) continue;
        const copy = source.cloneNode(true) as Element;
        if (previous) previous.replaceWith(copy);
        else head.appendChild(copy);
        copies.set(source, copy);
      }
    };
    syncStyles();
    const observer = new MutationObserver(syncStyles);
    observer.observe(sourceHead, { childList: true, subtree: true, characterData: true, attributes: true });
    return () => {
      observer.disconnect();
      for (const copy of copies.values()) copy.remove();
    };
  }, [iframeBody]);

  return (
    <iframe ref={frameRef} srcDoc={IFRAME_SRCDOC} onLoad={setupDocument} className={`w-full h-full border-none bg-white ${className}`} title="Undangan pernikahan" allow="autoplay; clipboard-write; fullscreen">
      {iframeBody && createPortal(children, iframeBody)}
    </iframe>
  );
}
