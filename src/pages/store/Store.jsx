import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import headingImg from '../../assets/Heading.png';
import { productService } from '../../api/products';
import { getDisplayImage } from '../../utils/productImage';

const skillLevels = ['ADVANCED', 'INTERMEDIATE', 'BEGINNER', 'GROMS'];
const waveTypes = ['SMALL', 'MEDIUM', 'BIG'];
const waveLabelMap = { SMALL: 'SMALL WAVES', MEDIUM: 'MEDIUM WAVES', BIG: 'BIG WAVES' };

export default function Store() {
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
          className="relative z-10 font-oswald text-7xl md:text-[96px] font-black tracking-[0.1em] uppercase text-white drop-shadow-2xl"
        >
          {activeTab}
        </motion.h1>
      </div>

      {/* ── FILTER + TOGGLE BAR ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#333]"
        >
          {/* Surfboard filters */}
          {activeTab === 'SURFBOARD' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-black tracking-[0.25em] text-gray-500 uppercase w-24 shrink-0">SKILL LEVEL</span>
                <div className="flex gap-2 flex-wrap">
                  {skillLevels.map((skill) => (
                    <button
                      key={skill}
                      id={`filter-skill-${skill.toLowerCase()}`}
                      onClick={() => handleSkillClick(skill)}
                      className={`px-4 py-1.5 rounded-full border text-[10px] font-black tracking-widest transition-all duration-300 ${
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
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-black tracking-[0.25em] text-gray-500 uppercase w-24 shrink-0">WAVES</span>
                <div className="flex gap-2 flex-wrap">
                  {waveTypes.map((wave) => (
                    <button
                      key={wave}
                      id={`filter-wave-${wave.toLowerCase()}`}
                      onClick={() => handleWaveClick(wave)}
                      className={`px-4 py-1.5 rounded-full border text-[10px] font-black tracking-widest transition-all duration-300 ${
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

          {/* Accessories filter */}
          {activeTab === 'ACCESSORIES' && categories.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-black tracking-[0.25em] text-gray-500 uppercase w-24 shrink-0">CATEGORY</span>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    id={`filter-cat-${cat.slug}`}
                    onClick={() => setActiveCategory((prev) => (prev === cat.id ? null : cat.id))}
                    className={`px-4 py-1.5 rounded-full border text-[10px] font-black tracking-widest transition-all duration-300 ${
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

          {/* Tab toggle */}
          <div className="flex gap-2 shrink-0">
            {['SURFBOARD', 'ACCESSORIES'].map((tab) => (
              <button
                key={tab}
                id={`tab-${tab.toLowerCase()}`}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-2.5 rounded-full border text-[10px] font-black tracking-widest transition-all duration-300 ${
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
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {Array(8).fill(null).map((_, i) => (
                <div key={i} className="flex flex-col animate-pulse">
                  <div className="bg-[#333] aspect-[3/4]" />
                  <div className="bg-[#3a3a3a] px-4 py-3 h-14" />
                </div>
              ))}
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
                      <div className="bg-white flex justify-center items-center overflow-hidden aspect-[3/4] p-4">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="h-full w-auto object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-lg"
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
