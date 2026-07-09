import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function CTAPopup({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[#010E19]/70 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Popup Card */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[101] px-4"
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-10 shadow-2xl overflow-hidden font-poppins">
              {/* Decorative Glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-teal to-transparent opacity-50" />
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent-teal rounded-full blur-[120px] opacity-10 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition duration-300"
                aria-label="Close"
              >
                ✕
              </button>

              {/* Content */}
              <div className="flex flex-col items-start gap-5">
                <p className="text-xs font-bold tracking-[0.3em] text-accent-teal uppercase">
                  FreepigMovement
                </p>

                <div className="flex flex-row gap-2">
                  <h2 className="font-oswald text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                    Ride Your Own Wave.
                  </h2>
                </div>
                <h3 className="text-gray-300 text-si">
                  <b>join our community.</b>{" "}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Create an account or sign in to unlock exclusive features,
                  save your preferences, and stay connected with the latest
                  updates.
                </p>

                <div className="flex items-center gap-4 mt-2 w-full">
                  <Link to="/login" className="flex-1" onClick={onClose}>
                    <motion.button
                      className="w-full px-6 py-3.5 bg-transparent border border-white/60 rounded-full hover:bg-white hover:border-white hover:text-black transition duration-300 text-white text-[11px] font-bold tracking-[0.2em] uppercase"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      ENTER THE MOVEMENT
                    </motion.button>
                  </Link>
                  <button
                    onClick={onClose}
                    className="text-xs text-gray-500 hover:text-gray-300 transition duration-300 whitespace-nowrap underline underline-offset-2"
                  >
                    no, thanks
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
