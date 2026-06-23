import useDocumentTitle from "../../hooks/useDocumentTitle";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import { Star } from "lucide-react";
import { getDisplayImage } from "../../utils/productImage";
import Rectangle94 from "../../assets/Rectangle94.webp";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import videoLandingPage from "../../assets/videoLandingPage.mp4";
import riders2 from "../../assets/riders2.webp";
import customer2 from "../../assets/customer2.webp";
import galery2 from "../../assets/galery2.webp";
import smallWavesImg from "../../assets/smallWave.webp";
import mediumWavesImg from "../../assets/mediumWave.webp";
import bigWavesImg from "../../assets/bigWave.webp";
import categoryAdvance from "../../assets/advanced.webp";
import categoryIntermediate from "../../assets/intermediate.webp";
import categoryBeginner from "../../assets/beginner.webp";
import categoryGroms from "../../assets/groms.webp";
import boardGroms from "../../assets/boardGroms.webp";
import aboutUsImg from "../../assets/aboutUs.webp";
import maskotBabi from "../../assets/maskotBabi.webp";
import maskotBabi2 from "../../assets/maskotBabi2.webp";
import FPWHITE from "../../assets/FPWHITE.webp";
import logoTransparan from "../../assets/logoTransparan.webp";
import bercakBercak from "../../assets/bercak-bercak.webp";
import bercakPembatas from "../../assets/bercakPembatas.webp";
import aksesoris3 from "../../assets/accessories3.webp";
import surfboard3 from "../../assets/surfboard3.webp";
import CTAPopup from "../../components/CTAPopup";
import ConfirmationModal from "../../components/ConfirmationModal";
import { newReleaseService } from "../../api/newReleases";
import { productService } from "../../api/products";
import { featuredService } from "../../api/featured";
import { storeReviewService } from "../../api/storeReviews";
import { heroService } from "../../api/hero";
import { wallMagazineService } from "../../api/wallMagazine";
import toast from "react-hot-toast";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

const FadeUp = ({ children, delay = 0, className = "" }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
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
};

// Wrapper container konsisten di seluruh halaman
const Container = ({ children, className = "" }) => (
  <div className={`w-full mx-auto px-6 md:px-[70px] ${className}`}>
    {children}
  </div>
);

