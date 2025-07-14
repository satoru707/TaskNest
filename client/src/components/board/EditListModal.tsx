import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Trash2, Archive, Copy } from "lucide-react";
import Button from "../ui/Button";
import { boardsAPI } from "../../lib/api";
import { toast } from "sonner";

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: any;
  boardId: string;
  onListUpdated: (listId: string, updates: any) => void;
  onListDeleted: (listId: string) => void;
}

export default function EditListModal({
  isOpen,
  onClose,
  list,
  boardId,
  onListUpdated,
  onListDeleted,
}: EditListModalProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (list) {
      setTitle(list.title || "");
    }
  }, [list]);

  if (!isOpen || !list) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await boardsAPI.updateList(boardId, list.id, {
        title: title.trim(),
      });

      onListUpdated(list.id, response.data.list);
      onClose();
      toast.success("List updated successfully");
    } catch (error) {
      console.error("Error updating list:", error);
      toast.error("Failed to update list");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const taskCount = list.tasks?.length || 0;
    const confirmMessage =
      taskCount > 0
        ? `Are you sure you want to delete "${
            list.title
          }"? This will also delete ${taskCount} task${
            taskCount === 1 ? "" : "s"
          }.`
        : `Are you sure you want to delete "${list.title}"?`;

    const confirmDelete = window.confirm(confirmMessage);

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await boardsAPI.deleteList(boardId, list.id);
      onListDeleted(list.id);
      onClose();
      toast.success("List deleted successfully");
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete list");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await boardsAPI.createList(boardId, {
        title: `${list.title} (Copy)`,
        position: list.position + 1,
      });

      onListUpdated("new", response.data.list);
      toast.success("List duplicated successfully");
    } catch (error) {
      console.error("Error duplicating list:", error);
      toast.error("Failed to duplicate list");
    }
  };

  const handleArchive = async () => {
    try {
      // In a real app, you'd have an archive endpoint
      toast.info("Archive functionality coming soon");
    } catch (error) {
      console.error("Error archiving list:", error);
      toast.error("Failed to archive list");
    }
  };

  const handleClose = () => {
    onClose();
    setTitle(list.title || "");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              List Settings
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Edit Title */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                List Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter list title"
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              icon={<Save size={16} />}
              disabled={!title.trim()}
              fullWidth
            >
              Save Changes
            </Button>
          </form>

          {/* List Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              List Information
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Tasks:</span>
                <span>{list.tasks?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span>
                  {list.tasks?.filter((task: any) => task.completed).length ||
                    0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Position:</span>
                <span>{list.position + 1}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleDuplicate}
              variant="outline"
              icon={<Copy size={16} />}
              fullWidth
            >
              Duplicate List
            </Button>

            <Button
              onClick={handleArchive}
              variant="outline"
              icon={<Archive size={16} />}
              fullWidth
            >
              Archive List
            </Button>

            <Button
              onClick={handleDelete}
              isLoading={isDeleting}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              icon={<Trash2 size={16} />}
              fullWidth
            >
              Delete List
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
