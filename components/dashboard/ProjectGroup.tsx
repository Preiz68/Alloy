"use client";
import React, { useState, useEffect } from "react";
import { Bot, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  useGroupStore,
  useCompletionStore,
  useNotificationStore,
  Group,
} from "@/store/usePostStore";
import {
  Plus,
  ArrowLeft,
  Check,
  MessageSquare,
  Info,
  ClipboardList,
} from "lucide-react";
import GroupCreationModal from "@/components/modals/GroupCreation";
import TaskAssignmentModal from "@/components/modals/TaskAssignment";
import ApprovalModal from "@/components/modals/ApprovalModal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ProjectGroupsSection = () => {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "chat" | "about">(
    "tasks"
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Modals
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openApprovalModal, setOpenApprovalModal] = useState(false);

  // Stores
  const { groups, fetchGroups, assignTask, submitCompletion } = useGroupStore();
  const { requests, fetchRequests, updateStatus } = useCompletionStore();
  const { sendNotification } = useNotificationStore();

  useEffect(() => {
    if (!user) return;
    fetchGroups();
    fetchRequests();
  }, [fetchGroups, fetchRequests]);

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

  // 🔹 Group Card
  const GroupCard = ({ group }: { group: Group }) => (
    <motion.div
      layout
      whileHover={{ y: -6, boxShadow: "0 10px 30px rgba(2,6,23,0.08)" }}
      onClick={() => setSelectedGroup(group)}
      className="p-5 border rounded-2xl bg-white dark:bg-gray-900 cursor-pointer transition-all"
    >
      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
        {group.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {group.description}
      </p>
      <div className="text-xs text-gray-400 mt-3">
        {group.members?.length ?? 0} members
      </div>
    </motion.div>
  );

  // 🔹 Task Tab
  const TaskTab = ({ group }: { group: Group }) => (
    <div className="space-y-4 mt-4">
      {group.tasks?.length ? (
        group.tasks.map((task: any, idx: number) => (
          <div
            key={idx}
            className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 flex justify-between items-center"
          >
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-100">
                {task.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {task.description}
              </p>
              <div className="text-xs mt-2">
                Status:{" "}
                <span
                  className={`font-medium ${
                    task.approved
                      ? "text-green-600"
                      : task.completed
                      ? "text-yellow-600"
                      : "text-gray-500"
                  }`}
                >
                  {task.approved
                    ? "Approved"
                    : task.completed
                    ? "Pending Review"
                    : "Not Completed"}
                </span>
              </div>
            </div>
            {!task.completed && (
              <button
                onClick={() =>
                  submitCompletion(group.id, task.id, user?.uid as string)
                }
                className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Mark Complete
              </button>
            )}
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-sm">No tasks assigned yet.</div>
      )}
    </div>
  );

  // 🔹 Chat Tab
  // 🧩 CHAT TAB with integrated AI Assist

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

  // 🔹 About Tab
  const AboutTab = ({ group }: { group: Group }) => (
    <div className="space-y-5">
      <div>
        <h4 className="font-semibold">Overview</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {group.projectDetails?.overview || "—"}
        </p>
      </div>

      <div>
        <h4 className="font-semibold">Goal</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {group.projectDetails?.goal || "—"}
        </p>
      </div>

      <div>
        <h4 className="font-semibold">Duration</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {group.projectDetails?.duration || "—"}
        </p>
      </div>

      <div>
        <h4 className="font-semibold">Members</h4>
        <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc pl-5 mt-1 space-y-1">
          {group.members?.length
            ? group.members.map((m, i) => <li key={i}>{m}</li>)
            : "No members yet"}
        </ul>
      </div>
    </div>
  );

  // 🔹 Group Detail
  const GroupDetailPage = ({ group }: { group: Group }) => (
    <motion.div
      key={group.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.2 }}
      className="p-4"
    >
      <div className="rounded-2xl bg-gray-500 p-6 text-white shadow-md mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{group.name}</h2>
          <p className="text-sm opacity-90 mt-1">{group.description}</p>
        </div>
        <button
          onClick={() => setSelectedGroup(null)}
          className="bg-white/10 hover:bg-white/20 p-2 rounded-full"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 border-b">
          {["tasks", "chat", "about"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex items-center gap-2 pb-2 text-sm capitalize ${
                activeTab === tab
                  ? "border-b-2 border-purple-500 text-purple-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              {tab === "tasks" && <ClipboardList size={15} />}
              {tab === "chat" && <MessageSquare size={15} />}
              {tab === "about" && <Info size={15} />}
              {tab}
            </button>
          ))}
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setOpenTaskModal(true)}
              className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm flex justify-center items-center"
            >
              Assign Task
            </button>
            <button
              onClick={() => setOpenApprovalModal(true)}
              className="bg-green-600 text-white px-4 py-1 rounded-md text-sm"
            >
              Review
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        {activeTab === "tasks" && <TaskTab group={group} />}
        {activeTab === "chat" && <ChatTab />}
        {activeTab === "about" && <AboutTab group={group} />}
      </div>
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
                {isAdmin && (
                  <button
                    onClick={() => setOpenApprovalModal(true)}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-sm border"
                  >
                    Review Requests
                  </button>
                )}
                <button
                  onClick={() => setOpenGroupModal(true)}
                  className="px-3 py-2 rounded-md bg-purple-600 text-white flex items-center gap-2 shadow-sm"
                >
                  <Plus size={16} /> Create Group
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
