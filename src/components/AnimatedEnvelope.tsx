import React from 'react';

interface AnimatedEnvelopeProps {
  className?: string;
  size?: number;
  color?: string;
}

export default function AnimatedEnvelope({ 
  className = "", 
  size = 24, 
  color = "currentColor" 
}: AnimatedEnvelopeProps) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size * 0.75 }}
    >
      <svg
        width={size}
        height={size * 0.75}
        viewBox="0 0 24 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Main Envelope Body */}
        <path
          d="M2.5 3.5C2.5 2.67157 3.17157 2 4 2H20C20.8284 2 21.5 2.67157 21.5 3.5V14.5C21.5 15.3284 20.8284 16 20 16H4C3.17157 16 2.5 15.3284 2.5 14.5V3.5Z"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Top Flap (Closed) */}
        <path
          d="M2.5 3.5L12 9.5L21.5 3.5"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Wax Seal detail in the center */}
        <circle cx="12" cy="9.5" r="2.5" fill={color} />
        <path d="M11 9.5H13 M12 8.5V10.5" stroke="var(--bg-primary)" strokeWidth="0.8" strokeLinecap="round" />
        
        {/* Bottom folding details for a premium look */}
        <path
          d="M8.5 16L2.5 10.5 M15.5 16L21.5 10.5"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
