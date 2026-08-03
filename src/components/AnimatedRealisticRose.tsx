import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedRealisticRoseProps {
  className?: string;
  isBlooming?: boolean;
}

export const AnimatedRealisticRose: React.FC<AnimatedRealisticRoseProps> = ({ 
  className = "w-64 h-64", 
  isBlooming = true 
}) => {
  // We use Framer Motion variants to control the blooming state.
  // The 'repeat: Infinity' with 'reverse' creates a continuous open-close loop.
  const transitionSettings: any = {
    duration: 3,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "mirror",
  };

  // Outer Petals - wide opening
  const outerPetalL = {
    closed: { scale: 0.6, rotate: 20, x: 20, y: 10 },
    bloomed: { scale: 1, rotate: 0, x: 0, y: 0 }
  };
  const outerPetalR = {
    closed: { scale: 0.6, rotate: -20, x: -20, y: 10 },
    bloomed: { scale: 1, rotate: 0, x: 0, y: 0 }
  };
  const outerPetalB = {
    closed: { scale: 0.5, rotate: 0, y: -30 },
    bloomed: { scale: 1, rotate: 0, y: 0 }
  };
  const outerPetalT = {
    closed: { scale: 0.5, rotate: 0, y: 30 },
    bloomed: { scale: 1, rotate: 0, y: 0 }
  };

  // Mid Petals - medium opening
  const midPetal1 = {
    closed: { scale: 0.65, rotate: -15 },
    bloomed: { scale: 1, rotate: 0 }
  };
  const midPetal2 = {
    closed: { scale: 0.65, rotate: 15 },
    bloomed: { scale: 1, rotate: 0 }
  };

  // Inner Petals (the bud) - slightly breathing
  const innerBud = {
    closed: { scale: 0.8 },
    bloomed: { scale: 1.05 }
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={isBlooming ? "bloomed" : "closed"}
        animate={isBlooming ? ["bloomed", "closed"] : "closed"}
        transition={transitionSettings}
        className="w-full h-full drop-shadow-2xl"
      >
        <defs>
          {/* Extremely realistic radial and linear gradients for deep rose colors */}
          <radialGradient id="rose-outer" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#ff0a43" />
            <stop offset="50%" stopColor="#cc0022" />
            <stop offset="100%" stopColor="#550000" />
          </radialGradient>
          
          <radialGradient id="rose-mid" cx="50%" cy="50%" r="50%" fx="40%" fy="60%">
            <stop offset="0%" stopColor="#ff3366" />
            <stop offset="60%" stopColor="#aa0011" />
            <stop offset="100%" stopColor="#330000" />
          </radialGradient>
          
          <linearGradient id="rose-inner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff1a53" />
            <stop offset="50%" stopColor="#880011" />
            <stop offset="100%" stopColor="#220000" />
          </linearGradient>

          <radialGradient id="rose-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff4d79" />
            <stop offset="40%" stopColor="#990011" />
            <stop offset="100%" stopColor="#110000" />
          </radialGradient>

          {/* Realistic Green Leaves */}
          <linearGradient id="leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a4d2e" />
            <stop offset="100%" stopColor="#0d2617" />
          </linearGradient>
          
          <filter id="petal-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.6"/>
          </filter>
          
          <filter id="deep-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.8"/>
          </filter>
        </defs>

        {/* --- LEAVES (Static background) --- */}
        <g filter="url(#deep-shadow)">
          <path d="M150,150 C230,280 300,200 280,120 C230,150 180,140 150,150 Z" fill="url(#leaf-grad)" />
          <path d="M150,150 C70,280 0,200 20,120 C70,150 120,140 150,150 Z" fill="url(#leaf-grad)" />
          <path d="M150,150 C50,20 120,-30 180,10 C160,70 160,110 150,150 Z" fill="url(#leaf-grad)" />
        </g>

        {/* --- OUTER PETALS --- */}
        <motion.g style={{ transformOrigin: "150px 150px" }} variants={outerPetalT} transition={transitionSettings}>
          <path d="M150,160 C250,50 280,180 150,280 C20,180 50,50 150,160 Z" fill="url(#rose-outer)" filter="url(#petal-shadow)" />
        </motion.g>

        <motion.g style={{ transformOrigin: "150px 150px" }} variants={outerPetalL} transition={transitionSettings}>
          <path d="M160,150 C50,50 -20,200 80,280 C150,280 180,200 160,150 Z" fill="url(#rose-outer)" filter="url(#petal-shadow)" />
        </motion.g>
        
        <motion.g style={{ transformOrigin: "150px 150px" }} variants={outerPetalR} transition={transitionSettings}>
          <path d="M140,150 C250,50 320,200 220,280 C150,280 120,200 140,150 Z" fill="url(#rose-outer)" filter="url(#petal-shadow)" />
        </motion.g>

        {/* --- MID PETALS --- */}
        <motion.g style={{ transformOrigin: "150px 150px" }} variants={midPetal1} transition={transitionSettings}>
          <path d="M150,170 C240,80 250,220 150,250 C60,220 70,80 150,170 Z" fill="url(#rose-mid)" filter="url(#petal-shadow)" />
        </motion.g>

        <motion.g style={{ transformOrigin: "150px 150px" }} variants={midPetal2} transition={transitionSettings}>
          <path d="M150,130 C220,230 100,280 60,180 C20,100 120,70 150,130 Z" fill="url(#rose-mid)" filter="url(#deep-shadow)" />
          <path d="M150,130 C80,230 200,280 240,180 C280,100 180,70 150,130 Z" fill="url(#rose-mid)" filter="url(#deep-shadow)" />
        </motion.g>

        {/* --- INNER PETALS (THE SPIRAL BUD) --- */}
        <motion.g style={{ transformOrigin: "150px 150px" }} variants={innerBud} transition={transitionSettings}>
          <path d="M150,145 C190,90 220,180 150,200 C80,180 110,90 150,145 Z" fill="url(#rose-inner)" filter="url(#petal-shadow)" />
          
          {/* Tight spiral overlapping */}
          <path d="M150,165 C120,110 180,100 180,150 C180,180 140,200 120,170 C100,140 140,110 160,130" fill="none" stroke="url(#rose-core)" strokeWidth="15" strokeLinecap="round" filter="url(#petal-shadow)" />
          
          {/* Center core deep darkness */}
          <circle cx="147" cy="155" r="12" fill="#1a0000" filter="url(#petal-shadow)" />
          <path d="M147,155 C130,140 160,130 160,155 C160,170 140,170 147,155 Z" fill="url(#rose-core)" />
        </motion.g>

      </motion.svg>
    </div>
  );
};
