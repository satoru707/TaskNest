import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Calendar, Flag } from "lucide-react";
import Button from "../ui/Button";
import { tasksAPI } from "../../lib/api";
import { toast } from "sonner";
import { cn } from "../../utils/cn";
import { useAuth0WithUser as useAuth0 } from "../../hooks/useAuth0withUser";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  boardMembers: any[];
  boardLabels: any[];
  onTaskCreated: (task: any) => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  listId,
  boardMembers,
  boardLabels,
  onTaskCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth0();
  console.log(user);
  console.log(listId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        listId,
        position: 0, // Will be calculated on backend
        dueDate: dueDate || undefined,
        priority,
        createdById: user?.sub,
        assigneeIds: selectedAssignees,
        labelIds: selectedLabels,
      };
      console.log("Task", taskData);

      const response = await tasksAPI.createTask(taskData);
      console.log(taskData, response.data.task);

      onTaskCreated(response.data.task);
      onClose();
      resetForm();
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("MEDIUM");
    setSelectedAssignees([]);
    setSelectedLabels([]);
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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Task
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
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter task title"
              required
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Add a description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Due Date */}
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Due Date
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Priority
              </label>
              <div className="relative">
                <Flag
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assignees
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {boardMembers.map((member) => (
                <label key={member.user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedAssignees.includes(member.user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAssignees([
                          ...selectedAssignees,
                          member.user.id,
                        ]);
                      } else {
                        setSelectedAssignees(
                          selectedAssignees.filter(
                            (id) => id !== member.user.id
                          )
                        );
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex items-center">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-medium text-primary-600 dark:text-primary-400">
                      {member.user.name.charAt(0)}
                    </div>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {member.user.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {boardLabels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => {
                    if (selectedLabels.includes(label.id)) {
                      setSelectedLabels(
                        selectedLabels.filter((id) => id !== label.id)
                      );
                    } else {
                      setSelectedLabels([...selectedLabels, label.id]);
                    }
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border-2 transition-all",
                    selectedLabels.includes(label.id)
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500",
                    label.color
                  )}
                >
                  {label.name}
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
              icon={<Plus size={16} />}
            >
              Create Task
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
