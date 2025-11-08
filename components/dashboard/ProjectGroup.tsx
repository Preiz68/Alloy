"use client";
import React, { useState, useEffect } from "react";
import { Bot, Icon, MoreHorizontal, PlusCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import {
  useGroupStore,
  useCompletionStore,
  useNotificationStore,
  Group,
  usePostsStore,
} from "@/store/usePostStore";
import {
  Users,
  Edit3,
  Trash2,
  ClipboardList,
  Plus,
  ArrowLeft,
  Eye,
  Info,
} from "lucide-react";
import GroupCreationModal from "@/components/modals/GroupCreation";
import TaskAssignmentModal from "@/components/modals/TaskAssignment";
import ApprovalModal from "@/components/modals/ApprovalModal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DeleteGroupModal from "../modals/DeleteGroupModal";

export const moreAdminOptions = [
  {
    id: "manageMembers",
    label: "Manage Members",
    icon: Users,
    color: "#3B82F6", // blue-500
  },
  {
    id: "editGroup",
    label: "Edit Group",
    icon: Edit3,
    color: "#10B981", // emerald-500
  },
  {
    id: "deleteGroup",
    label: "Delete Group",
    icon: Trash2,
    color: "#EF4444", // red-500
  },
  {
    id: "assignTask",
    label: "Assign Task",
    icon: ClipboardList,
    color: "#F59E0B", // amber-500
  },
  {
    id: "viewRequests",
    label: "Completion Requests",
    icon: Eye,
    color: "#8B5CF6", // violet-500
  },
  {
    id: "aboutGroup",
    label: "About Group",
    icon: Info,
    color: "#06B6D4", // cyan-500
  },
];

const ProjectGroupsSection = () => {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // Modals
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Stores
  const { groups, assignTask, editGroup, deleteGroup } = useGroupStore();
  const { requests, fetchRequests, updateStatus } = useCompletionStore();
  const { sendNotification } = useNotificationStore();

  useEffect(() => {
    const fetch = async () => {
      await useGroupStore.getState().fetchGroups();
    };
    fetch();
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (!user?.uid) return setCheckingAdmin(false);
    const check = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.exists() ? (snap.data() as any)?.role : null;
        const userIsAdmin =
          role === "admin" || groups.some((g) => g.adminId === user.uid);
        setIsAdmin(userIsAdmin);
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingAdmin(false);
      }
    };
    check();
  }, [user?.uid, groups]);

  if (checkingAdmin)
    return <div className="p-6 text-center text-gray-500">Loading...</div>;

  const ChatTab = () => {
    const [messages, setMessages] = useState<
      { sender: string; text: string; isAI?: boolean }[]
    >([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // Keep AI memory of last 10 messages
    const getContext = () => {
      return messages
        .slice(-10)
        .map((m) => `${m.sender}: ${m.text}`)
        .join("\n");
    };

    const handleSend = (isAI = false) => {
      if (!input.trim()) return;
      setMessages((prev) => [...prev, { sender: "You", text: input }]);
      if (isAI) handleAIResponse(input);
      setInput("");
    };

    const handleAIResponse = async (prompt: string) => {
      setLoading(true);
      try {
        const context = messages
          .slice(-10)
          .map((m) => `${m.sender}: ${m.text}`)
          .join("\n");

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `You are assisting a developer team chat in project "${selectedGroup?.name}".
Description: ${selectedGroup?.description}.
Recent conversation:
${context}

User asked: ${prompt}`,
          }),
        });

        const data = await res.json();
        const aiReply = data.reply || "⚠️ AI Assist encountered an error.";

        setMessages((prev) => [
          ...prev,
          { sender: "AI", text: aiReply, isAI: true },
        ]);
      } catch (err) {
        console.error("AI error:", err);
        setMessages((prev) => [
          ...prev,
          {
            sender: "AI",
            text: "⚠️ AI Assist encountered an error.",
            isAI: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex flex-col h-[40vh]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm">
              Start chatting about your project!
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.isAI
                    ? "bg-purple-100 dark:bg-gray-700 border border-purple-400 self-start"
                    : msg.sender === "You"
                    ? "bg-blue-500 text-white self-end"
                    : "bg-white dark:bg-gray-900 self-start"
                } shadow-sm`}
              >
                <div className="text-xs font-semibold opacity-70">
                  {msg.sender}
                </div>
                <div className="text-sm mt-1 whitespace-pre-line">
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="text-xs text-gray-400 mt-2 animate-pulse">
              AI is thinking...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm dark:bg-gray-900"
            onKeyDown={(e) =>
              e.key === "Enter" && (e.shiftKey ? null : handleSend(false))
            }
          />
          <button
            onClick={() => handleSend(false)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"
          >
            <Send size={14} />
            Send
          </button>
          <button
            onClick={() => handleSend(true)}
            disabled={loading}
            className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"
          >
            <Bot size={14} />
            {loading ? "Thinking..." : "AI Assist"}
          </button>
        </div>
      </div>
    );
  };

  // 🔹 Group Card
  const GroupCard = ({ group }: { group: Group }) => (
    <motion.div
      key={group.id}
      layout
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={() => setSelectedGroup(group)}
    >
      <div className="relative">
        <Image src="/Folder2.png" alt="folder" width={100} height={100} />
        <PlusCircle size={20} className="absolute right-22 top-8" />
      </div>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
        {group.name}
      </h3>
    </motion.div>
  );

  // 🔹 Group Detail
  const GroupDetailPage = ({ group }: { group: Group }) => (
    <motion.div className="p-4 shadow-md rounded-lg">
      <div className="p-6 text-white bg-amber-950 mb-6 relative flex items-center justify-center">
        <button
          onClick={() => setSelectedGroup(null)}
          className="bg-white/10 hover:bg-white/20 p-2 rounded-full absolute
          top-4 left-4 flex items-center justify-center"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div>
          <h2 className="text-2xl font-bold">{group.name}</h2>
          <p className="text-sm opacity-90 mt-1">{group.description}</p>
        </div>
        <div
          className="absolute
          top-4 right-4 "
        >
          <button
            onClick={() => {
              setIsMoreOptionsOpen((prev) => !prev);
            }}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-full relative flex items-center justify-center"
          >
            <MoreHorizontal size={18} />
          </button>
          <div className="absolute left-2 -bottom-24 translate-y-1/2 ml-3 z-70">
            {isMoreOptionsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="bg-white shadow-lg border border-gray-200 text-sm text-gray-800 w-44 py-2"
              >
                {isAdmin ? (
                  <div>
                    {moreAdminOptions.map(
                      ({ id, label, icon: Icon, color }) => (
                        <button
                          onClick={() => {
                            setIsMoreOptionsOpen(false);
                            switch (id) {
                              case "manageMembers":
                                // Open manage members modal
                                break;
                              case "editGroup":
                                setIsEditing(true);
                                setEditingGroup(group);
                                editGroup(id, editingGroup);
                                setOpenGroupModal(true);
                                break;
                              case "deleteGroup":
                                setDeleteModalOpen(true);
                                break;
                              case "aboutGroup":
                                // Open about group modal
                                break;
                              case "assignTask":
                                setOpenTaskModal(true);
                                break;
                              case "viewRequests":
                                setOpenApprovalModal(true);
                                break;
                            }
                          }}
                          className="px-3 py-2 flex gap-2 hover:bg-purple-50 hover:text-blue-950 cursor-pointer transition-all duration-200 border-b-2 border-gray-300 last:border-b-0 w-full text-left"
                          key={id}
                        >
                          <Icon size={15} color={color} />
                          <span>{label}</span>
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <div></div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <ChatTab />
    </motion.div>
  );

  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        {selectedGroup ? (
          <GroupDetailPage group={selectedGroup} />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Project Groups</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Collaborate on real projects and track progress.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpenGroupModal(true)}
                  className="px-3 py-2 rounded-md bg-purple-600 text-white flex items-center gap-2 shadow-sm"
                >
                  <Plus size={16} /> Create Group
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groups.length ? (
                groups.map((g) => <GroupCard key={g.id} group={g} />)
              ) : (
                <p className="text-gray-500 text-sm">No project groups yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {openGroupModal && (
          <GroupCreationModal
            onClose={() => setOpenGroupModal(false)}
            onCreate={useGroupStore.getState().createGroup}
            isEditing={isEditing}
          />
        )}

        {deleteModalOpen && selectedGroup && (
          <DeleteGroupModal
            {...{
              selectedGroup,
              setSelectedGroup,
              onClose: () => setDeleteModalOpen(false),
            }}
          />
        )}

        {openTaskModal && (
          <TaskAssignmentModal
            groups={groups}
            onClose={() => setOpenTaskModal(false)}
            assignTask={assignTask}
            sendNotification={sendNotification}
          />
        )}

        {openApprovalModal && (
          <ApprovalModal
            requests={requests}
            onClose={() => setOpenApprovalModal(false)}
            approve={updateStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectGroupsSection;
