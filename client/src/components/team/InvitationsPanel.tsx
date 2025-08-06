import { motion } from "framer-motion";
import {
  X,
  Mail,
  Clock,
  RotateCcw,
  Trash2,
  Crown,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Button from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { cn } from "../../utils/cn";

interface InvitationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  invitations: any[];
  onCancelInvitation: (invitationId: string) => void;
  onResendInvitation: (invitation: any) => void;
}

export default function InvitationsPanel({
  isOpen,
  onClose,
  invitations,
  onCancelInvitation,
  onResendInvitation,
}: InvitationsPanelProps) {
  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "accepted":
        return <CheckCircle size={16} className="text-green-500" />;
      case "declined":
        return <XCircle size={16} className="text-red-500" />;
      case "expired":
        return <AlertCircle size={16} className="text-gray-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "accepted":
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "declined":
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      case "expired":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown size={14} className="text-red-500" />;
      case "EDITOR":
        return <Shield size={14} className="text-blue-500" />;
      case "VIEWER":
        return <Eye size={14} className="text-gray-500" />;
      default:
        return <Shield size={14} className="text-blue-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hour${
        Math.floor(diffInMinutes / 60) === 1 ? "" : "s"
      } ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${
      Math.floor(diffInMinutes / 1440) === 1 ? "" : "s"
    } ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-50 overflow-y-auto"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="text-blue-600" size={24} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Messages ({invitations.length})
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </div>

      <div className="p-6">
        {invitations.length > 0 ? (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <Card className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Mail size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {invitation.email}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Invited to {invitation.boardTitle}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          getStatusColor(invitation.status)
                        )}
                      >
                        {getStatusIcon(invitation.status)}
                        {invitation.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Role:
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getRoleIcon(invitation.role)}
                          {invitation.role}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTimeAgo(invitation.invitedAt)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Invited by {invitation.invitedBy}
                    </div>

                    {invitation.status === "pending" && (
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onResendInvitation(invitation)}
                          icon={<RotateCcw size={14} />}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          Resend
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancelInvitation(invitation.id)}
                          icon={<Trash2 size={14} />}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Mail className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No pending messages
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Sent invitations will appear here for you to manage.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
