import useDocumentTitle from '../../hooks/useDocumentTitle';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import headingImg from '../../assets/Heading.webp';
import { productService } from '../../api/products';
import { getDisplayImage } from '../../utils/productImage';

const skillLevels = ['ADVANCED', 'INTERMEDIATE', 'BEGINNER', 'GROMS'];
const waveTypes = ['SMALL', 'MEDIUM', 'BIG'];
const waveLabelMap = { SMALL: 'SMALL WAVES', MEDIUM: 'MEDIUM WAVES', BIG: 'BIG WAVES' };

import PigLoader from '../../components/PigLoader';

export default function Store() {
  useDocumentTitle('Store | FreePigMovement');
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return tab && ['SURFBOARD', 'ACCESSORIES'].includes(tab.toUpperCase()) ? tab.toUpperCase() : 'SURFBOARD';
  });
  const [activeSkill, setActiveSkill] = useState(() => {
    const filter = searchParams.get('filter');
    return filter && skillLevels.includes(filter.toUpperCase()) ? filter.toUpperCase() : null;
  });
  const [activeWave, setActiveWave] = useState(() => {
    const filter = searchParams.get('filter');
    return filter && ['SMALL WAVES', 'MEDIUM WAVES', 'BIG WAVES'].includes(filter.toUpperCase()) 
      ? filter.toUpperCase().replace(' WAVES', '') 
      : null;
  });
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load categories for accessories tab
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await productService.getCategories();
        setCategories(res.data || []);
      } catch (err) {
        // ignore
      }
    };
    loadCategories();
  }, []);

  // Pre-select filter from URL params
  useEffect(() => {
    const filter = searchParams.get('filter');
    const tab = searchParams.get('tab');
    if (tab && ['SURFBOARD', 'ACCESSORIES'].includes(tab.toUpperCase())) {
      setActiveTab(tab.toUpperCase());
    }
    if (filter) {
      const upperFilter = filter.toUpperCase();
      if (skillLevels.includes(upperFilter)) {
        setActiveSkill(upperFilter);
      } else if (['SMALL WAVES', 'MEDIUM WAVES', 'BIG WAVES'].includes(upperFilter)) {
        const waveKey = upperFilter.replace(' WAVES', '');
        setActiveWave(waveKey);
      }
    }
  }, [searchParams]);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async (signal) => {
    setIsLoading(true);
    try {
      const params = { limit: 50 };
      if (activeSkill) params.skillLevel = activeSkill;
      if (activeWave) params.waveLevel = activeWave;
      if (activeTab === 'ACCESSORIES' && activeCategory) params.categoryId = activeCategory;
      params.productType = activeTab === 'ACCESSORIES' ? 'ACCESSORY' : 'SURFBOARD';
      const res = await productService.getAll(params, { signal });
      setProducts(res.data?.products || []);
      setIsLoading(false);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.message !== 'canceled') {
        setProducts([]);
        setIsLoading(false);
      }
    }
  }, [activeTab, activeSkill, activeWave, activeCategory]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  const handleSkillClick = (skill) => {
    setActiveSkill((prev) => (prev === skill ? null : skill));
    setActiveWave(null);
  };

  const handleWaveClick = (wave) => {
    setActiveWave((prev) => (prev === wave ? null : wave));
    setActiveSkill(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveSkill(null);
    setActiveWave(null);
    setActiveCategory(null);
  };

  const getProductImage = (product) => getDisplayImage(product);

  const getProductCategory = (product) => {
    return product.category?.name || product.skillLevel || 'SURFBOARD';
  };

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
          {activeTab}
        </motion.h1>
      </div>

      {/* ── FILTER + TOGGLE BAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 mt-6 sm:mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 pb-5 border-b border-[#333]"
        >
          {/* Filters (Left Side) */}
          <div className="flex-1 w-full overflow-hidden">
            {activeTab === 'SURFBOARD' && (
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full">
                  <span className="text-[10px] font-black tracking-[0.25em] text-gray-500 uppercase shrink-0">SKILL LEVEL</span>
                  <div className="flex gap-2 flex-nowrap md:flex-wrap overflow-x-auto pb-2 md:pb-0 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {skillLevels.map((skill) => (
                      <button
                        key={skill}
                        id={`filter-skill-${skill.toLowerCase()}`}
                        onClick={() => handleSkillClick(skill)}
                        className={`min-h-[44px] shrink-0 flex items-center justify-center px-5 py-2 rounded-full border text-[10px] font-black tracking-widest transition-all duration-300 ${
                          activeSkill === skill
                            ? 'bg-white text-black border-white shadow-lg'
                            : 'border-[#555] text-gray-400 hover:border-white hover:text-white'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full">
                  <span className="text-[10px] font-black tracking-[0.25em] text-gray-500 uppercase shrink-0">WAVES</span>
                  <div className="flex gap-2 flex-nowrap md:flex-wrap overflow-x-auto pb-2 md:pb-0 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {waveTypes.map((wave) => (
                      <button
                        key={wave}
                        id={`filter-wave-${wave.toLowerCase()}`}
                        onClick={() => handleWaveClick(wave)}
                        className={`min-h-[44px] shrink-0 flex items-center justify-center px-5 py-2 rounded-full border text-[10px] font-black tracking-widest transition-all duration-300 ${
                          activeWave === wave
                            ? 'bg-white text-black border-white shadow-lg'
                            : 'border-[#555] text-gray-400 hover:border-white hover:text-white'
                        }`}
                      >
                        {waveLabelMap[wave]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ACCESSORIES' && categories.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full">
                <span className="text-[10px] font-black tracking-[0.25em] text-gray-500 uppercase shrink-0">CATEGORY</span>
                <div className="flex gap-2 flex-nowrap md:flex-wrap overflow-x-auto pb-2 md:pb-0 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {categories
                    .filter((cat) => ['traction-pad', 'leash', 'fins', 'board-bag', 'sock'].includes(cat.slug))
                    .map((cat) => (
                      <button
                        key={cat.id}
                        id={`filter-cat-${cat.slug}`}
                        onClick={() => setActiveCategory((prev) => (prev === cat.id ? null : cat.id))}
                        className={`min-h-[44px] shrink-0 flex items-center justify-center px-5 py-2 rounded-full border text-[10px] font-black tracking-widest transition-all duration-300 ${
                          activeCategory === cat.id
                            ? 'bg-white text-black border-white shadow-lg'
                            : 'border-[#555] text-gray-400 hover:border-white hover:text-white'
                        }`}
                      >
                        {cat.name.toUpperCase()}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab toggle (Right Side) */}
          <div className="flex gap-2 shrink-0 self-start lg:self-auto w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {['SURFBOARD', 'ACCESSORIES'].map((tab) => (
              <button
                key={tab}
                id={`tab-${tab.toLowerCase()}`}
                onClick={() => handleTabChange(tab)}
                className={`min-h-[44px] shrink-0 flex items-center justify-center px-6 py-2.5 rounded-full border text-[10px] font-black tracking-widest transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'border-[#555] text-gray-400 hover:border-white hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Active filter badge */}
        {(activeSkill || activeWave || activeCategory) && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mt-4 mb-2">
            <span className="text-[10px] text-gray-500 tracking-widest uppercase">Showing:</span>
            <span className="text-[10px] font-bold tracking-widest bg-white/10 border border-white/20 px-3 py-1 rounded-full text-white">
              {activeSkill || (activeWave ? waveLabelMap[activeWave] : '') || categories.find((c) => c.id === activeCategory)?.name?.toUpperCase()}
            </span>
            <button
              onClick={() => { setActiveSkill(null); setActiveWave(null); setActiveCategory(null); }}
              className="text-[10px] text-gray-500 hover:text-white tracking-widest transition underline"
            >
              Clear
            </button>
          </motion.div>
        )}

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <div className="flex justify-center items-center py-8">
                <PigLoader />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="flex flex-col cursor-wait">
                    <div className="bg-[#2a2a2a] animate-pulse aspect-[3/4] w-full"></div>
                    <div className="bg-[#3a3a3a] px-4 py-4 flex flex-col gap-2">
                      <div className="bg-[#555] animate-pulse h-2 w-1/3 rounded"></div>
                      <div className="bg-[#666] animate-pulse h-4 w-2/3 rounded mt-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeTab}-${activeSkill}-${activeWave}-${activeCategory}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8"
            >
              {products.length === 0 ? (
                <div className="col-span-4 py-24 text-center text-gray-500 tracking-widest text-sm">
                  No products found for this filter.
                </div>
              ) : (
                products.map((product, idx) => (
                  <Link key={product.id} to={`/product/${product.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.04 }}
                      className="flex flex-col cursor-pointer group"
                    >
                      <div className="bg-white overflow-hidden aspect-[3/4]">
                        <img loading="lazy"
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="bg-[#3a3a3a] px-4 py-3">
                        <p className="text-[9px] text-gray-400 tracking-[0.18em] uppercase mb-0.5 font-semibold">
                          {getProductCategory(product)}
                        </p>
                        <p className="font-oswald text-sm font-bold tracking-wider uppercase text-white group-hover:text-accent-teal transition duration-300">
                          {product.name}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
