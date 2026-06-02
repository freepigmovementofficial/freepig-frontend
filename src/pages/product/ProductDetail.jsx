import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../../api/products';
import headingImg from '../../assets/Heading.png';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getBySlug(slug);
        setProduct(res.data);
        if (res.data?.images?.length > 0) {
          const imgs = res.data.images;
          // Prefer full-body DECK photo (not logo) as the default displayed image
          const deckFull = imgs.find(img => img.type === 'DECK' && !img.url.toLowerCase().includes('logo'));
          const anyFull = imgs.find(img => !img.url.toLowerCase().includes('logo'));
          setActiveImage((deckFull || anyFull || imgs[0]).url);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center font-poppins">
        <div className="w-12 h-12 border-4 border-white/20 border-t-accent-teal rounded-full animate-spin"></div>
      </div>
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

  // Helper for Ability Level Bar
  const skillLevels = ['GROMS', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const currentSkillIndex = skillLevels.indexOf(product.skillLevel);
  const abilityPercentage = currentSkillIndex >= 0 ? ((currentSkillIndex + 1) / skillLevels.length) * 100 : 50;

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
      <div
        className="relative w-full flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${headingImg})`, height: '350px' }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Column: Images */}
          <div className="flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg overflow-hidden flex items-center justify-center aspect-[3/4] p-8 shadow-2xl"
            >
              <img 
                src={activeImage || '/black_surfboard.png'} 
                alt={product.name} 
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </motion.div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.url)}
                    className={`bg-white rounded-lg overflow-hidden flex items-center justify-center aspect-[3/4] p-2 transition-all duration-300 ${
                      activeImage === img.url ? 'ring-2 ring-accent-teal shadow-lg scale-105' : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={img.url} alt={`${product.name} thumbnail`} className="w-full h-full object-contain" />
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
            <h1 className="font-oswald text-5xl md:text-6xl font-bold uppercase tracking-wider mb-2">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 flex-wrap mb-8 text-xs font-bold tracking-[0.2em] uppercase text-gray-400">
              <span className="text-white">{categoryName}</span>
              <span className="text-gray-600">|</span>
              {waveLevels.map((w, i) => (
                <React.Fragment key={w}>
                  <span className="text-white">{w} WAVES</span>
                  {i < waveLevels.length - 1 && <span className="text-gray-600">|</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="prose prose-invert prose-sm max-w-none mb-12">
              {renderDescription()}
            </div>

            {/* Bottom Section: Graphs & Dimensions */}
            <div className="mt-auto border-t border-[#444] pt-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                {/* Ability Level */}
                <div>
                  <h3 className="text-center font-bold text-sm tracking-widest mb-3">Ability Level</h3>
                  <div className="w-full h-4 bg-white border border-gray-500 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#333] transition-all duration-1000"
                      style={{ width: `${abilityPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[9px] text-gray-400 uppercase tracking-widest">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Advanced</span>
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

              {/* Dimensions Grid */}
              {product.dimensions && product.dimensions.length > 0 && (
                <div>
                  <h3 className="text-center font-bold text-lg tracking-widest mb-6">DIMENSIONS</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.dimensions.map((dim) => (
                      <div 
                        key={dim.id}
                        className="bg-white text-black py-2.5 px-4 rounded-full text-center text-xs font-bold tracking-widest hover:bg-gray-200 transition cursor-default"
                      >
                        {dim.size} x {dim.width} x {dim.thickness} {dim.volume ? `${dim.volume}` : ''}
                      </div>
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
