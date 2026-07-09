import useDocumentTitle from "../../hooks/useDocumentTitle";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import headingImg from "../../assets/headerRiderss.webp";
import headerTransparanImg from "../../assets/headertranparan.webp";
import bercakPembatas from "../../assets/bercakPembatas.webp";
import volumeImg from "../../assets/volumeCalculate.webp";

// ── Shape factors ──────────────────────────────────────────────────────────────
const SHAPE_FACTORS = {
  shortboard: 0.54,
  hybrid: 0.56,
  malibu: 0.58,
  bigboy: 0.58,
  funboard: 0.58,
};

// Exact lookup tables from old website to match their rounding quirks perfectly
function getLengthCm(feetFloat) {
  const inches = Math.round(feetFloat * 12);
  const table = {
    60: 152.4,
    61: 155.0,
    62: 157.5,
    63: 160.0,
    64: 162.5,
    65: 165.0,
    66: 167.6,
    67: 170.0,
    68: 172.7,
    69: 175.3,
    70: 178,
    71: 180.5,
    72: 183.0,
    73: 185.4,
    74: 188.0,
    75: 190.5,
    76: 193.0,
    77: 195.6,
    78: 198.0,
    79: 200.7,
    80: 203.2,
    81: 205.7,
    82: 208,
    83: 210,
    84: 213.4,
    85: 215.9,
    86: 218.4,
    87: 220.1,
    88: 223.5,
    89: 226.0,
    90: 228.6,
    91: 231.1,
    92: 233.7,
    93: 236.2,
    94: 238.5,
    95: 240.5,
    96: 243.8,
  };
  return table[inches] || Math.round(inches * 2.54 * 10) / 10;
}

function getWidthCm(inchesFloat) {
  const eighths = Math.round(inchesFloat * 8);
  const table = {
    136: 43.1,
    138: 43.8,
    140: 44.4,
    142: 45,
    144: 45.7,
    146: 46.3,
    148: 47.0,
    150: 47.6,
    152: 48.2,
    154: 48.9,
    156: 49.5,
    158: 50.1,
    160: 50.8,
    162: 51.4,
    164: 52.1,
    166: 52.7,
    168: 53.3,
    170: 53.9,
    172: 54.6,
    174: 55.2,
    176: 55.9,
    178: 56.5,
    180: 57.1,
    182: 57.8,
    184: 58.4,
    186: 59,
    188: 59.7,
    190: 60.3,
    192: 60.9,
  };
  return table[eighths] || Math.round(inchesFloat * 2.54 * 10) / 10;
}

function getThicknessCm(inchesFloat) {
  const eighths = Math.round(inchesFloat * 8);
  const table = {
    16: 5.0,
    17: 5.3,
    18: 5.7,
    19: 6.0,
    20: 6.3,
    21: 6.6,
    22: 6.9,
    23: 7.3,
    24: 7.6,
    25: 7.9,
    26: 8.2,
    27: 8.6,
    28: 8.9,
    29: 9.3,
    30: 9.5,
    31: 9.8,
    32: 10.1,
  };
  return table[eighths] || Math.round(inchesFloat * 2.54 * 10) / 10;
}

const BOARD_TYPES = [
  { id: "shortboard", label: "Shortboard" },
  { id: "hybrid", label: "Hybrid / Fish" },
  { id: "malibu", label: "Malibu" },
  { id: "bigboy", label: "Big Boy" },
  { id: "funboard", label: "Funboard" },
];

function formatFeet(value) {
  const feet = Math.floor(value);
  const inches = Math.round((value - feet) * 12);
  return inches === 0 ? `${feet}'0"` : `${feet}'${inches}"`;
}

// Format Width: kelipatan 0.25 → pecahan 1/4
function formatWidth(value) {
  const whole = Math.floor(value);
  const dec = Math.round((value - whole) * 4); // 0,1,2,3,4
  const fracs = ["", "\u00bc", "\u00bd", "\u00be", ""];
  const frac = [
    { num: 0, den: 4 },
    { num: 1, den: 4 },
    { num: 2, den: 4 },
    { num: 3, den: 4 },
    { num: 4, den: 4 },
  ];
  if (dec === 0) return `${whole}"`;
  if (dec === 4) return `${whole + 1}"`;
  const { num, den } = frac[dec];
  // simplify
  const g = num % 2 === 0 ? 2 : 1;
  return { whole, num: num / g, den: den / g, suffix: '"' };
}

// Format Thickness: kelipatan 0.125 → pecahan /8 atau /16
function formatThickness(value) {
  const whole = Math.floor(value);
  const rem = value - whole;
  const sixteenths = Math.round(rem * 16);
  if (sixteenths === 0) return `${whole}"`;
  if (sixteenths === 16) return `${whole + 1}"`;
  // simplify fraction
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(sixteenths, 16);
  return { whole, num: sixteenths / g, den: 16 / g, suffix: '"' };
}

