"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";


const navLinks = ["Home","Features","Community","About"]



export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <nav className="w-full bg-transparent flex justify-between">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-3xl font-bold text-white fixed top-4 left-4 z-50"
                    aria-label="Go to homepage"
                >
                    Alloy
                </Link>

                {/* Desktop Menu */}
                <div
                 className="hidden md:flex gap-8 text-white/80 font-medium">
                    {navLinks.map(link => (
                        <Link
                        className="hover:bg-cyan-600 px-3 py-2 rounded-full transition"
                        key={link === "Home" ? "/" : link} href={link}>{link}
                        </Link>
                    ))}
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex gap-4 fixed top-4 right-4 z-50">
                    <Link
                        href="/signin"
                        className="px-4 py-2 text-white border border-white/30 hover:bg-white/20 transition"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/signup"
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:scale-105 transition"
                    >
                        Sign Up
                    </Link>
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden text-white fixed top-4 right-4 z-60"
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    aria-label={open ? "Close menu" : "Open menu"}
                >
                    {open ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        id="mobile-menu"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden w-full flex flex-col items-center gap-6 py-6 bg-white/10 backdrop-blur-lg text-white border-t border-white/20 fixed top-0 right-0 z-50"
                    >
                        <Link href="/" onClick={() => setOpen(false)}>
                            Home
                        </Link>
                        <Link href="#features" onClick={() => setOpen(false)}>
                            Features
                        </Link>
                        <Link href="#community" onClick={() => setOpen(false)}>
                            Community
                        </Link>
                        <Link href="#about" onClick={() => setOpen(false)}>
                            About
                        </Link>
                        <div className="flex flex-col gap-4 w-full px-6 text-center">
                            <Link
                            href="/signin"
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 text-white border border-white/30 hover:bg-white/20 transition"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold"
                        >
                            Sign Up
                        </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}