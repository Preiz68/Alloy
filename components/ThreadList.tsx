"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

type Thread = {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt: any;
};

export default function ThreadList({
  currentUserId,
  onSelectThread,
}: {
  currentUserId: string;
  onSelectThread: (id: string) => void;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "threads"),
      where("participants", "array-contains", currentUserId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Thread[];
      setThreads(data);
    });

    return () => unsub();
  }, [currentUserId]);

  return (
    <div className="w-72 glass rounded-xl p-4">
      <h2 className="text-white font-bold mb-4">Chats</h2>
      {threads.map((thread) => (
        <div
          key={thread.id}
          onClick={() => onSelectThread(thread.id)}
          className="p-3 mb-2 rounded-lg hover:bg-white/10 cursor-pointer"
        >
          <p className="font-semibold text-white">
            {thread.participants.find((p) => p !== currentUserId)}
          </p>
          <p className="text-xs text-white/60">{thread.lastMessage}</p>
        </div>
      ))}
    </div>
  );
}
