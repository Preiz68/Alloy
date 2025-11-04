import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// 🧭 When a group document changes
export const onGroupUpdated = onDocumentUpdated(
  "groups/{groupId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const groupId = event.params.groupId;

    if (!before || !after) return;

    // 🛑 Skip if members haven’t changed
    if (JSON.stringify(before.members) === JSON.stringify(after.members))
      return;

    // ✅ Detect new members
    const addedMembers = after.members.filter(
      (id: string) => !before.members.includes(id)
    );

    for (const memberId of addedMembers) {
      await db.collection("notifications").add({
        userId: memberId,
        type: "group_joined",
        title: "🎉 You joined a new project group!",
        message: `You’ve been added to ${after.name}.`,
        groupId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return;
  }
);
