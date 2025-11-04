"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";
import { onForegroundMessage } from "@/lib/saveFcmToken";

/**
 * Listens to foreground Firebase Cloud Messages
 * and displays them via react-toastify.
 */
export function useFcmToastify() {
  useEffect(() => {
    const unsub = onForegroundMessage((payload: any) => {
      const notif = payload?.notification;
      const data = payload?.data;

      const message =
        notif?.body ||
        data?.message ||
        notif?.title ||
        "You have a new notification.";

      toast(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    });

    return () => {
      try {
        unsub?.();
      } catch {
        /* noop */
      }
    };
  }, []);
}
