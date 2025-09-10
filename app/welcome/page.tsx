// app/welcome/page.tsx
"use client"; // ✅ Important: makes this a client component

import { useState } from "react";
// your firebase client config
import { User } from "firebase/auth";

export default function WelcomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-500 to-green-500 text-white p-6">
      <h1 className="text-4xl font-bold mb-4">
        Welcome {user ? user.displayName || user.email : "Guest"}!
      </h1>
      <p className="text-lg text-center">
        You are now on the client-only welcome page.
      </p>
    </div>
  );
}
