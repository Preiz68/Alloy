"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WelcomePage() {
  const { user, loading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const letters = `${firstName || "Guest"}!`.split("");

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08, // faster, subtle stagger
      },
    },
  };

  const letter: Variants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  useEffect(() => {
    if (authLoading) return;

    const fetchUserName = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirstName(data.firstName || null);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, [user, authLoading]);

  if (authLoading || loading)
    return (
      <div className="h-screen flex justify-center items-center bg-white/30 backdrop-blur-lg shadow-lg">
        <motion.div
          className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );

  return (
    <div
      className="w-full h-screen"
      style={{
        backgroundImage: "url(/colorfulbackground.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
    <div className=" w-full h-full bg-white/10 flex justify-center items-center p-6 backdrop-blur-lg shadow-lg">
      <motion.h1
        variants={container}
        initial="hidden"
        animate="visible"
        className="text-5xl md:text-7xl font-bold text-center text-white drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]"
      >
       Welcome {letters.map((char, index) => (
          <motion.span key={index} variants={letter} className="inline-block">
            {char}
          </motion.span>
        ))}
      </motion.h1>
    </div>
    </div>
  );
}
