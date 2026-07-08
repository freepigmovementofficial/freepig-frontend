import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiInstagram,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import { MdSurfing } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { riderService } from "../../api/riders";
import PigLoader from "../../components/PigLoader";

const FadeUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

export default function RiderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Main photo carousel index (uses all images)
  const [mainIndex, setMainIndex] = useState(0);

  // Fullscreen modal state (uses gallery images only — index 1+)
  const [modalIndex, setModalIndex] = useState(null);

  useEffect(() => {
    const fetchRider = async () => {
      try {
        setLoading(true);
        const res = await riderService.getById(id);
        setRider(res.data?.rider || res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load rider details");
      } finally {
        setLoading(false);
      }
    };
    fetchRider();
  }, [id]);

  const allImages = rider?.images || [];
  const videoUrl = rider?.videoUrl;

  // Arrow handlers for main carousel
  const totalMain = allImages.length;
  const goMainPrev = useCallback(
    () => setMainIndex((i) => (i - 1 + totalMain) % totalMain),
    [totalMain],
  );
  const goMainNext = useCallback(
    () => setMainIndex((i) => (i + 1) % totalMain),
    [totalMain],
  );

  // Gallery images = all images except the first (used as portrait)
  const galleryImages = allImages.slice(1);
  const totalModal = galleryImages.length;
  const goModalPrev = useCallback(
    (e) => {
      e?.stopPropagation();
      setModalIndex((i) => (i - 1 + totalModal) % totalModal);
    },
    [totalModal],
  );
  const goModalNext = useCallback(
    (e) => {
      e?.stopPropagation();
      setModalIndex((i) => (i + 1) % totalModal);
    },
    [totalModal],
  );

  // Keyboard navigation for modal
  useEffect(() => {
    if (modalIndex === null) return;
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") goModalPrev();
      if (e.key === "ArrowRight") goModalNext();
      if (e.key === "Escape") setModalIndex(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modalIndex, goModalPrev, goModalNext]);

  if (loading) {
    return (
      <div className="bg-[#010E19] min-h-screen flex justify-center items-center">
        <PigLoader text="Loading Rider..." />
      </div>
    );
  }

  if (error || !rider) {
    return (
      <div className="bg-[#010E19] min-h-screen flex flex-col justify-center items-center text-white">
        <p className="text-red-400 tracking-widest uppercase mb-4">
          {error || "Rider not found"}
        </p>
        <Link
          to="/riders"
          className="px-6 py-2 border border-white/50 rounded-full hover:bg-white/10 transition"
        >
          BACK TO RIDERS
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#010E19] min-h-screen font-poppins text-white pb-24">
      {/* ── HERO VIDEO ── */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[70vh] bg-black overflow-hidden">
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-80"
          />
        ) : allImages[0] ? (
          <img
            loading="lazy"
            src={allImages[0].url}
            alt={rider.name}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-[#010E19] flex items-center justify-center text-gray-700 tracking-widest">
            NO MEDIA UPLOADED
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#010E19] to-transparent" />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="w-full mx-auto px-6 md:px-[70px] -mt-16 sm:-mt-20 md:-mt-32 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-all font-bold tracking-widest text-xs uppercase drop-shadow-lg"
        >
          <FiChevronLeft size={16} /> BACK
        </button>
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
          {/* Left: Photo Carousel */}
          <FadeUp className="w-full md:w-1/2 shrink-0">
            {allImages.length > 0 ? (
              <div className="relative group w-full aspect-[4/5] overflow-hidden shadow-2xl bg-[#010E19]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={mainIndex}
                    loading="lazy"
                    src={allImages[mainIndex].url}
                    alt={rider.name}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Arrow buttons */}
                {totalMain > 1 && (
                  <>
                    <button
                      onClick={goMainPrev}
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/60 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-black/80 transition-all duration-200 z-10"
                      aria-label="Previous photo"
                    >
                      <FiChevronLeft size={22} />
                    </button>
                    <button
                      onClick={goMainNext}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/60 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-black/80 transition-all duration-200 z-10"
                      aria-label="Next photo"
                    >
                      <FiChevronRight size={22} />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {allImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setMainIndex(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === mainIndex
                              ? "bg-white w-5"
                              : "bg-white/40 w-1.5"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Thumbnail strip */}
                    <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2 px-4">
                      {allImages.map((img, i) => (
                        <button
                          key={img.id}
                          onClick={() => setMainIndex(i)}
                          className={`w-10 h-10 rounded overflow-hidden border-2 transition-all duration-200 shrink-0 ${
                            i === mainIndex
                              ? "border-white scale-110"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full aspect-[4/5] bg-[#0a1929] flex items-center justify-center text-gray-500">
                NO MAIN IMAGE
              </div>
            )}
          </FadeUp>

          {/* Right: Bio */}
          <FadeUp delay={0.2} className="flex-1 pt-4 md:pt-32">
            <h1 className="font-oswald text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white leading-none mb-2">
              {rider.name}
            </h1>
            <p className="font-oswald text-xl md:text-2xl lg:text-3xl text-gray-400 tracking-widest mb-5">
              {rider.location}
            </p>

            {/* Board Model & Instagram badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {rider.boardModel && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                  <MdSurfing className="text-accent-teal text-base shrink-0" />
                  <span className="text-xs font-bold tracking-widest uppercase text-gray-200">
                    {rider.boardModel}
                  </span>
                </div>
              )}
              {rider.instagram && (
                <a
                  href={`https://instagram.com/${rider.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:border-accent-teal hover:bg-accent-teal/10 transition group"
                >
                  <FiInstagram className="text-pink-400 text-base shrink-0 group-hover:text-accent-teal transition" />
                  <span className="text-xs font-bold tracking-widest uppercase text-gray-200 group-hover:text-white transition">
                    @{rider.instagram.replace("@", "")}
                  </span>
                </a>
              )}
            </div>

            <div className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line font-light">
              {rider.bio}
            </div>
          </FadeUp>
        </div>
      </div>

      {/* ── GALLERY (masonry, clickable) ── */}
      {galleryImages.length > 0 && (
        <div className="w-full mx-auto px-6 md:px-[70px] mt-24">
          <FadeUp>
            <h2 className="font-oswald text-2xl font-bold tracking-widest text-white uppercase mb-8">
              Gallery
            </h2>
            <div className="columns-1 sm:columns-2 md:columns-3 gap-[20px] space-y-[20px]">
              {galleryImages.map((img, idx) => (
                <div
                  key={img.id}
                  className="break-inside-avoid relative group cursor-pointer overflow-hidden bg-[#051525]"
                  onClick={() => setModalIndex(idx)}
                >
                  <img
                    loading="lazy"
                    src={img.url}
                    alt={`${rider.name} gallery ${idx + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <span className="text-white text-xs font-bold tracking-widest uppercase">
                      View
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      )}

      {/* ── FULLSCREEN MODAL with Arrow Navigation ── */}
      <AnimatePresence>
        {modalIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-sm"
          >
            {/* Close */}
            <button
              onClick={() => setModalIndex(null)}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-accent-teal hover:text-black transition z-10"
            >
              <FiX size={20} />
            </button>

            {/* Prev arrow */}
            {totalModal > 1 && (
              <button
                onClick={goModalPrev}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
                aria-label="Previous image"
              >
                <FiChevronLeft size={24} />
              </button>
            )}

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={modalIndex}
                initial={{ opacity: 0, scale: 0.92, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.92, x: -30 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                src={galleryImages[modalIndex]?.url}
                alt="Preview"
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
            </AnimatePresence>

            {/* Next arrow */}
            {totalModal > 1 && (
              <button
                onClick={goModalNext}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
                aria-label="Next image"
              >
                <FiChevronRight size={24} />
              </button>
            )}

            {/* Counter */}
            {totalModal > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs tracking-widest">
                {modalIndex + 1} / {totalModal}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
