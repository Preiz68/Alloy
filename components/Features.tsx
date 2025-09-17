"use client";

import { motion,Variants } from "framer-motion";
import Image from "next/image";
import chaticon from "../public/icons/chaticon.jpg";
import progressicon from "../public/icons/progresstracker.jpg";
import profile from "../public/icons/profile.webp";
import collaboration from "../public/icons/collaboration.png";
import learning from "../public/icons/learningtogether.webp";
import creativeField from "../public/icons/creativeField.png";

const features = [
  {
    title: "Profiles",
    desc: "Create a personalized profile where you can highlight your skills, share your portfolio, and let the world know what makes you unique as a developer, designer, or creator.",
    img: profile
  },
  {
    title: "Collaboration",
    desc: "Team up with others on real-world projects, find partners who share your vision, and experience the power of building something meaningful together.",
    img: collaboration
  },
  {
    title: "Progress Tracking",
    desc: "Stay motivated by setting goals, tracking milestones, and celebrating achievements. Your journey becomes visible, measurable, and inspiring.",
    img: progressicon
  },
  {
    title: "Messaging",
    desc: "Communicate seamlessly with individuals or groups using our chat system. Whether it's brainstorming ideas or sharing quick updates, you're always connected.",
    img: chaticon
  },
  {
    title: "Creative Fields",
    desc: "This isn't just for developers — it's a space for designers, animators, illustrators, and all digital creators to connect, learn, and collaborate.",
    img:creativeField
  },
  {
    title: "Learning Together",
    desc: "Grow alongside a supportive community. Exchange knowledge, share resources, and inspire each other through every stage of your creative journey.",
    img: learning
  },
];



const containerVariants:Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.12,
    },
  },
};

const itemVariants:Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Features() {
  return (
    <section id="features" className="py-20 md:px-6">
      <h2 className="text-4xl font-bold text-center text-white mb-12">Why Join?</h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 gap-20 px-10 md:px-20 mx-auto"
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-lg flex flex-col md:grid md:grid-cols-12 p-5 text-white shadow-lg hover:scale-105 transition"
          >
            <Image
              unoptimized
              src={f.img}
              alt={`${f.title} Icon`}
              className="md:col-span-6 object-cover h-full"
            />
            <div className="md:col-span-6 md:pl-10 flex flex-col justify-center">
              <h3 className="text-2xl md:text-4xl font-semibold my-2 md:mb-3 uppercase text-center">{f.title}</h3>
              <p className="text-white/70 leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
