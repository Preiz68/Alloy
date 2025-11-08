"use client";

import { create } from "zustand";
import { db, storage } from "@/lib/firebase";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import { saveFcmToken, onForegroundMessage } from "@/lib/saveFcmToken";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  where,
  doc,
  getDocs,
  arrayUnion,
  increment,
  DocumentData,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { User } from "firebase/auth";

// ------------------------------
// 🔹 Utility: LinkedIn-style Relative Time Formatter
// ------------------------------
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
};

// ------------------------------
// 🔹 Types
// ------------------------------
type Post = {
  id: string;
  author: string;
  content: string;
  time: string;
  likes: number;
  imageUrl?: string | null;
  edited?: boolean;
  userId?: string;
};

type ThemeState = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  initializeTheme: () => void;
};

type PostsState = {
  posts: Post[];
  newPost: string;
  newImage?: File | null;
  loading: boolean;
  isAddingPost: boolean;
  isModalOpen: boolean;
  setNewPost: (newPost: string) => void;
  setNewImage: (file: File | null) => void;
  fetchPosts: () => () => void;
  addPost: (
    content: string,
    author: User | null,
    imageFile?: File | null
  ) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  deletePost: (id: string, imageUrl?: string | null) => Promise<void>;
  editPost: (
    id: string,
    data: Partial<Post>,
    newImage?: File | null
  ) => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
  approved: boolean;
};

export type Group = {
  id: string;
  name: string;
  adminId: string;
  description: string;
  createdBy: string;
  createdAt: any;
  members: string[];
  tasks: Task[];
  projectDetails: {
    overview: string;
    goal: string;
    duration: string;
  };
};

interface GroupState {
  groups: Group[];
  loading: boolean;
  fetchGroups: () => Promise<void>;
  createGroup: (
    data: Omit<Group, "id" | "createdAt" | "tasks">
  ) => Promise<void>;
  editGroup: (groupId: string, data: Group | null) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  addMember: (groupId: string, memberId: string) => Promise<void>;
  assignTask: (groupId: string, task: Task) => Promise<void>;
}

interface CompletionRequest {
  id: string;
  groupId: string;
  taskId: string;
  memberId: string;
  submittedAt: any;
  status: "pending" | "approved" | "rejected";
}

interface CompletionState {
  requests: CompletionRequest[];
  submitRequest: (
    data: Omit<CompletionRequest, "id" | "submittedAt" | "status">
  ) => Promise<void>;
  fetchRequests: () => Promise<void>;
  updateStatus: (
    requestId: string,
    status: "approved" | "rejected"
  ) => Promise<void>;
}

export type Notification = {
  id: string;
  userId: string;
  type?: string;
  title?: string;
  message?: string;
  groupId?: string;
  projectId?: string;
  taskId?: string;
  read?: boolean;
  createdAt?: any;
};

interface NotificationState {
  notifications: Notification[];
  listenToUserNotifications: (userId: string | null) => () => void;
  sendNotification: (
    payload: Omit<Notification, "id" | "createdAt">
  ) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: (userId: string) => Promise<void>;
}

type ProgressDoc = {
  userId: string;
  completedTasks?: number;
  streak?: number;
  lastUpdated?: any;
};

interface ProgressState {
  progress: ProgressDoc | null;
  listenToProgress: (userId: string | null) => () => void;
}

type ToastState = {
  message: string | null;
  show: (message: string) => void;
  hide: () => void;
};

if (typeof window !== "undefined" && (window as any).usePostsStore) {
  (window as any).usePostsStore.destroy();
}

// ------------------------------
// 🔹 Posts Store
// ------------------------------

let intervalInitialized = false;

