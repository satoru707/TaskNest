import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Lock, Globe, Users, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import { boardsAPI } from "../../lib/api";
import { toast } from "sonner";
import { cn } from "../../utils/cn";

interface EditBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: any;
  onBoardUpdated: (board: any) => void;
  onBoardDeleted: () => void;
}
//update board on board update
//prolly redirec to home page on delete
export default function EditBoardModal({
  isOpen,
  onClose,
  board,
  onBoardUpdated,
  onBoardDeleted,
}: EditBoardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (board) {
      setTitle(board.title || "");
      setDescription(board.description || "");
      setIsPublic(board.isPublic || false);
    }
  }, [board]);

  if (!isOpen || !board) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    // console.log(
    //   "Updating board with title:",
    //   title,
    //   board.id,
    //   description,
    //   isPublic
    // );

    try {
      const response = await boardsAPI.updateBoard(board.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        isPublic,
      });

      onBoardUpdated(response.data.board);
      onClose();
      toast.success("Board updated successfully");
    } catch (error) {
      console.error("Error updating board:", error);
      toast.error("Failed to update board");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${board.title}"? This action cannot be undone and will delete all lists and tasks.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await boardsAPI.deleteBoard(board.id);
      onBoardDeleted();
      onClose();
      toast.success("Board deleted successfully");
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error("Failed to delete board");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTitle(board.title || "");
    setDescription(board.description || "");
    setIsPublic(board.isPublic || false);
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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Board Settings
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Board Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter board title"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Add a description for your board..."
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Visibility
            </label>
            <div className="space-y-3">
              <div
                className={cn(
                  "flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all",
                  !isPublic
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                )}
                onClick={() => setIsPublic(false)}
              >
                <Lock
                  size={20}
                  className="text-gray-600 dark:text-gray-400 mr-3"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Private
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Only board members can see and edit
                  </p>
                </div>
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2",
                    !isPublic
                      ? "border-primary-500 bg-primary-500"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {!isPublic && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>

              <div
                className={cn(
                  "flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all",
                  isPublic
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                )}
                onClick={() => setIsPublic(true)}
              >
                <Globe
                  size={20}
                  className="text-gray-600 dark:text-gray-400 mr-3"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Public
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Anyone can see this board
                  </p>
                </div>
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2",
                    isPublic
                      ? "border-primary-500 bg-primary-500"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {isPublic && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Board Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Board Information
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{new Date(board.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Members:</span>
                <span>{board.members?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Lists:</span>
                <span>{board.lists?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks:</span>
                <span>
                  {board.lists?.reduce(
                    (acc: number, list: any) => acc + (list.tasks?.length || 0),
                    0
                  ) || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              icon={<Trash2 size={16} />}
            >
              Delete Board
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                icon={<Save size={16} />}
                disabled={!title.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
