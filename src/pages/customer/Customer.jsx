import useDocumentTitle from "../../hooks/useDocumentTitle";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonialsService } from "../../api/testimonials";
import headingImg from "../../assets/headerRiderss.webp";
import headerTransparanImg from "../../assets/headertranparan.webp";
import bercakPembatas from "../../assets/bercakPembatas.webp";
import PigLoader from "../../components/PigLoader";

const FadeUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.7, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export default function Customer() {
  useDocumentTitle("Customers | FreePigMovement");
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const fetchTestimonials = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await testimonialsService.getAll({ page: pageNum, limit: 8 });
      const data = res.data?.data;
      setTestimonials(data?.testimonials || []);
      setMeta(data?.meta || null);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials(1);
  }, []);

  return (
    <div className="bg-[#010E19] min-h-screen font-poppins text-white overflow-x-hidden">
      {/* ── HERO HEADER ── */}
      <div className="relative w-full flex items-center justify-center overflow-visible z-10 pt-32 pb-12">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 font-poppins font-bold tracking-wider text-4xl sm:text-5xl md:text-6xl lg:text-[72px] leading-none text-white drop-shadow-2xl px-4 text-center uppercase"
        >
          CUSTOMER
        </motion.h1>
      </div>

      {/* ── SUBTITLE ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center pt-10 pb-6 px-4 relative z-20"
      >
        <p className="text-gray-400 text-sm md:text-base tracking-[0.3em] uppercase font-medium">
          Loved By Surfers Worldwide
        </p>
        <div className="w-16 h-0.5 bg-white/20 mx-auto mt-4" />
      </motion.div>

      {/* ── CUSTOMER REVIEWS GRID ── */}
      <div className="w-full mx-auto px-6 md:px-[70px] pb-24 relative z-20">
        {error ? (
          <div className="text-center py-20 text-red-400 text-sm tracking-widest uppercase">
            <p>{error}</p>
            <button
              onClick={() => fetchTestimonials(1)}
              className="mt-4 px-6 py-2 border border-red-500/50 rounded-full hover:bg-red-500/10 transition"
            >
              TRY AGAIN
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-24">
            <PigLoader text="Loading testimonials..." />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-24 text-gray-500 tracking-widest text-sm uppercase">
            No testimonials available at the moment.
          </div>
        ) : (
          <AnimatePresence>
            <div className="flex flex-col gap-[20px]">
              {testimonials.map((item, idx) => {
                const isEven = idx % 2 === 1;
                return (
                  <FadeUp key={item.id} delay={idx * 0.05}>
                    <div
                      className={`group flex flex-col ${
                        isEven ? "md:flex-row-reverse" : "md:flex-row"
                      } bg-[#1A2127] rounded-2xl overflow-hidden border border-white/5 shadow-xl hover:border-white/15 hover:shadow-2xl transition-all duration-300 md:h-[230px]`}
                    >
                      {/* ── Photo ── */}
                      <div className="relative w-full md:w-[220px] shrink-0 h-[200px] md:h-full bg-[#2a2a2a] overflow-hidden">
                        {item.photoUrl ? (
                          <img
                            loading="lazy"
                            src={item.photoUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#333]">
                            <div
                              className="absolute inset-0 opacity-10"
                              style={{
                                backgroundImage:
                                  "repeating-conic-gradient(#666 0% 25%, #888 0% 50%)",
                                backgroundSize: "24px 24px",
                              }}
                            />
                            <span className="relative text-gray-500 text-xs font-bold tracking-widest uppercase">
                              No Photo
                            </span>
                          </div>
                        )}
                        {/* gradient edge overlay for blend */}
                        <div
                          className={`absolute inset-y-0 w-12 from-[#3a3a3a] to-transparent ${
                            isEven
                              ? "left-0 bg-gradient-to-r"
                              : "right-0 bg-gradient-to-l"
                          }`}
                        />
                      </div>

                      {/* ── Content ── */}
                      <div className="relative flex-1 px-7 py-6 md:px-9 md:py-7 flex flex-col justify-center text-left items-start overflow-hidden">
                        {/* Decorative quote mark */}
                        <span className="absolute top-3 right-5 font-oswald text-[80px] leading-none text-white/5 select-none pointer-events-none">
                          &ldquo;
                        </span>

                        {/* Name */}
                        <h2 className="font-oswald text-xl md:text-[22px] font-bold tracking-wider text-white mb-2">
                          {item.name}
                        </h2>

                        {/* Accent line */}
                        <div className="w-8 h-0.5 bg-white/30 mb-3" />

                        {/* Review text — clamped to 4 lines so card stays fixed height */}
                        <p
                          className="text-gray-300 text-[13px] md:text-sm leading-relaxed mb-4"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {item.review}
                        </p>

                        {/* Instagram handle */}
                        {item.instagram && (
                          <a
                            href={`https://instagram.com/${item.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-400 transition-colors duration-200 text-xs font-medium mt-auto"
                          >
                            <span className="text-pink-400">
                              <InstagramIcon />
                            </span>
                            <span className="tracking-wide">
                              @{item.instagram}
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        {/* ── PAGINATION ── */}
        {meta && meta.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-4 mt-16"
          >
            <button
              disabled={!meta.hasPrevPage || loading}
              onClick={() => fetchTestimonials(page - 1)}
              className="px-6 py-2.5 border border-gray-600 rounded-full text-xs font-bold tracking-widest text-gray-400 hover:border-white hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← PREV
            </button>
            <span className="text-gray-500 text-xs tracking-widest">
              {page} / {meta.totalPages}
            </span>
            <button
              disabled={!meta.hasNextPage || loading}
              onClick={() => fetchTestimonials(page + 1)}
              className="px-6 py-2.5 border border-gray-600 rounded-full text-xs font-bold tracking-widest text-gray-400 hover:border-white hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              NEXT →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