// Render fraction JSX inline
function FractionDisplay({ value }) {
  if (typeof value === "string") return <span>{value}</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
      {value.whole > 0 && <span>{value.whole}</span>}
      <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", fontSize: "0.85em", fontWeight: 600, lineHeight: 1.1, margin: "0 1px" }}>
        <span style={{ display: "block", textAlign: "center" }}>{value.num}</span>
        <span style={{ borderTop: "1.5px solid currentColor", display: "block", width: "100%", textAlign: "center" }}>{value.den}</span>
      </span>
      <span>{value.suffix}</span>
    </span>
  );
}


// ── Custom Slider ──────────────────────────────────────────────────────────────
function Slider({ label, min, max, step, value, onChange, display }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-5">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs tracking-widest text-gray-400 uppercase">
          {label}
        </span>
        <span className="text-[11px] font-semibold text-white">
          <FractionDisplay value={display} />
        </span>
      </div>
      <div className="text-[9px] text-gray-600 mb-1.5">
        {label === "Length"
          ? `${formatFeet(min)} – ${formatFeet(max)}`
          : `${min}" – ${max}"`}
      </div>

      {/* Track */}
      <div className="relative h-[3px] rounded-full">
        {/* Fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${pct}%`, background: "rgba(255,255,255,0.85)" }}
        />
        {/* Invisible native input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none"
          style={{
            left: `calc(${pct}% - 6px)`,
            background: "#fff",
            border: "2px solid rgba(255,255,255,0.6)",
            boxShadow: "0 0 6px rgba(255,255,255,0.5)",
          }}
        />
      </div>
    </div>
  );
}

// ── Surfboard SVG ──────────────────────────────────────────────────────────────
function SurfboardSVG() {
  return (
    <svg
      viewBox="0 0 200 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <filter id="gcyan">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="gred">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="gyellow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ggreen">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1c1c1c" />
          <stop offset="50%" stopColor="#2e2e2e" />
          <stop offset="100%" stopColor="#1c1c1c" />
        </linearGradient>
      </defs>

      {/* Board body */}
      <path
        d="M100 10
           C118 22,148 88,150 190
           C152 275,148 355,136 406
           C124 446,104 470,100 480
           C96 470,76 446,64 406
           C52 355,48 275,50 190
           C52 88,82 22,100 10Z"
        fill="url(#bg)"
        stroke="#00CFFF"
        strokeWidth="1.4"
        filter="url(#gcyan)"
      />

      {/* Stringer */}
      <line
        x1="100"
        y1="14"
        x2="100"
        y2="474"
        stroke="white"
        strokeWidth="0.5"
        strokeDasharray="5 5"
        opacity="0.2"
      />

      {/* Rail accents */}
      <path
        d="M100 22 C120 40,142 112,144 210 C146 295,140 370,124 415 C112 448,100 468,100 468"
        stroke="white"
        strokeWidth="0.4"
        opacity="0.1"
        fill="none"
      />
      <path
        d="M100 22 C80 40,58 112,56 210 C54 295,60 370,76 415 C88 448,100 468,100 468"
        stroke="white"
        strokeWidth="0.4"
        opacity="0.1"
        fill="none"
      />

      {/* Fin */}
      <path
        d="M93 452 C90 466,85 482,83 492
               C89 486,98 474,108 492
               C106 482,110 466,107 452Z"
        fill="#1a1a1a"
        stroke="#00CFFF"
        strokeWidth="0.9"
        opacity="0.85"
      />

      {/* ─ LENGTH: vertical red line ─ */}
      <line
        x1="68"
        y1="10"
        x2="68"
        y2="480"
        stroke="#FF3333"
        strokeWidth="1.8"
        filter="url(#gred)"
      />
      <polygon points="68,5 63,17 73,17" fill="#FF3333" />
      <polygon points="68,485 63,473 73,473" fill="#FF3333" />

      {/* ─ WIDTH: horizontal yellow line ─ */}
      <line
        x1="48"
        y1="225"
        x2="152"
        y2="225"
        stroke="#FFD700"
        strokeWidth="1.8"
        filter="url(#gyellow)"
      />
      <polygon points="43,225 55,220 55,230" fill="#FFD700" />
      <polygon points="157,225 145,220 145,230" fill="#FFD700" />

      {/* ─ THICKNESS: short green line ─ */}
      <line
        x1="48"
        y1="290"
        x2="90"
        y2="290"
        stroke="#22C55E"
        strokeWidth="1.8"
        filter="url(#ggreen)"
      />
      <polygon points="43,290 55,285 55,295" fill="#22C55E" />
      <polygon points="95,290 83,285 83,295" fill="#22C55E" />
    </svg>
  );
}

