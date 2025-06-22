import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Lock, Globe } from "lucide-react";
import Button from "../ui/Button";
import { boardsAPI } from "../../lib/api";
import { useCurrentUser } from "../../lib/auth";
import { toast } from "sonner";
import { cn } from "../../utils/cn";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardCreated: (board: any) => void;
}

export default function CreateBoardModal({
  isOpen,
  onClose,
  onBoardCreated,
}: CreateBoardModalProps) {
  const { dbUser } = useCurrentUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dbUser) return;

    setIsSubmitting(true);
    try {
      const response = await boardsAPI.createBoard({
        title: title.trim(),
        description: description.trim() || undefined,
        ownerId: dbUser.id,
        isPublic,
      });

      onBoardCreated(response.data.board);
      onClose();
      resetForm();
      toast.success("Board created successfully");
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Failed to create board");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIsPublic(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
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
              Create New Board
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              icon={<Plus size={16} />}
              disabled={!title.trim()}
            >
              Create Board
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
