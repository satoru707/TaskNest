import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Paperclip,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Save,
} from "lucide-react";
import { format } from "date-fns";
import Button from "../ui/Button";
// import { Card, CardContent } from "../ui/Card";
import { tasksAPI, uploadsAPI } from "../../lib/api";
import { toast } from "sonner";
import { cn } from "../../utils/cn";
import { useAuth0WithUser as useAuth0 } from "../../hooks/useAuth0withUser";

interface TaskModalProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: any) => void;
  boardMembers: any[];
  boardLabels: any[];
  refresh: () => void;
}

export default function TaskModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  boardMembers,
  boardLabels,
  refresh,
}: TaskModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
  );
  const [priority, setPriority] = useState(task?.priority || "MEDIUM");
  const [selectedAssignees, setSelectedAssignees] = useState(
    task?.assignees?.map((a: any) => a.user.id) || []
  );
  const [selectedLabels, setSelectedLabels] = useState(
    task?.labels?.map((l: any) => l.label.id) || []
  );
  const [newComment, setNewComment] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth0();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDueDate(
        task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
      );
      setPriority(task.priority);
      setSelectedAssignees(task.assignees?.map((a: any) => a.user.id) || []);
      setSelectedLabels(task.labels?.map((l: any) => l.label.id) || []);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const updates = {
        title,
        description,
        dueDate: dueDate || null,
        priority,
        assigneeIds: selectedAssignees,
        labelIds: selectedLabels,
      };

      const response = await tasksAPI.updateTask(task.id, updates);
      onUpdate(task.id, response.data.task);
      setIsEditing(false);
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    console.log("COmment", newComment);

    try {
      await tasksAPI.addComment(task.id, {
        content: newComment,
        userId: user?.sub,
      });
      setNewComment("");
      toast.success("Comment added");
      // Refresh task data
      refresh();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;

    try {
      await tasksAPI.addChecklistItem(task.id, {
        title: newChecklistItem,
        position: task.checklistItems?.length || 0,
      });
      setNewChecklistItem("");
      toast.success("Checklist item added");
      // Refresh task data
      refresh();
    } catch (error) {
      console.error("Error adding checklist item:", error);
      toast.error("Failed to add checklist item");
    }
  };

  const handleToggleChecklistItem = async (
    itemId: string,
    completed: boolean
  ) => {
    try {
      await tasksAPI.updateChecklistItem(task.id, itemId, { completed });
      toast.success("Checklist item updated");
      // Refresh task data
      refresh();
    } catch (error) {
      console.error("Error updating checklist item:", error);
      toast.error("Failed to update checklist item");
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", task.id);
      formData.append("uploadedById", user?.sub);

      await uploadsAPI.uploadAttachment(formData);
      toast.success("File uploaded successfully");
      // Refresh task data
      refresh();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  async function handleDeleteTask() {
    try {
      await tasksAPI.deleteTask(task.id);
      toast.success("Task deleted successfully");
      refresh();
    } catch (error) {
      console.error("Error updating checklist item:", error);
      toast.error("Failed to update checklist item");
    }
  }
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      case "HIGH":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "LOW":
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                      placeholder="Task title"
                    />
                  ) : (
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {task.title}
                    </h2>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    in list{" "}
                    <span className="font-medium">{task.list?.title}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      icon={<Edit2 size={16} />}
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleSave}
                      isLoading={isSubmitting}
                      icon={<Save size={16} />}
                    >
                      Save
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X size={20} />
                  </Button>
                </div>
              </div>

              {/* Labels */}
              {task.labels && task.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {task.labels.map((label: any) => (
                    <span
                      key={label.id}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        label.label.color
                      )}
                    >
                      {label.label.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </h3>
                {isEditing ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Add a description..."
                  />
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 min-h-[80px]">
                    {task.description ? (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {task.description}
                      </p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No description
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Checklist
                  </h3>
                  {task.checklistItems && task.checklistItems.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {
                        task.checklistItems.filter(
                          (item: any) => item.completed
                        ).length
                      }{" "}
                      of {task.checklistItems.length} completed
                    </span>
                  )}
                </div>

                {task.checklistItems && task.checklistItems.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {task.checklistItems.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) =>
                            handleToggleChecklistItem(item.id, e.target.checked)
                          }
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span
                          className={cn(
                            "flex-1 text-sm",
                            item.completed
                              ? "line-through text-gray-500 dark:text-gray-400"
                              : "text-gray-700 dark:text-gray-300"
                          )}
                        >
                          {item.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            /* Delete checklist item */
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Add checklist item"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddChecklistItem()
                    }
                  />
                  <Button
                    size="sm"
                    onClick={handleAddChecklistItem}
                    icon={<Plus size={16} />}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Attachments
                </h3>

                {task.attachments && task.attachments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {task.attachments.map((attachment: any) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
                      >
                        <Paperclip size={16} className="text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {attachment.originalName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    isLoading={isUploading}
                    icon={<Paperclip size={16} />}
                  >
                    Attach File
                  </Button>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Comments
                </h3>

                {task.comments && task.comments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {task.comments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                          {comment.user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {comment.user.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {format(
                                  new Date(comment.createdAt),
                                  "MMM d, yyyy at h:mm a"
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    icon={<MessageSquare size={16} />}
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-64 border-l border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Actions
            </h3>

            <div className="space-y-4">
              {/* Assignees */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Assignees
                </label>
                {isEditing ? (
                  <select
                    multiple
                    value={selectedAssignees}
                    onChange={(e) =>
                      setSelectedAssignees(
                        Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        )
                      )
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                  >
                    {boardMembers.map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {task.assignees?.map((assignee: any) => (
                      <div
                        key={assignee.id}
                        className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded px-2 py-1"
                      >
                        <div className="w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs">
                          {assignee.user.name.charAt(0)}
                        </div>
                        <span className="text-xs">{assignee.user.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Due Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                  />
                ) : (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {task.dueDate
                      ? format(new Date(task.dueDate), "MMM d, yyyy")
                      : "No due date"}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Priority
                </label>
                {isEditing ? (
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                ) : (
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      getPriorityColor(task.priority)
                    )}
                  >
                    {task.priority}
                  </span>
                )}
              </div>

              {/* Labels */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Labels
                </label>
                {isEditing ? (
                  <select
                    multiple
                    value={selectedLabels}
                    onChange={(e) =>
                      setSelectedLabels(
                        Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        )
                      )
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                  >
                    {boardLabels.map((label) => (
                      <option key={label.id} value={label.id}>
                        {label.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {task.labels?.map((label: any) => (
                      <span
                        key={label.id}
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          label.label.color
                        )}
                      >
                        {label.label.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="mb-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  icon={<Trash2 size={16} />}
                  onClick={handleDeleteTask}
                >
                  Delete Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
