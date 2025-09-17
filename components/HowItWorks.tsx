"use client";

import { motion } from "framer-motion";
import { UserPlus, Users, Trophy } from "lucide-react";

const steps = [
  {
    title: "Create Your Profile",
    desc: "Sign up in minutes, highlight your skills, and let others know what you can bring to the table.",
    icon: UserPlus,
  },
  {
    title: "Connect & Collaborate",
    desc: "Find like-minded creators, join exciting projects, and start building together.",
    icon: Users,
  },
  {
    title: "Track & Celebrate",
    desc: "Stay motivated with progress tracking, share your milestones, and celebrate achievements.",
    icon: Trophy,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-white/5">
      <h2 className="text-4xl font-bold text-center text-white mb-12">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center shadow-lg hover:scale-105 transition"
          >
            <s.icon className="mx-auto text-pink-400 mb-6" size={48} />
            <h3 className="text-2xl font-semibold text-white mb-3">{s.title}</h3>
            <p className="text-white/70">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
