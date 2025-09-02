"use client";

import { motion } from "framer-motion";

interface WelcomeProps {
  firstName: string;
}

export default function Welcome({ firstName }: WelcomeProps) {
  // Split the first name into letters
  const letters = firstName.split("");

  return (
    <motion.div
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
      className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-white"
    >
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome,</h1>

      <div className="flex space-x-1 overflow-hidden">
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: i * 0.1,
              duration: 0.6,
              ease: "easeOut",
            }}
            className="text-5xl md:text-7xl font-extrabold tracking-wide"
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
