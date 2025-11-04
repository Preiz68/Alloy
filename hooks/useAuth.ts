import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveFcmToken } from "@/lib/saveFcmToken";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // 👇 Save FCM token if user is logged in
      if (firebaseUser) {
        try {
          await saveFcmToken(firebaseUser.uid);
          console.log("✅ FCM token saved for user:", firebaseUser.uid);
        } catch (error) {
          console.error("❌ Error saving FCM token:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};

export default useAuth;
