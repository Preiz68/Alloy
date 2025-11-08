"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Group } from "@/store/usePostStore";

interface GroupCreationModalProps {
  onClose: () => void;
  onCreate: (data: Omit<Group, "id" | "tasks" | "createdAt">) => Promise<void>;
  isEditing: boolean;
}

const GroupCreationModal = ({
  onClose,
  onCreate,
  isEditing,
}: GroupCreationModalProps) => {
  const { user } = useAuth();

  // Form states
  const [loading, setLoading] = useState(false);

  const [projectDetails, setProjectDetails] = useState({
    name: "",
    description: "",
    overview: "",
    goal: "",
    duration: "",
  });

  const handleProjectDetailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProjectDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !projectDetails.name.trim())
      console.log("❌ User not authenticated or invalid group name");

    console.log("🚀 Creating group with details:", projectDetails);

    setLoading(true);

    const newGroup: Omit<Group, "id" | "tasks" | "createdAt"> = {
      name: projectDetails.name,
      description: projectDetails.description,
      createdBy: user!.uid,
      adminId: user!.uid,
      members: [user!.uid],
      projectDetails: {
        overview: projectDetails.overview,
        goal: projectDetails.goal,
        duration: projectDetails.duration,
      },
    };

    try {
      await onCreate(newGroup);
      onClose();
    } catch (error) {
      console.error("❌ Error creating group:", error);
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
            Create New Group
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input
              name="name"
              value={projectDetails.name}
              onChange={handleProjectDetailChange}
              className="w-full border rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-800"
              placeholder="e.g. Frontend Devs"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={projectDetails.description}
              onChange={handleProjectDetailChange}
              className="w-full border rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-800 resize-none"
              rows={3}
              placeholder="Describe what this group will focus on..."
            />
          </div>

          {/* Overview */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Project Overview
            </label>
            <textarea
              name="overview"
              value={projectDetails.overview}
              onChange={handleProjectDetailChange}
              className="w-full border rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-800 resize-none"
              rows={2}
              placeholder="A brief summary of the project..."
            />
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Project Goal
            </label>
            <input
              name="goal"
              value={projectDetails.goal}
              onChange={handleProjectDetailChange}
              className="w-full border rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-800"
              placeholder="e.g. Build a dev collaboration app"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <input
              name="duration"
              value={projectDetails.duration}
              onChange={handleProjectDetailChange}
              className="w-full border rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-800"
              placeholder="e.g. 4 weeks or Oct–Nov 2025"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition"
          >
            {isEditing && loading ? "Updating..." : "Update"} ||{" "}
            {!isEditing && loading ? "Creating..." : "Create Group"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default GroupCreationModal;
