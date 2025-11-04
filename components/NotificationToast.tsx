// /components/NotificationToast.tsx
"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/usePostStore";

const DURATION_MS = 4500; // how long the toast is visible

export default function NotificationToast() {
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => hide(), DURATION_MS);
    return () => clearTimeout(t);
  }, [message, hide]);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="pointer-events-auto max-w-sm w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-2"
          >
            <div className="text-sm text-gray-800 dark:text-gray-100">
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
