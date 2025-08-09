import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Plus,
  Search,
  UserPlus,
  User,
  Mail,
  Crown,
  Shield,
  Eye,
} from "lucide-react";
import Button from "../ui/Button";
import { boardsAPI, authAPI } from "../../lib/api";
import { useCurrentUser } from "../../lib/auth";
import { toast } from "sonner";
import { cn } from "../../utils/cn";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  onMemberAdded: (member: any) => void;
  existingMembers?: any[];
}

export default function AddMemberModal({
  isOpen,
  onClose,
  boardId,
  onMemberAdded,
  existingMembers = [],
}: AddMemberModalProps) {
  const { dbUser } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [role, setRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("EDITOR");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || (searchQuery.length < 2 && !selectedUser)) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        // Search for users by email or name
        const response = await authAPI.searchUsers(searchQuery);

        // Filter out existing members and current user
        const existingMemberIds = existingMembers.map(
          (m) => m.user?.id || m.userId
        );
        const filteredResults = response.data.users.filter(
          (user: any) =>
            !existingMemberIds.includes(user.id) && user.id !== dbUser?.id
        );

        setSearchResults(filteredResults);
        setShowResults(true);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, existingMembers, dbUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    ("Working");

    if (!selectedUser) {
      toast.error("Please select a user to add");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await boardsAPI.addMember(boardId, {
        userId: selectedUser.id,
        role,
      });

      onMemberAdded(response.data.member);
      handleClose();
      toast.success(
        `${selectedUser.name} added to board as ${role.toLowerCase()}`
      );
    } catch (error: any) {
      console.error("Error adding member:", error);
      if (error.response?.status === 409) {
        toast.error("User is already a member of this board");
      } else if (error.response?.status === 404) {
        toast.error("User not found");
      } else {
        toast.error("Failed to add member");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setRole("EDITOR");
    setShowResults(false);
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setShowResults(false);
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case "ADMIN":
        return <Crown size={16} className="text-red-500" />;
      case "EDITOR":
        return <Shield size={16} className="text-blue-500" />;
      case "VIEWER":
        return <Eye size={16} className="text-gray-500" />;
      default:
        return <User size={16} className="text-gray-500" />;
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
              Add Team Member
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Search */}
          <div className="relative">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Search User *
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedUser(null);
                }}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search by name or email..."
                required
                autoFocus
                disabled={!!selectedUser}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          handleUserSelect(user);
                          // setShowResults(false);
                          setSearchQuery("");
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                              {user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    {searchQuery.length < 2
                      ? "Type at least 2 characters to search"
                      : "No users found"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected User Display */}
          {selectedUser && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected User
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">
                      {selectedUser.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Role *
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
                    "flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all",
                    role === roleOption.value
                      ? getRoleColor(roleOption.value)
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  )}
                  onClick={() => setRole(roleOption.value as any)}
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
              disabled={!selectedUser}
              icon={<UserPlus size={16} />}
            >
              Add Member
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Click outside search results to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </motion.div>
  );
}
