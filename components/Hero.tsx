"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center flex-grow px-4 sm:px-6 pt-15 sm:pt-25 lg:pt-35">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
      >
        Build. Collaborate. Grow.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-white/80 max-w-xl sm:max-w-2xl"
      >
        Join a vibrant community of developers, designers, and creators.
        Showcase your work, connect with peers, and track your progress.
      </motion.p>

      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
        <Link
          href="/signup"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:scale-105 transition text-center"
        >
          Get Started
        </Link>
        <Link
          href="#features"
          className="px-6 py-3 border border-white/40 text-white hover:bg-white/20 transition text-center"
        >
          Learn More
        </Link>
      </div>
    </section>
  );
}
