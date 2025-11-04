// /hooks/useNotifications.tsx
"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@/store/usePostStore";
import { onForegroundMessage, saveFcmToken } from "@/lib/saveFcmToken";
import { useAuth } from "@/hooks/useAuth"; // your auth hook

export function useNotifications() {
  const { user } = useAuth();
  const listenToUserNotifications = useNotificationStore(
    (s) => s.listenToUserNotifications
  );
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  useEffect(() => {
    if (!user) return;

    // Save / refresh FCM token on login
    saveFcmToken(user.uid).catch(console.error);

    // Listen to firestore notifications
    const unsubFirestore = listenToUserNotifications(user.uid);

    // Foreground push handler
    const unsubFcm = onForegroundMessage((payload) => {
      // Optionally show in-app toast here (payload.notification.title, payload.notification.body)
      console.log("FCM foreground message:", payload);
    });

    return () => {
      unsubFirestore?.();
      unsubFcm?.();
    };
  }, [user?.uid, listenToUserNotifications]);

  return {
    notifications,
    markAsRead,
  };
}