export default function Home() {
  useDocumentTitle("Home | FreePigMovement");
  const newReleaseRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: newReleaseRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const isMobile = useIsMobile();

  const [openFaq, setOpenFaq] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newRelease, setNewRelease] = useState(null);
  const [wallMagazine, setWallMagazine] = useState(null);
  const [surfboards, setSurfboards] = useState([]);
  const [surfboardsLoading, setSurfboardsLoading] = useState(true);
  const [hero, setHero] = useState(null);

  // Store Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsMeta, setReviewsMeta] = useState({
    avgRating: 0,
    totalReviews: 0,
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [myReview, setMyReview] = useState(null); // user's own review object
  // Form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false); // editing own review
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [deleteReviewConfirmOpen, setDeleteReviewConfirmOpen] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("hasSeenCTAPopup");
    if (!token || !user) {
      if (!hasSeenPopup) {
        const timer = setTimeout(() => {
          setShowPopup(true);
          localStorage.setItem("hasSeenCTAPopup", "true");
        }, 1500);
        return () => clearTimeout(timer);
      }
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

    const fetchHero = async () => {
      try {
        const res = await heroService.getActive();
        if (res?.data) setHero(res.data);
      } catch (err) {
        // fallback to static content
      }
    };
    fetchHero();

    const fetchWallMagazine = async () => {
      try {
        const res = await wallMagazineService.getActive();
        if (res?.data) setWallMagazine(res.data);
      } catch (err) {
        // fallback to null
      }
    };
    fetchWallMagazine();
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
        toast.success("Review updated!");
      } else {
        await storeReviewService.create({
          rating: reviewRating,
          comment: reviewComment || undefined,
        });
        setReviewSuccess("Review submitted successfully!");
        toast.success("Review submitted!");
      }
      setReviewRating(0);
      setReviewComment("");
      setIsEditMode(false);
      fetchStoreReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
      setReviewError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Delete own review
  const handleDeleteReview = async () => {
    if (!myReview) return;
    setReviewSubmitting(true);
    try {
      await storeReviewService.delete(myReview.id);
      setMyReview(null);
      setHasReviewed(false);
      toast.success("Review deleted.");
      fetchStoreReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review.");
      setReviewError(err.response?.data?.message || "Failed to delete review.");
    } finally {
      setReviewSubmitting(false);
      setDeleteReviewConfirmOpen(false);
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
  const renderStars = (rating, className = "w-5 h-5") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        fill="currentColor"
        strokeWidth={1.5}
        className={`${className} ${i < rating ? "opacity-100" : "opacity-30"} mx-0.5`}
      />
    ));
  };

  const faqs = [
    {
      q: "How do I know which board suits me best?",
      a: "Don't worry if you're not sure which shape or volume to choose. We can help recommend the right board based on your height, weight, skill level, and surfing style. Whether you're a beginner looking for stability or an experienced surfer chasing performance, we'll guide you toward the setup that fits you best.",
    },
    {
      q: "How long does a custom board take?",
      a: "Usually around 2-6 weeks depending on the queue, board type, and design complexity. Every board is shaped and finished carefully by hand, so production time may vary during busy periods. We'll keep you updated throughout the process so you always know the progress of your board.",
    },
    {
      q: "Can I request my own design?",
      a: "Yes. You can fully customize your board based on your preferences, including dimensions, artwork, resin tint, logo placement, fin setup, and overall style. If you already have references or ideas, you can send them to us and we'll work together to bring the concept into a real board that matches your riding style and personality.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept payments via cash, bank transfer, and card for your convenience. Once your order is confirmed, our team will provide the necessary payment details and guide you through the process. If you have any questions regarding payment options, feel free to contact us for assistance.",
    },
  ];

  return (
    <div className="bg-[#000000] min-h-screen font-poppins overflow-x-hidden text-white">
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
      <section className="relative w-full h-screen flex flex-col justify-end pb-20 px-6 md:px-[70px] overflow-visible z-10">
        {/* Video diperpanjang ke bawah sejauh 128px (seukuran mt-32) biar ngisi ruang kosong */}
        <div
          className="absolute top-0 left-0 w-full z-0"
          style={{ height: "calc(100vh + 128px)" }}
        >
          <video
            src={hero?.videoUrl || videoLandingPage}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-top bg-cover"
          />
          {/* Efek Radial Gradient Figma: Pusat transparan di atas, gelap di bawah */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(150% 100% at 50% 0%, rgba(1, 14, 25, 0) 44%, rgba(1, 14, 25, 0.25) 68%, rgba(1, 14, 25, 1) 100%)",
            }}
          ></div>

          {/* Gradient tambahan untuk fade-out video ke warna hitam #000000 agar menyatu tanpa garis pembatas */}
          <div
            className="absolute bottom-0 left-0 w-full h-32 md:h-56 pointer-events-none z-[5]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000000 100%)",
            }}
          ></div>

          {/* Efek tekstur bercak di batas bawah video */}
          <img
            src={bercakPembatas}
            alt="Bercak pembatas video"
            className="absolute bottom-[-1px] left-0 w-full object-cover pointer-events-none z-10 mix-blend-normal translate-y-[60%]"
          />
        </div>

        <motion.div
          className="max-w-3xl flex flex-col items-start z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {/* Stacked typographic hero title — layout matches Figma reference */}
          <h1 className="font-road-rage text-white drop-shadow-xl tracking-wide leading-none mb-4">
            {hero?.title &&
            hero.title.toUpperCase() !== "RIDE YOUR OWN WAVE" ? (
              <span className="text-5xl md:text-7xl lg:text-8xl break-words max-w-2xl block">
                {hero.title.split("\n").map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i !== hero.title.split("\n").length - 1 && <br />}
                  </React.Fragment>
                ))}
              </span>
            ) : (
              <span className="relative flex flex-col items-start w-fit max-w-[100vw]">
                {/* RIDE */}
                <span className="block whitespace-nowrap text-[clamp(70px,20vw,145px)] lg:text-[128px] leading-[0.75] ml-[clamp(10px,4vw,90px)] lg:ml-[72px] relative z-20 lg:mb-[65px]">
                  RIDE
                </span>
                {/* YOUR OWN */}
                <span className="absolute whitespace-nowrap text-[clamp(24px,7vw,55px)] lg:text-[53px] leading-[1] left-[clamp(110px,32vw,250px)] lg:left-[158px] top-[clamp(45px,12vw,100px)] lg:top-[115px] z-30 drop-shadow-md">
                  YOUR OWN
                </span>
                {/* W and AVE container */}
                <span className="relative flex items-end -mt-[clamp(15px,4vw,30px)] lg:-mt-[40px] z-10">
                  {/* W — rotated just like in Figma */}
                  <span className="block text-[clamp(70px,20vw,145px)] lg:text-[200px] leading-[0.75] -rotate-[10deg] origin-bottom transform">
                    W
                  </span>
                  {/* AVE */}
                  <span className="block text-[clamp(70px,20vw,145px)] lg:text-[128px] leading-[0.75] ml-[clamp(5px,2vw,15px)] lg:ml-[-30px] lg:mt-[60px]">
                    AVE
                  </span>
                </span>
              </span>
            )}
          </h1>
        </motion.div>
      </section>

      {/* BANNER SECTION */}
      <section className="w-full py-28 mt-32 relative overflow-hidden">
        <Container className="relative z-10">
          <div className="flex flex-col items-center justify-center text-center w-full">
            <FadeUp className="w-full">
              <p className="text-[clamp(14px,2vw,20px)] text-[#4ADDDE] font-bold tracking-[0.4em] md:tracking-[0.5em] mb-1 md:mb-3 relative z-20">
                FREEPIGMOVEMENT
              </p>
              <h2 className="font-road-rage text-[clamp(18px,4vw,36px)] tracking-wider md:tracking-widest mb-6 text-white whitespace-normal leading-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-20 px-4 max-w-full">
                SHAPED WITH PASSION, SHARED WITH TRUST.
              </h2>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ABOUT US PREVIEW */}
      <section className="w-full relative -mt-16 mb-32 z-10">
        {/* Background biru yang ukurannya dipotong atas-bawah biar fotonya nembus */}
        <div className="absolute top-14 bottom-[-40px] left-0 w-full bg-[#1A2127] z-0"></div>

        {/* Bercak background dipindah ke mari biar bisa nembus ke atas persis kayak maskot */}
        <img
          src={bercakBercak}
          alt="Bercak background"
          className="absolute -top-64 md:-top-96 left-0 w-[400px] md:w-[600px] opacity-60 pointer-events-none z-[5]"
        />

        {/* Mascot watermark ditarik ke sini biar bisa nembus ke atas kotak biru */}
        <img
          src={maskotBabi}
          alt="Maskot Babi"
          className="absolute -top-64 md:-top-96 -right-[5%] w-[350px] md:w-[500px] lg:w-[420px] opacity-90 pointer-events-none z-[5]"
        />

        <Container className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16 py-4">
            {/* IMAGE SIDE */}
            <div className="w-full md:w-1/2 relative z-20">
              <div className="w-full max-w-[644px] h-[400px] md:h-[550px] mx-auto rounded-[32px] overflow-hidden border border-[#4ADDDE] relative group shadow-2xl bg-black">
                <img
                  loading="lazy"
                  src={aboutUsImg}
                  alt="About Freepigmovement"
                  className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-[1.5s] ease-out group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition duration-500"></div>
              </div>
            </div>

            {/* TEXT SIDE */}
            <div className="w-full md:w-1/2 flex flex-col justify-center py-4 relative z-30">
              <FadeUp>
                <div className="relative md:-ml-16 lg:-ml-28 pointer-events-none -rotate-[5deg] origin-left">
                  <div className="mb-5 md:ml-16 lg:ml-[80px]">
                    <h4 className="font-road-rage text-[24px] text-[#4ADDDE] tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] inline-block">
                      SINCE 2001
                    </h4>
                  </div>
                  <h2 className="font-road-rage text-6xl md:text-7xl lg:text-[70px] tracking-wide text-white mb-8 leading-[0.85] uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
                    THE HIGHEST <br />
                    QUALITY <span className="text-[#4ADDDE]">GOODS</span>
                  </h2>
                </div>

                <p className="text-gray-200 text-sm md:text-lg leading-relaxed mb-10 font-poppins lg:ml-[-30px]">
                  Every board we build carries a piece of Bali’s surfing
                  heritage and over two decades of raw dedication. No shortcuts,
                  no compromises—just pure handcrafted quality since 2001.
                </p>
                <p className="text-gray-200 text-sm md:text-lg leading-relaxed mb-8 font-poppins lg:ml-[-30px]">
                  Whether you're a beginner catching your first whitewash or a
                  seasoned pro chasing barrels, we don't just shape boards—we
                  craft experiences.
                </p>
                <div className="w-full flex justify-end">
                  <motion.button
                    onClick={() => navigate("/about")}
                    className="text-white text-[15px] font-road-rage tracking-widest hover:text-accent-teal transition duration-300 flex items-center gap-1"
                    whileHover={{ x: 5 }}
                  >
                    DISCOVER OUR STORY{" "}
                    <FaChevronRight className="text-accent-teal text-[15px]" />
                  </motion.button>
                </div>
              </FadeUp>
            </div>
          </div>
        </Container>
      </section>

      {/* ACCESSORIES & SURFBOARD CARDS */}
      <section className="w-full text-white mb-24 mt-10 md:mt-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            {[
              {
                label: "ACCESSORIES",
                img: aksesoris3,
                link: "/store?tab=accessories",
              },
              {
                label: "SURFBOARD",
                img: surfboard3,
                link: "/store?tab=surfboard",
              },
            ].map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                key={idx}
                onClick={() => navigate(item.link)}
                className="relative group cursor-pointer overflow-hidden rounded-[20px] border border-[#4ADDDE]/60 hover:border-[#4ADDDE] h-[400px] md:h-[550px] transition-colors duration-500"
              >
                {/* Background Image */}
                <img
                  loading="lazy"
                  src={item.img}
                  alt={item.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />

                {/* Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Label (Bottom Left) */}
                <div className="absolute inset-x-0 bottom-0 px-8 pb-10 md:px-12 md:pb-14 flex items-end">
                  <h3 className="relative z-10 font-road-rage text-[clamp(28px,8vw,40px)] tracking-widest text-white group-hover:text-accent-teal transition duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                    {item.label}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* NEW RELEASE SECTION — Full Frame */}
      <section
        ref={newReleaseRef}
        className="relative w-full min-h-screen flex flex-col md:flex-row overflow-hidden"
      >
        {/* Video background — full section */}
        <motion.div
          className="absolute inset-0 w-full h-[130%] -top-[15%]"
          style={{ y: isMobile ? 0 : bgY }}
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

        {/* Base dark overlay */}
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Shadow Kanan Atas (Hanya fokus di pojok) */}
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(0,0,0,0.85) 0%, transparent 50%)",
          }}
        ></div>

        {/* Shadow Bawah Kiri (Hanya fokus di pojok) */}
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            background:
              "radial-gradient(circle at bottom left, rgba(0,0,0,0.85) 0%, transparent 60%)",
          }}
        ></div>

        {/* Shadow Bawah Sedikit */}
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 25%)",
          }}
        ></div>
        {/* Top gradient transition to blend with background */}
        <div className="absolute top-0 left-0 w-full h-32 md:h-48 bg-gradient-to-b from-[#0A0F13] to-transparent pointer-events-none z-[5]"></div>

        {/* LEFT — Text content */}
        <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center px-8 md:px-[70px] py-32 md:py-32">
          {newRelease?.logoUrl && (
            <img
              src={newRelease.logoUrl}
              alt="New Release Logo"
              className="absolute top-[10%] md:top-[5%] left-[30%] md:left-[37%] w-[155px] md:w-[280px] opacity-90 pointer-events-none z-[1]"
            />
          )}
          <FadeUp className="flex flex-col items-start gap-4 text-white relative z-10">
            <h2 className="font-road-rage text-5xl md:text-7xl lg:text-[100px] leading-[0.9] text-white tracking-widest -rotate-[6deg] origin-left drop-shadow-md">
              NEW
              <br />
              RELEASE
            </h2>
            <div className="mt-8 relative z-10">
              <h3 className="font-sans font-black text-2xl md:text-3xl mb-3 text-[#4ADDDE] tracking-wide">
                {newRelease?.title || "THE ROOSTER"}
              </h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-lg">
                {newRelease?.description ||
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
              </p>
              <motion.button
                onClick={() => {
                  const slug = newRelease?.product?.slug;
                  if (slug) {
                    navigate(`/product/${slug}`);
                  } else {
                    navigate("/store");
                  }
                }}
                className="mt-6 px-8 py-3.5 bg-white text-black rounded-full text-[12px] font-bold tracking-[0.2em] uppercase hover:bg-transparent hover:text-white hover:border-white border border-transparent transition-all duration-300"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                SHOP NOW →
              </motion.button>
            </div>
          </FadeUp>
        </div>

        {/* RIGHT — Full frame product image(s) */}
        {newRelease?.images?.length > 0 && (
          <FadeUp
            delay={0.2}
            className="relative z-10 w-full md:w-1/2 min-h-[60vh] md:min-h-0"
          >
            {newRelease.images.length === 1 ? (
              /* Single image — full height, no crop */
              <div className="absolute inset-0 flex items-center justify-center md:justify-end overflow-hidden">
                <img
                  loading="lazy"
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
                    loading="lazy"
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
      <section className="relative w-full pt-20 pb-16">
        {/* Bercak Kiri Mengambang di antara dua section */}
        <img
          src={bercakBercak}
          alt="Bercak Kiri"
          className="absolute left-0 top-0 w-[400px] md:w-[700px] h-auto object-contain pointer-events-none mix-blend-screen opacity-70 -translate-x-[30%] -translate-y-[40%] z-[20]"
        />
        {/* Bercak Kanan Mengambang di antara dua section */}
        <img
          src={bercakBercak}
          alt="Bercak Kanan"
          className="absolute right-0 top-0 w-[400px] md:w-[700px] h-auto object-contain pointer-events-none mix-blend-screen opacity-70 translate-x-[20%] -translate-y-[30%] -scale-y-100 rotate-180 z-[20]"
        />
        <Container className="relative z-10">
          <FadeUp>
            <h3 className="font-road-rage text-4xl md:text-5xl tracking-wide text-white uppercase text-center mb-32 md:mb-40">
              FIND YOUR <span className="text-[#4ADDDE]">LEVEL</span>
            </h3>
          </FadeUp>
        </Container>

        <div className="w-full relative z-30 px-4 md:px-0">
          <FadeUp>
            <div className="flex flex-col md:flex-row justify-center w-full gap-12 md:gap-0">
              {[
                {
                  title: "ADVANCED",
                  subtitle: (
                    <>
                      For experience
                      <br />
                      and powerful surfers.
                    </>
                  ),
                  img: categoryAdvance,
                  zIndex: "z-40",
                },
                {
                  title: "INTERMEDIATE",
                  subtitle: (
                    <>
                      For progressing surfers
                      <br />
                      building their skills.
                    </>
                  ),
                  img: categoryIntermediate,
                  zIndex: "z-30",
                },
                {
                  title: "BEGINNER",
                  subtitle: (
                    <>
                      For first times
                      <br />
                      and easy progression.
                    </>
                  ),
                  img: categoryBeginner,
                  zIndex: "z-20",
                },
                {
                  title: "GROMS",
                  subtitle: (
                    <>
                      For young shredders
                      <br />
                      and future legends.
                    </>
                  ),
                  img: categoryGroms,
                  zIndex: "z-10",
                },
              ].map((level, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  onClick={() =>
                    navigate(`/store?filter=${encodeURIComponent(level.title)}`)
                  }
                  className={`relative w-full md:flex-1 h-64 md:h-80 group cursor-pointer ${level.zIndex} ${idx !== 0 ? "md:-ml-5" : ""}`}
                >
                  {/* Inner wrapper for background and text, handles the rounded corners and borders */}
                  <div
                    className={`absolute inset-0 overflow-hidden rounded-[30px] md:rounded-l-none ${idx === 3 ? "md:rounded-r-none md:border-r-0" : "md:rounded-r-[30px]"} border border-[#4ADDDE] md:border-l-0`}
                  >
                    <img
                      loading="lazy"
                      src={level.img}
                      alt={level.title}
                      className="absolute inset-0 w-full h-full object-cover scale-[1.25] group-hover:scale-[1.30] transition-transform duration-700 ease-out z-0"
                    />
                  </div>

                  {/* Surfing Board Popping Out */}
                  <img
                    src={boardGroms}
                    alt="Surfboard"
                    className="absolute bottom-0 right-0 w-auto h-[115%] object-contain object-bottom pointer-events-none drop-shadow-md z-20 origin-bottom-right group-hover:scale-110 transition-transform duration-700 ease-out"
                  />

                  {/* Text Overlay - Placed outside to render ABOVE the surfboard */}
                  <div className="absolute inset-0 py-5 pr-5 pl-8 md:py-6 md:pr-6 md:pl-10 flex flex-col justify-between z-30 pointer-events-none">
                    <h4 className="font-road-rage text-xl md:text-2xl tracking-wide text-white drop-shadow-md">
                      {level.title}
                    </h4>
                    <p className="font-poppins text-sm font-medium italic text-gray-300 pr-2 leading-tight drop-shadow-lg">
                      {level.subtitle}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SHOP BY WAVE */}
      <section className="w-full py-24">
        <Container>
          <FadeUp className="flex flex-col md:flex-row items-center justify-center gap-16 lg:gap-32">
            {/* Title Section */}
            <div className="flex flex-col items-start -rotate-[6deg] shrink-0 mb-8 md:mb-0">
              <h2 className="font-road-rage text-[64px] md:text-[96px] tracking-widest text-[#4ADDDE] leading-[0.85] drop-shadow-md">
                WAVE
              </h2>
              <h2 className="font-road-rage text-[42px] md:text-[64px] tracking-widest text-white leading-[0.85] drop-shadow-md ml-4 md:ml-8">
                SELECTION
              </h2>
            </div>

            {/* Wave Icons Section */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-12 md:gap-20 text-center">
              {[
                {
                  title: "SMALL WAVES",
                  img: smallWavesImg,
                  imgClass: "w-40 md:w-44 lg:w-48",
                },
                {
                  title: "MEDIUM WAVES",
                  img: mediumWavesImg,
                  imgClass: "w-40 md:w-44 lg:w-48",
                },
                {
                  title: "BIG WAVES",
                  img: bigWavesImg,
                  imgClass: "w-40 md:w-44 lg:w-48",
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
                  className="group cursor-pointer flex flex-col items-center hover:-translate-y-2 transition duration-500"
                >
                  <div className="h-24 md:h-32 flex items-center justify-center mb-4">
                    <img
                      loading="lazy"
                      src={wave.img}
                      alt={wave.title}
                      className={`${wave.imgClass} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition duration-700 ease-out drop-shadow-md`}
                    />
                  </div>
                  <div className="w-full text-center mt-2">
                    <h4 className="font-sans text-[10px] md:text-[11px] font-black tracking-widest text-white group-hover:text-[#4ADDDE] transition uppercase">
                      {wave.title}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* SURFBOARDS PRODUCTS */}
      <section className="w-full bg-[#000000] py-24">
        <Container>
          <FadeUp className="flex items-center gap-4 sm:gap-6 mb-12">
            <h3 className="font-poppins text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wide text-white whitespace-nowrap">
              FEATURED SURFBOARDS
            </h3>
            <div className="flex-grow h-[1px] bg-[#4ADDDD]" />
          </FadeUp>

          {/* Loading skeleton */}
          {surfboardsLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-[20px]">
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-[20px]">
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
                      className="flex flex-col cursor-pointer group rounded-[30px] overflow-hidden bg-[#16181a] shadow-lg h-full"
                    >
                      {/* Image — full-frame, no padding, white bg */}
                      <div className="bg-white overflow-hidden aspect-[3/4] flex items-center justify-center">
                        <img
                          loading="lazy"
                          src={firstImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = "/black_surfboard.png";
                          }}
                        />
                      </div>
                      {/* Info bar */}
                      <div className="bg-[#1A2127] px-5 py-4 md:py-6 flex-grow flex flex-col justify-center">
                        <p className="text-[9px] text-[#4ADDDE] tracking-[0.18em] uppercase mb-1 font-bold">
                          {category}
                        </p>
                        <p className="font-poppins text-sm sm:text-base md:text-lg font-bold tracking-wide uppercase text-white transition duration-300">
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
      <section className="w-full bg-[#000000] py-24">
        <div className="w-full px-4 md:px-[70px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
            {[
              {
                topTitle: "rider",
                bottomTitle: "spotlight",
                img: riders2,
                link: "/riders",
                titleSize: "text-3xl md:text-[36px]",
              },
              {
                topTitle: "LOVED BY",
                bottomTitle: "SURFERS\nWORLDWIDE",
                img: customer2,
                link: "/customer",
                titleSize: "text-3xl md:text-[36px]",
              },
              {
                topTitle: "",
                bottomTitle: "GALLERY",
                img: galery2,
                link: "/gallery",
                titleSize: "text-4xl md:text-[48px]",
                titleColor: "text-[#4ADDDD]",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => item.link && navigate(item.link)}
                className="relative group overflow-hidden cursor-pointer aspect-[420/487] rounded-[30px] border border-[#4ADDDD] shadow-lg"
              >
                <img
                  loading="lazy"
                  src={item.img}
                  alt={item.bottomTitle}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:grayscale"
                />

                {/* Dark gradient overlay for text readability */}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition duration-500 z-10"></div> */}

                {/* Text Container */}
                <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 z-20 flex flex-col transform -rotate-3 transition-transform duration-300 group-hover:-translate-y-2">
                  {item.topTitle && (
                    <span className="font-road-rage text-2xl md:text-3xl tracking-wide text-[#4ADDDD] drop-shadow-md leading-none mb-1">
                      {item.topTitle}
                    </span>
                  )}
                  <h3
                    className={`font-road-rage ${item.titleSize || "text-[48px]"} tracking-wide leading-none ${item.titleColor || "text-white"} drop-shadow-lg`}
                  >
                    {item.bottomTitle.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i !== item.bottomTitle.split("\n").length - 1 && (
                          <br />
                        )}
                      </React.Fragment>
                    ))}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WALL MAGAZINE SECTION */}
      {wallMagazine && (
        <section className="w-full relative -mt-55 mb-24 z-10">
          {/* Background yang ukurannya dipotong atas-bawah biar fotonya nembus */}
          <div className="absolute top-20 bottom-[-40px] left-0 w-full bg-[#1A2127] z-0 border-t border-b border-white/5"></div>

          <Container className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16 py-4">
              {/* TEXT SIDE */}
              <div className="w-full md:w-1/2 flex flex-col justify-center py-4 relative z-30 order-2 md:order-1">
                <FadeUp>
                  <div className="relative pointer-events-none -rotate-[3deg] origin-left mb-6">
                    <span className="relative flex flex-col items-start w-full">
                      <span className="block font-road-rage text-[#4ADDDD] text-[60px] md:text-[70px] leading-[0.9] md:leading-[0.75] relative z-20 drop-shadow-md break-words whitespace-normal">
                        {wallMagazine.title}
                      </span>
                      {/* Efek Garis Brush Putih */}
                      {/* <img
                        src={bercakPembatas}
                        alt=""
                        className="absolute -bottom-6 left-0 w-[110%] min-w-[300px] h-10 object-cover z-10 pointer-events-none opacity-90 brightness-200"
                        style={{ filter: "brightness(0) invert(1)" }}
                      /> */}
                    </span>
                  </div>

                  {/* Add top margin to push description down since title is absolute/overlapping */}
                  <div className="mt-8 md:mt-12 text-gray-200 text-sm md:text-base leading-relaxed mb-10 font-poppins whitespace-pre-wrap max-w-xl">
                    {wallMagazine.description}
                  </div>
                  {wallMagazine.buttonText && wallMagazine.buttonLink && (
                    <div className="w-full">
                      <motion.a
                        href={wallMagazine.buttonLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#4ADDDE] rounded-full text-[#4ADDDE] text-xs font-bold tracking-widest hover:bg-[#4ADDDE] hover:text-black transition duration-300"
                        whileHover={{ x: 5 }}
                      >
                        {wallMagazine.buttonText.toUpperCase()}{" "}
                        <FaChevronRight className="text-[10px]" />
                      </motion.a>
                    </div>
                  )}
                </FadeUp>
              </div>

              {/* IMAGE SIDE */}
              <div className="w-full md:w-1/2 relative z-20 order-1 md:order-2 mt-8 md:mt-0">
                <FadeUp>
                  <div className="w-full max-w-[644px] h-[400px] md:h-[500px] mx-auto rounded-[32px] overflow-hidden border border-[#4ADDDE] relative group shadow-2xl bg-black">
                    <img
                      loading="lazy"
                      src={wallMagazine.imageUrl}
                      alt={wallMagazine.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition duration-500"></div>
                  </div>
                </FadeUp>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* FAQ SECTION */}
      <section className="w-full pt-32 pb-12">
        <div className="w-full px-4 md:px-[70px]">
          <div className="flex flex-col md:flex-row md:items-center gap-12 md:gap-24 border-t border-b border-[#143336] py-12 md:py-16">
            <FadeUp className="w-full md:w-5/12">
              <h2 className="font-road-rage text-4xl md:text-[47px] tracking-wide leading-none flex flex-col">
                <span className="text-white drop-shadow-md">FREQUENTLY</span>
                <span className="text-[#4ADDDD] drop-shadow-md">
                  ASKED QUESTIONS
                </span>
              </h2>
            </FadeUp>
            <div className="w-full md:w-7/12 flex flex-col">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="py-3 md:py-4 cursor-pointer group"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <div className="flex justify-between items-center gap-4">
                    <h4 className="text-base md:text-[24px] font-poppins font-medium text-white transition duration-300 leading-snug">
                      {faq.q}
                    </h4>
                    <span className="text-xl md:text-2xl text-[#4ADDDD] transition duration-300 font-light">
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
        </div>
      </section>

      {/* CUSTOMER REVIEWS SECTION */}
      <section className="w-full bg-[#000000] pt-28 pb-24">
        <Container>
          <FadeUp>
            {/* Header */}
            <div className="text-center mb-12 border-b border-[#143336] pb-8">
              <h2 className="font-road-rage text-5xl md:text-[56px] tracking-wide text-[#4ADDDD] uppercase mb-3 drop-shadow-md">
                Voices From The Lineup
              </h2>
              <p className="text-white text-sm md:text-[15px] font-poppins tracking-widest">
                Trusted by Riders. Proven in Every Wave.
              </p>
            </div>

            {/* Reviews Grid */}
            {reviewsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full max-w-[447px] h-[200px] mx-auto bg-[#1a2127] rounded-[20px] p-6 animate-pulse flex flex-col"
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-[70px] h-[70px] rounded-full bg-[#333] shrink-0" />
                      <div className="flex flex-col gap-2">
                        <div className="h-5 bg-[#333] rounded w-28" />
                        <div className="h-4 bg-[#333] rounded w-20" />
                      </div>
                    </div>
                    <div className="h-3 bg-[#333] rounded w-full mb-2 mx-auto" />
                    <div className="h-3 bg-[#333] rounded w-5/6 mb-2 mx-auto" />
                    <div className="h-3 bg-[#333] rounded w-2/3 mx-auto" />
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.slice(0, 3).map((review, idx) => {
                  const isOwn = user && review.userId === user.id;
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                      className={`w-full max-w-[447px] h-[200px] mx-auto rounded-[20px] p-6 flex flex-col transition duration-500 group border ${
                        isOwn
                          ? "bg-[#1a2127] border-accent-teal/50 shadow-[0_0_15px_rgba(74,221,221,0.2)]"
                          : "bg-[#1a2127] border-transparent hover:border-[#4ADDDD]/30"
                      }`}
                    >
                      {/* User info + rating */}
                      <div className="flex items-center gap-5 mb-6 relative">
                        {isOwn && (
                          <div className="absolute top-0 right-0 flex gap-2 shrink-0 -mt-4 -mr-2">
                            <button
                              onClick={handleStartEdit}
                              className="text-gray-400 hover:text-[#4ADDDD] transition"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => setDeleteReviewConfirmOpen(true)}
                              className="text-red-400 hover:text-red-300 transition"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <div className="w-[70px] h-[70px] shrink-0 rounded-full bg-[#4ADDDD] flex items-center justify-center text-white font-bold text-2xl uppercase shadow-lg">
                          {review.user?.name?.[0] || ""}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-white font-poppins font-bold text-lg md:text-xl tracking-wide">
                            {review.user?.name || "Anonymous"}
                          </p>
                          <div className="flex text-[#4ADDDD] mt-1 gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                fill="currentColor"
                                strokeWidth={1.5}
                                className={`w-[18px] h-[18px] md:w-5 md:h-5 ${
                                  i < review.rating
                                    ? "opacity-100"
                                    : "opacity-30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-[10px] md:text-[13px] text-gray-300 text-center leading-relaxed overflow-hidden text-ellipsis line-clamp-3">
                        {review.comment || "No comment"}
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
            <div className="mt-16 flex flex-col md:flex-row items-center gap-12">
              {/* Left Side: Graphic */}
              <div className="w-full md:w-5/12 relative flex flex-col items-center justify-center min-h-[350px] z-0">
                {/* Huge Pig Logo overflowing to the right */}
                <div className="absolute top-1/2 left-[30%] transform -translate-x-1/2 -translate-y-1/2 w-[140%] md:w-[160%] max-w-[650px] pointer-events-none z-0">
                  <img
                    src={maskotBabi2}
                    alt=""
                    className="w-full h-auto object-contain opacity-60 mix-blend-screen"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(80%) sepia(50%) saturate(1000%) hue-rotate(130deg)",
                    }}
                  />
                </div>

                {/* Text & Stars overlaid on Pig */}
                <div className="relative z-10 flex flex-col items-center  mt-4">
                  <h3 className="font-road-rage text-6xl md:text-[60px] tracking-wide text-white drop-shadow-lg mb-0 leading-none text-center">
                    RATE & REVIEW
                  </h3>
                  {/* Interactive Star Rating */}
                  <div className="flex gap-4 md:gap-5 mt-4 drop-shadow-md">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewRating(i + 1)}
                        onMouseEnter={() => setReviewHover(i + 1)}
                        onMouseLeave={() => setReviewHover(0)}
                        className={`transition-all duration-200 text-[#4ADDDD] ${
                          i < (reviewHover || reviewRating)
                            ? "scale-110 opacity-100"
                            : "opacity-30 hover:opacity-60"
                        }`}
                      >
                        <Star
                          fill="currentColor"
                          strokeWidth={1.5}
                          className="w-[50px] h-[50px] md:w-[60px] md:h-[60px]"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Form Box */}
              <div className="w-full md:w-7/12 relative z-10">
                <div className="bg-[#1a2127] rounded-[20px] p-6 md:p-8 relative min-h-[300px] flex flex-col border border-transparent hover:border-[#4ADDDD]/30 transition duration-300">
                  {token && user && hasReviewed && !isEditMode ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-6">
                      <p className="text-accent-teal text-xs font-bold tracking-widest mb-3">
                        ✓ YOU HAVE ALREADY REVIEWED
                      </p>
                      <div className="flex justify-center mb-3 text-[#4ADDDD]">
                        {renderStars(myReview?.rating ?? 0, "w-8 h-8")}
                      </div>
                      {myReview?.comment && (
                        <p className="text-gray-300 text-sm italic mb-6">
                          "{myReview.comment}"
                        </p>
                      )}
                      <button
                        onClick={handleStartEdit}
                        className="bg-[#111] text-[#4ADDDD] px-8 py-3 rounded-full font-bold text-xs tracking-widest hover:bg-[#222] transition duration-300 shadow-md"
                      >
                        EDIT REVIEW
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex-grow flex flex-col">
                      {(!token || !user) && (
                        <div
                          className="absolute inset-0 z-10 cursor-pointer bg-black/10 rounded-lg"
                          onClick={() => setShowLoginPrompt(true)}
                        />
                      )}
                      <form
                        onSubmit={handleReviewSubmit}
                        className={`flex flex-col flex-grow ${!token || !user ? "opacity-70" : ""}`}
                      >
                        <textarea
                          rows={4}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Halo..."
                          className="w-full flex-grow bg-transparent text-white font-poppins text-sm resize-none focus:outline-none placeholder-gray-500 mb-16"
                        />

                        {/* Error / success messages */}
                        {(reviewError || reviewSuccess) && (
                          <div className="absolute top-0 right-0 max-w-[200px]">
                            {reviewError && (
                              <p className="text-red-400 text-[10px] text-right">
                                {reviewError}
                              </p>
                            )}
                            {reviewSuccess && (
                              <p className="text-green-400 text-[10px] text-right">
                                {reviewSuccess}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center border-t border-[#2a2a2a] pt-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-[#4ADDDD] text-sm uppercase font-bold shadow-inner">
                              {user?.name?.[0] || "?"}
                            </div>
                            <span className="text-[#4ADDDD] font-poppins font-bold text-sm">
                              {user?.name || "Guest"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {isEditMode && (
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="text-gray-500 hover:text-white font-bold text-[10px] tracking-widest transition"
                              >
                                CANCEL
                              </button>
                            )}
                            <button
                              type="submit"
                              disabled={reviewSubmitting}
                              className="bg-[#111] text-[#4ADDDD] px-8 py-3 rounded-full font-bold text-xs tracking-widest hover:bg-[#222] transition duration-300 shadow-md disabled:opacity-50"
                            >
                              {reviewSubmitting
                                ? "SAVING..."
                                : isEditMode
                                  ? "UPDATE"
                                  : "SUBMIT"}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>
      <ConfirmationModal
        isOpen={deleteReviewConfirmOpen}
        onClose={() => setDeleteReviewConfirmOpen(false)}
        onConfirm={handleDeleteReview}
        title="DELETE REVIEW?"
        message="Are you sure you want to delete your review? This action cannot be undone."
        loading={reviewSubmitting}
        loadingText="DELETING..."
      />
    </div>
  );
}
