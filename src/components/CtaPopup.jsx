import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function CtaPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  // useRef guard prevents React 18 StrictMode double-mount from firing the popup twice
  const hasTriggered = useRef(false);

  useEffect(() => {
    const hasSeenCta = sessionStorage.getItem('hasSeenFreepigCta');

    if (!hasSeenCta && !hasTriggered.current) {
      hasTriggered.current = true;
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenFreepigCta', 'true');
  };

  const handleEnterMovement = () => {
    handleClose();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111] border border-white/10 rounded-[2rem] p-8 md:p-12 w-full max-w-xl relative shadow-2xl flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 z-20 text-gray-500 hover:text-white transition duration-300 text-xl"
            >
              ✕
            </button>

            {/* Content */}
            <div className="flex flex-col gap-2">
              <span className="text-accent-teal text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                FREEPIGMOVEMENT
              </span>

              <h2 className="font-oswald text-4xl md:text-5xl font-bold text-white leading-tight">
                Ride Your Own<br />Wave.
              </h2>

              <h3 className="font-poppins text-lg font-bold text-white mt-4 mb-2 tracking-wide">
                join our community.
              </h3>

              <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-10 max-w-sm">
                Create an account or sign in to unlock exclusive features, save your preferences, and stay connected with the latest updates.
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-6 mt-auto">
                <button
                  onClick={handleEnterMovement}
                  className="px-8 py-3.5 bg-transparent border border-white/60 rounded-full hover:bg-white hover:border-white hover:text-black transition duration-300 text-white text-xs font-bold tracking-[0.15em] uppercase"
                >
                  ENTER THE MOVEMENT
                </button>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-white text-sm transition duration-300 underline decoration-gray-600 hover:decoration-white underline-offset-4"
                >
                  no, thanks
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
