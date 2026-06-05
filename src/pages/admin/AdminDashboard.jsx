import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../../api/products';
import { adminService } from '../../api/admin';
import { authService } from '../../api/auth';
import { newReleaseService } from '../../api/newReleases';
import { featuredService } from '../../api/featured';
import { storeReviewService } from '../../api/storeReviews';
import { galleryService } from '../../api/gallery';
import { useNavigate } from 'react-router-dom';
import PigLoader from '../../components/PigLoader';

// ─── Product Form Modal ──────────────────────────────────────────────────────
function ProductFormModal({ open, onClose, product, categories, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    skillLevel: 'BEGINNER',
    waveLevels: ['SMALL'],
    videoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'GROMS'];
  const WAVE_LEVELS = ['SMALL', 'MEDIUM', 'BIG', 'WAVE_POOL'];

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId || product.category?.id || '',
        skillLevel: product.skillLevel || 'BEGINNER',
        waveLevels: Array.isArray(product.waveLevels) ? product.waveLevels : ['SMALL'],
        videoUrl: product.videoUrl || '',
      });
    } else {
      setForm({ name: '', description: '', categoryId: '', skillLevel: 'BEGINNER', waveLevels: ['SMALL'], videoUrl: '' });
    }
    setError('');
  }, [product, open]);

  const toggleWave = (wave) => {
    setForm((prev) => {
      const currentWaves = Array.isArray(prev.waveLevels) ? prev.waveLevels : [];
      return {
        ...prev,
        waveLevels: currentWaves.includes(wave)
          ? currentWaves.filter((w) => w !== wave)
          : [...currentWaves, wave],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const payload = { ...form };
    const selectedCategory = categories.find((c) => c.id === form.categoryId);
    const accessorySlugs = ['traction-pad', 'leash', 'fins', 'board-bag', 'sock'];
    const isAccessory = selectedCategory && accessorySlugs.includes(selectedCategory.slug);

    if (isAccessory) {
      payload.productType = 'ACCESSORY';
      delete payload.skillLevel;
      delete payload.waveLevels;
    } else {
      payload.productType = 'SURFBOARD';
      payload.waveLevels = (payload.waveLevels || []).filter(w => w !== 'WAVE_POOL');
      if (payload.waveLevels.length === 0) payload.waveLevels = ['SMALL'];
    }

    if (!payload.description) delete payload.description;

    try {
      if (isEdit) {
        const updatePayload = {
          ...payload,
          videoUrl: payload.videoUrl || null,
        };
        await productService.update(product.id, updatePayload);
      } else {
        const createPayload = { ...payload };
        delete createPayload.videoUrl;
        const res = await productService.create(createPayload);
        if (payload.videoUrl) {
          await productService.update(res.data.id, { videoUrl: payload.videoUrl });
        }
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Validation Error: Check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white mb-6">
            {isEdit ? 'EDIT PRODUCT' : 'ADD PRODUCT'}
          </h2>

          {error && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">YouTube Video URL</label>
              <input
                value={form.videoUrl}
                onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Category *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Skill Level *</label>
              <div className="flex gap-2 flex-wrap">
                {SKILL_LEVELS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setForm((p) => ({ ...p, skillLevel: s }))}
                    className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest transition ${
                      form.skillLevel === s ? 'bg-white text-black border-white' : 'border-gray-600 text-gray-400 hover:border-white hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Wave Levels *</label>
              <div className="flex gap-2 flex-wrap">
                {WAVE_LEVELS.map((w) => (
                  <button
                    type="button"
                    key={w}
                    onClick={() => toggleWave(w)}
                    className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest transition ${
                      form.waveLevels.includes(w) ? 'bg-accent-teal text-black border-accent-teal' : 'border-gray-600 text-gray-400 hover:border-white hover:text-white'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition"
              >
                CANCEL
              </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <PigLoader size="mini" text="SAVING..." /> : isEdit ? 'UPDATE' : 'CREATE'}
                </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Product Images Modal ─────────────────────────────────────────────────
const IMAGE_TYPES = ['DECK', 'BOTTOM', 'NOSE', 'FINS', 'RAIL'];

function ProductImagesModal({ open, onClose, product, onSaved }) {
  const [files, setFiles] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pinnedId, setPinnedId] = useState(null);

  useEffect(() => {
    setFiles([]);
    setTypes([]);
    setError('');
    if (product) {
      const primaryImg = product.images?.find((img) => img.isPrimary === true);
      setPinnedId(primaryImg ? primaryImg.id : null);
    }
  }, [open, product]);

  if (!open || !product) return null;

  // Determine which image is currently the main display
  const getEffectiveMainId = () => {
    if (pinnedId) {
      const found = product.images?.find(img => img.id === pinnedId);
      if (found) return found.id;
    }
    // Fall back to DECK non-logo
    const deck = product.images?.find(
      img => img.type === 'DECK' && !img.url.toLowerCase().includes('logo')
    );
    if (deck) return deck.id;
    // Any non-logo
    const any = product.images?.find(img => !img.url.toLowerCase().includes('logo'));
    if (any) return any.id;
    return product.images?.[0]?.id;
  };

  const mainId = getEffectiveMainId();

  const handleSetMain = async (imageId) => {
    setLoading(true);
    setError('');
    try {
      await productService.setPrimaryImage(product.id, imageId);
      setPinnedId(imageId);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set primary image.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setTypes(selected.map(() => 'DECK'));
  };

  const handleTypeChange = (idx, val) => {
    setTypes((prev) => prev.map((t, i) => (i === idx ? val : t)));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    types.forEach((t) => formData.append('types', t));
    try {
      await productService.uploadImages(product.id, formData);
      setFiles([]);
      setTypes([]);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload images.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    setLoading(true);
    setError('');
    try {
      await productService.deleteImage(product.id, imageId);
      // Clear pin if deleted image was pinned
      if (pinnedId === imageId) {
        setPinnedId(null);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto py-10"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">MANAGE IMAGES</h2>
              <p className="text-gray-500 text-xs tracking-widest mt-0.5">{product.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center">✕</button>
          </div>

          {/* Info banner */}
          <div className="mb-5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 tracking-wide">
            ★ = foto yang tampil di kartu produk. Klik <span className="text-accent-teal font-bold">JADIKAN UTAMA</span> untuk menggantinya.
          </div>

          {error && <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>}

          {/* Current images */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
              Foto Produk ({product.images?.length || 0})
            </h3>
            {product.images?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {product.images.map((img) => {
                  const isMain = img.id === mainId;
                  return (
                    <div
                      key={img.id}
                      className={`relative group w-32 h-32 rounded-lg overflow-hidden bg-[#111] border-2 transition-all ${
                        isMain ? 'border-accent-teal shadow-lg shadow-accent-teal/20' : 'border-gray-700'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.type}
                        className="w-full h-full object-cover group-hover:opacity-50 transition duration-300"
                      />

                      {/* Type badge */}
                      <div className="absolute top-1 left-1 flex gap-1">
                        <span className="text-[9px] font-bold bg-black/80 text-accent-teal px-1.5 py-0.5 rounded tracking-wider">
                          {img.type}
                        </span>
                        {isMain && (
                          <span className="text-[9px] font-bold bg-accent-teal text-black px-1.5 py-0.5 rounded tracking-wider">
                            ★ UTAMA
                          </span>
                        )}
                      </div>

                      {/* Hover actions */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        {!isMain && (
                          <button
                            type="button"
                            onClick={() => handleSetMain(img.id)}
                            className="px-2 py-1 bg-accent-teal text-black rounded-full text-[9px] font-black tracking-widest hover:bg-accent-teal/80 transition"
                          >
                            JADIKAN UTAMA
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(img.id)}
                          disabled={loading}
                          className="px-2 py-1 bg-red-500/80 text-white rounded-full text-[9px] font-black tracking-widest hover:bg-red-600 transition disabled:opacity-50"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-xs">Belum ada foto.</p>
            )}
          </div>

          {/* Upload new images */}
          <div className="border border-gray-700 rounded-xl p-5 bg-[#222]">
            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Upload Foto Baru</h3>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
              />
              {files.length > 0 && (
                <div className="flex flex-col gap-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-300 flex-1 truncate">{file.name}</span>
                      <select
                        value={types[idx] || 'DECK'}
                        onChange={(e) => handleTypeChange(idx, e.target.value)}
                        className="bg-[#333] border border-gray-600 rounded px-2 py-1 text-xs text-white focus:border-accent-teal transition"
                      >
                        {IMAGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="submit"
                disabled={files.length === 0 || loading}
                className="py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50"
              >
                {loading ? <PigLoader size="mini" text="UPLOADING..." /> : `UPLOAD ${files.length > 0 ? `(${files.length} FILE${files.length > 1 ? 'S' : ''})` : ''}`}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


// ─── Product Dimensions Modal ───────────────────────────────────────────────
function ProductDimensionsModal({ open, onClose, productSlug, onSaved }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ size: '', width: '', thickness: '', volume: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && productSlug) {
      loadProduct();
    } else {
      setProduct(null);
      setForm({ size: '', width: '', thickness: '', volume: '' });
      setError('');
    }
  }, [open, productSlug]);

  const loadProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productService.getBySlug(productSlug);
      setProduct(res.data);
    } catch (err) {
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    setError('');
    try {
      await productService.addDimension(product.id, form);
      setForm({ size: '', width: '', thickness: '', volume: '' });
      await loadProduct();
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add dimension.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dimensionId) => {
    if (!window.confirm('Delete this dimension?')) return;
    setLoading(true);
    setError('');
    try {
      await productService.deleteDimension(product.id, dimensionId);
      await loadProduct();
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete dimension.');
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto py-10"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">MANAGE DIMENSIONS</h2>
              <p className="text-gray-500 text-xs tracking-widest mt-0.5">{product?.name || 'Loading...'}</p>
            </div>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center">✕</button>
          </div>

          {error && <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>}

          {/* Current dimensions */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
              Existing Dimensions ({product?.dimensions?.length || 0})
            </h3>
            {loading && !product ? (
              <div className="text-center py-4"><PigLoader size="mini" text="Loading..." /></div>
            ) : product?.dimensions?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.dimensions.map((dim) => (
                  <div key={dim.id} className="flex justify-between items-center bg-[#222] border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300">
                    <span>{dim.size} x {dim.width} x {dim.thickness} {dim.volume ? `${dim.volume}` : ''}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(dim.id)}
                      disabled={loading}
                      className="text-red-400 hover:text-red-300 transition text-xs font-bold ml-2 shrink-0 disabled:opacity-50"
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-xs">Belum ada dimensi.</p>
            )}
          </div>

          {/* Add new dimension */}
          <div className="border border-gray-700 rounded-xl p-5 bg-[#222]">
            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Add New Dimension</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase block mb-1">Size *</label>
                  <input required placeholder="5'8&quot;" value={form.size} onChange={e => setForm(p => ({...p, size: e.target.value}))} className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-teal transition" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase block mb-1">Width *</label>
                  <input required placeholder="20 1/2&quot;" value={form.width} onChange={e => setForm(p => ({...p, width: e.target.value}))} className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-teal transition" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase block mb-1">Thickness *</label>
                  <input required placeholder="2 3/8&quot;" value={form.thickness} onChange={e => setForm(p => ({...p, thickness: e.target.value}))} className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-teal transition" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase block mb-1">Volume</label>
                  <input placeholder="32.00 L" value={form.volume} onChange={e => setForm(p => ({...p, volume: e.target.value}))} className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-teal transition" />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting || !product}
                className="py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50 w-full sm:w-auto self-end mt-2 px-8 flex items-center justify-center"
              >
                {submitting ? <PigLoader size="mini" text="ADDING..." /> : 'ADD DIMENSION'}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


// ─── Products Table ──────────────────────────────────────────────────────────
function ProductsTable({ categories }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imagesModalOpen, setImagesModalOpen] = useState(false);
  const [dimensionsModalOpen, setDimensionsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ limit: 100 });
      setProducts(res.data?.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await productService.delete(id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCategoryName = (p) => p.category?.name || categories.find((c) => c.id === p.categoryId)?.name || '—';

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">PRODUCTS</h2>
        <button
          onClick={() => { setEditProduct(null); setModalOpen(true); }}
          className="px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest hover:bg-gray-200 transition"
        >
          + ADD PRODUCT
        </button>
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editProduct}
        categories={categories}
        onSaved={load}
      />

      <ProductImagesModal
        open={imagesModalOpen}
        onClose={() => setImagesModalOpen(false)}
        product={editProduct}
        onSaved={load}
      />

      <ProductDimensionsModal
        open={dimensionsModalOpen}
        onClose={() => setDimensionsModalOpen(false)}
        productSlug={editProduct?.slug}
        onSaved={load}
      />

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <h3 className="font-oswald text-xl font-bold text-white mb-2">DELETE PRODUCT?</h3>
              <p className="text-gray-400 text-sm mb-6">This action cannot be undone. All associated images will be deleted from Cloudinary.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition">
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-xs font-bold tracking-widest hover:bg-red-600 transition disabled:opacity-50"
                >
                  {deleteLoading ? 'DELETING...' : 'DELETE'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto min-h-0 mb-8 rounded-xl border border-white/5 custom-scrollbar">
        {loading ? (
          <div className="py-16 flex justify-center">
            <PigLoader size="mini" text="Loading products..." />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">No products found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase shadow-md">
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Skill</th>
                <th className="px-4 py-3 text-left">Waves</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id} className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? 'bg-[#1c1c1c]' : 'bg-[#1a1a1a]'}`}>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 bg-[#333] rounded overflow-hidden flex items-center justify-center">
                      {p.images?.[0]?.url ? (
                        <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-white tracking-wide">{p.name}</td>
                  <td className="px-4 py-3 text-gray-400">{getCategoryName(p)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold tracking-widest text-gray-300">{p.skillLevel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(p.waveLevels || []).map((w) => (
                        <span key={w} className="px-2 py-0.5 rounded-full bg-accent-teal/20 text-accent-teal text-[9px] font-bold tracking-widest">{w}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setEditProduct(p); setImagesModalOpen(true); }}
                        className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest text-white hover:bg-white/20 transition"
                      >
                        IMAGES
                      </button>
                      <button
                        onClick={() => { setEditProduct(p); setDimensionsModalOpen(true); }}
                        className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest text-white hover:bg-white/20 transition"
                      >
                        DIMENSIONS
                      </button>
                      <button
                        onClick={() => { setEditProduct(p); setModalOpen(true); }}
                        className="px-3 py-1 border border-gray-600 rounded-full text-[10px] font-bold tracking-widest text-gray-300 hover:border-white hover:text-white transition"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p.id)}
                        className="px-3 py-1 border border-red-500/40 rounded-full text-[10px] font-bold tracking-widest text-red-400 hover:bg-red-500/10 transition"
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── New Release Form Modal ──────────────────────────────────────────────────
function NewReleaseFormModal({ open, onClose, release, onSaved, products }) {
  const isEdit = !!release;
  const [form, setForm] = useState({
    title: '',
    description: '',
    productId: '',
    isActive: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (release) {
      setForm({
        title: release.title || '',
        description: release.description || '',
        productId: release.productId || release.product?.id || '',
        isActive: release.isActive || false,
      });
    } else {
      setForm({ title: '', description: '', productId: '', isActive: false });
    }
    setError('');
  }, [release, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = { ...form };
    if (!payload.productId) delete payload.productId;

    try {
      if (isEdit) {
        await newReleaseService.update(release.id, payload);
      } else {
        await newReleaseService.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save New Release.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white mb-6">
            {isEdit ? 'EDIT RELEASE' : 'ADD RELEASE'}
          </h2>
          {error && <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Title *</label>
              <input
                required value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent-teal transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Description *</label>
              <textarea
                required rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent-teal transition resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Featured Product</label>
              <select
                value={form.productId} onChange={(e) => setForm(p => ({ ...p, productId: e.target.value }))}
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent-teal transition"
              >
                <option value="">Select a product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox" id="isActive" checked={form.isActive}
                onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-700 bg-[#222] text-accent-teal"
              />
              <label htmlFor="isActive" className="text-xs font-bold text-gray-400 tracking-widest uppercase cursor-pointer">
                Set as Active Release
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition">CANCEL</button>
              <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50">
                {loading ? <PigLoader size="mini" text="SAVING..." /> : isEdit ? 'UPDATE' : 'CREATE'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── New Release Media Modal ─────────────────────────────────────────────────
function NewReleaseMediaModal({ open, onClose, release, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    setVideoFile(null);
    setImageFiles([]);
    setError('');
  }, [open]);

  if (!open || !release) return null;

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    if (!videoFile) return;
    setLoading(true); setError('');
    const formData = new FormData();
    formData.append('video', videoFile);
    try {
      await newReleaseService.uploadVideo(release.id, formData);
      setVideoFile(null);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload video.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) return;
    setLoading(true); setError('');
    const formData = new FormData();
    Array.from(imageFiles).forEach(file => formData.append('images', file));
    try {
      await newReleaseService.uploadImages(release.id, formData);
      setImageFiles([]);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload images.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    setLoading(true); setError('');
    try {
      await newReleaseService.deleteImage(release.id, imageId);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto py-10"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">MANAGE MEDIA: {release.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white font-bold">X</button>
          </div>
          {error && <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>}
          
          <div className="space-y-8">
            {/* Video Section */}
            <div className="border border-gray-700 rounded-xl p-5 bg-[#222]">
              <h3 className="text-sm font-bold text-gray-300 tracking-widest uppercase mb-4">Background Video</h3>
              {release.videoUrl ? (
                <div className="mb-4 rounded overflow-hidden border border-gray-600 bg-black max-h-48 flex justify-center">
                  <video src={release.videoUrl} controls className="h-48 object-contain" />
                </div>
              ) : (
                <p className="text-xs text-gray-500 mb-4">No video uploaded yet.</p>
              )}
              <form onSubmit={handleUploadVideo} className="flex items-center gap-3">
                <input
                  type="file" accept="video/mp4,video/webm,video/quicktime"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="flex-1 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
                />
                <button type="submit" disabled={!videoFile || loading} className="px-4 py-2 bg-accent-teal text-black rounded-full text-xs font-bold tracking-widest hover:bg-accent-teal/80 transition disabled:opacity-50">
                  UPLOAD VIDEO
                </button>
              </form>
            </div>

            {/* Images Section */}
            <div className="border border-gray-700 rounded-xl p-5 bg-[#222]">
              <h3 className="text-sm font-bold text-gray-300 tracking-widest uppercase mb-4">Marketing Images (Max 2)</h3>
              {release.images?.length > 0 ? (
                <div className="flex gap-4 mb-4">
                  {release.images.map(img => (
                    <div key={img.id} className="relative w-32 h-32 border border-gray-600 rounded bg-black group overflow-hidden">
                      <img src={img.url} alt="Release" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition" />
                      <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-500 font-bold tracking-widest text-xs transition">
                        DELETE
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mb-4">No images uploaded yet.</p>
              )}
              {release.images?.length < 2 && (
                <form onSubmit={handleUploadImages} className="flex items-center gap-3">
                  <input
                    type="file" accept="image/*" multiple
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="flex-1 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
                  />
                  <button type="submit" disabled={imageFiles.length === 0 || loading} className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50">
                    UPLOAD IMAGES
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── New Releases Table ──────────────────────────────────────────────────────
function NewReleasesTable() {
  const [releases, setReleases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [editRelease, setEditRelease] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [res, prodRes] = await Promise.all([
        newReleaseService.getAll(),
        productService.getAll({ limit: 100 })
      ]);
      setReleases(res.data || []);
      setProducts(prodRes.data?.products || []);
    } catch {
      setReleases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await newReleaseService.delete(id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete release.');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await newReleaseService.toggleActive(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle active status.');
    }
  };

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">NEW RELEASES</h2>
        <button
          onClick={() => { setEditRelease(null); setModalOpen(true); }}
          className="px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest hover:bg-gray-200 transition"
        >
          + ADD RELEASE
        </button>
      </div>

      <NewReleaseFormModal open={modalOpen} onClose={() => setModalOpen(false)} release={editRelease} onSaved={load} products={products} />
      <NewReleaseMediaModal open={mediaModalOpen} onClose={() => setMediaModalOpen(false)} release={editRelease} onSaved={load} />

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center">
              <h3 className="font-oswald text-xl font-bold text-white mb-2">DELETE RELEASE?</h3>
              <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition">CANCEL</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-xs font-bold tracking-widest hover:bg-red-600 transition">DELETE</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto min-h-0 mb-8 rounded-xl border border-white/5 custom-scrollbar">
        {loading ? (
          <div className="py-16 flex justify-center">
            <PigLoader size="mini" text="Loading releases..." />
          </div>
        ) : releases.length === 0 ? (
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">No new releases found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase shadow-md">
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Media</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((r, idx) => (
                <tr key={r.id} className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? 'bg-[#1c1c1c]' : 'bg-[#1a1a1a]'}`}>
                  <td className="px-4 py-3 font-bold text-white tracking-wide">{r.title}</td>
                  <td className="px-4 py-3 text-gray-400">{r.product?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleActive(r.id)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest transition ${r.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-600 hover:bg-gray-700/50'}`}>
                      {r.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {r.videoUrl && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[9px] font-bold">VIDEO</span>}
                      {r.images?.length > 0 && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-[9px] font-bold">{r.images.length} IMAGES</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setEditRelease(r); setMediaModalOpen(true); }} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest text-white hover:bg-white/20 transition">MEDIA</button>
                      <button onClick={() => { setEditRelease(r); setModalOpen(true); }} className="px-3 py-1 border border-gray-600 rounded-full text-[10px] font-bold tracking-widest text-gray-300 hover:border-white hover:text-white transition">EDIT</button>
                      <button onClick={() => setDeleteConfirm(r.id)} className="px-3 py-1 border border-red-500/40 rounded-full text-[10px] font-bold tracking-widest text-red-400 hover:bg-red-500/10 transition">DELETE</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Featured Sections Table ──────────────────────────────────────────────────
function FeaturedSectionsTable() {
  const [sections, setSections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit-products modal
  const [editSection, setEditSection] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [secRes, prodRes] = await Promise.all([
        featuredService.getAll(),
        productService.getAll({ limit: 200 }),
      ]);
      setSections(secRes.data || []);
      setAllProducts(prodRes.data?.products || []);
    } catch {
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleActive = async (id) => {
    setActionLoading(true);
    try {
      await featuredService.toggleActive(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle active status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await featuredService.delete(id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete section.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      await featuredService.create({ title: newTitle });
      setNewTitle('');
      setCreateModalOpen(false);
      load();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create section.');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditProducts = (section) => {
    setEditSection(section);
    const currentIds = (section.products || []).map((p) => p.productId ?? p.product?.id ?? p.id);
    setSelectedProductIds(currentIds);
    setEditError('');
  };

  const toggleProductSelection = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSaveProducts = async () => {
    if (selectedProductIds.length === 0) {
      setEditError('Please select at least 1 product.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      await featuredService.setProducts(editSection.id, selectedProductIds);
      setEditSection(null);
      load();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to save products.');
    } finally {
      setEditLoading(false);
    }
  };

  // Surfboard-only products for selection
  const surfboardProducts = allProducts.filter(
    (p) => p.isActive !== false
  );

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">FEATURED SECTIONS</h2>
          <p className="text-gray-500 text-[10px] tracking-widest mt-0.5">Pilih produk yang tampil di halaman Home</p>
        </div>
        <button
          onClick={() => { setNewTitle(''); setCreateError(''); setCreateModalOpen(true); }}
          className="px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest hover:bg-gray-200 transition"
        >
          + ADD SECTION
        </button>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
            onClick={() => setCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-oswald text-2xl font-bold tracking-widest text-white mb-6">CREATE FEATURED SECTION</h2>
              {createError && <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{createError}</div>}
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Section Title *</label>
                  <input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Summer Picks 2026"
                    className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition"
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setCreateModalOpen(false)} className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition">CANCEL</button>
                  <button type="submit" disabled={createLoading} className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50">
                    {createLoading ? 'CREATING...' : 'CREATE'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Products Modal */}
      <AnimatePresence>
        {editSection && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 py-10 overflow-y-auto"
            onClick={() => setEditSection(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">PILIH PRODUK</h2>
                  <p className="text-gray-500 text-xs tracking-widest mt-0.5">{editSection.title}</p>
                </div>
                <button onClick={() => setEditSection(null)} className="text-gray-400 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center">✕</button>
              </div>

              <div className="mb-4 px-3 py-2 bg-accent-teal/5 border border-accent-teal/20 rounded-lg text-[10px] text-gray-400 tracking-wide">
                ✓ Centang produk yang ingin ditampilkan di halaman Home. Urutan pilihan menentukan urutan tampilan.
              </div>

              {editError && <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{editError}</div>}

              <div className="max-h-[420px] overflow-y-auto custom-scrollbar rounded-xl border border-white/5 mb-5">
                {surfboardProducts.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm">No products available.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase">
                        <th className="px-4 py-3 text-left w-10">✓</th>
                        <th className="px-4 py-3 text-left">Image</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Skill</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surfboardProducts.map((p, idx) => {
                        const isSelected = selectedProductIds.includes(p.id);
                        const selectionOrder = selectedProductIds.indexOf(p.id);
                        return (
                          <tr
                            key={p.id}
                            onClick={() => toggleProductSelection(p.id)}
                            className={`border-t border-white/5 cursor-pointer transition ${
                              isSelected
                                ? 'bg-accent-teal/10 hover:bg-accent-teal/15'
                                : idx % 2 === 0 ? 'bg-[#1c1c1c] hover:bg-white/5' : 'bg-[#1a1a1a] hover:bg-white/5'
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border text-[10px] font-black transition ${
                                isSelected ? 'bg-accent-teal border-accent-teal text-black' : 'border-gray-600 text-transparent'
                              }`}>
                                {isSelected ? selectionOrder + 1 : '✓'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="w-10 h-10 bg-[#333] rounded overflow-hidden flex items-center justify-center">
                                {p.images?.[0]?.url ? (
                                  <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-gray-600 text-[9px]">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-white tracking-wide">{p.name}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{p.category?.name || '—'}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold tracking-widest text-gray-300">
                                {p.skillLevel || '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 tracking-widest">
                  {selectedProductIds.length} produk dipilih
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setEditSection(null)} className="px-6 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition">CANCEL</button>
                  <button
                    onClick={handleSaveProducts}
                    disabled={editLoading || selectedProductIds.length === 0}
                    className="px-6 py-2.5 bg-accent-teal text-black rounded-full text-xs font-bold tracking-widest hover:bg-accent-teal/80 transition disabled:opacity-50"
                  >
                    {editLoading ? 'SAVING...' : 'SAVE PRODUCTS'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center">
              <h3 className="font-oswald text-xl font-bold text-white mb-2">DELETE SECTION?</h3>
              <p className="text-gray-400 text-sm mb-6">All featured product entries will be removed. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition">CANCEL</button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={actionLoading} className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-xs font-bold tracking-widest hover:bg-red-600 transition disabled:opacity-50">
                  {actionLoading ? 'DELETING...' : 'DELETE'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto min-h-0 mb-8 rounded-xl border border-white/5 custom-scrollbar">
        {loading ? (
          <div className="py-16 flex justify-center">
            <PigLoader size="mini" text="Loading sections..." />
          </div>
        ) : sections.length === 0 ? (
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">No featured sections yet. Create one to get started.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase shadow-md">
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Products</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s, idx) => (
                <tr key={s.id} className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? 'bg-[#1c1c1c]' : 'bg-[#1a1a1a]'}`}>
                  <td className="px-4 py-3 font-bold text-white tracking-wide">{s.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(s.products || []).slice(0, 3).map((entry) => {
                        const prod = entry.product ?? entry;
                        return (
                          <span key={entry.id ?? prod.id} className="px-2 py-0.5 bg-white/10 text-gray-300 rounded-full text-[9px] font-bold tracking-widest">
                            {prod.name}
                          </span>
                        );
                      })}
                      {(s.products || []).length > 3 && (
                        <span className="px-2 py-0.5 bg-white/5 text-gray-500 rounded-full text-[9px] font-bold tracking-widest">
                          +{(s.products || []).length - 3} more
                        </span>
                      )}
                      {(s.products || []).length === 0 && (
                        <span className="text-gray-600 text-[9px] italic">No products</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(s.id)}
                      disabled={actionLoading}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest transition border ${
                        s.isActive
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-600 hover:bg-gray-700/50'
                      }`}
                    >
                      {s.isActive ? '● ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(s.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditProducts(s)}
                        className="px-3 py-1 bg-accent-teal/20 border border-accent-teal/30 rounded-full text-[10px] font-bold tracking-widest text-accent-teal hover:bg-accent-teal/30 transition"
                      >
                        SET PRODUCTS
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(s.id)}
                        className="px-3 py-1 border border-red-500/40 rounded-full text-[10px] font-bold tracking-widest text-red-400 hover:bg-red-500/10 transition"
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getDashboard();
        setStats(res.data);
      } catch { setStats(null); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = stats ? [
    { label: 'Total Products', value: stats.totalProducts, color: 'text-accent-teal' },
    { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-400' },
    { label: 'Custom Orders', value: stats.totalCustomOrders, color: 'text-purple-400' },
    { label: 'Pending Orders', value: stats.pendingCustomOrders, color: 'text-yellow-400' },
    { label: 'Total Riders', value: stats.totalRiders, color: 'text-pink-400' },
    { label: 'Total Reviews', value: stats.totalReviews, color: 'text-green-400' },
    { label: 'Avg Rating', value: stats.averageRating?.toFixed(1), color: 'text-orange-400' },
  ] : [];

  return (
    <div className="flex flex-col h-full p-8 pb-0 overflow-y-auto">
      <h2 className="font-oswald text-2xl font-bold tracking-widest text-white mb-6">DASHBOARD OVERVIEW</h2>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(7).fill(null).map((_, i) => (
            <div key={i} className="bg-[#222] rounded-xl p-6 animate-pulse h-28" />
          ))}
        </div>
      ) : !stats ? (
        <p className="text-gray-500 tracking-widest text-sm">Failed to load stats.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#222] rounded-xl p-6 border border-white/5 hover:border-white/10 transition"
            >
              <p className="text-gray-500 text-[10px] tracking-widest uppercase mb-2">{card.label}</p>
              <p className={`font-oswald text-4xl font-bold ${card.color}`}>{card.value ?? '—'}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Store Reviews Table ──────────────────────────────────────────────────
function ReviewsTable() {
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState({ avgRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await storeReviewService.getAll({ limit: 100 });
      setReviews(res.data?.reviews || []);
      setMeta({
        avgRating: res.data?.avgRating ?? 0,
        totalReviews: res.data?.totalReviews ?? 0,
      });
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await storeReviewService.delete(id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">STORE REVIEWS</h2>
          {meta.totalReviews > 0 && (
            <p className="text-gray-500 text-[10px] tracking-widest mt-0.5">
              {meta.totalReviews} reviews • avg {meta.avgRating.toFixed(1)} ★
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <h3 className="font-oswald text-xl font-bold text-white mb-2">DELETE REVIEW?</h3>
              <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition">
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-xs font-bold tracking-widest hover:bg-red-600 transition disabled:opacity-50"
                >
                  {deleteLoading ? 'DELETING...' : 'DELETE'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto min-h-0 mb-8 rounded-xl border border-white/5 custom-scrollbar">
        {loading ? (
          <div className="py-16 flex justify-center">
            <PigLoader size="mini" text="Loading reviews..." />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">No store reviews yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase shadow-md">
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left w-1/3">Comment</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, idx) => (
                <tr key={r.id} className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? 'bg-[#1c1c1c]' : 'bg-[#1a1a1a]'}`}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold text-white text-sm">{r.user?.name || '—'}</p>
                      <p className="text-gray-500 text-[10px]">{r.user?.email || ''}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-accent-teal">{renderStars(r.rating)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs italic">
                    {r.comment ? `"${r.comment}"` : <span className="text-gray-600">No comment</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => setDeleteConfirm(r.id)}
                        className="px-3 py-1 border border-red-500/40 rounded-full text-[10px] font-bold tracking-widest text-red-400 hover:bg-red-500/10 transition"
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Gallery Management ──────────────────────────────────────────────────────
function GalleryTable() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // For upload
  const [files, setFiles] = useState([]);
  // For edit
  const [caption, setCaption] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await galleryService.getAll({ limit: 100 });
      setGalleries(res.data?.data?.galleries || []);
    } catch {
      setGalleries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length) return;
    setActionLoading(true);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    try {
      await galleryService.upload(formData);
      setUploadOpen(false);
      setFiles([]);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCaption = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await galleryService.updateCaption(editItem.id, { caption: caption || null });
      setEditItem(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update caption');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await galleryService.delete(id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete image');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">GALLERY</h2>
        <button
          onClick={() => setUploadOpen(true)}
          className="px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest hover:bg-gray-200 transition"
        >
          + UPLOAD PHOTOS
        </button>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg">
              <h3 className="font-oswald text-xl font-bold text-white mb-4">UPLOAD PHOTOS</h3>
              <form onSubmit={handleUpload} className="flex flex-col gap-4">
                <input
                  type="file" multiple accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFiles(e.target.files)}
                  className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
                />
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setUploadOpen(false)} className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition">CANCEL</button>
                  <button type="submit" disabled={!files.length || actionLoading} className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50">
                    {actionLoading ? 'UPLOADING...' : 'UPLOAD'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Caption Modal */}
      <AnimatePresence>
        {editItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg">
              <h3 className="font-oswald text-xl font-bold text-white mb-4">EDIT CAPTION</h3>
              <form onSubmit={handleUpdateCaption} className="flex flex-col gap-4">
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Enter caption..."
                  className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent-teal transition resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setEditItem(null)} className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition">CANCEL</button>
                  <button type="submit" disabled={actionLoading} className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50">
                    {actionLoading ? 'SAVING...' : 'SAVE'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-8 max-w-sm text-center">
              <h3 className="font-oswald text-xl font-bold text-white mb-2">DELETE PHOTO?</h3>
              <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition">CANCEL</button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={actionLoading} className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-xs font-bold tracking-widest hover:bg-red-600 transition disabled:opacity-50">
                  {actionLoading ? 'DELETING...' : 'DELETE'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto min-h-0 mb-8 rounded-xl border border-white/5 custom-scrollbar">
        {loading ? (
          <div className="py-16 flex justify-center">
            <PigLoader size="mini" text="Loading gallery..." />
          </div>
        ) : galleries.length === 0 ? (
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">No photos in gallery.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase shadow-md">
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Caption</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {galleries.map((img, idx) => (
                <tr key={img.id} className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? 'bg-[#1c1c1c]' : 'bg-[#1a1a1a]'}`}>
                  <td className="px-4 py-3">
                    <div className="w-16 h-16 bg-[#333] rounded overflow-hidden">
                      <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 italic text-xs">
                    {img.caption || 'No caption'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(img.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setEditItem(img); setCaption(img.caption || ''); }}
                        className="px-3 py-1 border border-gray-600 rounded-full text-[10px] font-bold tracking-widest text-gray-300 hover:border-white hover:text-white transition"
                      >
                        EDIT CAPTION
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(img.id)}
                        className="px-3 py-1 border border-red-500/40 rounded-full text-[10px] font-bold tracking-widest text-red-400 hover:bg-red-500/10 transition"
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'products', label: 'Products' },
  { id: 'new-releases', label: 'New Releases' },
  { id: 'featured', label: 'Featured Sections' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'gallery', label: 'Gallery' },
];

export default function AdminDashboard() {
  const [active, setActive] = useState('overview');
  const [categories, setCategories] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await productService.getCategories();
        setCategories(res.data || []);
      } catch {}
    };
    load();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="h-screen bg-[#111] flex font-poppins text-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-[#0d0d0d] border-r border-white/5 flex flex-col h-full shrink-0"
      >
        {/* Brand */}
        <div className="px-6 py-8 border-b border-white/5 shrink-0">
          <p className="font-oswald text-xl font-bold tracking-[0.2em] text-accent-teal">FREEPIG</p>
          <p className="text-[10px] text-gray-500 tracking-widest mt-0.5">ADMIN PANEL</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 flex flex-col gap-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200 ${
                active === item.id
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="px-6 py-6 border-t border-white/5 shrink-0">
          <p className="text-xs text-gray-400 tracking-wide mb-1">{user.name || 'Admin'}</p>
          <p className="text-[10px] text-gray-600 tracking-widest mb-4">{user.email || ''}</p>
          <button
            onClick={handleLogout}
            className="w-full py-2 border border-gray-700 rounded-full text-[10px] font-bold tracking-widest text-gray-400 hover:border-white hover:text-white transition"
          >
            LOGOUT
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col"
          >
            {active === 'overview' && <DashboardOverview />}
            {active === 'products' && <ProductsTable categories={categories} />}
            {active === 'new-releases' && <NewReleasesTable />}
            {active === 'featured' && <FeaturedSectionsTable />}
            {active === 'reviews' && <ReviewsTable />}
            {active === 'gallery' && <GalleryTable />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
