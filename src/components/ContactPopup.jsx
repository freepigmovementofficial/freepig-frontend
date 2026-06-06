import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle } from 'react-icons/fa';
import headingImg from '../assets/Heading.webp';

export default function ContactPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openContactPopup', handleOpen);
    return () => window.removeEventListener('openContactPopup', handleOpen);
  }, []);

  const admins = [
    { name: 'FOZZ', phone: '6281338506556' },
    { name: 'GONZO', phone: '6287839119590' },
    { name: 'DANY', phone: '6281224222380' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#292929] rounded-3xl overflow-hidden w-full max-w-4xl relative shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-6 z-20 text-white hover:text-gray-300 text-3xl font-light"
            >
              ✕
            </button>

            {/* Header with Image */}
            <div className="relative h-48 flex items-center justify-center overflow-hidden">
              <img
                src={headingImg}
                alt="Heading"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-black/60"></div>
              <h2 className="relative z-10 font-oswald text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-widest text-center mt-2">
                GET IN TOUCH WITH OUR TEAM
              </h2>
            </div>

            {/* Content */}
            <div className="p-8 md:p-16 text-center">
              <p className="text-gray-200 mb-12 text-sm md:text-base tracking-wide max-w-3xl mx-auto leading-loose">
                For inquiries, consultations, or custom requests, please contact our team through WhatsApp. Select one of our administrators below, and we will assist you as soon as possible.
              </p>

              {/* Admin Cards */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12">
                {admins.map((admin) => (
                  <a
                    key={admin.name}
                    href={`https://wa.me/${admin.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center group cursor-pointer relative"
                  >
                    <div className="bg-white rounded-full p-2 z-10 relative">
                      <FaUserCircle className="text-[#444] text-7xl md:text-8xl" />
                    </div>
                    <div className="bg-[#444] rounded-r-2xl -ml-8 pl-12 pr-8 py-3 md:py-4 shadow-lg group-hover:bg-[#555] transition duration-300">
                      <span className="font-oswald text-xl md:text-2xl font-bold text-white tracking-widest">
                        {admin.name}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
