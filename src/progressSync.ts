import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const fcm = admin.messaging();

// ✅ Trigger when completionRequests are approved
export const onTaskApproved = onDocumentUpdated(
  "completionRequests/{requestId}",
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    if (!before || !after) return;
    if (before.status === after.status) return;
    if (after.status !== "approved") return;

    const { memberId, groupId, taskId } = after;

    // 🧮 Update user’s progress
    const progressRef = db.collection("progress").doc(memberId);
    await progressRef.set(
      {
        completedTasks: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 🔔 Notify member
    const userDoc = await db.collection("users").doc(memberId).get();
    const token = userDoc.data()?.fcmToken;

    await db.collection("notifications").add({
      userId: memberId,
      type: "task_approved",
      title: "✅ Task Approved",
      message: "Your recent task was approved by the admin.",
      groupId,
      taskId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 🚀 Send FCM push notification (if token exists)
    if (token) {
      await fcm.send({
        token,
        notification: {
          title: "✅ Task Approved",
          body: "Your recent task was approved and progress updated!",
        },
        data: {
          type: "task_approved",
          groupId,
          taskId,
        },
      });
    }

    return;
  }
);
