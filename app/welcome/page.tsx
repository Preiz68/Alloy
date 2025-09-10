"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import useAuth from "@/hooks/useAuth";

export default function Welcome() {
  const [firstName, setFirstName] = useState<string>("Developer");
  const auth = getAuth();
  const {user} = useAuth()

  useEffect(() => {
    const fetchName = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().firstName) {
          setFirstName(docSnap.data().firstName);
        }
      } catch (err) {
        console.error("Error fetching user name:", err);
      }
    };

    fetchName();
  }, [auth]);

    const backgroundImage = "/colorfulbackground.jpg";

  return (
       <div
      className="flex justify-center w-full min-h-screen max-h-full overflow-x-clip"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="flex flex-col items-center justify-center h-screen relative overflow-hidden bg-white/70 backdrop-blur-lg text-white"
    >

      {/* Glassmorphism card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
        className="relative z-10 px-10 py-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
      >
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 120 }}
          className="text-4xl md:text-6xl font-extrabold text-center bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent"
        >
          Welcome {firstName} 🎉
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-lg md:text-xl text-center text-gray-200 mt-4"
        >
          You’ve successfully set up your profile 🚀
        </motion.p>
      </motion.div>
    </motion.div>
    </div>
  );
}
