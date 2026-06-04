import React from 'react';
import { motion } from 'framer-motion';

/**
 * PigLoader – Premium FreePig Movement loading animation
 *
 * Props:
 *  fullScreen  {boolean}  – wraps in min-h-screen dark bg (default: false)
 *  size        {string}   – 'mini' | 'normal' (default: 'normal')
 *  text        {string}   – custom loading text (default: 'Loading...')
 */
export default function PigLoader({ fullScreen = false, size = 'normal', text = 'Loading...' }) {
  const isMini = size === 'mini';

  // ── Wave animations ────────────────────────────────────────────────
  const waveLeft = {
    animate: {
      x: [0, -40],
      transition: { repeat: Infinity, duration: 2.5, ease: 'linear' },
    },
  };
  const waveRight = {
    animate: {
      x: [-40, 0],
      transition: { repeat: Infinity, duration: 3, ease: 'linear' },
    },
  };

  // ── Surfboard float + tilt ─────────────────────────────────────────
  const boardAnim = {
    animate: {
      y: [0, -3, 0],
      rotate: [-5, 5, -5],
      transition: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
    },
  };

  // ── Pig jump with squash & stretch ────────────────────────────────
  const pigAnim = {
    animate: {
      y: [0, -28, 0, 0],
      rotate: [0, -6, 6, 0],
      scaleY: [1, 0.82, 1.06, 1],
      transition: {
        repeat: Infinity,
        duration: 1.4,
        ease: [0.45, 0, 0.25, 1],
        times: [0, 0.42, 0.85, 1],
      },
    },
  };

  // ── Water splash particles (triggered on landing) ─────────────────
  const splashLeft = {
    animate: {
      x: [0, -12],
      y: [0, -8, 4],
      opacity: [0, 0.9, 0],
      scaleX: [0.2, 1, 0.4],
      transition: {
        repeat: Infinity,
        duration: 1.4,
        delay: 0.88, // fires near landing moment
        ease: 'easeOut',
      },
    },
  };

  const splashRight = {
    animate: {
      x: [0, 12],
      y: [0, -8, 4],
      opacity: [0, 0.9, 0],
      scaleX: [0.2, 1, 0.4],
      transition: {
        repeat: Infinity,
        duration: 1.4,
        delay: 0.88,
        ease: 'easeOut',
      },
    },
  };

  const splashCenter = {
    animate: {
      y: [0, -14, 4],
      opacity: [0, 1, 0],
      scale: [0.3, 1, 0.4],
      transition: {
        repeat: Infinity,
        duration: 1.4,
        delay: 0.9,
        ease: 'easeOut',
      },
    },
  };

  // ─── MINI VERSION ────────────────────────────────────────────────────────
  if (isMini) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <defs>
              <clipPath id="mini-circle-clip">
                <circle cx="60" cy="60" r="42" />
              </clipPath>
            </defs>
            <circle cx="60" cy="60" r="42" fill="#141414" stroke="#333" strokeWidth="3" />
            <g clipPath="url(#mini-circle-clip)">
              <motion.g variants={waveLeft} animate="animate">
                <path d="M -40,75 Q -30,70 -20,75 T 0,75 T 20,75 T 40,75 T 60,75 T 80,75 T 100,75 T 120,75 T 140,75 T 160,75 L 160,120 L -40,120 Z" fill="#00a3c4" opacity="0.8" />
              </motion.g>
              <motion.g variants={waveLeft} animate="animate">
                <path d="M -40,78 Q -30,73 -20,78 T 0,78 T 20,78 T 40,78 T 60,78 T 80,78 T 100,78 T 120,78 T 140,78 T 160,78 L 160,120 L -40,120 Z" fill="#00e5ff" />
              </motion.g>
            </g>
            <motion.g variants={boardAnim} animate="animate" style={{ originX: '60px', originY: '75px' }}>
              <motion.g variants={pigAnim} animate="animate" style={{ originX: '55px', originY: '73px' }}>
                <ellipse cx="53" cy="50" rx="14" ry="11" fill="white" stroke="black" strokeWidth="2.5" />
                <circle cx="67" cy="43" r="8" fill="white" stroke="black" strokeWidth="2.5" />
                <rect x="73" y="41" width="6" height="5" rx="2" fill="white" stroke="black" strokeWidth="2" />
                <circle cx="69" cy="40" r="1" fill="black" />
              </motion.g>
              <path d="M 20,74 C 35,68 75,68 90,74 C 75,78 35,78 20,74 Z" fill="#00D8FF" stroke="black" strokeWidth="2.5" strokeLinejoin="round" />
            </motion.g>
          </svg>
        </div>
        <span className="text-[10px] text-gray-400 tracking-widest uppercase font-semibold">{text}</span>
      </div>
    );
  }

  // ─── NORMAL (FULLSCREEN / INLINE) VERSION ────────────────────────────────
  const loaderContent = (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Circular Badge */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <defs>
            <clipPath id="circle-clip">
              <circle cx="60" cy="60" r="42" />
            </clipPath>
          </defs>

          {/* Outer circle */}
          <circle cx="60" cy="60" r="42" fill="#141414" stroke="#222" strokeWidth="3" />

          {/* Clipped content */}
          <g clipPath="url(#circle-clip)">
            <circle cx="60" cy="52" r="26" fill="rgba(0, 216, 255, 0.08)" />
            <circle cx="60" cy="52" r="16" fill="rgba(255, 255, 255, 0.03)" />

            {/* Back wave */}
            <motion.g variants={waveRight} animate="animate">
              <path d="M -40,72 Q -30,68 -20,72 T 0,72 T 20,72 T 40,72 T 60,72 T 80,72 T 100,72 T 120,72 T 140,72 T 160,72 L 160,120 L -40,120 Z" fill="#162c38" opacity="0.6" />
            </motion.g>

            {/* Middle wave */}
            <motion.g variants={waveLeft} animate="animate">
              <path d="M -40,75 Q -30,70 -20,75 T 0,75 T 20,75 T 40,75 T 60,75 T 80,75 T 100,75 T 120,75 T 140,75 T 160,75 L 160,120 L -40,120 Z" fill="#009ebf" opacity="0.8" />
            </motion.g>

            {/* Front wave */}
            <motion.g variants={waveLeft} animate="animate">
              <path d="M -40,78 Q -30,73 -20,78 T 0,78 T 20,78 T 40,78 T 60,78 T 80,78 T 100,78 T 120,78 T 140,78 T 160,78 L 160,120 L -40,120 Z" fill="#00e5ff" />
              <path d="M -40,78 Q -30,73 -20,78 T 0,78 T 20,78 T 40,78 T 60,78 T 80,78 T 100,78 T 120,78 T 140,78 T 160,78" fill="none" stroke="white" strokeWidth="1.5" opacity="0.8" />
            </motion.g>
          </g>

          {/* Board + Pig (outside clip = pop-out 3D effect) */}
          <motion.g variants={boardAnim} animate="animate" style={{ originX: '60px', originY: '75px' }}>

            {/* ── Water Splash particles (at board landing point) ── */}
            <motion.ellipse
              variants={splashLeft}
              animate="animate"
              cx="35" cy="74"
              rx="4" ry="2"
              fill="#00e5ff"
              opacity="0"
            />
            <motion.ellipse
              variants={splashRight}
              animate="animate"
              cx="75" cy="74"
              rx="4" ry="2"
              fill="#00e5ff"
              opacity="0"
            />
            <motion.circle
              variants={splashCenter}
              animate="animate"
              cx="55" cy="72"
              r="2.5"
              fill="white"
              opacity="0"
            />

            {/* Pig */}
            <motion.g variants={pigAnim} animate="animate" style={{ originX: '55px', originY: '73px' }}>
              {/* Tail */}
              <path d="M 39,52 C 34,52 34,46 37,46 C 39,46 40,49 39,51" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
              {/* Back leg */}
              <path d="M 46,60 L 43,67 L 47,73" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {/* Front leg */}
              <path d="M 60,60 L 62,67 L 58,73" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {/* Body */}
              <ellipse cx="53" cy="50" rx="14" ry="11" fill="white" stroke="black" strokeWidth="2.5" />
              {/* Head */}
              <circle cx="67" cy="43" r="8" fill="white" stroke="black" strokeWidth="2.5" />
              {/* Snout */}
              <rect x="73" y="41" width="6" height="5" rx="2" fill="white" stroke="black" strokeWidth="2" />
              <circle cx="76" cy="43" r="0.6" fill="black" />
              <circle cx="76" cy="45" r="0.6" fill="black" />
              {/* Eye */}
              <circle cx="69" cy="40" r="1" fill="black" />
              {/* Ear */}
              <path d="M 63,33 C 60,31 58,37 59,39 C 60,41 63,39 63,33 Z" fill="white" stroke="black" strokeWidth="1.8" strokeLinejoin="round" />
              {/* Arm */}
              <path d="M 58,50 Q 64,53 66,48" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
            </motion.g>

            {/* Surfboard */}
            <path d="M 32,75 C 30,79 26,83 24,85 C 28,83 33,79 35,75 Z" fill="#111" stroke="black" strokeWidth="2" />
            <path d="M 20,74 C 35,68 75,68 90,74 C 75,78 35,78 20,74 Z" fill="#00D8FF" stroke="black" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 20,74 Q 55,74 90,74" stroke="white" strokeWidth="1" opacity="0.7" />
          </motion.g>
        </svg>
      </div>

      {/* Brand text */}
      <h2 className="font-oswald text-white font-bold tracking-[0.3em] text-sm uppercase mt-4">
        FREEPIG MOVEMENT
      </h2>
      <motion.p
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        className="text-[10px] text-accent-teal font-semibold tracking-[0.2em] mt-2 uppercase"
      >
        {text}
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-[#111] flex items-center justify-center font-poppins z-[9999]"
      >
        {loaderContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center py-16 w-full"
    >
      {loaderContent}
    </motion.div>
  );
}
