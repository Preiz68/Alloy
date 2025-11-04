"use client";

import Link from "next/link";



export default function Navbar() {

    return (
        <nav className="w-full bg-transparent flex justify-between">
            <div className="max-w-7xl px-6 py-4 flex mx-auto items-center">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-3xl font-bold text-white fixed top-4 left-4 z-50"
                    aria-label="Go to homepage"
                >
                    Alloy
                </Link>


                {/* Auth Buttons */}
                <div className="flex gap-4 fixed top-4 right-4 z-50">
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
                </div>
        </nav>
    );
}