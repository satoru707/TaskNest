import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, MessageCircle, User } from "lucide-react";
import Button from "../ui/Button";
import { useCurrentUser } from "../../lib/auth";
import { toast } from "sonner";
import { cn } from "../../utils/cn";

interface MessageMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  onMessageSent: (messageData: any) => void;
}

export default function MessageMemberModal({
  isOpen,
  onClose,
  member,
  onMessageSent,
}: MessageMemberModalProps) {
  const { dbUser } = useCurrentUser();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    try {
      const messageData = {
        recipientId: member.id,
        recipientName: member.name,
        recipientEmail: member.email,
        subject: subject.trim() || "Message from TaskNest",
        message: message.trim(),
        priority,
        sentBy: dbUser?.name,
        sentById: dbUser?.id,
      };

      onMessageSent(messageData);
      handleClose();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSubject("");
    setMessage("");
    setPriority("normal");
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
            <div className="flex items-center gap-3">
              <MessageCircle className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Send Message
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Recipient Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recipient
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
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
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Message subject (optional)"
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Message *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Type your message here..."
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {message.length}/500 characters
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <div className="flex gap-3">
              {[
                { value: "low", label: "Low", color: "text-green-600" },
                { value: "normal", label: "Normal", color: "text-blue-600" },
                { value: "high", label: "High", color: "text-orange-600" },
                { value: "urgent", label: "Urgent", color: "text-red-600" },
              ].map((priorityOption) => (
                <button
                  key={priorityOption.value}
                  type="button"
                  onClick={() => setPriority(priorityOption.value)}
                  className={cn(
                    "flex-1 px-3 py-2 border-2 rounded-lg transition-all text-sm font-medium",
                    priority === priorityOption.value
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
                  )}
                >
                  {priorityOption.label}
                </button>
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
              disabled={!message.trim()}
              icon={<Send size={16} />}
            >
              Send Message
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
