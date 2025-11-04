"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  setDoc,
} from "firebase/firestore";

type Message = {
  id: string;
  sender: string;
  text: string;
  timestamp: any;
  readBy?: string[];
};

export default function ChatWindow({
  currentUserId,
  threadId,
}: {
  currentUserId: string;
  threadId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Load messages
  useEffect(() => {
    if (!threadId) return;

    const q = query(
      collection(db, "threads", threadId, "messages")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(data);
    });

    return () => unsub();
  }, [threadId]);

  // Listen for typing indicators
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "threads", threadId, "typingStatus"), (snap) => {
      const users = snap.docs.filter((doc) => doc.data().isTyping).map((doc) => doc.id);
      setTypingUsers(users.filter((id) => id !== currentUserId));
    });

    return () => unsub();
  }, [threadId, currentUserId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageRef = await addDoc(collection(db, "threads", threadId, "messages"), {
      sender: currentUserId,
      text: newMessage,
      timestamp: serverTimestamp(),
      readBy: [currentUserId],
    });

    await updateDoc(doc(db, "threads", threadId), {
      lastMessage: newMessage,
      updatedAt: serverTimestamp(),
    });

    setNewMessage("");
    await setDoc(doc(db, "threads", threadId, "typingStatus", currentUserId), { isTyping: false });
  };

  // Typing status
  const handleTyping = async (value: string) => {
    setNewMessage(value);
    await setDoc(doc(db, "threads", threadId, "typingStatus", currentUserId), { isTyping: !!value });
  };

  // Mark messages as read
  useEffect(() => {
    messages.forEach(async (msg) => {
      if (!msg.readBy?.includes(currentUserId)) {
        await updateDoc(doc(db, "threads", threadId, "messages", msg.id), {
          readBy: arrayUnion(currentUserId),
        });
      }
    });
  }, [messages, currentUserId, threadId]);

  return (
    <div className="flex flex-col flex-1 glass rounded-xl">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === currentUserId ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-3 py-2 rounded-lg max-w-xs ${
                msg.sender === currentUserId
                  ? "bg-gradient-to-r from-purple-600 to-pink-500"
                  : "glass"
              }`}
            >
              <p>{msg.text}</p>
              <span className="block text-xs text-white/60 mt-1">
                {msg.timestamp?.toDate().toLocaleTimeString() || "..."}
              </span>
              {msg.readBy!.length > 1 && <span className="block text-xs text-green-400">✓ Seen</span>}
            </div>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <p className="text-sm text-white/60">{typingUsers.join(", ")} typing...</p>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 flex items-center gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/10 px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-pink-500/40"
        />
        <button
          onClick={handleSend}
          className="bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