export const usePostsStore = create<PostsState>((set, get) => {
  // ✅ Auto-refresh relative time every 60 seconds
  if (!intervalInitialized) {
    intervalInitialized = true;
    setInterval(() => {
      const updated = get().posts.map((post) => {
        const parsedDate = new Date(post.time);
        return { ...post, time: getRelativeTime(parsedDate) };
      });
      set({ posts: updated });
    }, 60000);
  }

  return {
    posts: [],
    newPost: "",
    newImage: null,
    loading: true,
    isAddingPost: false,
    isModalOpen: false,

    setNewPost: (newPost) => set({ newPost }),
    setNewImage: (file) => set({ newImage: file }),

    fetchPosts: (): (() => void) => {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: Post[] = snapshot.docs.map((doc) => {
          const docData = doc.data() as DocumentData;
          const createdAt = docData.createdAt?.toDate?.();

          return {
            id: doc.id,
            author: docData.author || "Unknown",
            content: docData.content || "",
            imageUrl: docData.imageUrl || null,
            time: createdAt ? createdAt.toLocaleString() : "",
            likes: docData.likes ?? 0,
            edited: docData.edited ?? false,
            userId: docData.userId || "",
          };
        });

        set({ posts: data, loading: false });
      });

      return unsubscribe; // ✅ Explicitly returned
    },

    addPost: async (content, author, imageFile) => {
      if (!content.trim() && !imageFile) return;
      set({ isAddingPost: true });

      try {
        let imageUrl: string | null = null;

        if (imageFile) {
          const imageRef = ref(
            storage,
            `posts/${Date.now()}-${imageFile.name}`
          );
          await uploadBytes(imageRef, imageFile);
          imageUrl = await getDownloadURL(imageRef);
        }

        await addDoc(collection(db, "posts"), {
          content,
          author: author?.displayName || "Anonymous",
          userId: author?.uid ?? "",
          imageUrl,
          createdAt: serverTimestamp(),
          likes: 0,
          edited: false,
        });
      } catch (err) {
        console.error("❌ Error adding post:", err);
      } finally {
        set({
          newPost: "",
          newImage: null,
          isModalOpen: false,
          isAddingPost: false,
        });
      }
    },

    likePost: async (id) => {
      try {
        const postRef = doc(db, "posts", id);
        await updateDoc(postRef, { likes: increment(1) });
      } catch (err) {
        console.error("❌ Error liking post:", err);
      }
    },

    deletePost: async (id, imageUrl) => {
      try {
        await deleteDoc(doc(db, "posts", id));
        set({ posts: get().posts.filter((post) => post.id !== id) });

        if (imageUrl) {
          const path = decodeURIComponent(
            imageUrl.split("/o/")[1].split("?")[0]
          );
          const imageRef = ref(storage, path);
          await deleteObject(imageRef);
        }
      } catch (error) {
        console.error("❌ Error deleting post:", error);
      }
    },

    editPost: async (id, data, newImage) => {
      try {
        let imageUrl = data.imageUrl || null;

        if (newImage) {
          const imageRef = ref(storage, `posts/${Date.now()}-${newImage.name}`);
          await uploadBytes(imageRef, newImage);
          imageUrl = await getDownloadURL(imageRef);
        }

        const updatedData = {
          ...data,
          imageUrl,
          edited: true,
        };

        await updateDoc(doc(db, "posts", id), updatedData);

        set({
          posts: get().posts.map((post) =>
            post.id === id ? { ...post, ...updatedData } : post
          ),
        });
      } catch (error) {
        console.error("❌ Error editing post:", error);
      }
    },

    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),
  };
});

// ------------------------------
// 🔹 Theme Store
// ------------------------------
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",

  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
    set({ theme: newTheme });
  },

  initializeTheme: () => {
    if (typeof window !== "undefined") {
      const savedTheme =
        (localStorage.getItem("theme") as "light" | "dark") || "light";
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      set({ theme: savedTheme });
    }
  },
}));

export const useGroupStore = create<
  GroupState & {
    removeMember: (groupId: string, memberId: string) => Promise<void>;
    submitCompletion: (
      groupId: string,
      taskId: string,
      memberId: string
    ) => Promise<void>;
    approveCompletion: (
      groupId: string,
      taskId: string,
      memberId: string,
      status: "approved" | "rejected"
    ) => Promise<void>;
  }
