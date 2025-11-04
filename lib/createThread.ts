import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";

export async function createThread(userA: string, userB: string) {
  // Check if thread already exists
  const q = query(collection(db, "threads"), where("participants", "array-contains", userA));
  const snap = await getDocs(q);

  let existing = snap.docs.find((doc) => {
    const data = doc.data();
    return data.participants.includes(userB);
  });

  if (existing) return existing.id;

  // Otherwise create a new thread
  const newThread = await addDoc(collection(db, "threads"), {
    participants: [userA, userB],
    lastMessage: "",
    updatedAt: serverTimestamp(),
  });

  return newThread.id;
}
