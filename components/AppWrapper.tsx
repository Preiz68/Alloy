import { useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useProgressStore } from "@/store/usePostStore";
import { useAuth } from "@/hooks/useAuth";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { listenToProgress } = useProgressStore();
  useEffect(() => {
    if (!user) return;
    const unsubProgress = listenToProgress(user.uid);
    return () => unsubProgress?.();
  }, [user?.uid, listenToProgress]);

  useNotifications();

  return <>{children}</>;
}
