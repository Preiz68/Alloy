"use client";
import React from "react";
import { motion } from "framer-motion";
import { X, Check, XCircle } from "lucide-react";

interface ApprovalModalProps {
  requests: any[];
  onClose: () => void;
  approve: (requestId: string, status: "approved" | "rejected") => void;
}

const ApprovalModal = ({ requests, onClose, approve }: ApprovalModalProps) => {
  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Review Task Completions</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {pending.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No pending requests.
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {pending.map((r) => (
              <div
                key={r.id}
                className="border rounded-lg p-3 flex justify-between items-center bg-gray-50 dark:bg-gray-800"
              >
                <div>
                  <p className="font-medium text-sm">{r.taskTitle}</p>
                  <p className="text-xs text-gray-500">{r.userName}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(r.id, "approved")}
                    className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => approve(r.id, "rejected")}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ApprovalModal;