>((set, get) => ({
  groups: [],
  loading: false,
  deleteGroup: async (groupId) => {
    try {
      await deleteDoc(doc(db, "groups", groupId));
      set({ groups: get().groups.filter((group) => group.id !== groupId) });
    } catch (error) {
      console.error("❌ Error deleting group:", error);
    }
  },
  editGroup: async (groupId, data) => {
    if (!data) return;
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, data);
      set({
        groups: get().groups.map((group) =>
          group.id === groupId ? { ...group, ...data } : group
        ),
      });
    } catch (error) {
      console.error("❌ Error editing group:", error);
    }
  },

  // 🔹 Fetch all groups
  fetchGroups: async () => {
    set({ loading: true });
    const snapshot = await getDocs(collection(db, "groups"));
    const groups = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Group)
    );
    set({ groups, loading: false });
  },

  // 🔹 Create new group
  createGroup: async (data) => {
    const docRef = await addDoc(collection(db, "groups"), {
      ...data,
      createdAt: serverTimestamp(),
      tasks: [],
      members: [data.createdBy],
    });
    set({
      groups: [
        ...get().groups,
        {
          id: docRef.id,
          ...data,
          tasks: [],
          members: [data.createdBy],
          createdAt: new Date(),
        },
      ],
    });
  },

  // 🔹 Add a member (only admin)
  addMember: async (groupId, memberId) => {
    const group = get().groups.find((g) => g.id === groupId);
    const { user } = useAuth();

    if (group?.adminId !== user?.uid) {
      throw new Error("Only the admin can add members.");
    }

    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(memberId),
    });
  },

  // 🔹 Remove member (only admin)
  removeMember: async (groupId, memberId) => {
    const group = get().groups.find((g) => g.id === groupId);
    const { user } = useAuth();

    if (group?.adminId !== user?.uid) {
      throw new Error("Only the admin can remove members.");
    }

    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      members: group?.members.filter((m) => m !== memberId),
    });
  },

  // 🔹 Assign a task (only admin)
  assignTask: async (groupId, task) => {
    const group = get().groups.find((g) => g.id === groupId);
    const { user } = useAuth();

    if (group?.adminId !== user?.uid) {
      throw new Error("Only the admin can assign tasks.");
    }

    const groupRef = doc(db, "groups", groupId);
    const newTask = { ...task, completed: false, approved: false };
    await updateDoc(groupRef, {
      tasks: arrayUnion(newTask),
    });
  },

  // 🔹 Submit completion (member)
  submitCompletion: async (groupId, taskId, memberId) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group?.members.includes(memberId)) {
      throw new Error("You must be a member of this group to submit.");
    }

    await addDoc(collection(db, "completionRequests"), {
      groupId,
      taskId,
      memberId,
      submittedAt: serverTimestamp(),
      status: "pending",
    });

    // 🔔 Notify admin
    const { sendNotification } = useNotificationStore.getState();
    await sendNotification({
      userId: group.adminId,
      type: "completion",
      title: "Task completion submitted",
      message: `A member submitted a task for review in ${group.name}.`,
      groupId,
      taskId,
    });
  },

  // 🔹 Approve or reject (only admin)
  approveCompletion: async (groupId, taskId, memberId, status) => {
    const group = get().groups.find((g) => g.id === groupId);
    const { user } = useAuth();

    if (group?.adminId !== user?.uid) {
      throw new Error("Only the admin can approve or reject submissions.");
    }

    // Update completion request
    const q = query(
      collection(db, "completionRequests"),
      where("groupId", "==", groupId),
      where("taskId", "==", taskId),
      where("memberId", "==", memberId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const ref = snapshot.docs[0].ref;
      await updateDoc(ref, { status });
    }

    // Update task approval if approved
    if (status === "approved") {
      const groupRef = doc(db, "groups", groupId);
      const updatedTasks = group?.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: true, approved: true } : t
      );
      await updateDoc(groupRef, { tasks: updatedTasks });
    }

    // 🔔 Notify member
    const { sendNotification } = useNotificationStore.getState();
    await sendNotification({
      userId: memberId,
      type: "review",
      title: status === "approved" ? "Task approved 🎉" : "Task rejected ❌",
      message:
        status === "approved"
          ? "Your task submission has been approved!"
          : "Your task submission was rejected.",
      groupId,
      taskId,
    });
  },
}));

