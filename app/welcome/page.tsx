"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WelcomePage() {
  const { user, loading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchUserName = async () => {
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
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-purple-500 to-green-500 text-white">
        Loading...
      </div>
    );

  return (
    <div
      className="relative w-full min-h-screen flex justify-center items-center"
      style={{
        backgroundImage: "url(/colorfulbackground.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Full-page glassmorphic overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl flex justify-center items-center p-6">
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text text-center"
        >
          Welcome {firstName || "Guest"}!
        </motion.h1>
      </div>
    </div>
  );
}
