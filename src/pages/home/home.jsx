import React, { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getDisplayImage } from "../../utils/productImage";
import Rectangle94 from "../../assets/Rectangle94.png";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import videoLandingPage from "../../assets/videoLandingPage.mp4";
import meetTheRiders from "../../assets/meetTheRiders.png";
import ourCustomer from "../../assets/ourCustomer.png";
import customresinTint from "../../assets/customresinTint.png";
import smallWavesImg from "../../assets/small.png";
import mediumWavesImg from "../../assets/medium.png";
import bigWavesImg from "../../assets/big.png";
import categoryAdvance from "../../assets/CategoryAdvance.jpg";
import categoryIntermediate from "../../assets/CategoryIntermediate.jpg";
import categoryBeginner from "../../assets/CategoryBeginner.png";
import categoryGroms from "../../assets/CategoryGroms.jpg";
import CTAPopup from "../../components/CTAPopup";
import { newReleaseService } from "../../api/newReleases";
import { productService } from "../../api/products";
import { featuredService } from "../../api/featured";
import { storeReviewService } from "../../api/storeReviews";

const FadeUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.7, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

// Wrapper container konsisten di seluruh halaman
const Container = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-6 md:px-12 lg:px-16 ${className}`}>
    {children}
  </div>
);

export default function Home() {
  const newReleaseRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: newReleaseRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  const [openFaq, setOpenFaq] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newRelease, setNewRelease] = useState(null);
  const [surfboards, setSurfboards] = useState([]);
  const [surfboardsLoading, setSurfboardsLoading] = useState(true);

  // Store Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsMeta, setReviewsMeta] = useState({ avgRating: 0, totalReviews: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [myReview, setMyReview] = useState(null);      // user's own review object
  // Form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);  // editing own review
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !user) {
      const timer = setTimeout(() => setShowPopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [token, user]);

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const res = await newReleaseService.getActive();
        if (res?.data) setNewRelease(res.data);
      } catch (err) {
        // fallback to static content
      }
    };
    fetchRelease();
  }, []);

  useEffect(() => {
    const fetchSurfboards = async () => {
      try {
        setSurfboardsLoading(true);
        // Fetch curated products from the active featured section (set by admin)
        const res = await featuredService.getActive();
        const featuredProducts = res.data?.products ?? [];
        // The API returns featured entries: { product: { ... } }
        // so we map each entry to its nested product object
        const items = featuredProducts.map((entry) => entry.product ?? entry);
        setSurfboards(Array.isArray(items) ? items : []);
      } catch (err) {
        // 404 means no active featured section — fallback to empty
        setSurfboards([]);
      } finally {
        setSurfboardsLoading(false);
      }
    };
    fetchSurfboards();
  }, []);

  // Fetch store reviews
  const fetchStoreReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await storeReviewService.getAll({ limit: 20 });
      const data = res.data;
      setReviews(data?.reviews ?? []);
      setReviewsMeta({
        avgRating: data?.avgRating ?? 0,
        totalReviews: data?.totalReviews ?? 0,
      });
      setHasReviewed(data?.hasReviewed ?? false);
      // Find own review to allow edit/delete
      if (user && data?.reviews) {
        const mine = data.reviews.find((r) => r.userId === user.id);
        setMyReview(mine ?? null);
      }
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreReviews();
  }, []);

  // Submit or update store review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!token || !user) {
      navigate("/login");
      return;
    }
    if (reviewRating === 0) {
      setReviewError("Please select a star rating.");
      return;
    }

    setReviewSubmitting(true);
    try {
      if (isEditMode && myReview) {
        await storeReviewService.update(myReview.id, {
          rating: reviewRating,
          comment: reviewComment || undefined,
        });
        setReviewSuccess("Review updated successfully!");
      } else {
        await storeReviewService.create({
          rating: reviewRating,
          comment: reviewComment || undefined,
        });
        setReviewSuccess("Review submitted successfully!");
      }
      setReviewRating(0);
      setReviewComment("");
      setIsEditMode(false);
      fetchStoreReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Delete own review
  const handleDeleteReview = async () => {
    if (!myReview) return;
    if (!window.confirm("Delete your review?")) return;
    try {
      await storeReviewService.delete(myReview.id);
      setMyReview(null);
      setHasReviewed(false);
      fetchStoreReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to delete review.");
    }
  };

  // Start editing own review
  const handleStartEdit = () => {
    if (!myReview) return;
    setReviewRating(myReview.rating);
    setReviewComment(myReview.comment || "");
    setIsEditMode(true);
    setReviewError("");
    setReviewSuccess("");
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setReviewRating(0);
    setReviewComment("");
    setReviewError("");
  };

  // Star rendering helper
  const renderStars = (rating, size = "text-lg") => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`${size} ${i < rating ? "text-yellow-400" : "text-gray-600"}`}
      >
        ★
      </span>
    ));
  };

  const faqs = [
    {
      q: "How long does a custom board take?",
      a: "Usually around 2-6 weeks depending on the queue, board type, and design complexity. Every board is shaped and finished carefully by hand, so production time may vary during busy periods. We'll keep you updated throughout the process so you always know the progress of your board.",
    },
    {
      q: "Can I request my own design?",
      a: "Yes. You can fully customize your board based on your preferences, including dimensions, artwork, resin tint, logo placement, fin setup, and overall style. If you already have references or ideas, you can send them to us and we'll work together to bring the concept into a real board that matches your riding style and personality.",
    },
    {
      q: "How do I know which board suits me best?",
      a: "Don't worry if you're not sure which shape or volume to choose. We can help recommend the right board based on your height, weight, skill level, and surfing style. Whether you're a beginner looking for stability or an experienced surfer chasing performance, we'll guide you toward the setup that fits you best.",
    },
  ];

  return (
    <div className="bg-[#252525] min-h-screen font-poppins overflow-x-hidden text-white">
      <CTAPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />

      {/* LOGIN PROMPT POPUP */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 max-w-sm w-full text-center relative"
            >
              <h3 className="font-oswald text-2xl font-bold tracking-widest text-white mb-2">
                LOGIN REQUIRED
              </h3>
              <p className="text-gray-400 text-sm tracking-wide mb-8">
                You must be logged in to share your experience and rate our
                surfboards.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-white text-black font-bold tracking-widest text-xs rounded-full hover:bg-gray-200 transition"
                >
                  LOGIN NOW
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full py-3 border border-gray-600 text-gray-400 font-bold tracking-widest text-xs rounded-full hover:border-white hover:text-white transition"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative w-full h-screen flex flex-col justify-end pb-20 px-10 md:px-20 overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <video
            src={videoLandingPage}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-top bg-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent"></div>
        </div>

        <motion.div
          className="max-w-3xl flex flex-col items-start z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <p className="text-[12px] md:text-[16px] font-bold tracking-[0.2em] uppercase text-gray-100 drop-shadow-md mb-2">
            BUILD DIFFERENT, RIDE DIFFERENT
          </p>
          <h1 className="font-oswald text-5xl md:text-[64px] font-bold tracking-tight text-white drop-shadow-xl leading-none mb-4">
            RIDE YOUR OWN WAVE
          </h1>
          <p className="text-[15px] md:text-[18px] font-medium text-gray-300 drop-shadow-md mb-8">
            Custom surfboards made for your identity.
          </p>
          <motion.button
            className="px-8 py-3.5 bg-transparent border border-white/60 rounded-full hover:bg-white hover:border-white hover:text-black transition duration-300 text-white text-[12px] font-bold tracking-[0.15em] uppercase"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            CUSTOMIZE NOW
          </motion.button>
        </motion.div>
      </section>

      {/* BANNER SECTION */}
      <section className="w-full bg-[#1a1a1a] py-20">
        <Container className="flex flex-col items-center justify-center text-center">
          <FadeUp>
            <p className="text-sm md:text-base font-bold tracking-[0.4em] text-gray-400 mb-3">
              FREEPIGMOVEMENT
            </p>
            <h2 className="font-oswald text-4xl md:text-6xl font-bold tracking-widest mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              PROUDLY LOCAL HAND CRAFTED
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-light tracking-wide">
              The highest quality good since 2001
            </p>
          </FadeUp>
        </Container>
      </section>

      {/* ACCESSORIES & SURFBOARD SPLIT */}
      <section className="w-full text-white mb-24">
        <div className="flex flex-col md:flex-row h-auto md:h-[600px]">
          {[
            {
              label: "ACCESSORIES",
              img: "/Accessories.webp",
              link: "/store?tab=accessories",
            },
            {
              label: "SURFBOARD",
              img: "/Surfboard.webp",
              link: "/store?tab=surfboard",
            },
          ].map((item, idx) => (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              key={idx}
              onClick={() => navigate(item.link)}
              className="flex-1 relative group cursor-pointer overflow-hidden h-[400px] md:h-full"
            >
              {/* Background Image */}
              <img
                src={item.img}
                alt={item.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              />

              {/* Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

              {/* Label */}
              <div className="absolute inset-0 flex flex-col justify-end items-center pb-12 md:pb-16">
                <h3 className="relative z-10 font-oswald text-4xl md:text-5xl font-black tracking-[0.2em] text-white group-hover:text-accent-teal transition duration-500 drop-shadow-2xl">
                  {item.label}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEW RELEASE SECTION — Full Frame */}
      <section
        ref={newReleaseRef}
        className="relative w-full min-h-screen flex flex-col md:flex-row overflow-hidden"
      >
        {/* Video background — full section */}
        <motion.div
          className="absolute inset-0 w-full h-[130%] -top-[15%]"
          style={{ y: bgY }}
        >
          <video
            src={newRelease?.videoUrl || videoLandingPage}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/60"></div>

        {/* LEFT — Text content */}
        <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center px-8 md:px-14 lg:px-20 py-24 md:py-0">
          <FadeUp className="flex flex-col items-start gap-6 text-white">
            <h2 className="font-oswald text-6xl md:text-8xl font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
              NEW
              <br />
              RELEASE
            </h2>
            <div className="mt-4">
              <h3 className="font-oswald text-3xl font-bold mb-3 text-white-teal tracking-widest">
                {newRelease?.title || "THE ROOSTER"}
              </h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-lg">
                {newRelease?.description ||
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
              </p>
            </div>
          </FadeUp>
        </div>

        {/* RIGHT — Full frame product image(s) */}
        {newRelease?.images?.length > 0 && (
          <FadeUp
            delay={0.2}
            className="relative w-full md:w-1/2 min-h-[60vh] md:min-h-0"
          >
            {newRelease.images.length === 1 ? (
              /* Single image — full height, no crop */
              <div className="absolute inset-0 flex items-center justify-end overflow-hidden">
                <img
                  src={newRelease.images[0].url}
                  alt={newRelease.title}
                  className="h-full w-auto object-contain"
                />
              </div>
            ) : (
              /* Two images — side by side, each full height */
              <div className="absolute inset-0 flex">
                {newRelease.images.slice(0, 2).map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={newRelease.title}
                    className="w-1/2 h-full object-contain hover:scale-105 transition duration-700"
                  />
                ))}
              </div>
            )}
          </FadeUp>
        )}
      </section>

      {/* SHOP BY SKILL */}
      <section className="w-full bg-[#1a1a1a] py-24">
        <Container>
          <FadeUp>
            <h3 className="font-oswald text-3xl font-bold tracking-[0.3em] text-gray-400 uppercase text-center mb-12">
              find your level
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { title: "ADVANCED", img: categoryAdvance },
                { title: "INTERMEDIATE", img: categoryIntermediate },
                { title: "BEGINNER", img: categoryBeginner },
                { title: "GROMS", img: categoryGroms },
              ].map((level, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  onClick={() =>
                    navigate(`/store?filter=${encodeURIComponent(level.title)}`)
                  }
                  className="bg-[#222] border border-[#333] group cursor-pointer flex flex-col hover:bg-[#2a2a2a] hover:border-accent-teal transition duration-500 shadow-xl overflow-hidden"
                >
                  <div className="h-72 w-full overflow-hidden">
                    <img
                      src={level.img}
                      alt={level.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
                    />
                  </div>
                  <div className="bg-[#1f1f1f] border-t border-[#333] w-full py-5 text-center group-hover:bg-[#2a2a2a] transition duration-500">
                    <h4 className="font-oswald text-xl font-bold tracking-[0.2em] text-gray-200 group-hover:text-accent-teal transition">
                      {level.title}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* SHOP BY WAVE */}
      <section className="w-full bg-[#1f1f1f] py-24 border-t border-[#333]">
        <Container>
          <FadeUp>
            <h3 className="font-oswald text-3xl font-bold tracking-[0.3em] text-gray-400 uppercase text-center mb-12">
              find your wave
            </h3>
            <div className="flex flex-col md:flex-row justify-center items-end gap-12 md:gap-24 text-center mt-12">
              {[
                {
                  title: "SMALL WAVES",
                  img: smallWavesImg,
                  desc: "Longboards & Funboards",
                  imgClass: "w-28 md:w-36",
                },
                {
                  title: "MEDIUM WAVES",
                  img: mediumWavesImg,
                  desc: "Mid-Length & Fish",
                  imgClass: "w-28 md:w-36",
                },
                {
                  title: "BIG WAVES",
                  img: bigWavesImg,
                  desc: "Guns & Step-Ups",
                  imgClass: "w-28 md:w-36",
                },
              ].map((wave, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  onClick={() =>
                    navigate(`/store?filter=${encodeURIComponent(wave.title)}`)
                  }
                  className="flex flex-col items-center gap-4 group cursor-pointer"
                >
                  <img
                    src={wave.img}
                    alt={wave.title}
                    className={`${wave.imgClass} object-contain opacity-80 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 drop-shadow-xl`}
                  />
                  <div>
                    <h4 className="font-oswald text-sm font-bold tracking-[0.15em] text-gray-300 group-hover:text-white transition uppercase mt-2">
                      {wave.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 tracking-widest mt-1 uppercase">
                      {wave.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* SURFBOARDS PRODUCTS */}
      <section className="w-full bg-[#151515] py-24">
        <Container>
          <FadeUp className="flex items-center justify-between mb-12">
            <h3 className="font-oswald text-4xl font-bold tracking-widest">
              SURFBOARDS
            </h3>
            <p
              className="text-sm font-bold tracking-widest text-gray-400 hover:text-accent-teal transition cursor-pointer flex items-center gap-2"
              onClick={() => navigate("/store?tab=surfboard")}
            >
              VIEW ALL <span className="text-lg">&rarr;</span>
            </p>
          </FadeUp>

          {/* Loading skeleton */}
          {surfboardsLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col animate-pulse">
                  <div className="bg-[#333] aspect-[3/4]" />
                  <div className="bg-[#3a3a3a] px-4 py-3 h-14" />
                </div>
              ))}
            </div>
          )}

          {/* Actual products */}
          {!surfboardsLoading && surfboards.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {surfboards.map((product, idx) => {
                const firstImage = getDisplayImage(product);
                const category =
                  product.category?.name ??
                  product.skillLevel ??
                  product.type ??
                  "Surfboard";
                return (
                  <Link key={product.id ?? idx} to={`/product/${product.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: idx * 0.08 }}
                      className="flex flex-col cursor-pointer group"
                    >
                      {/* Image — full-frame, no padding, white bg */}
                      <div className="bg-white overflow-hidden aspect-[3/4]">
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = "/black_surfboard.png";
                          }}
                        />
                      </div>
                      {/* Info bar */}
                      <div className="bg-[#3a3a3a] px-4 py-3">
                        <p className="text-[9px] text-gray-400 tracking-[0.18em] uppercase mb-0.5 font-semibold">
                          {category}
                        </p>
                        <p className="font-oswald text-sm font-bold tracking-wider uppercase text-white group-hover:text-accent-teal transition duration-300">
                          {product.name}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Fallback jika tidak ada data */}
          {!surfboardsLoading && surfboards.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg tracking-widest">
                No surfboards available at the moment.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* FOOTER IMAGES GRID */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {[
            {
              topTitle: "RIDERS",
              bottomTitle: "SPOTLIGHT",
              img: meetTheRiders,
            },
            {
              topTitle: "LOVED BY",
              bottomTitle: "SURFERS WORLDWIDE",
              img: ourCustomer,
            },
            {
              bottomTitle: "GALERY",
              img: customresinTint,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative group overflow-hidden cursor-pointer h-full"
            >
              <img
                src={item.img}
                alt={item.bottomTitle}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:grayscale"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition duration-500"></div>
              <div className="absolute bottom-0 left-0 right-0 p-10 pt-16 bg-transparent group-hover:bg-[#222] transition-colors duration-500 flex flex-col z-10">
                <span className="font-poppins text-lg md:text-xl font-medium tracking-wide text-white drop-shadow-md">
                  {item.topTitle}
                </span>
                <h3 className="font-oswald text-4xl md:text-5xl font-bold tracking-widest leading-none text-white drop-shadow-lg transition duration-300">
                  {item.bottomTitle}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMMUNITY SECTION — Instagram-style grid */}
      <section className="w-full bg-[#111] py-20">
        <Container>
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-xs tracking-[0.4em] text-accent-teal font-bold mb-3 uppercase">
                Join The Community
              </p>
              <h2 className="font-oswald text-4xl md:text-5xl font-bold tracking-widest text-white">
                Follow Our Journey
              </h2>
              <p className="text-gray-400 mt-3 tracking-widest text-sm font-semibold">
                @FreepigMovement
              </p>
            </div>

            {/* Asymmetric grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]">
              {/* Large featured tile */}
              <div className="col-span-2 row-span-2 relative group overflow-hidden cursor-pointer bg-[#222]">
                <img
                  src={Rectangle94}
                  alt="Community"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition duration-500"></div>
                <div className="absolute bottom-5 left-5">
                  <span className="text-xs font-bold tracking-widest text-accent-teal uppercase bg-black/60 px-3 py-1">
                    Featured Rider
                  </span>
                </div>
              </div>

              {/* Small tiles */}
              {[
                { label: "Local Surf Session" },
                { label: "Workshop" },
                { label: "Custom Build" },
                { label: "Community Ride" },
              ].map((tile, idx) => (
                <div
                  key={idx}
                  className="relative group overflow-hidden cursor-pointer bg-[#2a2a2a] border border-[#333] hover:border-accent-teal transition duration-300"
                >
                  <img
                    src="/action_surfer.png"
                    alt={tile.label}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 flex items-end p-4">
                    <span className="text-[10px] font-bold tracking-widest text-white uppercase opacity-0 group-hover:opacity-100 transition duration-300 bg-black/60 px-2 py-0.5">
                      {tile.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <motion.a
                href="#"
                className="px-8 py-3.5 bg-transparent border border-white/60 rounded-full hover:bg-white hover:border-white hover:text-black transition duration-300 text-white text-[12px] font-bold tracking-[0.15em] uppercase"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                View Instagram
              </motion.a>
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* FAQ SECTION */}
      <section className="w-full bg-[#1a1a1a] py-32">
        <Container>
          <div className="flex flex-col md:flex-row gap-16 border-t border-b border-gray-700 py-16">
            <FadeUp className="w-full md:w-1/3">
              <h2 className="font-oswald text-4xl md:text-5xl font-bold tracking-wide leading-tight">
                Frequently Asked Questions
              </h2>
              <div className="w-12 h-1 bg-accent-teal mt-4"></div>
            </FadeUp>
            <div className="w-full md:w-2/3 flex flex-col">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="border-b border-gray-700 last:border-0 py-6 cursor-pointer group"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold group-hover:text-accent-teal transition duration-300">
                      {faq.q}
                    </h4>
                    <span className="text-2xl text-gray-500 group-hover:text-accent-teal transition duration-300">
                      {openFaq === idx ? "−" : "+"}
                    </span>
                  </div>
                  {/* Answer content */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === idx ? "auto" : 0,
                      opacity: openFaq === idx ? 1 : 0,
                    }}
                    className="overflow-hidden"
                  >
                    <p className="pt-4 text-sm text-gray-400 leading-relaxed pr-8">
                      {faq.a}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CUSTOMER REVIEWS SECTION */}
      <section className="w-full bg-[#151515] py-24">
        <Container>
          <FadeUp>
            {/* Header + rating summary */}
            <div className="text-center mb-16">
              <h2 className="font-oswald text-4xl md:text-5xl font-bold tracking-widest text-white mb-3">
                Voices From The Lineup
              </h2>
              <p className="text-gray-400 text-sm tracking-widest mb-6">
                Trusted by Riders. Proven in Every Wave.
              </p>
              {reviewsMeta.totalReviews > 0 && (
                <div className="flex items-center justify-center gap-3">
                  <div className="flex">
                    {renderStars(Math.round(reviewsMeta.avgRating), "text-xl")}
                  </div>
                  <span className="text-white font-bold text-lg">
                    {reviewsMeta.avgRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500 text-sm tracking-widest">
                    ({reviewsMeta.totalReviews} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Reviews carousel */}
            {reviewsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#333]" />
                      <div className="h-4 bg-[#333] rounded w-24" />
                    </div>
                    <div className="h-3 bg-[#333] rounded w-full mb-2" />
                    <div className="h-3 bg-[#333] rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {reviews.map((review, idx) => {
                  const isOwn = user && review.userId === user.id;
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                      className={`min-w-[300px] md:min-w-[340px] snap-start rounded-xl p-6 flex flex-col transition duration-500 group border ${
                        isOwn
                          ? "bg-accent-teal/5 border-accent-teal/30"
                          : "bg-[#1e1e1e] border-[#2a2a2a] hover:border-accent-teal/40"
                      }`}
                    >
                      {/* User info + rating */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-teal/30 to-[#333] flex items-center justify-center text-white font-bold text-sm uppercase">
                            {review.user?.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm tracking-wide flex items-center gap-2">
                              {review.user?.name || "Anonymous"}
                              {isOwn && (
                                <span className="text-[9px] font-bold text-accent-teal tracking-widest bg-accent-teal/10 px-1.5 py-0.5 rounded">
                                  YOU
                                </span>
                              )}
                            </p>
                            <div className="flex">{renderStars(review.rating, "text-sm")}</div>
                          </div>
                        </div>
                        {/* Edit/Delete for own review */}
                        {isOwn && (
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={handleStartEdit}
                              className="px-2 py-1 text-[9px] font-bold tracking-widest border border-gray-600 rounded-full text-gray-400 hover:border-white hover:text-white transition"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={handleDeleteReview}
                              className="px-2 py-1 text-[9px] font-bold tracking-widest border border-red-500/40 rounded-full text-red-400 hover:bg-red-500/10 transition"
                            >
                              DEL
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Comment */}
                      <p className="text-gray-400 text-sm leading-relaxed flex-1">
                        {review.comment || (
                          <span className="italic text-gray-600">No comment</span>
                        )}
                      </p>

                      {/* Date */}
                      <p className="text-[10px] text-gray-600 tracking-widest mt-4 pt-3 border-t border-[#2a2a2a]">
                        {new Date(review.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="tracking-widest">
                  No reviews yet. Be the first to share your experience!
                </p>
              </div>
            )}
          </FadeUp>

          {/* RATE & REVIEW FORM */}
          <FadeUp delay={0.2}>
            <div className="mt-20 max-w-lg mx-auto">
              <h3 className="font-oswald text-3xl font-bold tracking-widest text-white text-center mb-2">
                {isEditMode ? "Edit Your Review" : "Rate & Review"}
              </h3>
              <p className="text-gray-500 text-xs tracking-widest text-center mb-8">
                Share your experience with Freepig Movement
              </p>

              {/* If user already reviewed and NOT editing — show their review summary */}
              {token && user && hasReviewed && !isEditMode ? (
                <div className="bg-accent-teal/5 border border-accent-teal/20 rounded-2xl p-6 text-center">
                  <p className="text-accent-teal text-xs font-bold tracking-widest mb-3">
                    ✓ YOU HAVE ALREADY REVIEWED
                  </p>
                  <div className="flex justify-center mb-3">
                    {renderStars(myReview?.rating ?? 0, "text-2xl")}
                  </div>
                  {myReview?.comment && (
                    <p className="text-gray-300 text-sm italic mb-4">"{myReview.comment}"</p>
                  )}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleStartEdit}
                      className="px-6 py-2.5 border border-white/40 rounded-full text-white text-xs font-bold tracking-widest hover:bg-white hover:text-black transition"
                    >
                      EDIT REVIEW
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      className="px-6 py-2.5 border border-red-500/40 rounded-full text-red-400 text-xs font-bold tracking-widest hover:bg-red-500/10 transition"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {(!token || !user) && (
                    <div
                      className="absolute inset-0 z-10 cursor-pointer"
                      onClick={() => setShowLoginPrompt(true)}
                    />
                  )}
                  <form
                    onSubmit={handleReviewSubmit}
                    className={`flex flex-col gap-6 ${!token || !user ? "opacity-70" : ""}`}
                  >
                    {/* Star rating */}
                    <div className="flex justify-center gap-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewRating(i + 1)}
                          onMouseEnter={() => setReviewHover(i + 1)}
                          onMouseLeave={() => setReviewHover(0)}
                          className={`text-4xl transition-all duration-200 ${
                            i < (reviewHover || reviewRating)
                              ? "text-yellow-400 scale-110"
                              : "text-gray-600 hover:text-yellow-400/60"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    {/* Comment textarea */}
                    <textarea
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with Freepig Movement..."
                      className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-teal transition resize-none placeholder-gray-600"
                    />

                    {/* Error / success messages */}
                    {reviewError && (
                      <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
                        {reviewError}
                      </div>
                    )}
                    {reviewSuccess && (
                      <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs text-center">
                        {reviewSuccess}
                      </div>
                    )}

                    {/* User info + buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-teal/30 to-[#333] flex items-center justify-center text-white font-bold text-xs uppercase">
                          {user?.name?.[0] || "?"}
                        </div>
                        <span className="text-sm text-gray-300 tracking-wide">
                          {user?.name || "Guest"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2.5 border border-gray-600 rounded-full text-gray-400 text-[11px] font-bold tracking-[0.15em] uppercase hover:border-white hover:text-white transition"
                          >
                            CANCEL
                          </button>
                        )}
                        <motion.button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="px-6 py-2.5 bg-transparent border border-white/60 rounded-full hover:bg-white hover:border-white hover:text-black transition duration-300 text-white text-[11px] font-bold tracking-[0.15em] uppercase disabled:opacity-50"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {reviewSubmitting
                            ? "SAVING..."
                            : isEditMode
                            ? "UPDATE"
                            : "SUBMIT"}
                        </motion.button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* FOOTER BOTTOM */}
      <footer className="w-full bg-black py-10 text-center text-gray-600 text-xs tracking-widest">
        <p className="font-oswald text-lg text-gray-500 mb-1">
          FREEPIGMOVEMENT
        </p>
        <p>
          &copy; {new Date().getFullYear()} Freepigmovement. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
