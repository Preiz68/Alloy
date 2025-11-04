"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Check, X, Bell } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useGroupStore } from "@/store/usePostStore"; // your group store (adjust path if needed)
import { useCompletionStore } from "@/store/usePostStore";
import { useNotificationStore } from "@/store/usePostStore";

/**
 * AdminDashboard
 * - Requires the current user to be an admin (user.role === "admin" in users/{uid} doc)
 * - Tabs: Groups | Tasks | Requests
 *
 * NOTE: adjust import paths if your stores/hooks are located elsewhere.
 */

type Tab = "groups" | "tasks" | "requests";

const AdminDashboard = () => {
  const router = useRouter();
  const { user } = useAuth(); // must provide { uid, displayName } at minimum
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // local UI state
  const [activeTab, setActiveTab] = useState<Tab>("groups");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // group store + completion + notifications
  const groups = useGroupStore((s) => s.groups);
  const fetchGroups = useGroupStore((s) => s.fetchGroups);
  const createGroup = useGroupStore((s) => s.createGroup);
  const addMember = useGroupStore((s) => s.addMember);
  const assignTaskInStore = useGroupStore((s) => s.assignTask);

  const requests = useCompletionStore((s) => s.requests);
  const fetchRequests = useCompletionStore((s) => s.fetchRequests);
  const submitRequest = useCompletionStore((s) => s.submitRequest);
  const updateRequestStatus = useCompletionStore((s) => s.updateStatus);

  const sendNotification = useNotificationStore((s) => s.sendNotification);

  // for simple polling / refresh
  useEffect(() => {
    // fetch groups and requests
    const run = async () => {
      await fetchGroups();
      await fetchRequests();
    };
    run();
    // no cleanup - stores handle listeners if they are snapshot-based
  }, [fetchGroups, fetchRequests]);

  // 1) Confirm admin role by checking users/{uid}.role === "admin"
  useEffect(() => {
    if (!user?.uid) {
      // not logged in yet
      setCheckingAdmin(false);
      return;
    }

    const check = async () => {
      try {
        const uref = doc(db, "users", user.uid);
        const snap = await getDoc(uref);
        const data = snap.exists() ? snap.data() : null;
        const role = (data as any)?.role;
        if (role === "admin") {
          setIsAdmin(true);
        } else {
          // fallback: user is admin if they created any group (adminId)
          // we'll also check groups array quickly
          const createdAdmin = groups.some(
            (g) =>
              (g as any).adminId === user.uid ||
              (g as any).createdBy === user.uid
          );
          setIsAdmin(createdAdmin);
        }
      } catch (err) {
        console.error("Error checking admin status", err);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // redirect if explicitly not admin after check
  useEffect(() => {
    if (!checkingAdmin && !isAdmin) {
      // send back to main dashboard
      router.push("/dashboard");
    }
  }, [checkingAdmin, isAdmin, router]);

  // --- Create Group Form local state
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  const handleCreateGroup = async () => {
    if (!user?.uid) return;
    if (!newGroupName.trim()) return;

    const payload = {
      name: newGroupName.trim(),
      description: newGroupDesc.trim(),
      adminId: user.uid,
      createdBy: user.uid,
      members: [user.uid],
      projectDetails: {
        overview: "",
        goal: "",
        duration: "",
      },
    } as any;

    try {
      await createGroup(payload);
      setNewGroupName("");
      setNewGroupDesc("");
      setCreateModalOpen(false);
      // Refresh groups
      await fetchGroups();
    } catch (err) {
      console.error("Could not create group", err);
    }
  };

  // --- Assign Task form state
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDue, setTaskDue] = useState<string>("");
  const [taskAssignee, setTaskAssignee] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  // get members for selected group (memo)
  const selectedGroup = useMemo(
    () => groups.find((g: any) => g.id === selectedGroupId) as any | undefined,
    [groups, selectedGroupId]
  );
  const members = selectedGroup?.members ?? [];

  const handleAssignTask = async () => {
    if (!selectedGroupId || !taskTitle.trim()) return;
    if (!taskAssignee) return alert("Select an assignee");

    setAssigning(true);
    try {
      const task = {
        id: `${Date.now()}`,
        title: taskTitle,
        description: taskDesc,
        assignedTo: taskAssignee,
        dueDate: taskDue || "",
        completed: false,
        approved: false,
      };
      // create in store (this either updates tasks array or creates subcollection depending on your store)
      if (assignTaskInStore) {
        await assignTaskInStore(selectedGroupId, task);
      } else {
        // fallback: update group doc tasks array
        const groupRef = doc(db, "groups", selectedGroupId);
        const gsnap = await getDoc(groupRef);
        const gdata = gsnap.exists() ? (gsnap.data() as any) : null;
        const updatedTasks = Array.isArray(gdata?.tasks)
          ? [...gdata.tasks, task]
          : [task];
        await updateDoc(groupRef, { tasks: updatedTasks });
      }

      // send notification doc + (Cloud Function picks up, or sendNotification creates doc)
      await sendNotification({
        userId: taskAssignee,
        type: "task_assigned",
        title: `New task: ${taskTitle}`,
        message:
          taskDesc ||
          `A new task was assigned to you in ${
            selectedGroup?.name || "a group"
          }.`,
        groupId: selectedGroupId,
        projectId: selectedGroup?.projectId || "",
      });

      // reset form
      setTaskTitle("");
      setTaskDesc("");
      setTaskDue("");
      setTaskAssignee(null);
      setAssigning(false);

      // refresh groups
      await fetchGroups();
    } catch (err) {
      console.error("Error assigning task", err);
      setAssigning(false);
    }
  };

  // --- Requests (approve/reject)
  const handleApproveRequest = async (reqId: string) => {
    try {
      // fetch request to get details
      const reqDocRef = doc(db, "completionRequests", reqId);
      const reqSnap = await getDoc(reqDocRef);
      if (!reqSnap.exists()) return;

      const reqData = reqSnap.data() as any;
      const { memberId, groupId, taskId } = reqData;

      // Update request status via store (updates completionRequests collection)
      await updateRequestStatus(reqId, "approved");

      // Also update group task approved flag (find task inside group and set approved)
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        const gdata = groupSnap.data() as any;
        const tasksArr = Array.isArray(gdata.tasks) ? gdata.tasks : [];
        const updated = tasksArr.map((t: any) =>
          t.id === taskId ? { ...t, approved: true, completed: true } : t
        );
        await updateDoc(groupRef, { tasks: updated });
      }

      // update progress (Cloud Function also handles this, but we add a notification here)
      await sendNotification({
        userId: memberId,
        type: "task_approved",
        title: "Task approved",
        message: `Your task was approved by ${
          user?.displayName || "the admin"
        }.`,
        groupId,
        taskId,
      });

      // refresh requests & groups
      await fetchRequests();
      await fetchGroups();
    } catch (err) {
      console.error("Error approving request", err);
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    try {
      await updateRequestStatus(reqId, "rejected");
      const reqDocRef = doc(db, "completionRequests", reqId);
      const reqSnap = await getDoc(reqDocRef);
      const reqData = reqSnap.exists() ? (reqSnap.data() as any) : null;
      if (reqData) {
        await sendNotification({
          userId: reqData.memberId,
          type: "task_rejected",
          title: "Task rejected",
          message: `Your task was rejected by ${
            user?.displayName || "the admin"
          }. Please update and resubmit.`,
          groupId: reqData.groupId,
          taskId: reqData.taskId,
        });
      }
      await fetchRequests();
    } catch (err) {
      console.error("Error rejecting request", err);
    }
  };

  // Loading guard while we confirm admin
  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600 dark:text-gray-300">
          Checking permissions...
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 dark:text-white">
      {/* Left: Sidebar (reuse your existing Sidebar if desired) */}
      <div className="w-72 p-6 border-r border-gray-100 dark:border-gray-800">
        <div className="text-2xl font-extrabold mb-6">Admin</div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-left ${
              activeTab === "groups"
                ? "bg-gray-200 dark:bg-gray-800 text-purple-700"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Plus size={16} />
            <span>Groups</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-left ${
              activeTab === "tasks"
                ? "bg-gray-200 dark:bg-gray-800 text-purple-700"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Bell size={16} />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-left ${
              activeTab === "requests"
                ? "bg-gray-200 dark:bg-gray-800 text-purple-700"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Check size={16} />
            <span>Requests</span>
          </button>
        </nav>

        <div className="mt-6">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <Plus size={16} />
            Create Group
          </button>
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          <div className="text-sm text-gray-500">
            Signed in as {user?.displayName || "Admin"}
          </div>
        </div>

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Tab content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {activeTab === "groups" && (
              <section>
                <h3 className="text-lg font-semibold mb-4">Project Groups</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {groups?.length ? (
                    groups.map((g: any) => (
                      <div
                        key={g.id}
                        className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border dark:border-gray-700"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{g.name}</h4>
                            <div className="text-sm text-gray-500">
                              {g.description}
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              {g.members?.length ?? 0} members
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(
                              g.createdAt?.toDate?.() ??
                                g.createdAt ??
                                Date.now()
                            ).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              // quick add member prompt for demo
                              const email = prompt(
                                "Enter new member userId (uid) to add:"
                              );
                              if (!email) return;
                              addMember(g.id, email);
                            }}
                            className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm"
                          >
                            Add Member
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No groups yet.</div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "tasks" && (
              <section>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold mb-4">Assign Task</h3>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm">Select Group</label>
                      <select
                        className="mt-1 block w-full rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                        value={selectedGroupId ?? ""}
                        onChange={(e) =>
                          setSelectedGroupId(e.target.value || null)
                        }
                      >
                        <option value="">-- choose group --</option>
                        {groups.map((g: any) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm">Assignee</label>
                      <select
                        className="mt-1 block w-full rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                        value={taskAssignee ?? ""}
                        onChange={(e) =>
                          setTaskAssignee(e.target.value || null)
                        }
                        disabled={!selectedGroupId}
                      >
                        <option value="">-- choose member --</option>
                        {members.map((m: string) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm">Title</label>
                      <input
                        className="mt-1 block w-full rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm">Description</label>
                      <textarea
                        className="mt-1 block w-full rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                        rows={3}
                        value={taskDesc}
                        onChange={(e) => setTaskDesc(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm">Due Date</label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                        value={taskDue}
                        onChange={(e) => setTaskDue(e.target.value)}
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={handleAssignTask}
                        disabled={assigning}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        {assigning ? "Assigning..." : "Assign Task"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "requests" && (
              <section>
                <h3 className="text-lg font-semibold mb-4">
                  Completion Requests
                </h3>

                <div className="space-y-3">
                  {requests?.length ? (
                    requests.map((r: any) => (
                      <div
                        key={r.id}
                        className="bg-white dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700 flex justify-between items-start"
                      >
                        <div>
                          <div className="font-medium">
                            {r.taskId ?? "Task"}
                          </div>
                          <div className="text-sm text-gray-500">
                            By: {r.memberId}
                          </div>
                          <div className="text-xs text-gray-400">
                            Submitted:{" "}
                            {new Date(
                              r.submittedAt?.toDate?.() ??
                                r.submittedAt ??
                                Date.now()
                            ).toLocaleString()}
                          </div>
                          <div className="mt-2 text-sm">{r.note ?? ""}</div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveRequest(r.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(r.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No completion requests.</div>
                  )}
                </div>
              </section>
            )}
          </motion.div>
        </main>
      </div>

      {/* Create Group Modal */}
      <AnimateCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateGroup}
        name={newGroupName}
        setName={setNewGroupName}
        desc={newGroupDesc}
        setDesc={setNewGroupDesc}
      />
    </div>
  );
};

/* ---------------------------
   Small animated modal component
   --------------------------- */
function AnimateCreateModal({
  open,
  onClose,
  onCreate,
  name,
  setName,
  desc,
  setDesc,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
  name: string;
  setName: (v: string) => void;
  desc: string;
  setDesc: (v: string) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="relative bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Create Group</div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm">Group name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded bg-gray-100">
              Cancel
            </button>
            <button
              onClick={onCreate}
              className="px-3 py-2 rounded bg-purple-600 text-white"
            >
              Create
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminDashboard;
