import React from 'react';
import { motion } from 'framer-motion';
import headingImg from '../../assets/Heading.png';
import meetTheRiders from '../../assets/meetTheRiders.png';
import ourCustomer from '../../assets/ourCustomer.png';

const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.75, ease: 'easeOut', delay }}
  >
    {children}
  </motion.div>
);

const stats = [
  { value: '2001', label: 'Founded in Bali' },
  { value: '20+', label: 'Years of Craftsmanship' },
  { value: '100%', label: 'Handcrafted Boards' },
  { value: '∞', label: 'Waves Ridden Worldwide' },
];

export default function About() {
  return (
    <div className="bg-[#252525] min-h-screen font-poppins text-white overflow-x-hidden">

      {/* ── HERO BANNER ── */}
      <div
        className="relative w-full flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${headingImg})`, height: '350px' }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 font-oswald text-5xl sm:text-6xl md:text-7xl lg:text-[96px] font-black tracking-[0.1em] text-center uppercase text-white drop-shadow-2xl px-4"
        >
          ABOUT US
        </motion.h1>
      </div>

      {/* ── STATS BAR ── */}
      <div className="bg-[#1a1a1a] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
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

        {/* Split: heading + body */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start mb-20">

          {/* Left — large heading */}
          <FadeUp delay={0.1} className="lg:w-[38%] shrink-0">
            <h2 className="font-oswald text-4xl md:text-5xl lg:text-[52px] font-black leading-tight text-white">
              BORN FROM<br />THE OCEAN,<br />BUILT BY<br />HAND.
            </h2>
            <div className="w-10 h-1 bg-white/30 mt-6" />
          </FadeUp>

          {/* Right — paragraphs */}
          <FadeUp delay={0.2} className="flex-1 flex flex-col gap-6">
            <p className="text-gray-300 text-base md:text-[17px] leading-[1.85] font-light">
              Founded in Bali in 2001, we started with a simple goal: to build surfboards that
              we would be proud to ride ourselves.
            </p>
            <p className="text-gray-300 text-base md:text-[17px] leading-[1.85] font-light">
              For over two decades, we have focused on quality, using genuine materials and
              paying close attention to every detail throughout the shaping process. We believe
              that a great surfboard should feel reliable, perform well, and last for years.
            </p>
            <p className="text-gray-300 text-base md:text-[17px] leading-[1.85] font-light">
              What began as a local Bali brand has grown beyond the island, with our boards now
              being ridden by surfers from around the world. While we've expanded internationally,
              our commitment remains the same — creating quality surfboards and staying true to
              our roots.
            </p>
          </FadeUp>
        </div>

        {/* ── IMAGE PAIR ── */}
        <FadeUp delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
            <div className="overflow-hidden rounded-2xl h-[280px] md:h-[360px] group">
              <img loading="lazy"
                src={meetTheRiders}
                alt="Our Riders"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="overflow-hidden rounded-2xl h-[280px] md:h-[360px] group">
              <img loading="lazy"
                src={ourCustomer}
                alt="Our Customers"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </FadeUp>

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
