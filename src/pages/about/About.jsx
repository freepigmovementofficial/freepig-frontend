import useDocumentTitle from "../../hooks/useDocumentTitle";
import React from "react";
import { motion } from "framer-motion";
import headingImg from "../../assets/headerRiderss.webp";
import headerTransparanImg from "../../assets/headertranparan.webp";
import bercakPembatas from "../../assets/bercakPembatas.webp";
import ourCustomer from "../../assets/ourCustomer.webp";
import aboutUsImg from "../../assets/aboutUs.webp";
import logoPutih from "../../assets/logoPutih.webp";
import maskotBabi from "../../assets/maskotBabi.webp";

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

export default function About() {
  useDocumentTitle("About Us | FreePigMovement");
  return (
    <div className="bg-[#010E19] min-h-screen font-poppins text-white overflow-x-hidden">
      {/* ── MAIN CONTENT ── */}
      <div className="w-full mx-auto px-6 md:px-[70px] pt-44 pb-24">
        {/* Section label */}
        <FadeUp>
          <p className="text-[11px] text-gray-500 tracking-[0.35em] uppercase font-bold mb-5">
            Our Story
          </p>
        </FadeUp>

        {/* ── HEADING ── */}
        <FadeUp delay={0.1} className="text-center mb-16 md:mb-24">
          <h2 className="font-road-rage text-5xl md:text-7xl lg:text-[80px] leading-[0.9] text-white uppercase tracking-wide drop-shadow-md">
            BORN FROM THE OCEAN, <br className="hidden md:block" /> BUILT BY
            HAND.
          </h2>
          <div className="w-24 h-1 bg-white/30 mx-auto mt-8" />
        </FadeUp>

        {/* ── CONTENT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px] items-center mb-24">
          {/* Left Side - Tall Image */}
          <div className="lg:col-span-5">
            <FadeUp
              delay={0.2}
              className="overflow-hidden rounded-2xl h-[400px] lg:h-[600px] group sticky top-32"
            >
              <img
                loading="lazy"
                src={aboutUsImg}
                alt="About Us"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#010E19]/20 group-hover:bg-transparent transition-colors duration-500" />
            </FadeUp>
          </div>

          {/* Right Side - Text & Small Image */}
          <div className="lg:col-span-7 flex flex-col gap-[20px]">
            <FadeUp delay={0.3}>
              <p className="text-gray-300 text-[17px] md:text-[19px] leading-[1.8] font-light">
                <strong className="text-white font-medium">Since 2001</strong> ,
                we’ve been shaping more than just surfboards <br />
                we’re crafting pure stoke. Every board is a slice of Bali’s
                soul, <br />
                fueled by two decades of ocean love. Whether you’re paddling{" "}
                <br /> out for your first wave or dropping into a perfect
                barrel, we’ve got <br /> your back—no shortcuts, just pure,
                hand-shaped magic. Ready to ride
                <br /> your dream board? Let’s roll
              </p>
            </FadeUp>
          </div>

          {/* Full Width Paragraph + Image */}
          <div className="lg:col-span-12 flex flex-col md:flex-row gap-[20px] items-center lg:-mt-8">
            <FadeUp delay={0.5} className="flex-1 w-full">
              <p className="text-gray-300 text-[17px] md:text-[19px] leading-[1.8] font-light">
                What began as a core local Bali brand has now found its way into
                line-ups across the globe. We may be shipping worldwide, but our
                roots remain exactly where we started: dedicated to
                high-performance quality shapes, respecting the ocean, and
                staying true to our heritage.
              </p>
            </FadeUp>
            <FadeUp
              delay={0.6}
              className="w-full md:w-[40%] lg:w-[35%] shrink-0"
            >
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
          <div className="relative border border-white/10 rounded-2xl px-8 md:px-16 py-14 text-center overflow-visible bg-[#1A2127]">
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent pointer-events-none" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-white/4 rounded-full blur-3xl pointer-events-none" />

            {/* Maskot Babi */}
            <img
              src={maskotBabi}
              alt="Maskot Babi"
              className="absolute -top-36 md:-top-52 -right-4 md:-right-10 w-[220px] md:w-[300px] lg:w-[340px] opacity-90 pointer-events-none z-10 select-none"
            />

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
