"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityStore, useNotificationStore } from "@/store/usePostStore";
import {
  Plus,
  ArrowLeft,
  MessageSquare,
  Info,
  Bot,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CommunityCreationModal } from "../modals/CommunityCreation";

export type Community = {
  id: string;
  name: string;
  description: string;
  adminId: string;
  members: string[];
  createdAt?: any;
};

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
};

const CommunitySection = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"chat" | "about" | "ai">("chat");
  const [openModal, setOpenModal] = useState(false);

  const {
    communities,
    fetchCommunities,
    createCommunity,
    joinCommunity,
    leaveCommunity,
  } = useCommunityStore();
  const { sendNotification } = useNotificationStore();

  // 🔹 Fetch all communities on mount
  useEffect(() => {
    if (!user) return;
    fetchCommunities();
  }, [user, fetchCommunities]);

  // 🔹 Determine if user is admin
  useEffect(() => {
    if (!user?.uid) return setCheckingAdmin(false);

    const checkAdmin = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.exists() ? (snap.data() as any)?.role : null;
        const userIsAdmin =
          role === "admin" || communities.some((c) => c.adminId === user.uid);
        setIsAdmin(userIsAdmin);
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [user?.uid, communities]);

  if (checkingAdmin)
    return <div className="text-center p-6">Loading community data...</div>;

  // 🔹 Join / Leave
  const handleJoinLeave = async (community: Community) => {
    if (!user?.uid) return alert("Please log in to join communities.");

    const isMember = community.members?.includes(user.uid);

    if (isMember) {
      await leaveCommunity(community.id, user.uid);
      await sendNotification({
        userId: community.adminId,
        type: "leave",
        title: "Member left",
        message: `${user.displayName || "A member"} left ${community.name}.`,
      });
    } else {
      await joinCommunity(community.id, user.uid);
      await sendNotification({
        userId: community.adminId,
        type: "join",
        title: "Join request",
        message: `${user.displayName || "A member"} joined ${community.name}.`,
      });
    }

    fetchCommunities();
  };

  // 🔹 Community Card
  const CommunityCard = ({ community }: { community: Community }) => {
    const isMember = user && community.members?.includes(user.uid);
    return (
      <motion.div
        layout
        onClick={() => setSelectedCommunity(community)}
        whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(2,6,23,0.08)" }}
        className="p-5 border rounded-2xl bg-white dark:bg-gray-900 cursor-pointer transition"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{community.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {community.description}
            </p>
            <div className="text-xs text-gray-400 mt-2">
              {community.members?.length ?? 0} members
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleJoinLeave(community);
            }}
            className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 transition ${
              isMember
                ? "bg-red-100 text-red-700 dark:bg-red-800/40"
                : "bg-blue-100 text-blue-700 dark:bg-blue-800/40"
            }`}
          >
            {isMember ? <LogOut size={12} /> : <LogIn size={12} />}
            {isMember ? "Leave" : "Join"}
          </button>
        </div>
      </motion.div>
    );
  };

  // 🔹 About Tab
  const AboutTab = ({ community }: { community: Community }) => (
    <div className="space-y-4 p-3">
      <div>
        <h4 className="font-semibold">Description</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {community.description}
        </p>
      </div>

      <div>
        <h4 className="font-semibold">Admin</h4>
        <p className="text-sm mt-1 text-gray-500">{community.adminId}</p>
      </div>

      <div>
        <h4 className="font-semibold">Members</h4>
        <ul className="text-sm list-disc pl-5 text-gray-500 mt-1">
          {community.members?.length ? (
            community.members.map((m, i) => <li key={i}>{m}</li>)
          ) : (
            <li>No members yet</li>
          )}
        </ul>
      </div>
    </div>
  );

  // 🔹 Chat Tab
  const ChatTab = ({ community }: { community: Community }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");

    useEffect(() => {
      const q = query(
        collection(db, "communities", community.id, "messages"),
        orderBy("createdAt", "asc")
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          ...(d.data() as Message),
        }));
        setMessages(data);
      });
      return unsub;
    }, [community.id]);

    const sendMessage = async () => {
      if (!input.trim() || !user) return;
      await addDoc(collection(db, "communities", community.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || "Anonymous",
        text: input.trim(),
        createdAt: serverTimestamp(),
      });
      setInput("");
    };

    return (
      <div className="flex flex-col h-[45vh]">
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm">
              No messages yet — start chatting.
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[70%] mb-2 px-3 py-2 rounded-lg text-sm ${
                  m.senderId === user?.uid
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                <div className="font-semibold text-xs opacity-70">
                  {m.senderName}
                </div>
                <div>{m.text}</div>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 dark:text-white text-sm"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    );
  };

  // 🔹 AI Tab
  const AITab = () => (
    <div className="p-4 text-center text-gray-400">
      <Bot className="mx-auto mb-2" /> AI assistant coming soon…
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {!selectedCommunity ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Communities</h2>
            <button
              onClick={() => setOpenModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
            >
              <Plus size={16} /> Create
            </button>
          </div>

          <AnimatePresence>
            <motion.div
              layout
              className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
            >
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </motion.div>
          </AnimatePresence>

          {openModal && (
            <CommunityCreationModal
              open={openModal}
              onClose={() => setOpenModal(false)}
              userId={user?.uid || ""}
            />
          )}
        </>
      ) : (
        <div>
          <button
            onClick={() => setSelectedCommunity(null)}
            className="flex items-center gap-2 mb-4 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Back to Communities
          </button>

          <h2 className="text-xl font-semibold mb-4">
            {selectedCommunity.name}
          </h2>

          <div className="flex gap-3 mb-4 border-b">
            {["chat", "about", "ai"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-2 px-2 text-sm font-medium ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {tab === "chat" ? (
                  <MessageSquare size={14} className="inline mr-1" />
                ) : tab === "about" ? (
                  <Info size={14} className="inline mr-1" />
                ) : (
                  <Bot size={14} className="inline mr-1" />
                )}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "chat" && <ChatTab community={selectedCommunity} />}
          {activeTab === "about" && <AboutTab community={selectedCommunity} />}
          {activeTab === "ai" && <AITab />}
        </div>
      )}
    </div>
  );
};

export default CommunitySection;
