import useDocumentTitle from "../../hooks/useDocumentTitle";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { riderService } from "../../api/riders";
import headingImg from "../../assets/headerRiderss.webp";
import headerTransparanImg from "../../assets/headertranparan.webp";
import bercakPembatas from "../../assets/bercakPembatas.webp";
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

export default function Riders() {
  useDocumentTitle("Riders | FreePigMovement");
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        setLoading(true);
        const res = await riderService.getAll({ limit: 100 });
        setRiders(res.data?.riders || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load riders");
      } finally {
        setLoading(false);
      }
    };
    fetchRiders();
  }, []);

  return (
    <div className="bg-[#000000] min-h-screen font-poppins text-white pb-24">
      {/* ── HERO BANNER ── */}
      <div
        className="relative w-full flex items-center justify-center bg-cover bg-[center_15%] overflow-visible z-10"
        style={{ backgroundImage: `url(${headingImg})`, height: "500px" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(150% 100% at 50% 0%, rgba(1, 14, 25, 0) 44%, rgba(1, 14, 25, 0.25) 68%, rgba(1, 14, 25, 1) 100%)",
          }}
        ></div>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 font-road-rage text-5xl sm:text-6xl md:text-7xl lg:text-[96px] text-white drop-shadow-2xl px-4 text-center"
        >
          RIDERS
        </motion.h1>
        <div
          className="absolute inset-0 bg-cover bg-[center_15%] pointer-events-none z-20"
          style={{ backgroundImage: `url(${headerTransparanImg})` }}
        ></div>

        {/* Gradient tambahan untuk fade-out banner ke warna hitam #000000 agar menyatu tanpa garis pembatas */}
        <div
          className="absolute bottom-0 left-0 w-full h-32 md:h-56 pointer-events-none z-[5]"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000000 100%)",
          }}
        ></div>

        <img
          src={bercakPembatas}
          alt="Bercak pembatas banner"
          className="absolute bottom-[-1px] left-0 w-full object-cover pointer-events-none z-10 mix-blend-normal translate-y-[60%] brightness-0"
        />
      </div>

      <div className="w-full mx-auto px-6 md:px-[70px] mt-12 sm:mt-16 relative z-20">
        {error ? (
          <div className="text-center py-20 text-red-400 text-sm tracking-widest uppercase">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 border border-red-500/50 rounded-full hover:bg-red-500/10 transition"
            >
              TRY AGAIN
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center py-20 w-full"
              >
                <PigLoader text="Loading Riders..." />
              </motion.div>
            ) : riders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 text-gray-500 tracking-widest text-sm uppercase"
              >
                No riders available at the moment.
              </motion.div>
            ) : (
              <motion.div
                key="riders-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-6 gap-[20px]"
              >
                {riders.map((rider, idx) => {
                  const isLastRowOfTwo =
                    riders.length % 3 === 2 && idx >= riders.length - 2;
                  const colSpanClass = isLastRowOfTwo
                    ? "md:col-span-3"
                    : "md:col-span-2";

                  return (
                    <FadeUp
                      key={rider.id}
                      delay={idx * 0.1}
                      className={`col-span-1 ${colSpanClass}`}
                    >
                      <Link
                        to={`/riders/${rider.id}`}
                        className="group flex flex-col h-full bg-[#16181a] rounded-[30px] overflow-hidden border border-[#4ADDDD] shadow-lg hover:shadow-2xl hover:shadow-[#4ADDDD]/10 transition-all duration-300"
                      >
                        <div
                          className={`w-full bg-[#2a2a2a] overflow-hidden ${isLastRowOfTwo ? "aspect-[3/2]" : "aspect-[4/5] md:aspect-square lg:aspect-[4/5]"}`}
                        >
                          <img
                            loading="lazy"
                            src={
                              rider.images?.[0]?.url || "/black_surfboard.png"
                            }
                            alt={rider.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                              e.target.src = "/black_surfboard.png";
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 md:p-5 flex-grow bg-[#1A2127]">
                          <div className="flex flex-col">
                            <span className="text-[9px] sm:text-[10px] md:text-xs text-[#4ADDDD] uppercase tracking-widest font-bold mb-1">
                              {rider.location || "Location"}
                            </span>
                            <h3 className="font-poppins text-lg sm:text-xl md:text-[22px] font-black uppercase tracking-wide text-white transition-colors">
                              {rider.name}
                            </h3>
                          </div>
                          <div className="w-10 h-10 rounded-full border border-[#4ADDDD] flex items-center justify-center text-[#4ADDDD] transition-all duration-300 shrink-0 ml-4 group-hover:bg-[#4ADDDD] group-hover:text-black">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </FadeUp>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
