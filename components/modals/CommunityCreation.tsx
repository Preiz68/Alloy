"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useCommunityStore } from "@/store/usePostStore";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

interface CommunityCreationModalProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

export const CommunityCreationModal = ({
  open,
  onClose,
  userId,
}: CommunityCreationModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const { createCommunity } = useCommunityStore();

  const handleCreate = async () => {
    if (!userId) {
      toast.error("You must be logged in to create a community.");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter a community name.");
      return;
    }

    setLoading(true);

    try {
      // Create community in Firestore
      const docRef = await addDoc(collection(db, "communities"), {
        name: name.trim(),
        description: description.trim(),
        adminId: userId,
        members: [userId],
        createdAt: serverTimestamp(),
      });

      // Sync to Zustand store with Firestore-generated ID
      await createCommunity({
        id: docRef.id,
        name: name.trim(),
        description: description.trim(),
        adminId: userId,
        members: [userId],
      });

      toast.success("Community created successfully!");
      setName("");
      setDescription("");
      onClose();
    } catch (error: any) {
      console.error("Error creating community:", error);
      if (error.code === "permission-denied") {
        toast.error("You are not authorized to create a community.");
      } else {
        toast.error("Failed to create community. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Create a New Community
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Community Name
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend Wizards"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-800 dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              placeholder="What's this community about?"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-800 dark:text-white"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};
