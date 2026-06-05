import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function ErrorPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden pt-20 pb-10">
      {/* Texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] mix-blend-overlay"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 flex flex-col items-center"
      >
        <h1 className="font-oswald font-black text-[120px] md:text-[160px] leading-none text-white tracking-[0.05em] mb-0 opacity-90 drop-shadow-2xl">
          404
        </h1>
        <h2 className="font-oswald font-bold text-2xl md:text-3xl tracking-[0.2em] text-accent-teal mb-6 uppercase">
          Lost at Sea
        </h2>
        <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-10 tracking-wide font-inter">
          The wave you're looking for has already passed or doesn't exist. Let's get you back to the lineup.
        </p>

        <Link to="/">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3.5 bg-white text-black font-bold text-xs tracking-widest uppercase rounded-full hover:bg-gray-200 transition shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-2"
          >
            <span>BACK TO HOME</span>
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

export default ErrorPage;
