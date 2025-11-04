"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { createThread } from "@/lib/createThread";

export default function NewChat({
  currentUserId,
  onNewThread,
}: {
  currentUserId: string;
  onNewThread: (id: string) => void;
}) {
  const [email, setEmail] = useState("");

  const handleNewChat = async () => {
    if (!email.trim()) return;

    // 1. Find the user by email
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);

    if (snap.empty) {
      alert("No user found with that email");
      return;
    }

    const userDoc = snap.docs[0].data();
    const otherUserId = userDoc.uid;

    // 2. Create thread
    const threadId = await createThread(currentUserId, otherUserId);

    // 3. Open that thread
    onNewThread(threadId);

    // 4. Reset input
    setEmail("");
  };

  return (
    <div className="p-3 border-b border-white/10 flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter user email..."
        className="flex-1 bg-white/10 px-2 py-1 rounded text-sm"
      />
      <button
        onClick={handleNewChat}
        className="bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-1 rounded text-sm"
      >
        New Chat
      </button>
    </div>
  );
}
