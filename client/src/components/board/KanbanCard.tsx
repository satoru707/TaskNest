import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import {
  MessageSquare,
  Paperclip,
  Calendar,
  CheckSquare,
  Flag,
  BookmarkCheck,
  Bookmark,
  Archive,
  Move,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { toast } from "sonner";
import { tasksAPI } from "../../lib/api";

interface KanbanCardProps {
  task: any;
  onClick?: (task: any) => void;
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onBookmarkToggle?: (type: "task", id: string, isBookmarked: boolean) => void;
  refresh: () => void;
}

export default function KanbanCard({
  task,
  onClick,
  onTaskUpdate,
  onBookmarkToggle,
  refresh,
}: KanbanCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(task.isBookMarked || false);
  const [isCompleted, setIsCompleted] = useState(task.completed || false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600";
      case "HIGH":
        return "text-orange-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "LOW":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const handleCompletionToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    await tasksAPI.updateTask(task.id.split("-")[1], {
      completed: newCompletedState,
    });
    onTaskUpdate?.(task.id, { completed: newCompletedState });
    toast.success(
      newCompletedState ? "Task completed!" : "Task marked as incomplete"
    );
  };

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    onBookmarkToggle?.("task", task.id, newBookmarkState);
    const ans = await tasksAPI.updateTask(task.id.split("-")[1], {
      isBookmarked: newBookmarkState,
    });
    console.log(ans);
    toast.success(newBookmarkState ? "Task bookmarked" : "Bookmark removed");
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await tasksAPI.updateTask(task.id.split("-")[1], {
        isArchived: true,
      });
      toast.success("Task archived");
      refresh();
    } catch (error) {
      console.error("Error archiving task:", error);
      toast.error("Failed to archive task");
    }
  };

  const completedChecklist =
    task.checklistItems?.filter((item: any) => item.completed).length || 0;
  const totalChecklist = task.checklistItems?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md p-3 transition-all group cursor-move",
        isDragging ? "opacity-50 z-10 shadow-md rotate-3" : "opacity-100",
        isCompleted && "opacity-75 bg-gray-50 dark:bg-gray-900"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-10 w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Move size={16} />
      </div>
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCompletionToggle}
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
            isCompleted
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 dark:border-gray-600 hover:border-green-500"
          )}
        >
          {isCompleted && <CheckSquare size={12} />}
        </button>
      </div>

      {/* Bookmark and Archive Buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={handleBookmarkToggle}
          className={cn(
            "p-1 rounded transition-colors",
            isBookmarked
              ? "text-yellow-500 hover:text-yellow-600"
              : "text-gray-400 hover:text-yellow-500"
          )}
        >
          {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </button>
        <button
          onClick={(e) => handleArchive(e)}
          className={cn(
            "p-1 rounded transition-colors text-blue-500 hover:text-yellow-600"
          )}
        >
          <Archive size={14} />
        </button>
      </div>

      {/* Clickable card content */}
      <div className="cursor-pointer" onClick={() => onClick?.(task)}>
        {/* Priority indicator */}
        {task.priority && (
          <div className="flex items-center justify-between mb-2">
            <Flag size={12} className={getPriorityColor(task.priority)} />
          </div>
        )}

        {/* Card labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.labels.slice(0, 3).map((label: any) => (
              <span
                key={label.id}
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  label.label.color
                )}
              >
                {label.label.name}
              </span>
            ))}
            {task.labels.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5">
                +{task.labels.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Card title */}
        <h4 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {task.title}
        </h4>

        {/* Card description (truncated) */}
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Checklist progress */}
        {totalChecklist > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare size={14} className="text-gray-400" />
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(completedChecklist / totalChecklist) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {completedChecklist}/{totalChecklist}
            </span>
          </div>
        )}

        {/* Card meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded",
                  new Date(task.dueDate) < new Date()
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : "bg-gray-100 dark:bg-gray-700"
                )}
              >
                <Calendar size={12} />
                <span>{format(new Date(task.dueDate), "MMM d")}</span>
              </div>
            )}

            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare size={12} />
                <span>{task.comments.length}</span>
              </div>
            )}

            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip size={12} />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>

          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-1">
              {task.assignees
                .slice(0, 3)
                .map((assignee: any, index: number) => (
                  <div
                    key={assignee.id}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300"
                    title={assignee.user.name}
                  >
                    {assignee.user.avatar ? (
                      <img
                        src={assignee.user.avatar}
                        alt={assignee.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      assignee.user.name.charAt(0)
                    )}
                  </div>
                ))}
              {task.assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
