import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryService } from '../../api/gallery';

// Reusable FadeUp component
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

const Container = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-6 md:px-12 lg:px-16 ${className}`}>
    {children}
  </div>
);

export default function Gallery() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        // Using limit 100 to get a good chunk of photos for the masonry grid
        const res = await galleryService.getAll({ limit: 100 });
        setGalleries(res.data?.data?.galleries || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <div className="bg-[#1a1a1a] min-h-screen font-poppins pt-28 pb-20 text-white selection:bg-accent-teal selection:text-black">
      <Container>
        <div className="text-center mb-16">
          <FadeUp>
            <p className="text-sm font-bold tracking-[0.4em] text-accent-teal mb-3">
              MOMENTS
            </p>
            <h1 className="font-oswald text-5xl md:text-7xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              GALLERY
            </h1>
          </FadeUp>
        </div>

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
        ) : loading ? (
          // Skeleton Masonry Layout
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid bg-[#222] rounded-xl animate-pulse"
                style={{ height: `${Math.floor(Math.random() * (400 - 200 + 1)) + 200}px` }}
              ></div>
            ))}
          </div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-20 text-gray-500 tracking-widest text-sm uppercase">
            No photos available at the moment.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {galleries.map((img, idx) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: (idx % 10) * 0.1 }}
                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-xl bg-[#222]"
                onClick={() => setSelectedImage(img)}
              >
                <img
                  src={img.url}
                  alt={img.caption || 'Gallery photo'}
                  loading="lazy"
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = '/black_surfboard.png';
                  }}
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                  {img.caption && (
                    <motion.p
                      initial={{ y: 10, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-white font-medium text-sm tracking-wide border-l-2 border-accent-teal pl-3"
                    >
                      {img.caption}
                    </motion.p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
                      Preview
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-accent-teal transition text-white group-hover:text-black">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Container>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-sm"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 sm:top-10 sm:right-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-accent-teal hover:text-black transition"
            >
              ✕
            </button>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-full flex flex-col items-center"
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.caption || 'Preview'}
                className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-sm"
              />
              {selectedImage.caption && (
                <div className="mt-6 text-center max-w-2xl">
                  <p className="text-white text-lg font-medium tracking-wide">
                    {selectedImage.caption}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
