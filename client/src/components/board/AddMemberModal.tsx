import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Search, UserPlus } from "lucide-react";
import Button from "../ui/Button";
import { boardsAPI } from "../../lib/api";
import { toast } from "sonner";
import { cn } from "../../utils/cn";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  onMemberAdded: (member: any) => void;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  boardId,
  onMemberAdded,
}: AddMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("EDITOR");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      // In a real app, you'd first search for the user by email
      // For now, we'll simulate adding a member
      const response = await boardsAPI.addMember(boardId, {
        userId: "user-id-from-email-search", // This would come from user search
        role,
      });

      onMemberAdded(response.data.member);
      onClose();
      setEmail("");
      setRole("EDITOR");
      toast.success("Member added successfully");
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setEmail("");
    setRole("EDITOR");
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
              Add Member
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address *
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter email address"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Role
            </label>
            <div className="space-y-3">
              {[
                {
                  value: "ADMIN",
                  title: "Admin",
                  description: "Can manage board settings and members",
                },
                {
                  value: "EDITOR",
                  title: "Editor",
                  description: "Can create and edit tasks and lists",
                },
                {
                  value: "VIEWER",
                  title: "Viewer",
                  description: "Can only view board content",
                },
              ].map((roleOption) => (
                <div
                  key={roleOption.value}
                  className={cn(
                    "flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all",
                    role === roleOption.value
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  )}
                  onClick={() => setRole(roleOption.value as any)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {roleOption.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {roleOption.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2",
                      role === roleOption.value
                        ? "border-primary-500 bg-primary-500"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                  >
                    {role === roleOption.value && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              ))}
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
              icon={<UserPlus size={16} />}
            >
              Add Member
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
