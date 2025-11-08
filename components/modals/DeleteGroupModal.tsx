import { Group, useGroupStore } from "@/store/usePostStore";
import { motion } from "framer-motion";
import { useState } from "react";

const DeleteGroupModal = ({
  selectedGroup,
  onClose,
  setSelectedGroup,
}: {
  selectedGroup: Group;
  onClose: () => void;
  setSelectedGroup: (group: Group | null) => void;
}) => {
  const { deleteGroup } = useGroupStore();

  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
      >
        <p>{`Are you sure you want to delete the ${selectedGroup.name} project ?`}</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel{" "}
          </button>
          <button
            onClick={async () => {
              setIsDeleting(true);
              try {
                await deleteGroup(selectedGroup.id);
                onClose();
                setSelectedGroup(null);
              } catch (error: any) {
                console.log("❌ Error deleting group:", error);
              } finally {
                setIsDeleting(false);
              }
            }}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
export default DeleteGroupModal;
