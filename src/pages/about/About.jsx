import useDocumentTitle from '../../hooks/useDocumentTitle';
import React from "react";
import { motion } from "framer-motion";
import headingImg from '../../assets/Heading.webp';
import ourCustomer from '../../assets/ourCustomer.webp';
import aboutUsImg from '../../assets/aboutUs.webp';
import logoPutih from '../../assets/logoPutih.webp';

const FadeUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.75, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

const stats = [
  { value: "2001", label: "Founded in Bali" },
  { value: "100%", label: "Handcrafted Boards" },
  { value: "∞", label: "Waves Ridden Worldwide" },
];

export default function About() {
  useDocumentTitle('About Us | FreePigMovement');
  return (
    <div className="bg-[#252525] min-h-screen font-poppins text-white overflow-x-hidden">
      {/* ── HERO BANNER ── */}
      <div
        className="relative w-full flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${headingImg})`, height: "350px" }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 font-oswald text-5xl sm:text-6xl md:text-7xl lg:text-[96px] font-black tracking-[0.1em] text-center uppercase text-white drop-shadow-2xl px-4"
        >
          ABOUT US
        </motion.h1>
      </div>

      {/* ── STATS BAR ── */}
      <div className="bg-[#1a1a1a] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <FadeUp key={i} delay={i * 0.1} className="text-center">
              <p className="font-oswald text-4xl md:text-5xl font-black text-white mb-1">
                {s.value}
              </p>
              <p className="text-[11px] text-gray-500 tracking-[0.25em] uppercase font-medium">
                {s.label}
              </p>
            </FadeUp>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-24">
        {/* Section label */}
        <FadeUp>
          <p className="text-[11px] text-gray-500 tracking-[0.35em] uppercase font-bold mb-5">
            Our Story
          </p>
        </FadeUp>

        {/* ── HEADING ── */}
        <FadeUp delay={0.1} className="text-center mb-16 md:mb-24">
          <h2 className="font-oswald text-4xl md:text-6xl lg:text-[76px] font-black leading-[1.1] text-white uppercase tracking-wide">
            BORN FROM THE OCEAN, <br className="hidden md:block" /> BUILT BY HAND.
          </h2>
          <div className="w-24 h-1 bg-white/30 mx-auto mt-8" />
        </FadeUp>

        {/* ── CONTENT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
          {/* Left Side - Tall Image */}
          <div className="lg:col-span-5">
            <FadeUp delay={0.2} className="overflow-hidden rounded-2xl h-[400px] lg:h-[600px] group sticky top-32">
              <img
                loading="lazy"
                src={aboutUsImg}
                alt="About Us"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            </FadeUp>
          </div>

          {/* Right Side - Text & Small Image */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <FadeUp delay={0.3}>
              <p className="text-gray-300 text-[17px] md:text-[19px] leading-[1.8] font-light">
                <strong className="text-white font-medium">Back in 2001</strong> with a simple, uncompromising mission: to build surfboards that we would actually want to paddle out on ourselves. No shortcuts. No compromises.
              </p>
            </FadeUp>

            <FadeUp delay={0.4}>
              <p className="text-gray-300 text-[17px] md:text-[19px] leading-[1.8] font-light">
                Over two decades later, our obsession with detail hasn't changed. We believe a great board isn't just manufactured—it's handcrafted. From sourcing genuine premium materials to chasing precision through every step of the shaping and glassing process, it's the human touch and years of refined instinct that give our boards their soul. For us, it's about reliability, peak performance, and durability that stands the test of time.
              </p>
            </FadeUp>
            
          </div>

          {/* Full Width Paragraph + Image */}
          <div className="lg:col-span-12 flex flex-col md:flex-row gap-8 lg:gap-16 items-center lg:-mt-8">
            <FadeUp delay={0.5} className="flex-1 w-full">
              <p className="text-gray-300 text-[17px] md:text-[19px] leading-[1.8] font-light">
                What began as a core local Bali brand has now found its way into line-ups across the globe. We may be shipping worldwide, but our roots remain exactly where we started: dedicated to high-performance quality shapes, respecting the ocean, and staying true to our heritage.
              </p>
            </FadeUp>
            <FadeUp delay={0.6} className="w-full md:w-[40%] lg:w-[35%] shrink-0">
              <div className="overflow-hidden rounded-xl h-[260px] group shadow-2xl">
                <img
                  loading="lazy"
                  src={logoPutih}
                  alt="Our Heritage"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
              </div>
            </FadeUp>
          </div>

          {/* Full Width Footer Text */}
          <div className="lg:col-span-12 mt-4 lg:mt-8">
            <FadeUp delay={0.7}>
              <div className="pt-12 border-t border-white/10 relative">
                <div className="absolute top-0 left-0 w-32 h-[2px] bg-white/50" />
                <p className="font-oswald text-white text-3xl md:text-4xl tracking-[0.1em] font-bold">
                  PROUDLY HANDCRAFTED
                </p>
                <p className="font-oswald text-gray-400 text-xl md:text-2xl tracking-[0.15em] font-medium mt-2">
                  THE HIGHEST QUALITY GOODS SINCE 2001
                </p>
              </div>
            </FadeUp>
          </div>
        </div>

        {/* ── TAGLINE HIGHLIGHT ── */}
        <FadeUp delay={0.1}>
          <div className="relative border border-white/10 rounded-2xl px-8 md:px-16 py-14 text-center overflow-hidden bg-[#1e1e1e]">
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent pointer-events-none" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-white/4 rounded-full blur-3xl pointer-events-none" />

            <p className="text-[11px] text-gray-500 tracking-[0.35em] uppercase font-bold mb-5">
              Our Tagline
            </p>
            <h3 className="font-oswald text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              MADE IN BALI.
              <br />
              <span className="text-gray-400">ENJOYED WORLDWIDE.</span>
            </h3>
            <div className="w-16 h-px bg-white/20 mx-auto mt-8" />
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
