import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white/10 backdrop-blur-lg text-white py-10 mt-20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo */}
        <div className="text-2xl font-extrabold text-white">
          Alloy
        </div>

        {/* Links */}
        <div className="flex gap-4 md:gap-6 text-white/80">
          <Link href="/">Home</Link>
          <Link className="whitespace-nowrap" href="#features">Features</Link>
          <Link href="#community">Community</Link>
          <Link href="#about">About</Link>
        </div>

        {/* Socials */}
        <div className="flex gap-4">
          <a href="https://twitter.com" target="_blank" className="hover:text-pink-400">
            <Twitter size={22} />
          </a>
          <a href="https://github.com" target="_blank" className="hover:text-pink-400">
            <Github size={22} />
          </a>
          <a href="https://linkedin.com" target="_blank" className="hover:text-pink-400">
            <Linkedin size={22} />
          </a>
        </div>
      </div>
      <p className="text-center text-white/50 mt-6 text-sm">
        © {new Date().getFullYear()} ALLOY. All rights reserved.
      </p>
    </footer>
  );
}
