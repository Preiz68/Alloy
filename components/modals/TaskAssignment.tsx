"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Task, Notification } from "@/store/usePostStore";

interface TaskAssignmentModalProps {
  groups: any[];
  onClose: () => void;
  assignTask: (groupId: string, task: Task) => Promise<void>;
  sendNotification: (
    payload: Omit<Notification, "id" | "createdAt">
  ) => Promise<void>;
}

const TaskAssignmentModal = ({
  groups,
  onClose,
  assignTask,
  sendNotification,
}: TaskAssignmentModalProps) => {
  const [groupId, setGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedGroup = groups.find((g) => g.id === groupId);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !title.trim()) return;
    setLoading(true);

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      assignedTo,
      dueDate,
      completed: false,
      approved: false,
    };

    try {
      await assignTask(groupId, newTask);

      // Send notification to assigned member(s)
      if (assignedTo) {
        await sendNotification({
          userId: assignedTo,
          title: "New Task Assigned",
          message: `You have been assigned a new task: "${title}"`,
          groupId,
          taskId: newTask.id,
          read: false,
        });
      }

      onClose();
    } catch (error) {
      console.error("❌ Error assigning task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Assign Task
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleAssign} className="space-y-4">
          {/* Group Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Group
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-800"
              required
            >
              <option value="">Select...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assign To Selector */}
          {selectedGroup && selectedGroup.members?.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Assign To
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-800"
                required
              >
                <option value="">Select member...</option>
                {selectedGroup.members.map((memberId: string) => (
                  <option key={memberId} value={memberId}>
                    {memberId}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Task Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-800"
              placeholder="e.g. Build landing page"
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-800 resize-none"
              rows={3}
              placeholder="Describe the task..."
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-800"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 mt-2 transition"
          >
            {loading ? "Assigning..." : "Assign Task"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskAssignmentModal;
