import React, { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  RadialBarChart, RadialBar,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiPieChart,
  FiLayers,
  FiTag,
  FiStar,
  FiLayout,
  FiMessageSquare,
  FiImage,
  FiHeart,
  FiUsers,
  FiVideo,
  FiDatabase,
  FiFileText,
} from "react-icons/fi";
import { productService } from "../../api/products";
import { adminService } from "../../api/admin";
import { authService } from "../../api/auth";
import { newReleaseService } from "../../api/newReleases";
import { featuredService } from "../../api/featured";
import { storeReviewService } from "../../api/storeReviews";
import { galleryService } from "../../api/gallery";
import { testimonialsService } from "../../api/testimonials";
import { riderService } from "../../api/riders";
import { heroService } from "../../api/hero";
import { wallMagazineService } from "../../api/wallMagazine";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PigLoader from "../../components/PigLoader";
import AdminSidebar from "../../components/AdminSidebar";
import ConfirmationModal from "../../components/ConfirmationModal";
import DashboardOverview from "./components/DashboardOverview";

// ─── Product Form Modal ──────────────────────────────────────────────────────
function ProductFormModal({ open, onClose, product, categories, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: "",
    description: "",
    skillLevel: "BEGINNER",
    waveLevels: ["SMALL"],
    videoUrl: "",
    images: [],
    dimensions: [{ size: "", width: "", thickness: "", volume: "" }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
  const WAVE_LEVELS = ["SMALL", "MEDIUM", "BIG", "WAVE_POOL"];

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        skillLevel: product.skillLevel || "BEGINNER",
        waveLevels: Array.isArray(product.waveLevels)
          ? product.waveLevels
          : ["SMALL"],
        videoUrl: product.videoUrl || "",
        waveHeightMin: product.waveHeightMin !== undefined ? product.waveHeightMin : 1,
        waveHeightMax: product.waveHeightMax !== undefined ? product.waveHeightMax : 10,
        images: [],
        dimensions: [{ size: "", width: "", thickness: "", volume: "" }],
      });
    } else {
      setForm({
        name: "",
        description: "",
        skillLevel: "BEGINNER",
        waveLevels: ["SMALL"],
        videoUrl: "",
        waveHeightMin: 1,
        waveHeightMax: 10,
        images: [],
        dimensions: [{ size: "", width: "", thickness: "", volume: "" }],
      });
    }
    setError("");
  }, [product, open]);

  const toggleWave = (wave) => {
    setForm((prev) => {
      const currentWaves = Array.isArray(prev.waveLevels)
        ? prev.waveLevels
        : [];
      return {
        ...prev,
        waveLevels: currentWaves.includes(wave)
          ? currentWaves.filter((w) => w !== wave)
          : [...currentWaves, wave],
      };
    });
  };

  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, images: selected }));
  };

  const handleDimensionChange = (idx, field, value) => {
    setForm((prev) => {
      const newDims = [...prev.dimensions];
      newDims[idx][field] = value;
      return { ...prev, dimensions: newDims };
    });
  };

  const addDimensionRow = () => {
    setForm((prev) => ({
      ...prev,
      dimensions: [
        ...prev.dimensions,
        { size: "", width: "", thickness: "", volume: "" },
      ],
    }));
  };

  const removeDimensionRow = (idx) => {
    setForm((prev) => ({
      ...prev,
      dimensions: prev.dimensions.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const surfboardCategory = (categories || []).find(
      (c) =>
        !["traction-pad", "leash", "fins", "board-bag", "sock"].includes(
          c.slug,
        ),
    );

    const productPayload = {
      name: form.name,
      description: form.description || undefined,
      skillLevel: form.skillLevel,
      waveLevels: form.waveLevels.filter((w) => w !== "WAVE_POOL"),
      waveHeightMin: form.waveHeightMin,
      waveHeightMax: form.waveHeightMax,
      categoryId: surfboardCategory ? surfboardCategory.id : undefined,
      productType: "SURFBOARD",
    };
    if (productPayload.waveLevels.length === 0)
      productPayload.waveLevels = ["SMALL"];

    try {
      if (isEdit) {
        await productService.update(product.id, {
          ...productPayload,
          videoUrl: form.videoUrl || null,
        });
        toast.success("Product updated successfully");
        onSaved();
        onClose();
        return;
      }

      // ── SINGLE BUSINESS PROCESS CREATE ──

      // 1. Create Product
      const res = await productService.create(productPayload);
      const productId = res.data.id;

      if (form.videoUrl) {
        await productService.update(productId, { videoUrl: form.videoUrl });
      }

      // 2. Upload Images
      if (form.images && form.images.length > 0) {
        const formData = new FormData();
        form.images.forEach((file) => formData.append("images", file));
        form.images.forEach(() => formData.append("types", "DECK")); // Default to DECK
        await productService.uploadImages(productId, formData);
      }

      // 3. Create Dimensions
      const validDimensions = form.dimensions.filter(
        (d) => d.size && d.width && d.thickness,
      );
      if (validDimensions.length > 0) {
        await Promise.all(
          validDimensions.map((d) =>
            productService.addDimension(productId, {
              size: d.size,
              width: d.width,
              thickness: d.thickness,
              volume: d.volume || undefined,
            }),
          ),
        );
      }

      toast.success("Product created successfully");

      // Reset form & close
      setForm({
        name: "",
        description: "",
        skillLevel: "BEGINNER",
        waveLevels: ["SMALL"],
        videoUrl: "",
        waveHeightMin: 1,
        waveHeightMax: 10,
        images: [],
        dimensions: [{ size: "", width: "", thickness: "", volume: "" }],
      });
      onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Process failed.";
      toast.error(msg);
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto py-10"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white mb-6">
            {isEdit ? "EDIT SURFBOARD" : "ADD SURFBOARD"}
          </h2>

          {error && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                  Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                  YouTube Video URL
                </label>
                <input
                  value={form.videoUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, videoUrl: e.target.value }))
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                  Skill Level *
                </label>
                <div className="flex gap-2 flex-wrap">
                  {SKILL_LEVELS.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setForm((p) => ({ ...p, skillLevel: s }))}
                      className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest transition ${
                        form.skillLevel === s
                          ? "bg-white text-black border-white"
                          : "border-gray-600 text-gray-400 hover:border-white hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                  Wave Levels *
                </label>
                <div className="flex gap-2 flex-wrap">
                  {WAVE_LEVELS.map((w) => (
                    <button
                      type="button"
                      key={w}
                      onClick={() => toggleWave(w)}
                      className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest transition ${
                        form.waveLevels.includes(w)
                          ? "bg-accent-teal text-black border-accent-teal"
                          : "border-gray-600 text-gray-400 hover:border-white hover:text-white"
                      }`}
                    >
                      {w.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                  Wave Height (Feet) *
                </label>
                <div className="flex gap-4 items-center mt-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">
                      Min Height: {form.waveHeightMin} ft
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={form.waveHeightMin}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          waveHeightMin: Number(e.target.value),
                          // Ensure max is not less than min
                          waveHeightMax: Math.max(Number(e.target.value), p.waveHeightMax)
                        }))
                      }
                      className="w-full accent-accent-teal"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">
                      Max Height: {form.waveHeightMax} ft
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={form.waveHeightMax}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          waveHeightMax: Number(e.target.value),
                          // Ensure min is not greater than max
                          waveHeightMin: Math.min(Number(e.target.value), p.waveHeightMin)
                        }))
                      }
                      className="w-full accent-accent-teal"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images & Dimensions (CREATE ONLY) */}
            {!isEdit && (
              <div className="border border-gray-700 rounded-xl p-5 bg-[#222] mt-2 flex flex-col gap-6">
                {/* Images */}
                <div>
                  <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-2">
                    Upload Images
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
                  />
                  {form.images.length > 0 && (
                    <p className="text-[10px] text-gray-500 mt-2 tracking-widest">
                      {form.images.length} files selected
                    </p>
                  )}
                </div>

                {/* Dimensions */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-0">
                      Dimensions
                    </label>
                    <button
                      type="button"
                      onClick={addDimensionRow}
                      className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest text-white hover:bg-white/20 transition"
                    >
                      + ADD ROW
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {form.dimensions.map((d, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          placeholder="Size *"
                          value={d.size}
                          onChange={(e) =>
                            handleDimensionChange(idx, "size", e.target.value)
                          }
                          className="w-1/4 bg-[#1a1a1a] border border-gray-600 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-accent-teal transition"
                        />
                        <input
                          placeholder="Width *"
                          value={d.width}
                          onChange={(e) =>
                            handleDimensionChange(idx, "width", e.target.value)
                          }
                          className="w-1/4 bg-[#1a1a1a] border border-gray-600 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-accent-teal transition"
                        />
                        <input
                          placeholder="Thickness *"
                          value={d.thickness}
                          onChange={(e) =>
                            handleDimensionChange(
                              idx,
                              "thickness",
                              e.target.value,
                            )
                          }
                          className="w-1/4 bg-[#1a1a1a] border border-gray-600 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-accent-teal transition"
                        />
                        <input
                          placeholder="Volume"
                          value={d.volume}
                          onChange={(e) =>
                            handleDimensionChange(idx, "volume", e.target.value)
                          }
                          className="w-1/4 bg-[#1a1a1a] border border-gray-600 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-accent-teal transition"
                        />
                        {form.dimensions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDimensionRow(idx)}
                            className="text-red-400 hover:text-red-300 font-bold px-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <PigLoader size="mini" text="CREATING..." />
                ) : isEdit ? (
                  "UPDATE PRODUCT"
                ) : (
                  "CREATE PRODUCT"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Product Images Modal ─────────────────────────────────────────────────
const IMAGE_TYPES = ["DECK", "BOTTOM", "NOSE", "FINS", "RAIL"];

function ProductImagesModal({ open, onClose, product, onSaved }) {
  const [files, setFiles] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pinnedId, setPinnedId] = useState(null);
  const [imageToDelete, setImageToDelete] = useState(null);

  useEffect(() => {
    setFiles([]);
    setTypes([]);
    setError("");
    if (product) {
      const primaryImg = product.images?.find((img) => img.isPrimary === true);
      setPinnedId(primaryImg ? primaryImg.id : null);
    }
  }, [open, product]);

  if (!open || !product) return null;

  // Determine which image is currently the main display
  const getEffectiveMainId = () => {
    if (pinnedId) {
      const found = product.images?.find((img) => img.id === pinnedId);
      if (found) return found.id;
    }
    // Fall back to DECK non-logo
    const deck = product.images?.find(
      (img) => img.type === "DECK" && !img.url.toLowerCase().includes("logo"),
    );
    if (deck) return deck.id;
    // Any non-logo
    const any = product.images?.find(
      (img) => !img.url.toLowerCase().includes("logo"),
    );
    if (any) return any.id;
    return product.images?.[0]?.id;
  };

  const mainId = getEffectiveMainId();

  const handleSetMain = async (imageId) => {
    setLoading(true);
    setError("");
    try {
      await productService.setPrimaryImage(product.id, imageId);
      setPinnedId(imageId);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set primary image.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    const defaultType = product.productType === "ACCESSORY" ? "GENERAL" : "DECK";
    setTypes(selected.map(() => defaultType));
  };

  const handleTypeChange = (idx, val) => {
    setTypes((prev) => prev.map((t, i) => (i === idx ? val : t)));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    types.forEach((t) => formData.append("types", t));
    try {
      await productService.uploadImages(product.id, formData);
      setFiles([]);
      setTypes([]);
      toast.success("Images uploaded successfully!");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload images.");
      setError(err.response?.data?.message || "Failed to upload images.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (imageId) => {
    setImageToDelete(imageId);
  };

  const doDeleteImage = async () => {
    if (!imageToDelete) return;
    setLoading(true);
    setError("");
    try {
      await productService.deleteImage(product.id, imageToDelete);
      // Clear pin if deleted image was pinned
      if (pinnedId === imageToDelete) {
        setPinnedId(null);
      }
      toast.success("Image deleted.");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete image.");
      setError(err.response?.data?.message || "Failed to delete image.");
    } finally {
      setLoading(false);
      setImageToDelete(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto py-10"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">
                MANAGE IMAGES
              </h2>
              <p className="text-gray-500 text-xs tracking-widest mt-0.5">
                {product.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Info banner */}
          <div className="mb-5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 tracking-wide">
            ★ = the image shown on the product card. Click{" "}
            <span className="text-accent-teal font-bold">SET AS MAIN</span>{" "}
            to change it.
          </div>

          {error && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Current images */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
              Product Images ({product.images?.length || 0})
            </h3>
            {product.images?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {product.images.map((img) => {
                  const isMain = img.id === mainId;
                  return (
                    <div
                      key={img.id}
                      className={`relative group w-32 h-32 rounded-lg overflow-hidden bg-[#111] border-2 transition-all ${
                        isMain
                          ? "border-accent-teal shadow-lg shadow-accent-teal/20"
                          : "border-gray-700"
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
                            ★ MAIN
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
                            SET AS MAIN
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
              <p className="text-gray-600 text-xs">No images yet.</p>
            )}
          </div>

          {/* Upload new images */}
          <div className="border border-gray-700 rounded-xl p-5 bg-[#222]">
            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">
              Upload New Images
            </h3>
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
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-3 py-2"
                    >
                      <span className="text-xs text-gray-300 flex-1 truncate">
                        {file.name}
                      </span>
                      {product.productType !== "ACCESSORY" && (
                        <select
                          value={types[idx] || "DECK"}
                          onChange={(e) => handleTypeChange(idx, e.target.value)}
                          className="bg-[#333] border border-gray-600 rounded px-2 py-1 text-xs text-white focus:border-accent-teal transition"
                        >
                          {IMAGE_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button
                type="submit"
                disabled={files.length === 0 || loading}
                className="py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50"
              >
                {loading ? (
                  <PigLoader size="mini" text="UPLOADING..." />
                ) : (
                  `UPLOAD ${files.length > 0 ? `(${files.length} FILE${files.length > 1 ? "S" : ""})` : ""}`
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
      <ConfirmationModal
        isOpen={!!imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={doDeleteImage}
        title="DELETE IMAGE?"
        message="Are you sure you want to delete this image? This action cannot be undone."
        loading={loading}
        loadingText="DELETING..."
      />
    </AnimatePresence>
  );
}

// ─── Product Dimensions Modal ───────────────────────────────────────────────
function ProductDimensionsModal({ open, onClose, productSlug, onSaved }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forms, setForms] = useState([
    { size: "", width: "", thickness: "", volume: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [dimensionToDelete, setDimensionToDelete] = useState(null);

  useEffect(() => {
    if (open && productSlug) {
      loadProduct();
    } else {
      setProduct(null);
      setForms([{ size: "", width: "", thickness: "", volume: "" }]);
      setError("");
    }
  }, [open, productSlug]);

  const loadProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await productService.getBySlug(productSlug);
      setProduct(res.data);
    } catch (err) {
      setError("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    setForms((prev) => [
      ...prev,
      { size: "", width: "", thickness: "", volume: "" },
    ]);
  };

  const handleRemoveRow = (idx) => {
    setForms((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (idx, field, value) => {
    setForms((prev) => {
      const newForms = [...prev];
      newForms[idx][field] = value;
      return newForms;
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!product || forms.length === 0) return;
    setSubmitting(true);
    setError("");
    try {
      await Promise.all(
        forms.map((f) => productService.addDimension(product.id, f)),
      );
      setForms([{ size: "", width: "", thickness: "", volume: "" }]);
      await loadProduct();
      toast.success("Dimensions saved successfully!");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add dimensions.");
      setError(err.response?.data?.message || "Failed to add dimensions.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (dimensionId) => {
    setDimensionToDelete(dimensionId);
  };

  const doDeleteDimension = async () => {
    if (!dimensionToDelete) return;
    setLoading(true);
    setError("");
    try {
      await productService.deleteDimension(product.id, dimensionToDelete);
      await loadProduct();
      toast.success("Dimension deleted.");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete dimension.");
      setError(err.response?.data?.message || "Failed to delete dimension.");
    } finally {
      setLoading(false);
      setDimensionToDelete(null);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto py-10"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">
                MANAGE DIMENSIONS
              </h2>
              <p className="text-gray-500 text-xs tracking-widest mt-0.5">
                {product?.name || "Loading..."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Current dimensions */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
              Existing Dimensions ({product?.dimensions?.length || 0})
            </h3>
            {loading && !product ? (
              <div className="text-center py-4">
                <PigLoader size="mini" text="Loading..." />
              </div>
            ) : product?.dimensions?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.dimensions.map((dim) => (
                  <div
                    key={dim.id}
                    className="flex justify-between items-center bg-[#222] border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300"
                  >
                    <span>
                      {dim.size} x {dim.width} x {dim.thickness}{" "}
                      {dim.volume ? `${dim.volume}` : ""}
                    </span>
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
              <p className="text-gray-600 text-xs">No dimensions yet.</p>
            )}
          </div>

          {/* Add new dimension */}
          <div className="border border-gray-700 rounded-xl p-5 bg-[#222]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                Add New Dimensions
              </h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest text-white hover:bg-white/20 transition"
              >
                + ADD ROW
              </button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {forms.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-center bg-[#2a2a2a] p-2 rounded-lg border border-gray-700"
                  >
                    <input
                      required
                      placeholder="Size *"
                      value={f.size}
                      onChange={(e) =>
                        handleChange(idx, "size", e.target.value)
                      }
                      className="w-1/4 bg-[#1a1a1a] border border-gray-600 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-accent-teal transition"
                    />
                    <input
                      required
                      placeholder="Width *"
                      value={f.width}
                      onChange={(e) =>
                        handleChange(idx, "width", e.target.value)
                      }
                      className="w-1/4 bg-[#1a1a1a] border border-gray-600 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-accent-teal transition"
                    />
                    <input
                      required
                      placeholder="Thickness *"
                      value={f.thickness}
                      onChange={(e) =>
                        handleChange(idx, "thickness", e.target.value)
                      }
                      className="w-1/4 bg-[#1a1a1a] border border-gray-600 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-accent-teal transition"
                    />
                    <input
                      placeholder="Volume"
                      value={f.volume}
                      onChange={(e) =>
                        handleChange(idx, "volume", e.target.value)
                      }
                      className="w-1/4 bg-[#1a1a1a] border border-gray-600 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-accent-teal transition"
                    />
                    {forms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="text-red-400 hover:text-red-300 font-bold px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="submit"
                disabled={submitting || !product || forms.length === 0}
                className="py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50 w-full sm:w-auto self-end mt-2 px-8 flex items-center justify-center"
              >
                {submitting ? (
                  <PigLoader size="mini" text="ADDING..." />
                ) : (
                  `SAVE ${forms.length > 1 ? forms.length + " " : ""}DIMENSIONS`
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
      <ConfirmationModal
        isOpen={!!dimensionToDelete}
        onClose={() => setDimensionToDelete(null)}
        onConfirm={doDeleteDimension}
        title="DELETE DIMENSION?"
        message="Are you sure you want to delete this dimension? This action cannot be undone."
        loading={loading}
        loadingText="DELETING..."
      />
    </AnimatePresence>
  );
}

// ─── Products Table ──────────────────────────────────────────────────────────
// ─── Table Pagination ────────────────────────────────────────────────────────
function TablePagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  if (totalItems === 0) return null;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between mt-4 shrink-0 border-t border-white/5 pt-4">
      <div className="text-[10px] text-gray-500 tracking-widest uppercase hidden sm:block">
        Showing <span className="text-white font-bold">{startItem}</span> to <span className="text-white font-bold">{endItem}</span> of <span className="text-white font-bold">{totalItems}</span> entries
      </div>
      <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1 w-full sm:w-auto justify-between sm:justify-end">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-md bg-[#1a1a1a] border border-white/5 text-gray-400 text-[10px] font-bold tracking-widest hover:bg-white/10 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          PREV
        </button>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            if (
              totalPages > 7 &&
              page !== 1 &&
              page !== totalPages &&
              Math.abs(currentPage - page) > 1
            ) {
              if (page === 2 || page === totalPages - 1) {
                return <span key={page} className="px-1 py-1.5 text-gray-500 text-[10px]">...</span>;
              }
              return null;
            }
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-md text-[10px] font-bold transition border ${
                  currentPage === page
                    ? "bg-accent-teal/20 text-accent-teal border-accent-teal/30"
                    : "bg-[#1a1a1a] text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1.5 rounded-md bg-[#1a1a1a] border border-white/5 text-gray-400 text-[10px] font-bold tracking-widest hover:bg-white/10 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          NEXT
        </button>
      </div>
    </div>
  );
}

function ProductsTable({ categories }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [imagesModalOpen, setImagesModalOpen] = useState(false);
  const [dimensionsModalOpen, setDimensionsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({
        limit: 100,
        productType: "SURFBOARD",
      });
      setProducts(res.data?.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await productService.delete(id);
      setDeleteConfirm(null);
      toast.success("Product deleted successfully.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCategoryName = (p) =>
    p.category?.name ||
    categories.find((c) => c.id === p.categoryId)?.name ||
    "—";

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <h2 className="font-oswald text-2xl font-bold tracking-widest text-white shrink-0">
          SURFBOARDS
        </h2>

        {/* Search Bar — center */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search surfboards..."
              className="w-full bg-[#2a2a2a] border border-gray-700 rounded-full pl-9 pr-4 py-2 text-white text-xs tracking-wide placeholder-gray-600 focus:outline-none focus:border-gray-500 transition"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setEditProduct(null);
            setModalOpen(true);
          }}
          className="shrink-0 px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest hover:bg-gray-200 transition"
        >
          + ADD SURFBOARD
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <h3 className="font-oswald text-xl font-bold text-white mb-2">
                DELETE SURFBOARD?
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                This action cannot be undone. All associated images will be
                deleted from Cloudinary.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-xs font-bold tracking-widest hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <PigLoader size="mini" text="DELETING..." />
                  ) : (
                    "DELETE"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto min-h-0 mb-2 rounded-xl border border-white/5 custom-scrollbar">
        {loading ? (
          <div className="py-16 flex justify-center">
            <PigLoader size="mini" text="Loading products..." />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">
            {search ? `No surfboards match "${search}"` : "No products found."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase shadow-md">
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Skill</th>
                <th className="px-4 py-3 text-left">Waves</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((p, idx) => (
                <tr
                  key={p.id}
                  className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? "bg-[#1c1c1c]" : "bg-[#1a1a1a]"}`}
                >
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 bg-[#333] rounded overflow-hidden flex items-center justify-center">
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-white tracking-wide">
                    {p.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold tracking-widest text-gray-300">
                      {p.skillLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(p.waveLevels || []).map((w) => (
                        <span
                          key={w}
                          className="px-2 py-0.5 rounded-full bg-accent-teal/20 text-accent-teal text-[9px] font-bold tracking-widest"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest ${p.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                    >
                      {p.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === p.id ? null : p.id,
                            )
                          }
                          className="px-3 py-1 border border-gray-600 rounded-full text-[10px] font-bold tracking-widest text-gray-300 hover:border-white hover:text-white transition flex items-center gap-1"
                        >
                          EDIT <span className="text-[8px]">▼</span>
                        </button>
                        <AnimatePresence>
                          {openDropdownId === p.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-2 w-32 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl py-1 z-50 flex flex-col"
                            >
                              <button
                                onClick={() => {
                                  setEditProduct(p);
                                  setModalOpen(true);
                                  setOpenDropdownId(null);
                                }}
                                className="px-4 py-2 text-left text-[10px] font-bold tracking-widest text-gray-300 hover:bg-white/10 hover:text-white transition"
                              >
                                EDIT DETAILS
                              </button>
                              <button
                                onClick={() => {
                                  setEditProduct(p);
                                  setImagesModalOpen(true);
                                  setOpenDropdownId(null);
                                }}
                                className="px-4 py-2 text-left text-[10px] font-bold tracking-widest text-gray-300 hover:bg-white/10 hover:text-white transition"
                              >
                                IMAGES
                              </button>
                              <button
                                onClick={() => {
                                  setEditProduct(p);
                                  setDimensionsModalOpen(true);
                                  setOpenDropdownId(null);
                                }}
                                className="px-4 py-2 text-left text-[10px] font-bold tracking-widest text-gray-300 hover:bg-white/10 hover:text-white transition"
                              >
                                DIMENSIONS
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
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
      <TablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredProducts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

// ─── Accessory Form Modal ───────────────────────────────────────────────────
function AccessoryFormModal({ open, onClose, accessory, categories, onSaved }) {
  const isEdit = !!accessory;
  const accessoryCategories = (categories || []).filter((c) =>
    ["traction-pad", "leash", "fins", "board-bag", "sock"].includes(c.slug),
  );

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (accessory) {
      setForm({
        name: accessory.name || "",
        description: accessory.description || "",
        categoryId: accessory.categoryId || accessory.category?.id || (accessoryCategories[0]?.id || ""),
      });
    } else {
      setForm({ 
        name: "", 
        description: "", 
        categoryId: accessoryCategories[0]?.id || "" 
      });
    }
    setError("");
  }, [accessory, open, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.categoryId) {
      setError("Please select a category.");
      setLoading(false);
      return;
    }

    const payload = { ...form };
    payload.productType = "ACCESSORY";
    if (!payload.description) delete payload.description;

    try {
      if (isEdit) {
        await productService.update(accessory.id, payload);
      } else {
        await productService.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Validation Error: Check your inputs.",
      );
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
            {isEdit ? "EDIT ACCESSORY" : "ADD ACCESSORY"}
          </h2>

          {error && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                Category *
              </label>
              <select
                required
                value={form.categoryId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, categoryId: e.target.value }))
                }
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition appearance-none"
              >
                <option value="" disabled>Select a category</option>
                {accessoryCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition resize-none"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <PigLoader size="mini" text="SAVING..." />
                ) : isEdit ? (
                  "UPDATE"
                ) : (
                  "CREATE"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Accessories Table ──────────────────────────────────────────────────────
function AccessoriesTable({ categories }) {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [imagesModalOpen, setImagesModalOpen] = useState(false);
  const [editAccessory, setEditAccessory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredAccessories = accessories.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredAccessories.length / itemsPerPage);
  const currentAccessories = filteredAccessories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({
        limit: 100,
        productType: "ACCESSORY",
      });
      setAccessories(res.data?.products || []);
    } catch {
      setAccessories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await productService.delete(id);
      setDeleteConfirm(null);
      toast.success("Accessory deleted successfully.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete accessory.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCategoryName = (p) =>
    p.category?.name ||
    categories.find((c) => c.id === p.categoryId)?.name ||
    "—";

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <h2 className="font-oswald text-2xl font-bold tracking-widest text-white shrink-0">
          ACCESSORIES
        </h2>

        {/* Search Bar — center */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accessories..."
              className="w-full bg-[#2a2a2a] border border-gray-700 rounded-full pl-9 pr-4 py-2 text-white text-xs tracking-wide placeholder-gray-600 focus:outline-none focus:border-gray-500 transition"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setEditAccessory(null);
            setModalOpen(true);
          }}
          className="shrink-0 px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest hover:bg-gray-200 transition"
        >
          + ADD ACCESSORY
        </button>
      </div>

      <AccessoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        accessory={editAccessory}
        categories={categories}
        onSaved={load}
      />

      <ProductImagesModal
        open={imagesModalOpen}
        onClose={() => setImagesModalOpen(false)}
        product={editAccessory}
        onSaved={load}
      />

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <h3 className="font-oswald text-xl font-bold text-white mb-2">
                DELETE ACCESSORY?
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                This action cannot be undone. All associated images will be
                deleted from Cloudinary.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-xs font-bold tracking-widest hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <PigLoader size="mini" text="DELETING..." />
                  ) : (
                    "DELETE"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto min-h-0 mb-2 rounded-xl border border-white/5 custom-scrollbar">
        {loading ? (
          <div className="py-16 flex justify-center">
            <PigLoader size="mini" text="Loading accessories..." />
          </div>
        ) : filteredAccessories.length === 0 ? (
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">
            {search
              ? `No accessories match "${search}"`
              : "No accessories found."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase shadow-md">
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAccessories.map((p, idx) => (
                <tr
                  key={p.id}
                  className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? "bg-[#1c1c1c]" : "bg-[#1a1a1a]"}`}
                >
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 bg-[#333] rounded overflow-hidden flex items-center justify-center">
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-white tracking-wide">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {getCategoryName(p)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest ${p.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                    >
                      {p.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === p.id ? null : p.id,
                            )
                          }
                          className="px-3 py-1 border border-gray-600 rounded-full text-[10px] font-bold tracking-widest text-gray-300 hover:border-white hover:text-white transition flex items-center gap-1"
                        >
                          EDIT <span className="text-[8px]">▼</span>
                        </button>
                        <AnimatePresence>
                          {openDropdownId === p.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-2 w-32 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl py-1 z-50 flex flex-col"
                            >
                              <button
                                onClick={() => {
                                  setEditAccessory(p);
                                  setModalOpen(true);
                                  setOpenDropdownId(null);
                                }}
                                className="px-4 py-2 text-left text-[10px] font-bold tracking-widest text-gray-300 hover:bg-white/10 hover:text-white transition"
                              >
                                EDIT DETAILS
                              </button>
                              <button
                                onClick={() => {
                                  setEditAccessory(p);
                                  setImagesModalOpen(true);
                                  setOpenDropdownId(null);
                                }}
                                className="px-4 py-2 text-left text-[10px] font-bold tracking-widest text-gray-300 hover:bg-white/10 hover:text-white transition"
                              >
                                IMAGES
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
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
      <TablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredAccessories.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

// ─── New Release Form Modal ──────────────────────────────────────────────────
function NewReleaseFormModal({ open, onClose, release, onSaved, products }) {
  const isEdit = !!release;
  const [form, setForm] = useState({
    title: "",
    description: "",
    productId: "",
    isActive: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (release) {
      setForm({
        title: release.title || "",
        description: release.description || "",
        productId: release.productId || release.product?.id || "",
        isActive: release.isActive || false,
      });
    } else {
      setForm({ title: "", description: "", productId: "", isActive: false });
    }
    setError("");
  }, [release, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
      setError(err.response?.data?.message || "Failed to save New Release.");
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
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white mb-6">
            {isEdit ? "EDIT RELEASE" : "ADD RELEASE"}
          </h2>
          {error && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                Title *
              </label>
              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent-teal transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent-teal transition resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                Featured Product
              </label>
              <select
                value={form.productId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, productId: e.target.value }))
                }
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent-teal transition"
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
                className="w-4 h-4 rounded border-gray-700 bg-[#222] text-accent-teal"
              />
              <label
                htmlFor="isActive"
                className="text-xs font-bold text-gray-400 tracking-widest uppercase cursor-pointer"
              >
                Set as Active Release
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <PigLoader size="mini" text="SAVING..." />
                ) : isEdit ? (
                  "UPDATE"
                ) : (
                  "CREATE"
                )}
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
  const [error, setError] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [imageToDelete, setImageToDelete] = useState(null);

  useEffect(() => {
    setVideoFile(null);
    setImageFiles([]);
    setLogoFile(null);
    setError("");
  }, [open]);

  if (!open || !release) return null;

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    if (!videoFile) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("video", videoFile);
    try {
      await newReleaseService.uploadVideo(release.id, formData);
      setVideoFile(null);
      toast.success("Video uploaded successfully!");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload video.");
      setError(err.response?.data?.message || "Failed to upload video.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    Array.from(imageFiles).forEach((file) => formData.append("images", file));
    try {
      await newReleaseService.uploadImages(release.id, formData);
      setImageFiles([]);
      toast.success("Images uploaded successfully!");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload images.");
      setError(err.response?.data?.message || "Failed to upload images.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadLogo = async (e) => {
    e.preventDefault();
    if (!logoFile) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("logo", logoFile);
    try {
      await newReleaseService.uploadLogo(release.id, formData);
      setLogoFile(null);
      toast.success("Logo uploaded successfully!");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload logo.");
      setError(err.response?.data?.message || "Failed to upload logo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = (imageId) => {
    setImageToDelete(imageId);
  };

  const doDeleteImage = async () => {
    if (!imageToDelete) return;
    setLoading(true);
    setError("");
    try {
      await newReleaseService.deleteImage(release.id, imageToDelete);
      toast.success("Image deleted.");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete image.");
      setError(err.response?.data?.message || "Failed to delete image.");
    } finally {
      setLoading(false);
      setImageToDelete(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto py-10"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">
              MANAGE MEDIA: {release.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white font-bold"
            >
              X
            </button>
          </div>
          {error && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Video Section */}
            <div className="border border-gray-700 rounded-xl p-5 bg-[#222]">
              <h3 className="text-sm font-bold text-gray-300 tracking-widest uppercase mb-4">
                Background Video
              </h3>
              {release.videoUrl ? (
                <div className="mb-4 rounded overflow-hidden border border-gray-600 bg-black max-h-48 flex justify-center">
                  <video
                    src={release.videoUrl}
                    controls
                    className="h-48 object-contain"
                  />
                </div>
              ) : (
                <p className="text-xs text-gray-500 mb-4">
                  No video uploaded yet.
                </p>
              )}
              <form
                onSubmit={handleUploadVideo}
                className="flex items-center gap-3"
              >
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="flex-1 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
                />
                <button
                  type="submit"
                  disabled={!videoFile || loading}
                  className="px-4 py-2 bg-accent-teal text-black rounded-full text-xs font-bold tracking-widest hover:bg-accent-teal/80 transition disabled:opacity-50"
                >
                  UPLOAD VIDEO
                </button>
              </form>
            </div>

            {/* Logo Section */}
            <div className="border border-gray-700 rounded-xl p-5 bg-[#222]">
              <h3 className="text-sm font-bold text-gray-300 tracking-widest uppercase mb-4">
                Release Logo
              </h3>
              {release.logoUrl ? (
                <div className="mb-4 rounded overflow-hidden border border-gray-600 bg-black max-h-48 flex justify-center p-4 relative group">
                  <img
                    src={release.logoUrl}
                    alt="Release Logo"
                    className="h-32 object-contain"
                  />
                  {/* The API doesn't have a distinct delete logo route but uploading a new one replaces it. So no delete button is needed, or we just rely on uploading a new one. */}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mb-4">
                  No logo uploaded yet.
                </p>
              )}
              <form
                onSubmit={handleUploadLogo}
                className="flex items-center gap-3"
              >
                <input
                  type="file"
                  accept="image/png,image/webp"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="flex-1 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
                />
                <button
                  type="submit"
                  disabled={!logoFile || loading}
                  className="px-4 py-2 bg-accent-teal text-black rounded-full text-xs font-bold tracking-widest hover:bg-accent-teal/80 transition disabled:opacity-50"
                >
                  UPLOAD LOGO
                </button>
              </form>
            </div>

            {/* Images Section */}
            <div className="border border-gray-700 rounded-xl p-5 bg-[#222]">
              <h3 className="text-sm font-bold text-gray-300 tracking-widest uppercase mb-4">
                Marketing Images (Max 2)
              </h3>
              {release.images?.length > 0 ? (
                <div className="flex gap-4 mb-4">
                  {release.images.map((img) => (
                    <div
                      key={img.id}
                      className="relative w-32 h-32 border border-gray-600 rounded bg-black group overflow-hidden"
                    >
                      <img
                        src={img.url}
                        alt="Release"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-500 font-bold tracking-widest text-xs transition"
                      >
                        DELETE
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mb-4">
                  No images uploaded yet.
                </p>
              )}
              {release.images?.length < 2 && (
                <form
                  onSubmit={handleUploadImages}
                  className="flex items-center gap-3"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="flex-1 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
                  />
                  <button
                    type="submit"
                    disabled={imageFiles.length === 0 || loading}
                    className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    UPLOAD IMAGES
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
      <ConfirmationModal
        isOpen={!!imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={doDeleteImage}
        title="DELETE IMAGE?"
        message="Are you sure you want to delete this image? This action cannot be undone."
        loading={loading}
        loadingText="DELETING..."
      />
    </AnimatePresence>
  );
}

// ─── New Releases Table ──────────────────────────────────────────────────────
function NewReleasesTable() {
  const [releases, setReleases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [editRelease, setEditRelease] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [res, prodRes] = await Promise.all([
        newReleaseService.getAll(),
        productService.getAll({ limit: 100 }),
      ]);
      setReleases(res.data || []);
      setProducts(prodRes.data?.products || []);
    } catch {
      setReleases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await newReleaseService.delete(id);
      setDeleteConfirm(null);
      toast.success("Release deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete release.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await newReleaseService.toggleActive(id);
      toast.success("Status updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle active status.");
    }
  };

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">
          NEW RELEASES
        </h2>
        <button
          onClick={() => {
            setEditRelease(null);
            setModalOpen(true);
          }}
          className="px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest hover:bg-gray-200 transition"
        >
          + ADD RELEASE
        </button>
      </div>

      <NewReleaseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        release={editRelease}
        onSaved={load}
        products={products}
      />
      <NewReleaseMediaModal
        open={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        release={editRelease}
        onSaved={load}
      />

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <h3 className="font-oswald text-xl font-bold text-white mb-2">
                DELETE RELEASE?
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-xs font-bold tracking-widest hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <PigLoader size="mini" text="DELETING..." />
                  ) : (
                    "DELETE"
                  )}
                </button>
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
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">
            No new releases found.
          </div>
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
                <tr
                  key={r.id}
                  className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? "bg-[#1c1c1c]" : "bg-[#1a1a1a]"}`}
                >
                  <td className="px-4 py-3 font-bold text-white tracking-wide">
                    {r.title}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {r.product?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(r.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest transition ${r.isActive ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gray-500/20 text-gray-400 border border-gray-600 hover:bg-gray-700/50"}`}
                    >
                      {r.isActive ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {r.videoUrl && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[9px] font-bold">
                          VIDEO
                        </span>
                      )}
                      {r.images?.length > 0 && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-[9px] font-bold">
                          {r.images.length} IMAGES
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditRelease(r);
                          setMediaModalOpen(true);
                        }}
                        className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest text-white hover:bg-white/20 transition"
                      >
                        MEDIA
                      </button>
                      <button
                        onClick={() => {
                          setEditRelease(r);
                          setModalOpen(true);
                        }}
                        className="px-3 py-1 border border-gray-600 rounded-full text-[10px] font-bold tracking-widest text-gray-300 hover:border-white hover:text-white transition"
                      >
                        EDIT
                      </button>
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

// ─── Wall Magazine Form Modal ───────────────────────────────────────────────
function WallMagazineFormModal({ open, onClose, magazine, onSaved }) {
  const isEdit = !!magazine;
  const [form, setForm] = useState({
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    isActive: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (magazine) {
      setForm({
        title: magazine.title || "",
        description: magazine.description || "",
        buttonText: magazine.buttonText || "",
        buttonLink: magazine.buttonLink || "",
        isActive: magazine.isActive || false,
      });
    } else {
      setForm({ title: "", description: "", buttonText: "", buttonLink: "", isActive: false });
    }
    setError("");
  }, [magazine, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEdit) {
        await wallMagazineService.update(magazine.id, form);
      } else {
        await wallMagazineService.create(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save Wall Magazine.");
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
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white mb-6">
            {isEdit ? "EDIT WALL MAGAZINE" : "ADD WALL MAGAZINE"}
          </h2>
          {error && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                Title *
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent-teal transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent-teal transition resize-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                  Button Text
                </label>
                <input
                  value={form.buttonText}
                  onChange={(e) => setForm((p) => ({ ...p, buttonText: e.target.value }))}
                  className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent-teal transition"
                  placeholder="e.g. READ MORE"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                  Button Link
                </label>
                <input
                  value={form.buttonLink}
                  onChange={(e) => setForm((p) => ({ ...p, buttonLink: e.target.value }))}
                  className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent-teal transition"
                  placeholder="e.g. https://..."
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="wm-isActive"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-700 bg-[#222] text-accent-teal"
              />
              <label htmlFor="wm-isActive" className="text-xs font-bold text-gray-400 tracking-widest uppercase cursor-pointer">
                Set as Active
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <PigLoader size="mini" text="SAVING..." /> : isEdit ? "UPDATE" : "CREATE"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Wall Magazine Image Modal ──────────────────────────────────────────────
function WallMagazineImageModal({ open, onClose, magazine, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    setImageFile(null);
    setError("");
  }, [open]);

  if (!open || !magazine) return null;

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (!imageFile) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", imageFile);
    try {
      await wallMagazineService.uploadImage(magazine.id, formData);
      setImageFile(null);
      toast.success("Image uploaded successfully!");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image.");
      setError(err.response?.data?.message || "Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

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
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">
              MANAGE IMAGE: {magazine.title}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white font-bold">X</button>
          </div>
          {error && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="border border-gray-700 rounded-xl p-5 bg-[#222]">
            {magazine.imageUrl ? (
              <div className="mb-4 rounded overflow-hidden border border-gray-600 bg-black max-h-48 flex justify-center">
                <img src={magazine.imageUrl} alt="Wall Magazine" className="h-48 object-cover" />
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-4">No image uploaded yet.</p>
            )}
            <form onSubmit={handleUploadImage} className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="flex-1 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
              />
              <button
                type="submit"
                disabled={!imageFile || loading}
                className="px-4 py-2 bg-accent-teal text-black rounded-full text-xs font-bold tracking-widest hover:bg-accent-teal/80 transition disabled:opacity-50"
              >
                UPLOAD IMAGE
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Wall Magazine Table ────────────────────────────────────────────────────
function WallMagazineTable() {
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editMagazine, setEditMagazine] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await wallMagazineService.getAll();
      setMagazines(res.data || []);
    } catch {
      setMagazines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await wallMagazineService.delete(id);
      setDeleteConfirm(null);
      toast.success("Wall magazine deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await wallMagazineService.toggleActive(id);
      toast.success("Status updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status.");
    }
  };

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">
          WALL MAGAZINES
        </h2>
        <button
          onClick={() => {
            setEditMagazine(null);
            setModalOpen(true);
          }}
          className="px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest hover:bg-gray-200 transition"
        >
          + ADD MAGAZINE
        </button>
      </div>

      <WallMagazineFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        magazine={editMagazine}
        onSaved={load}
      />
      <WallMagazineImageModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        magazine={editMagazine}
        onSaved={load}
      />

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <ConfirmationModal
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={() => handleDelete(deleteConfirm)}
            title="DELETE MAGAZINE?"
            message="This action cannot be undone."
            loading={deleteLoading}
            loadingText="DELETING..."
          />
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto min-h-0 mb-8 rounded-xl border border-white/5 custom-scrollbar">
        {loading ? (
          <div className="py-16 flex justify-center">
            <PigLoader size="mini" text="Loading magazines..." />
          </div>
        ) : magazines.length === 0 ? (
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">
            No wall magazines found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase shadow-md">
                <th className="px-4 py-3 text-left w-1/4">Title</th>
                <th className="px-4 py-3 text-left w-1/4">Description</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {magazines.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? "bg-[#1c1c1c]" : "bg-[#1a1a1a]"}`}
                >
                  <td className="px-4 py-3 font-bold text-white tracking-wide truncate max-w-[200px]">
                    {r.title}
                  </td>
                  <td className="px-4 py-3 text-gray-400 truncate max-w-[250px]">
                    {r.description}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(r.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest transition ${r.isActive ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gray-500/20 text-gray-400 border border-gray-600 hover:bg-gray-700/50"}`}
                    >
                      {r.isActive ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt="Img" className="h-8 w-12 object-cover rounded" />
                    ) : (
                      <span className="text-gray-500 text-xs">No img</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditMagazine(r);
                          setImageModalOpen(true);
                        }}
                        className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest text-white hover:bg-white/20 transition"
                      >
                        IMAGE
                      </button>
                      <button
                        onClick={() => {
                          setEditMagazine(r);
                          setModalOpen(true);
                        }}
                        className="px-3 py-1 border border-gray-600 rounded-full text-[10px] font-bold tracking-widest text-gray-300 hover:border-white hover:text-white transition"
                      >
                        EDIT
                      </button>
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

// ─── Featured Sections Table ──────────────────────────────────────────────────
function FeaturedSectionsTable() {
  const [sections, setSections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Edit-products modal
  const [editSection, setEditSection] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

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

  useEffect(() => {
    load();
  }, []);

  const handleToggleActive = async (id) => {
    setActionLoading(true);
    try {
      await featuredService.toggleActive(id);
      toast.success("Section status updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle active status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await featuredService.delete(id);
      setDeleteConfirm(null);
      toast.success("Featured section deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete section.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    try {
      await featuredService.create({ title: newTitle });
      setNewTitle("");
      setCreateModalOpen(false);
      load();
    } catch (err) {
      setCreateError(
        err.response?.data?.message || "Failed to create section.",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditProducts = (section) => {
    setEditSection(section);
    const currentIds = (section.products || []).map(
      (p) => p.productId ?? p.product?.id ?? p.id,
    );
    setSelectedProductIds(currentIds);
    setEditError("");
  };

  const toggleProductSelection = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleSaveProducts = async () => {
    if (selectedProductIds.length === 0) {
      setEditError("Please select at least 1 product.");
      return;
    }
    setEditLoading(true);
    setEditError("");
    try {
      await featuredService.setProducts(editSection.id, selectedProductIds);
      setEditSection(null);
      load();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to save products.");
    } finally {
      setEditLoading(false);
    }
  };

  // Surfboard-only products for selection
  const surfboardProducts = allProducts.filter((p) => p.isActive !== false);

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">
            FEATURED SECTIONS
          </h2>
        </div>
        <button
          onClick={() => {
            setNewTitle("");
            setCreateError("");
            setCreateModalOpen(true);
          }}
          className="px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest hover:bg-gray-200 transition"
        >
          + ADD SECTION
        </button>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
            onClick={() => setCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-oswald text-2xl font-bold tracking-widest text-white mb-6">
                CREATE FEATURED SECTION
              </h2>
              {createError && (
                <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {createError}
                </div>
              )}
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                    Section Title *
                  </label>
                  <input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Summer Picks 2026"
                    className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition"
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    disabled={createLoading}
                    className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createLoading ? (
                      <PigLoader size="mini" text="CREATING..." />
                    ) : (
                      "CREATE"
                    )}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 py-10 overflow-y-auto"
            onClick={() => setEditSection(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">
                    PILIH PRODUK
                  </h2>
                  <p className="text-gray-500 text-xs tracking-widest mt-0.5">
                    {editSection.title}
                  </p>
                </div>
                <button
                  onClick={() => setEditSection(null)}
                  className="text-gray-400 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 px-3 py-2 bg-accent-teal/5 border border-accent-teal/20 rounded-lg text-[10px] text-gray-400 tracking-wide">
                ✓ Check the products you want to display on the Home page. The
                order of selection determines the display order.
              </div>

              {editError && (
                <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {editError}
                </div>
              )}

              <div className="max-h-[420px] overflow-y-auto custom-scrollbar rounded-xl border border-white/5 mb-5">
                {surfboardProducts.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm">
                    No products available.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase">
                        <th className="px-4 py-3 text-left w-10">✓</th>
                        <th className="px-4 py-3 text-left">Image</th>
                        <th className="px-4 py-3 text-left">Name</th>
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
                                ? "bg-accent-teal/10 hover:bg-accent-teal/15"
                                : idx % 2 === 0
                                  ? "bg-[#1c1c1c] hover:bg-white/5"
                                  : "bg-[#1a1a1a] hover:bg-white/5"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center border text-[10px] font-black transition ${
                                  isSelected
                                    ? "bg-accent-teal border-accent-teal text-black"
                                    : "border-gray-600 text-transparent"
                                }`}
                              >
                                {isSelected ? selectionOrder + 1 : "✓"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="w-10 h-10 bg-[#333] rounded overflow-hidden flex items-center justify-center">
                                {p.images?.[0]?.url ? (
                                  <img
                                    src={p.images[0].url}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-gray-600 text-[9px]">
                                    —
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-white tracking-wide">
                              {p.name}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold tracking-widest text-gray-300">
                                {p.skillLevel || "—"}
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
                  {selectedProductIds.length} product(s) selected
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditSection(null)}
                    disabled={editLoading || selectedProductIds.length === 0}
                    className="px-6 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSaveProducts}
                    disabled={editLoading || selectedProductIds.length === 0}
                    className="px-6 py-2.5 bg-accent-teal text-black rounded-full text-xs font-bold tracking-widest hover:bg-accent-teal/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {editLoading ? (
                      <PigLoader size="mini" text="SAVING..." />
                    ) : (
                      "SAVE PRODUCTS"
                    )}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <h3 className="font-oswald text-xl font-bold text-white mb-2">
                DELETE SECTION?
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                All featured product entries will be removed. This cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-xs font-bold tracking-widest hover:bg-red-600 transition disabled:opacity-50"
                >
                  {actionLoading ? "DELETING..." : "DELETE"}
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
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">
            No featured sections yet. Create one to get started.
          </div>
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
                <tr
                  key={s.id}
                  className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? "bg-[#1c1c1c]" : "bg-[#1a1a1a]"}`}
                >
                  <td className="px-4 py-3 font-bold text-white tracking-wide">
                    {s.title}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(s.products || []).slice(0, 3).map((entry) => {
                        const prod = entry.product ?? entry;
                        return (
                          <span
                            key={entry.id ?? prod.id}
                            className="px-2 py-0.5 bg-white/10 text-gray-300 rounded-full text-[9px] font-bold tracking-widest"
                          >
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
                        <span className="text-gray-600 text-[9px] italic">
                          No products
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(s.id)}
                      disabled={actionLoading}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest transition border ${
                        s.isActive
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-600 hover:bg-gray-700/50"
                      }`}
                    >
                      {s.isActive ? "● ACTIVE" : "INACTIVE"}
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

// ─── Dashboard Overview Wrapper ─────────────────────────────────────────────
function DashboardOverviewWrapper() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getDashboard();
        setDashboardData(res.data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return <DashboardOverview data={dashboardData} loading={isLoading} error={error} />;
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

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await storeReviewService.delete(id);
      setDeleteConfirm(null);
      toast.success("Review deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">
            STORE REVIEWS
          </h2>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <h3 className="font-oswald text-xl font-bold text-white mb-2">
                DELETE REVIEW?
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-xs font-bold tracking-widest hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <PigLoader size="mini" text="DELETING..." />
                  ) : (
                    "DELETE"
                  )}
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
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">
            No store reviews yet.
          </div>
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
                <tr
                  key={r.id}
                  className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? "bg-[#1c1c1c]" : "bg-[#1a1a1a]"}`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold text-white text-sm">
                        {r.user?.name || "—"}
                      </p>
                      <p className="text-gray-500 text-[10px]">
                        {r.user?.email || ""}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-accent-teal">
                    {renderStars(r.rating)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs italic">
                    {r.comment ? (
                      `"${r.comment}"`
                    ) : (
                      <span className="text-gray-600">No comment</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
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
  const [caption, setCaption] = useState("");

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

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length) return;
    setActionLoading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("images", f));
    try {
      await galleryService.upload(formData);
      setUploadOpen(false);
      setFiles([]);
      toast.success("Photos uploaded successfully!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload images");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCaption = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await galleryService.updateCaption(editItem.id, {
        caption: caption || null,
      });
      setEditItem(null);
      toast.success("Caption updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update caption");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await galleryService.delete(id);
      setDeleteConfirm(null);
      toast.success("Image deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete image");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">
          GALLERY
        </h2>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg"
            >
              <h3 className="font-oswald text-xl font-bold text-white mb-4">
                UPLOAD PHOTOS
              </h3>
              <form onSubmit={handleUpload} className="flex flex-col gap-4">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFiles(e.target.files)}
                  className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => { setUploadOpen(false); setFiles([]); }}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={!files.length || actionLoading}
                    className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <PigLoader size="mini" text="UPLOADING..." />
                    ) : (
                      "UPLOAD"
                    )}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg"
            >
              <h3 className="font-oswald text-xl font-bold text-white mb-4">
                EDIT CAPTION
              </h3>
              <form
                onSubmit={handleUpdateCaption}
                className="flex flex-col gap-4"
              >
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Enter caption..."
                  className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent-teal transition resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setEditItem(null)}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <PigLoader size="mini" text="SAVING..." />
                    ) : (
                      "SAVE"
                    )}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-8 max-w-sm text-center"
            >
              <h3 className="font-oswald text-xl font-bold text-white mb-2">
                DELETE PHOTO?
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-xs font-bold tracking-widest hover:bg-red-600 transition disabled:opacity-50"
                >
                  {actionLoading ? "DELETING..." : "DELETE"}
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
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">
            No photos in gallery.
          </div>
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
                <tr
                  key={img.id}
                  className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? "bg-[#1c1c1c]" : "bg-[#1a1a1a]"}`}
                >
                  <td className="px-4 py-3">
                    <div className="w-16 h-16 bg-[#333] rounded overflow-hidden">
                      <img
                        src={img.url}
                        alt="Gallery"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 italic text-xs">
                    {img.caption || "No caption"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(img.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditItem(img);
                          setCaption(img.caption || "");
                        }}
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

// ─── Testimonials Management ─────────────────────────────────────────────────
function TestimonialsTable() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [photoItem, setPhotoItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form fields
  const [form, setForm] = useState({
    name: "",
    review: "",
    instagram: "",
    order: 0,
    isActive: true,
  });
  const [photoFile, setPhotoFile] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await testimonialsService.getAllAdmin({ limit: 100 });
      setTestimonials(res.data?.data?.testimonials || []);
    } catch {
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", review: "", instagram: "", order: 0, isActive: true });
    setError("");
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name || "",
      review: item.review || "",
      instagram: item.instagram || "",
      order: item.order ?? 0,
      isActive: item.isActive ?? true,
    });
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        review: form.review,
        instagram: form.instagram || undefined,
        order: Number(form.order) || 0,
        isActive: form.isActive,
      };
      if (editItem) {
        await testimonialsService.update(editItem.id, payload);
      } else {
        await testimonialsService.create(payload);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save testimonial.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (item) => {
    setActionLoading(true);
    try {
      await testimonialsService.toggle(item.id);
      toast.success("Testimonial status updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!photoFile || !photoItem) return;
    setActionLoading(true);
    const formData = new FormData();
    formData.append("photo", photoFile);
    try {
      await testimonialsService.uploadPhoto(photoItem.id, formData);
      setPhotoItem(null);
      setPhotoFile(null);
      toast.success("Photo uploaded successfully!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload photo.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await testimonialsService.delete(id);
      setDeleteConfirm(null);
      toast.success("Testimonial deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete testimonial.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">
            TESTIMONIALS
          </h2>
          <p className="text-gray-500 text-[10px] tracking-widest mt-0.5">
            {testimonials.length} total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest hover:bg-gray-200 transition"
        >
          + ADD TESTIMONIAL
        </button>
      </div>

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto py-10"
            onClick={() => setFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-oswald text-2xl font-bold tracking-widest text-white mb-6">
                {editItem ? "EDIT TESTIMONIAL" : "ADD TESTIMONIAL"}
              </h3>
              {error && (
                <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                    Customer Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                    Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.review}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, review: e.target.value }))
                    }
                    className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                    Instagram Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      @
                    </span>
                    <input
                      value={form.instagram}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, instagram: e.target.value }))
                      }
                      placeholder="customer_handle"
                      className="w-full bg-[#222] border border-gray-700 rounded-lg pl-7 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, order: e.target.value }))
                      }
                      className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                      Status
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, isActive: !p.isActive }))
                      }
                      className={`w-full py-2.5 rounded-lg border text-xs font-bold tracking-widest transition ${
                        form.isActive
                          ? "bg-green-500/20 border-green-500/50 text-green-400"
                          : "bg-gray-500/10 border-gray-600 text-gray-400"
                      }`}
                    >
                      {form.isActive ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    {actionLoading
                      ? "SAVING..."
                      : editItem
                        ? "UPDATE"
                        : "CREATE"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upload Photo Modal ── */}
      <AnimatePresence>
        {photoItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
            onClick={() => setPhotoItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-oswald text-xl font-bold text-white mb-1">
                UPLOAD PHOTO
              </h3>
              <p className="text-gray-500 text-xs tracking-widest mb-5">
                {photoItem.name}
              </p>
              {photoItem.photoUrl && (
                <div className="mb-4 w-20 h-20 rounded-xl overflow-hidden bg-[#333]">
                  <img
                    src={photoItem.photoUrl}
                    alt={photoItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <form
                onSubmit={handleUploadPhoto}
                className="flex flex-col gap-4"
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoItem(null);
                      setPhotoFile(null);
                    }}
                    className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={!photoFile || actionLoading}
                    className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    {actionLoading ? "UPLOADING..." : "UPLOAD"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <h3 className="font-oswald text-xl font-bold text-white mb-2">
                DELETE TESTIMONIAL?
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                The customer photo will also be removed from Cloudinary.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-xs font-bold tracking-widest hover:bg-red-600 transition disabled:opacity-50"
                >
                  {actionLoading ? "DELETING..." : "DELETE"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto min-h-0 mb-8 rounded-xl border border-white/5 custom-scrollbar">
        {loading ? (
          <div className="py-16 flex justify-center">
            <PigLoader size="mini" text="Loading testimonials..." />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">
            No testimonials yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase shadow-md">
                <th className="px-4 py-3 text-left">Photo</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left w-1/3">Review</th>
                <th className="px-4 py-3 text-left">Instagram</th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? "bg-[#1c1c1c]" : "bg-[#1a1a1a]"}`}
                >
                  <td className="px-4 py-3">
                    <div className="w-14 h-14 bg-[#333] rounded-lg overflow-hidden flex items-center justify-center">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 text-[10px] font-bold tracking-wider">
                          NO
                          <br />
                          PHOTO
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-white">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs italic">
                    <span className="line-clamp-2 block max-w-xs">
                      &quot;{item.review}&quot;
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {item.instagram ? (
                      `@${item.instagram}`
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-center">
                    {item.order}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(item)}
                      disabled={actionLoading}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest transition ${
                        item.isActive
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                      } disabled:opacity-50`}
                    >
                      {item.isActive ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => openEdit(item)}
                        className="px-3 py-1 border border-gray-600 rounded-full text-[10px] font-bold tracking-widest text-gray-300 hover:border-white hover:text-white transition"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => {
                          setPhotoItem(item);
                          setPhotoFile(null);
                        }}
                        className="px-3 py-1 border border-blue-500/40 rounded-full text-[10px] font-bold tracking-widest text-blue-400 hover:bg-blue-500/10 transition"
                      >
                        PHOTO
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
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

// ─── Rider Form Modal ────────────────────────────────────────────────────────
function RiderFormModal({ open, onClose, rider, onSaved }) {
  const isEdit = !!rider;
  const [form, setForm] = useState({ name: "", location: "", bio: "", boardModel: "", instagram: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (rider) {
      setForm({
        name: rider.name || "",
        location: rider.location || "",
        bio: rider.bio || "",
        boardModel: rider.boardModel || "",
        instagram: rider.instagram || "",
      });
    } else {
      setForm({ name: "", location: "", bio: "", boardModel: "", instagram: "" });
    }
    setError("");
  }, [rider, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isEdit) {
        await riderService.update(rider.id, form);
      } else {
        await riderService.create(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving rider.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white mb-6">
            {isEdit ? "EDIT RIDER" : "ADD RIDER"}
          </h2>
          {error && <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Location *</label>
              <input required value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Bio *</label>
              <textarea required minLength={10} rows={4} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition resize-none" placeholder="Minimal 10 karakter..." />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">🏄 Surfboard (Board Model)</label>
              <input value={form.boardModel} onChange={e => setForm(p => ({ ...p, boardModel: e.target.value }))} placeholder="e.g. FreePig Custom 6'2" className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Instagram Handle</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                <input value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} placeholder="rider_handle" className="w-full bg-[#222] border border-gray-700 rounded-lg pl-7 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition" />
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50">CANCEL</button>
              <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50">{loading ? <PigLoader size="mini" text="SAVING..." /> : isEdit ? "UPDATE" : "CREATE"}</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Rider Media Modal ───────────────────────────────────────────────────────
function RiderMediaModal({ open, onClose, rider, onSaved }) {
  const [files, setFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: "", targetId: null, title: "", message: "" });

  if (!open || !rider) return null;

  const handleUploadImages = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    try {
      await riderService.uploadImages(rider.id, formData);
      setFiles([]);
      toast.success("Images uploaded successfully!");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload images.");
      setError(err.response?.data?.message || "Failed to upload images.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    if (!videoFile) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("video", videoFile);
    try {
      await riderService.uploadVideo(rider.id, formData);
      setVideoFile(null);
      toast.success("Video uploaded successfully!");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload video.");
      setError(err.response?.data?.message || "Failed to upload video.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = (imageId) => {
    setDeleteConfirm({
      isOpen: true,
      type: "image",
      targetId: imageId,
      title: "DELETE IMAGE?",
      message: "Are you sure you want to delete this image? This action cannot be undone.",
    });
  };

  const handleDeleteVideo = () => {
    setDeleteConfirm({
      isOpen: true,
      type: "video",
      targetId: null,
      title: "DELETE HERO VIDEO?",
      message: "Are you sure you want to delete the hero video? This action cannot be undone.",
    });
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError("");
    try {
      if (deleteConfirm.type === "image") {
        await riderService.deleteImage(rider.id, deleteConfirm.targetId);
      } else if (deleteConfirm.type === "video") {
        await riderService.deleteVideo(rider.id);
      }
      toast.success(`${deleteConfirm.type === "video" ? "Video" : "Image"} deleted.`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to delete ${deleteConfirm.type}.`);
      setError(err.response?.data?.message || `Failed to delete ${deleteConfirm.type}.`);
    } finally {
      setLoading(false);
      setDeleteConfirm({ isOpen: false, type: "", targetId: null, title: "", message: "" });
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto py-10" onClick={onClose}>
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl my-auto" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">MANAGE RIDER MEDIA</h2>
              <p className="text-gray-500 text-xs tracking-widest mt-0.5">{rider.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-lg font-bold w-8 h-8">✕</button>
          </div>
          {error && <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Video Section */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Hero Video</h3>
              <div className="bg-[#222] border border-gray-700 rounded-xl p-4">
                {rider.videoUrl ? (
                  <div className="relative group w-full h-32 rounded-lg overflow-hidden bg-black mb-4">
                    <video src={rider.videoUrl} className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button onClick={handleDeleteVideo} disabled={loading} className="px-3 py-1 bg-red-500/80 text-white rounded-full text-[9px] font-bold tracking-widest hover:bg-red-600 transition disabled:opacity-50">DELETE VIDEO</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-xs mb-4">Belum ada video.</p>
                )}
                <form onSubmit={handleUploadVideo} className="flex flex-col gap-3">
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => setVideoFile(e.target.files[0])} className="text-[10px] text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-white/10 file:text-white" />
                  <button type="submit" disabled={!videoFile || loading} className="w-full py-2 bg-white text-black rounded-full text-[10px] font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50">UPLOAD VIDEO</button>
                </form>
              </div>
            </div>

            {/* Images Section */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Photos ({rider.images?.length || 0})</h3>
              <div className="bg-[#222] border border-gray-700 rounded-xl p-4">
                {rider.images?.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {rider.images.map(img => (
                      <div key={img.id} className="relative group w-16 h-16 rounded-lg overflow-hidden bg-[#111] border border-gray-700">
                        <img src={img.url} className="w-full h-full object-cover group-hover:opacity-50 transition" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => handleDeleteImage(img.id)} disabled={loading} className="p-1 bg-red-500/80 text-white rounded text-[8px] hover:bg-red-600">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-xs mb-4">No images yet.</p>
                )}
                <form onSubmit={handleUploadImages} className="flex flex-col gap-3">
                  <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files))} className="text-[10px] text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-white/10 file:text-white" />
                  <button type="submit" disabled={files.length === 0 || loading} className="w-full py-2 bg-white text-black rounded-full text-[10px] font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50">UPLOAD IMAGES</button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: "", targetId: null, title: "", message: "" })}
        onConfirm={handleConfirmDelete}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        loading={loading}
        loadingText="DELETING..."
      />
    </AnimatePresence>
  );
}

// ─── Riders Table ────────────────────────────────────────────────────────────
function RidersTable() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [editRider, setEditRider] = useState(null);
  const [riderToDelete, setRiderToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await riderService.getAll({ limit: 100 });
      setRiders(res.data?.riders || []);
    } catch (err) {
      toast.error("Failed to fetch riders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRiders(); }, []);

  const handleDelete = (id) => {
    setRiderToDelete(id);
  };

  const doDeleteRider = async () => {
    if (!riderToDelete) return;
    setDeleteLoading(true);
    try {
      await riderService.delete(riderToDelete);
      toast.success("Rider deleted");
      fetchRiders();
    } catch (err) {
      toast.error("Failed to delete rider");
    } finally {
      setDeleteLoading(false);
      setRiderToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white uppercase">
            RIDERS SPOTLIGHT
          </h2>
          <p className="text-gray-500 text-[10px] tracking-widest mt-0.5">
            {riders.length} total
          </p>
        </div>
        <button onClick={() => { setEditRider(null); setModalOpen(true); }} className="px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest hover:bg-gray-200 transition">
          + ADD RIDER
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 mb-8 rounded-xl border border-white/5 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <PigLoader size="mini" text="Loading riders..." />
          </div>
        ) : riders.length === 0 ? (
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">No riders found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase shadow-md">
                <th className="px-4 py-3 text-left">Main Image</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-center">Media</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r, idx) => (
                <tr key={r.id} className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? "bg-[#1c1c1c]" : "bg-[#1a1a1a]"}`}>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 bg-[#333] rounded overflow-hidden flex items-center justify-center">
                      {r.images?.[0]?.url ? <img src={r.images[0].url} alt={r.name} className="w-full h-full object-cover" /> : <span className="text-gray-600 text-xs">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-white tracking-wide">{r.name}</td>
                  <td className="px-4 py-3 text-gray-400">{r.location || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => { setEditRider(r); setMediaModalOpen(true); }} className="px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold tracking-widest hover:bg-accent-teal hover:text-black transition">
                      MANAGE ({r.images?.length || 0} PICS, {r.videoUrl ? '1 VIDEO' : 'NO VIDEO'})
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setEditRider(r); setModalOpen(true); }} className="px-3 py-1 border border-gray-600 rounded-full text-[10px] font-bold tracking-widest text-gray-300 hover:border-white hover:text-white transition">EDIT</button>
                      <button onClick={() => handleDelete(r.id)} className="px-3 py-1 border border-red-500/40 rounded-full text-[10px] font-bold tracking-widest text-red-400 hover:bg-red-500/10 transition">DELETE</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <RiderFormModal open={modalOpen} onClose={() => setModalOpen(false)} rider={editRider} onSaved={fetchRiders} />
      <RiderMediaModal open={mediaModalOpen} onClose={() => setMediaModalOpen(false)} rider={editRider} onSaved={fetchRiders} />
      <ConfirmationModal
        isOpen={!!riderToDelete}
        onClose={() => setRiderToDelete(null)}
        onConfirm={doDeleteRider}
        title="DELETE RIDER?"
        message="Are you sure you want to delete this rider? This action cannot be undone."
        loading={deleteLoading}
        loadingText="DELETING..."
      />
    </div>
  );
}

// ─── Hero Section Table ───────────────────────────────────────────────────────
function HeroTable() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editHero, setEditHero] = useState(null);
  const [videoModalHero, setVideoModalHero] = useState(null);
  const [heroToDelete, setHeroToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({ title: "", subtitle: "", description: "", isActive: false });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formVideoFile, setFormVideoFile] = useState(null);

  // Video state (for separate video modal on existing hero)
  const [videoFile, setVideoFile] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await heroService.getAll();
      setHeroes(res.data || []);
    } catch {
      setHeroes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditHero(null);
    setForm({ title: "", subtitle: "", description: "", isActive: false });
    setFormError("");
    setFormVideoFile(null);
    setModalOpen(true);
  };

  const openEdit = (hero) => {
    setEditHero(hero);
    setForm({ title: hero.title, subtitle: hero.subtitle, description: hero.description || "", isActive: hero.isActive });
    setFormError("");
    setFormVideoFile(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      if (editHero) {
        await heroService.update(editHero.id, { title: form.title, subtitle: form.subtitle, description: form.description || undefined });
        toast.success("Hero section updated!");
      } else {
        // Step 1: Create hero
        const res = await heroService.create({
          title: form.title,
          subtitle: form.subtitle,
          description: form.description || undefined,
          isActive: form.isActive,
        });
        const newId = res.data?.id;
        // Step 2: Upload video if provided
        if (formVideoFile && newId) {
          const fd = new FormData();
          fd.append("video", formVideoFile);
          await heroService.uploadVideo(newId, fd);
          toast.success("Hero created with video!");
        } else {
          toast.success("Hero section created!");
        }
      }
      setModalOpen(false);
      setFormVideoFile(null);
      load();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save hero section.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (id) => {
    setActionLoading(true);
    try {
      await heroService.toggleActive(id);
      toast.success("Hero status updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status.");
    } finally {
      setActionLoading(false);
    }
  };

  const doDelete = async () => {
    if (!heroToDelete) return;
    setDeleteLoading(true);
    try {
      await heroService.delete(heroToDelete);
      setHeroToDelete(null);
      toast.success("Hero section deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    if (!videoFile || !videoModalHero) return;
    setVideoLoading(true);
    const formData = new FormData();
    formData.append("video", videoFile);
    try {
      await heroService.uploadVideo(videoModalHero.id, formData);
      setVideoFile(null);
      setVideoModalHero(null);
      toast.success("Video uploaded successfully!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload video.");
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 pb-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">HERO SECTION</h2>
          <p className="text-gray-500 text-[10px] tracking-widest mt-0.5">Manage landing page hero banner</p>
        </div>
        <button onClick={openCreate} className="px-5 py-2 bg-white text-black rounded-full text-[10px] font-black tracking-widest hover:bg-gray-200 transition">
          + ADD HERO
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-oswald text-2xl font-bold tracking-widest text-white">
                  {editHero ? "EDIT HERO" : "CREATE HERO"}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center">✕</button>
              </div>
              {formError && <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{formError}</div>}
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Title *</label>
                  <textarea required rows={2} value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. RIDE YOUR\nOWN WAVE"
                    className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Subtitle *</label>
                  <input required value={form.subtitle} onChange={(e) => setForm(p => ({ ...p, subtitle: e.target.value }))}
                    placeholder="e.g. BUILD DIFFERENT, RIDE DIFFERENT"
                    className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Description</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. Custom surfboards made for your identity."
                    className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-teal transition resize-none" />
                </div>
                {!editHero && (
                  <div>
                    <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                      Background Video <span className="text-gray-600 normal-case font-normal">(optional)</span>
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => setFormVideoFile(e.target.files[0] || null)}
                      className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
                    />
                    {formVideoFile && (
                      <p className="text-[10px] text-accent-teal mt-1.5 tracking-widest">
                        ✓ {formVideoFile.name}
                      </p>
                    )}
                  </div>
                )}
                {!editHero && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${form.isActive ? 'bg-accent-teal' : 'bg-gray-700'}`}
                      onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${form.isActive ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">Set as Active</span>
                  </label>
                )}
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setModalOpen(false)} disabled={formLoading}
                    className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50">CANCEL</button>
                  <button type="submit" disabled={formLoading}
                    className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {formLoading ? <PigLoader size="mini" text="SAVING..." /> : (editHero ? "UPDATE" : "CREATE")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Upload Modal */}
      <AnimatePresence>
        {videoModalHero && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
            onClick={() => { setVideoModalHero(null); setVideoFile(null); }}
          >
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-oswald text-xl font-bold tracking-widest text-white">UPLOAD HERO VIDEO</h2>
                  <p className="text-gray-500 text-[10px] tracking-widest mt-0.5">{videoModalHero.title}</p>
                </div>
                <button onClick={() => { setVideoModalHero(null); setVideoFile(null); }} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
              </div>
              {videoModalHero.videoUrl && (
                <div className="mb-5 rounded-xl overflow-hidden border border-gray-700 bg-black max-h-48 flex justify-center">
                  <video src={videoModalHero.videoUrl} controls className="h-48 object-contain" />
                </div>
              )}
              <form onSubmit={handleUploadVideo} className="flex flex-col gap-4">
                <input type="file" accept="video/mp4,video/webm,video/quicktime"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setVideoModalHero(null); setVideoFile(null); }} disabled={videoLoading}
                    className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 text-xs font-bold tracking-widest hover:border-white hover:text-white transition disabled:opacity-50">CANCEL</button>
                  <button type="submit" disabled={!videoFile || videoLoading}
                    className="flex-1 py-2.5 bg-accent-teal text-black rounded-full text-xs font-bold tracking-widest hover:bg-accent-teal/80 transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {videoLoading ? <PigLoader size="mini" text="UPLOADING..." /> : "UPLOAD VIDEO"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <ConfirmationModal
        isOpen={!!heroToDelete}
        onClose={() => setHeroToDelete(null)}
        onConfirm={doDelete}
        title="DELETE HERO?"
        message="Are you sure you want to delete this hero section? Its video will also be deleted from storage."
        loading={deleteLoading}
        loadingText="DELETING..."
      />

      {/* Table */}
      <div className="flex-1 overflow-y-auto min-h-0 mb-8 rounded-xl border border-white/5 custom-scrollbar">
        {loading ? (
          <div className="py-16 flex justify-center"><PigLoader size="mini" text="Loading hero sections..." /></div>
        ) : heroes.length === 0 ? (
          <div className="py-20 text-center text-gray-500 tracking-widest text-sm">No hero sections yet. Create one to get started.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#222] text-gray-400 text-[10px] tracking-[0.2em] uppercase shadow-md">
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Subtitle</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Video</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {heroes.map((h, idx) => (
                <tr key={h.id} className={`border-t border-white/5 hover:bg-white/5 transition ${idx % 2 === 0 ? 'bg-[#1c1c1c]' : 'bg-[#1a1a1a]'}`}>
                  <td className="px-4 py-3 font-bold text-white tracking-wide max-w-[160px] truncate">{h.title}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-[160px] truncate">{h.subtitle}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate">{h.description || '—'}</td>
                  <td className="px-4 py-3">
                    {h.videoUrl
                      ? <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[9px] font-bold">VIDEO ✓</span>
                      : <span className="px-2 py-0.5 bg-gray-700/50 text-gray-500 rounded-full text-[9px] font-bold">NO VIDEO</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(h.id)} disabled={actionLoading}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest transition ${h.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-600 hover:bg-gray-700/50'}`}>
                      {h.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setVideoModalHero(h)}
                        className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest text-white hover:bg-white/20 transition">VIDEO</button>
                      <button onClick={() => openEdit(h)}
                        className="px-3 py-1 border border-gray-600 rounded-full text-[10px] font-bold tracking-widest text-gray-300 hover:border-white hover:text-white transition">EDIT</button>
                      <button onClick={() => setHeroToDelete(h.id)}
                        className="px-3 py-1 border border-red-500/40 rounded-full text-[10px] font-bold tracking-widest text-red-400 hover:bg-red-500/10 transition">DELETE</button>
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
  { id: "overview", label: "Overview", icon: FiPieChart },
  { id: "hero", label: "Hero Section", icon: FiVideo },
  { id: "new-releases", label: "New Releases", icon: FiStar },
  { id: "featured", label: "Featured Sections", icon: FiLayout },
  { 
    id: "master-data", 
    label: "Master Data", 
    icon: FiDatabase,
    subItems: [
      { id: "wall-magazine", label: "Wall Magazine", icon: FiFileText },
      { id: "surfboards", label: "Surfboards", icon: FiLayers },
      { id: "accessories", label: "Accessories", icon: FiTag },
      { id: "reviews", label: "Reviews", icon: FiMessageSquare },
      { id: "gallery", label: "Gallery", icon: FiImage },
      { id: "testimonials", label: "Testimonials", icon: FiHeart },
      { id: "riders", label: "Riders", icon: FiUsers },
    ]
  },
];

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");
  const [categories, setCategories] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

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
    navigate("/login");
  };

  return (
    <div className="h-screen bg-[#111] flex font-poppins text-white overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        menuItems={SIDEBAR_ITEMS}
        activeMenu={active}
        onMenuClick={setActive}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pb-[70px] md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col"
          >
            {active === "overview" && <DashboardOverviewWrapper />}
            {active === "hero" && <HeroTable />}
            {active === "wall-magazine" && <WallMagazineTable />}
            {active === "surfboards" && (
              <ProductsTable categories={categories} />
            )}
            {active === "accessories" && (
              <AccessoriesTable categories={categories} />
            )}
            {active === "new-releases" && <NewReleasesTable />}
            {active === "featured" && <FeaturedSectionsTable />}
            {active === "reviews" && <ReviewsTable />}
            {active === "gallery" && <GalleryTable />}
            {active === "testimonials" && <TestimonialsTable />}
            {active === "riders" && <RidersTable />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