// ── Dimension label ────────────────────────────────────────────────────────────

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Volume() {
  useDocumentTitle("Volume Calculator | FreePigMovement");
  const [length, setLength] = useState(6.5);
  const [width, setWidth] = useState(20.5);
  const [thickness, setThickness] = useState(2.75);
  const [boardType, setBoardType] = useState("shortboard");

  const factor = SHAPE_FACTORS[boardType];
  const lengthCm = getLengthCm(length);
  const widthCm = getWidthCm(width);
  const thicknessCm = getThicknessCm(thickness);
  const rawVal = (lengthCm * widthCm * thicknessCm * factor) / 100;
  const volume = (Math.floor(rawVal) / 10).toFixed(1);

  return (
    <div
      className="min-h-screen text-white bg-[#000000]"
      style={{
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* ══════════════════ HERO BANNER ══════════════════ */}
      <div className="relative w-full flex items-center justify-center overflow-visible z-10 pt-32 pb-12">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 font-poppins font-bold tracking-wider text-4xl sm:text-5xl md:text-6xl lg:text-[72px] leading-none text-white drop-shadow-2xl px-4 text-center uppercase"
        >
          VOLUME CALCULATE
        </motion.h1>
      </div>

      {/* ══════════════════ CALCULATOR SECTION ══════════════════ */}
      <div
        className="w-full px-6 md:px-[70px] py-8 md:py-10 mt-16 sm:mt-24 relative z-20"
        style={{ backgroundColor: "#000000" }}
      >
        <div className="w-full mx-auto flex flex-col lg:grid lg:grid-cols-3 gap-[20px] items-start">
          {/* ─── LEFT: Controls ─── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {/* Section title */}
            <h2 className="text-sm font-bold tracking-[0.25em] uppercase text-white mb-6">
              VOLUME CALCULATE SURFBOARD
            </h2>

            {/* Sliders */}
            <Slider
              label="Length"
              min={5}
              max={8}
              step={1 / 12}
              value={length}
              onChange={setLength}
              display={formatFeet(length)}
            />
            <Slider
              label="Width"
              min={17}
              max={24}
              step={0.25}
              value={width}
              onChange={setWidth}
              display={formatWidth(width)}
            />
            <Slider
              label="Thickness"
              min={2}
              max={4}
              step={0.125}
              value={thickness}
              onChange={setThickness}
              display={formatThickness(thickness)}
            />

            {/* Radio buttons — bigger tap targets on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mb-6 mt-2">
              {BOARD_TYPES.map((bt) => (
                <label
                  key={bt.id}
                  className="flex items-center gap-2 cursor-pointer py-1"
                  onClick={() => setBoardType(bt.id)}
                >
                  {/* Custom radio */}
                  <div
                    className="w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: boardType === bt.id ? "#ffffffff" : "#555",
                      boxShadow:
                        boardType === bt.id ? "0 0 6px #ffffffff" : "none",
                    }}
                  >
                    {boardType === bt.id && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#ffffffff" }}
                      />
                    )}
                  </div>
                  <span
                    className="text-[11px] leading-tight transition-colors"
                    style={{ color: boardType === bt.id ? "#fff" : "#888" }}
                  >
                    {bt.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Result label */}
            <p className="text-[11px] tracking-widest uppercase text-gray-500 mb-3">
              Your Surfboard Volume
            </p>

            {/* Calculate pill — button + result menyatu */}
            <div
              className="flex items-center rounded-full overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {/* Button kiri */}
              <div
                className="flex-shrink-0 px-8 py-3 text-[11px] font-bold tracking-widest uppercase text-black bg-white cursor-default"
              >
                Volume
              </div>

              {/* Divider */}
              <div
                className="w-px self-stretch"
                style={{ background: "rgba(255,255,255,0.15)" }}
              />

              {/* Hasil kanan */}
              <div className="flex-1 flex items-center justify-center px-5 py-2.5 gap-1.5 min-w-[100px]">
                <span className="text-sm font-bold text-white">
                  {volume}
                </span>
                <span className="text-xs text-gray-500 tracking-widest">L</span>
              </div>
            </div>
          </motion.div>

          {/* ─── CENTER: Explanation — hidden on mobile, shown on lg ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:flex flex-col items-center text-center pt-0 lg:pt-8"
          >
            <p className="text-xs tracking-[0.3em] uppercase text-white mb-1">
              How To Calculate
            </p>
            <h2 className="text-xl md:text-[22px]  mb-4 leading-snug text-white">
              Surfboard Volume
            </h2>

            <div
              className="w-12 h-px mb-5"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#00CFFF,transparent)",
              }}
            />

            <p className="text-xs text-gray-400 leading-relaxed max-w-[240px] mb-6">
              The final volume is still tentative it really depends on how the
              foil holds its thickness through the rails, nose, and tail in
              reality
            </p>

            <p className="text-xs text-gray-400 leading-relaxed max-w-[240px] mb-6">
              Length, width and thickness measured at widest point.
            </p>
          </motion.div>

          {/* ─── RIGHT: Image ─── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full flex items-center justify-center gap-4 sm:gap-6 order-first lg:order-last"
          >
            {/* Board image */}
            <div className="w-[240px] sm:w-[280px] md:w-[320px] lg:w-[400px] flex-shrink-0 mb-6 lg:mb-0">
              <img
                src={volumeImg}
                alt="Surfboard volume reference"
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
        {/* /grid */}
      </div>
      {/* /calculator section */}

      {/* Slider thumb reset */}
      <style>{`
        input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:0;height:0;}
        input[type=range]::-moz-range-thumb{width:0;height:0;border:none;background:transparent;}
      `}</style>
    </div>
  );
}
