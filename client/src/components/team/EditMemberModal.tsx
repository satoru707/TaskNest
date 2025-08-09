import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Crown, Shield, Eye, User, AlertTriangle } from "lucide-react";
import Button from "../ui/Button";
import { useCurrentUser } from "../../lib/auth";
import { toast } from "sonner";
import { cn } from "../../utils/cn";
import { authAPI } from "../../lib/api";

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  onMemberUpdated: (memberData: any) => void;
}

export default function EditMemberModal({
  isOpen,
  onClose,
  member,
  onMemberUpdated,
}: EditMemberModalProps) {
  const { dbUser } = useCurrentUser();
  const [role, setRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("EDITOR");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setRole(member.role || "EDITOR");
      setStatus(member.status || "active");
      setNotes(member.notes || "");
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const memberData = {
        role,
        status,
        notes: notes.trim(),
        updatedBy: dbUser?.name,
        updatedAt: new Date().toISOString(),
      };

      onMemberUpdated(memberData);
      handleClose();
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Failed to update member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    if (member) {
      setRole(member.role || "EDITOR");
      authAPI.updateProfile(member.auth0Id, {
        role: member.role,
      });
    }
  };

  const getRoleColor = (roleType: string) => {
    switch (roleType) {
      case "ADMIN":
        return "border-red-500 bg-red-50 dark:bg-red-900/20";
      case "EDITOR":
        return "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
      case "VIEWER":
        return "border-gray-500 bg-gray-50 dark:bg-gray-900/20";
      default:
        return "border-gray-300 dark:border-gray-600";
    }
  };

  const canEditMember = dbUser?.role === "ADMIN" || member.role !== "OWNER";

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
              Edit Member
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Member Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">
                    {member.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {member.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {member.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Member since {new Date(member.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {!canEditMember && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  You don't have permission to edit this member's details.
                </span>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Role
            </label>
            <div className="space-y-3">
              {[
                {
                  value: "ADMIN",
                  title: "Admin",
                  description:
                    "Can manage board settings, members, and all content",
                  icon: <Crown size={20} className="text-red-500" />,
                },
                {
                  value: "EDITOR",
                  title: "Editor",
                  description: "Can create, edit, and manage tasks and lists",
                  icon: <Shield size={20} className="text-blue-500" />,
                },
                {
                  value: "VIEWER",
                  title: "Viewer",
                  description: "Can only view board content and add comments",
                  icon: <Eye size={20} className="text-gray-500" />,
                },
              ].map((roleOption) => (
                <div
                  key={roleOption.value}
                  className={cn(
                    "flex items-center p-4 border-2 rounded-lg transition-all",
                    role === roleOption.value
                      ? getRoleColor(roleOption.value)
                      : "border-gray-200 dark:border-gray-600",
                    canEditMember
                      ? "cursor-pointer hover:border-gray-300 dark:hover:border-gray-500"
                      : "opacity-60 cursor-not-allowed"
                  )}
                  onClick={() =>
                    canEditMember && setRole(roleOption.value as any)
                  }
                >
                  <div className="mr-3">{roleOption.icon}</div>
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
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      role === roleOption.value
                        ? "border-current bg-current"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                  >
                    {role === roleOption.value && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
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
              disabled={!canEditMember}
              icon={<Save size={16} />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
