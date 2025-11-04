// /lib/fcm.ts
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase"; // your existing file

// Save FCM token to user's document
export async function saveFcmToken(userId: string) {
  try {
    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
    });

    if (token) {
      await updateDoc(doc(db, "users", userId), { fcmToken: token });
      return token;
    }
  } catch (err) {
    console.warn("Could not get/save FCM token:", err);
  }
  return null;
}

// Register foreground message handler (returns unsubscribe function)
export function onForegroundMessage(callback: (payload: any) => void) {
  try {
    const messaging = getMessaging();
    const handler = (payload: any) => callback(payload);
    onMessage(messaging, handler);
    // onMessage has no official unsubscribe handle — returning a noop
    return () => {
      /* nothing to cleanup for onMessage in current SDK */
    };
  } catch (err) {
    console.warn("onForegroundMessage failed:", err);
    return () => {};
  }
}
