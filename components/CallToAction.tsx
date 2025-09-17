"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CallToAction() {
  return (
    <section className="py-20 px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-2xl sm:text-3xl lg:text-4xl md:text-5xl font-bold text-white mb-6"
      >
        Ready to Start Your Journey?
      </motion.h2>
      <motion.div whileHover={{ scale: 1.05 }}>
        <Link
          href="/signup"
          className="px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-bold text-lg transition"
        >
          Join Now 🚀
        </Link>
      </motion.div>
    </section>
  );
}
