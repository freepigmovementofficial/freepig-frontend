import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { productService } from '../../api/products';
import headingImg from '../../assets/Heading.webp';
import PigLoader from '../../components/PigLoader';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getBySlug(slug);
        setProduct(res.data);
        if (res.data?.images?.length > 0) {
          const imgs = res.data.images;
          // Prefer full-body DECK photo (not logo) as the default displayed image
          const deckFull = imgs.findIndex(img => img.type === 'DECK' && !img.url.toLowerCase().includes('logo'));
          const anyFull = imgs.findIndex(img => !img.url.toLowerCase().includes('logo'));
          setActiveIndex(deckFull >= 0 ? deckFull : anyFull >= 0 ? anyFull : 0);
        }
      } catch (err) {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const images = product?.images || [];
  const totalImages = images.length;
  const goNext = useCallback(() => setActiveIndex(i => (i + 1) % totalImages), [totalImages]);
  const goPrev = useCallback(() => setActiveIndex(i => (i - 1 + totalImages) % totalImages), [totalImages]);

  if (loading) {
    return (
      <AnimatePresence>
        <PigLoader key="loader" fullScreen text="Loading board details..." />
      </AnimatePresence>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] flex flex-col items-center justify-center font-poppins text-white">
        <h2 className="text-2xl font-bold mb-4">{error || 'Product not found'}</h2>
        <Link to="/store" className="text-accent-teal hover:underline">Back to Store</Link>
      </div>
    );
  }

  const categoryName = product.category?.name || 'SURFBOARD';
  const waveLevels = product.waveLevels || [];
  const isAccessory = product.productType === 'ACCESSORY';
  
  // Format description with paragraphs
  const renderDescription = () => {
    if (!product.description) {
      return <p className="text-gray-400 text-sm leading-relaxed">No description available for this product.</p>;
    }
    return product.description.split('\n').map((line, idx) => {
      if (line.trim().startsWith('*')) {
        return <li key={idx} className="ml-4 list-disc text-sm text-gray-300 mb-1 leading-relaxed">{line.replace('*', '').trim()}</li>;
      }
      if (line.trim() === '') return <br key={idx} />;
      return <p key={idx} className="text-sm text-gray-300 mb-3 leading-relaxed">{line}</p>;
    });
  };

  const skillLevels = ['GROMS', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const currentSkillIndex = skillLevels.indexOf(product.skillLevel?.toUpperCase());
  const abilityPercentage = currentSkillIndex >= 0 ? ((currentSkillIndex + 1) / skillLevels.length) * 100 : 0;

  // Helper for Wave Height Bar (Approximate mapping)
  let waveMin = 0; let waveMax = 0;
  if (waveLevels.includes('SMALL')) { waveMin = 1; waveMax = Math.max(waveMax, 3); }
  if (waveLevels.includes('MEDIUM')) { waveMin = waveMin === 0 ? 3 : waveMin; waveMax = Math.max(waveMax, 6); }
  if (waveLevels.includes('BIG')) { waveMin = waveMin === 0 ? 6 : waveMin; waveMax = Math.max(waveMax, 10); }
  
  const waveLeftPercent = (waveMin / 10) * 100;
  const waveWidthPercent = ((waveMax - waveMin) / 10) * 100;

  return (
    <div className="bg-[#222] min-h-screen font-poppins text-white pb-24">
      {/* ── HERO BANNER ── */}
      {product.videoUrl ? (
        <div className="relative w-full overflow-hidden bg-black" style={{ height: '350px' }}>
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full min-h-full"
            style={{ width: '100vw', height: '56.25vw', minHeight: '350px', minWidth: '622px' }}
            src={`${product.videoUrl}?autoplay=1&mute=1&loop=1&playlist=${product.videoUrl.split('/').pop()?.split('?')[0]}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
            title="YouTube Video Hero"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute bottom-3 right-4 md:right-8 z-10 pointer-events-none">
            <span className="text-[8px] sm:text-[9px] text-white/40 tracking-[0.15em] uppercase font-medium drop-shadow-md">
              Video playback quality adapts to your connection speed
            </span>
          </div>
        </div>
      ) : (
        <div
          className="relative w-full flex items-center justify-center bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(${headingImg})`, height: '350px' }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 mt-8 sm:mt-12">
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-all font-bold tracking-widest text-xs uppercase drop-shadow-lg"
        >
          <FiChevronLeft size={16} /> BACK
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Column: Images */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Main image with arrow buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-white rounded-lg overflow-hidden aspect-[3/4] shadow-2xl group"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIndex}
                  loading="lazy"
                  src={images[activeIndex]?.url || '/black_surfboard.png'}
                  alt={product.name}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Arrow Buttons — only shown when multiple images exist */}
              {totalImages > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-black/50 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-black/80 transition-all duration-200 z-10"
                    aria-label="Previous image"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-black/50 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-black/80 transition-all duration-200 z-10"
                    aria-label="Next image"
                  >
                    <FiChevronRight size={20} />
                  </button>
                  {/* Dot indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                          i === activeIndex ? 'bg-black w-3' : 'bg-black/30'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* Thumbnails */}
            {totalImages > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveIndex(i)}
                    className={`bg-white rounded-lg overflow-hidden aspect-[3/4] transition-all duration-300 ${
                      i === activeIndex ? 'ring-2 ring-accent-teal shadow-lg scale-105' : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img loading="lazy" src={img.url} alt={`${product.name} thumbnail`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="font-oswald text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-wider mb-2">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 flex-wrap mb-8 text-xs font-bold tracking-[0.2em] uppercase text-gray-400">
              <span className="text-white">{categoryName}</span>
              {!isAccessory && waveLevels.length > 0 && (
                <>
                  <span className="text-gray-600">|</span>
                  {waveLevels.map((w, i) => (
                    <React.Fragment key={w}>
                      <span className="text-white">{w} WAVES</span>
                      {i < waveLevels.length - 1 && <span className="text-gray-600">|</span>}
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>

            <div className="prose prose-invert prose-sm max-w-none mb-12">
              {renderDescription()}
            </div>

            {/* Bottom Section: Graphs & Dimensions */}
            <div className="mt-auto border-t border-[#444] pt-8">
              
              {/* Ability Level & Wave Height — only for Surfboards */}
              {!isAccessory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                  {/* Ability Level */}
                  <div>
                    <h3 className="text-center font-bold text-sm tracking-widest mb-3">Ability Level</h3>
                    <div className="w-full h-4 bg-[#333] border border-gray-500 relative">
                      <div 
                        className="absolute top-0 left-0 h-full bg-white transition-all duration-1000"
                        style={{ width: `${abilityPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-widest">
                      <span className="w-1/4 text-left">Groms</span>
                      <span className="w-1/4 text-center">Beginner</span>
                      <span className="w-1/4 text-center">Intermediate</span>
                      <span className="w-1/4 text-right">Advanced</span>
                    </div>
                  </div>

                  {/* Wave Height */}
                  <div>
                    <h3 className="text-center font-bold text-sm tracking-widest mb-3">Wave Height (Feet)</h3>
                    <div className="w-full h-4 bg-[#333] border border-gray-500 relative">
                      {waveMax > 0 && (
                        <div 
                          className="absolute top-0 h-full bg-white transition-all duration-1000"
                          style={{ left: `${waveLeftPercent}%`, width: `${waveWidthPercent}%` }}
                        />
                      )}
                      {/* Ruler Marks */}
                      <div className="absolute top-full left-0 w-full flex justify-between mt-1">
                        {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                          <div key={n} className="flex flex-col items-center">
                            <div className="w-[1px] h-1.5 bg-gray-500"></div>
                            <span className="text-[8px] text-gray-500 mt-0.5">{n}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dimensions Grid */}
              {product.dimensions && product.dimensions.length > 0 && (
                <div>
                  <h3 className="text-center font-bold text-lg tracking-widest mb-2">DIMENSIONS</h3>
                  <p className="text-center text-[9px] text-gray-500 tracking-widest mb-6 uppercase">Tap a size to order</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.dimensions.map((dim) => (
                      <button
                        key={dim.id}
                        onClick={() => window.dispatchEvent(new Event("openContactPopup"))}
                        className="bg-white text-black py-2.5 px-4 rounded-full text-center text-xs font-bold tracking-widest hover:bg-accent-teal hover:text-black transition-all duration-300 cursor-pointer active:scale-95"
                      >
                        {dim.size} x {dim.width} x {dim.thickness} {dim.volume ? `${dim.volume}` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
