// /components/NotificationsPanel.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationsPanel() {
  const { notifications, markAsRead } = useNotifications();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="w-96 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4">
      <h4 className="text-lg font-semibold mb-3">Notifications</h4>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {notifications.map((n:any) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`p-3 rounded-md border ${
                n.read
                  ? "bg-gray-50 dark:bg-gray-800"
                  : "bg-white dark:bg-gray-900"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">
                    {n.title || "Notification"}
                  </div>
                  <div className="text-xs text-gray-500">{n.message}</div>
                </div>
                <div className="text-xs text-gray-400 ml-3">
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700"
                  >
                    Mark read
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
