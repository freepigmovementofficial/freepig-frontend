import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import PigLoader from "./PigLoader";

/**
 * Reusable Confirmation Modal styled to match the premium dark theme.
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "CONFIRM ACTION",
  message = "Are you sure you want to perform this action?",
  confirmText = "DELETE",
  cancelText = "CANCEL",
  loading = false,
  loadingText = "PROCESSING...",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#010E19]/75 backdrop-blur-sm px-4"
          onClick={loading ? undefined : onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1a1a] border border-red-500/20 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
          >
            {/* Warning Icon */}
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <h3 className="font-oswald text-xl font-bold tracking-widest text-white mb-2 uppercase">
              {title}
            </h3>
            <p className="text-gray-400 text-sm tracking-wide leading-relaxed mb-8">
              {message}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 border border-gray-600 rounded-full text-gray-400 hover:border-white hover:text-white text-xs font-bold tracking-widest transition duration-300 disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold tracking-widest transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <PigLoader size="mini" text={loadingText} />
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
