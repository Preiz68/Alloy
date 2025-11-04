import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const fcm = admin.messaging();

// 📩 Trigger: when a task is assigned in any group
export const onTaskAssigned = onDocumentCreated(
  "groups/{groupId}/projects/{projectId}/tasks/{taskId}",
  async (event) => {
    const task = event.data?.data();
    const { groupId, projectId } = event.params;

    if (!task) return;
    const { assignedTo, title, description } = task;

    if (!assignedTo) return;

    // 🧾 Fetch recipient's FCM token
    const userDoc = await db.collection("users").doc(assignedTo).get();
    const token = userDoc.data()?.fcmToken;

    // 📨 Create a Firestore notification
    await db.collection("notifications").add({
      userId: assignedTo,
      type: "task_assigned",
      title: `New Task: ${title}`,
      message: description || "A new task was assigned to you.",
      groupId,
      projectId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 🚀 Send FCM push notification (if token exists)
    if (token) {
      await fcm.send({
        token,
        notification: {
          title: "🎯 New Task Assigned",
          body: `${title} — check your dashboard!`,
        },
        data: {
          type: "task_assigned",
          groupId,
          projectId,
        },
      });
    }

    return;
  }
);
