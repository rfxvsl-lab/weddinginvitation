import React from 'react';

/**
 * IframePreview — renders children directly in a scrollable div.
 * Previous approach using <iframe> + createPortal was fragile (empty preview
 * after Google OAuth login). This div-based approach is simpler and 100% reliable.
 * CSS containment (`contain: content`) provides style isolation.
 */
export default function IframePreview({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`w-full h-full overflow-y-auto overflow-x-hidden bg-white ${className}`}
      style={{
        contain: 'content',       // CSS containment for isolation
        colorScheme: 'light',
      }}
    >
      {children}
    </div>
  );
}
