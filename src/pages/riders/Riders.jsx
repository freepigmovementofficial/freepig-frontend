import useDocumentTitle from '../../hooks/useDocumentTitle';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { riderService } from '../../api/riders';
import headingImg from '../../assets/Heading.webp';
import PigLoader from '../../components/PigLoader';

const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: 'easeOut', delay }}
  >
    {children}
  </motion.div>
);

export default function Riders() {
  useDocumentTitle('Riders | FreePigMovement');
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
        setError(err.response?.data?.message || 'Failed to load riders');
      } finally {
        setLoading(false);
      }
    };
    fetchRiders();
  }, []);

  return (
    <div className="bg-[#1c1c1c] min-h-screen font-poppins text-white pb-24">
      {/* ── HERO BANNER ── */}
      <div
        className="relative w-full flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${headingImg})`, height: '350px' }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 font-oswald text-5xl sm:text-6xl md:text-7xl lg:text-[96px] font-black tracking-[0.1em] text-center uppercase text-white drop-shadow-2xl px-4"
        >
          RIDERS
        </motion.h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-10 sm:mt-16">
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
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center py-20 w-full">
                <PigLoader text="Loading Riders..." />
              </motion.div>
            ) : riders.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-gray-500 tracking-widest text-sm uppercase">
                No riders available at the moment.
              </motion.div>
            ) : (
              <motion.div
                key="riders-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-12"
              >
                {riders.map((rider, idx) => (
                  <FadeUp key={rider.id} delay={idx * 0.1}>
                    <Link to={`/riders/${rider.id}`} className="group block">
                      <div className="w-full aspect-square bg-[#2a2a2a] overflow-hidden mb-4">
                        <img loading="lazy"
                          src={rider.images?.[0]?.url || '/black_surfboard.png'}
                          alt={rider.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = '/black_surfboard.png';
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
                          {rider.location || 'Location'}
                        </span>
                        <h3 className="font-oswald text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wider text-white group-hover:text-accent-teal transition-colors">
                          {rider.name}
                        </h3>
                      </div>
                    </Link>
                  </FadeUp>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
