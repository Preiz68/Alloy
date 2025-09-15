"use client";

import { motion } from "framer-motion";

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = "Loading" }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-lg flex flex-col items-center justify-center z-50">
      <motion.div
        className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <p className="mt-3 text-sm text-white">{message}</p>
    </div>
  );
}
