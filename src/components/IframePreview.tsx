import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * IframePreview — renders children inside a real <iframe> using React Portal.
 * This ensures that CSS media queries (like Tailwind's md: and lg:) evaluate
 * against the iframe's 375px width, rather than the parent window's width.
 */
export default function IframePreview({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

  const handleIframe = (iframe: HTMLIFrameElement | null) => {
    if (!iframe) return;
    
    const setupDoc = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc && doc.body) {
        // Prevent infinite re-renders by checking if already set
        setIframeBody((prev) => prev !== doc.body ? doc.body : prev);
        
        const parentHead = window.document.head;
        const iframeHead = doc.head;
        
        // Only copy if styles aren't already there
        if (iframeHead.children.length === 0) {
          Array.from(parentHead.querySelectorAll('style, link[rel="stylesheet"]')).forEach(tag => {
            iframeHead.appendChild(tag.cloneNode(true));
          });
          doc.body.style.margin = '0';
          doc.body.style.padding = '0';
          doc.body.style.background = 'transparent';
          doc.body.style.overflowX = 'hidden';
        }
      }
    };

    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      setupDoc();
    }
    // Always attach load event just in case
    iframe.onload = setupDoc;
  };

  return (
    <iframe
      ref={handleIframe}
      className={`w-full h-full border-none bg-white ${className}`}
      title="Preview"
    >
      {iframeBody && createPortal(children, iframeBody)}
    </iframe>
  );
}