export const useCompletionStore = create<CompletionState>((set, get) => ({
  requests: [],

  submitRequest: async (data) => {
    await addDoc(collection(db, "completionRequests"), {
      ...data,
      submittedAt: new Date(),
      status: "pending",
    });
  },

  fetchRequests: async () => {
    const snapshot = await getDocs(collection(db, "completionRequests"));
    const requests = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as CompletionRequest)
    );
    set({ requests });
  },

  updateStatus: async (requestId, status) => {
    const ref = doc(db, "completionRequests", requestId);
    await updateDoc(ref, { status });
  },
}));

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  listenToUserNotifications: (userId) => {
    if (!userId) {
      set({ notifications: [] });
      return () => {};
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      set({ notifications: notes });
    });

    return unsubscribe;
  },

  sendNotification: async (payload) => {
    await addDoc(collection(db, "notifications"), {
      ...payload,
      read: false,
      createdAt: serverTimestamp(),
    });
  },

  markAsRead: async (id) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
  },

  markAllRead: async (userId) => {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    const snap = await (await import("firebase/firestore")).getDocs(q);
    const batchUpdates: Promise<void>[] = [];
    snap.forEach((s) => {
      batchUpdates.push(
        updateDoc(doc(db, "notifications", s.id), {
          read: true,
        }) as Promise<void>
      );
    });
    await Promise.all(batchUpdates);
  },
}));

export const useProgressStore = create<ProgressState>((set) => ({
  progress: null,

  listenToProgress: (userId) => {
    if (!userId) {
      set({ progress: null });
      return () => {};
    }
    const ref = doc(db, "progress", userId);
    const unsubscribe = onSnapshot(ref, (snap) => {
      set({ progress: snap.exists() ? (snap.data() as ProgressDoc) : null });
    });
    return unsubscribe;
  },
}));

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

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message: string) => set({ message }),
  hide: () => set({ message: null }),
}));

// ------------------------------
// 🔹 Community Store (NEW)
// ------------------------------
export const useCommunityStore = create<{
  communities: any[];
  loading: boolean;
  fetchCommunities: () => Promise<void>;
  createCommunity: (data: {
    id: null | string;
    name: string;
    description: string;
    adminId: string;
    members: string[];
  }) => Promise<void>;
  joinCommunity: (communityId: string, userId: string) => Promise<void>;
  leaveCommunity: (communityId: string, userId: string) => Promise<void>;
}>((set, get) => ({
  communities: [],
  loading: false,

  // 🔹 Fetch all communities
  fetchCommunities: async () => {
    set({ loading: true });
    const snapshot = await getDocs(collection(db, "communities"));
    const communities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    set({ communities, loading: false });
  },

  // 🔹 Create a new community
  createCommunity: async ({ name, description, adminId }) => {
    try {
      const docRef = await addDoc(collection(db, "communities"), {
        name: name.trim(),
        description: description.trim(),
        adminId,
        members: [adminId],
        createdAt: serverTimestamp(),
      });

      set({
        communities: [
          ...get().communities,
          {
            id: docRef.id,
            name: name.trim(),
            description: description.trim(),
            adminId,
            members: [adminId],
            createdAt: new Date(), // local fallback for immediate UI update
          },
        ],
      });
    } catch (err: any) {
      console.error("❌ Failed to create community:", err);
      throw new Error(err.message || "Failed to create community");
    }
  },

  // 🔹 Join a community
  joinCommunity: async (communityId, userId) => {
    const ref = doc(db, "communities", communityId);
    await updateDoc(ref, {
      members: arrayUnion(userId),
    });
    const updated = get().communities.map((c) =>
      c.id === communityId
        ? { ...c, members: [...(c.members || []), userId] }
        : c
    );
    set({ communities: updated });
  },

  // 🔹 Leave a community
  leaveCommunity: async (communityId, userId) => {
    const ref = doc(db, "communities", communityId);
    const community = get().communities.find((c) => c.id === communityId);
    if (!community) return;

    const newMembers = community.members.filter((m: string) => m !== userId);
    await updateDoc(ref, { members: newMembers });

    const updated = get().communities.map((c) =>
      c.id === communityId ? { ...c, members: newMembers } : c
    );
    set({ communities: updated });
  },
}));
