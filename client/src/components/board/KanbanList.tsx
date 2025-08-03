import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { MoreHorizontal, Plus, Trash2, Edit2, Archive } from "lucide-react";
import { useState } from "react";
import KanbanCard from "./KanbanCard";
import { cn } from "../../utils/cn";
import { boardsAPI, authAPI } from "../../lib/api";
import { useAuth0WithUser as useAuth0 } from "../../hooks/useAuth0withUser";

interface KanbanListProps {
  id: string;
  title: string;
  tasks: any[];
  onTaskClick?: (task: any) => void;
  onCreateTask?: () => void;
  onDeleteList?: (listId: string) => void;
  onEditList?: (listId: string, title: string) => void;
  onArchiveList?: (listId: string) => void;
  refresh: () => void;
}

export default function KanbanList({
  id,
  title,
  tasks,
  onTaskClick,
  onCreateTask,
  onDeleteList,
  onEditList,
  onArchiveList,
  refresh,
}: KanbanListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [showListMenu, setShowListMenu] = useState(false);
  const { user } = useAuth0();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "list",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const listColors = {
    "To Do": "bg-gray-100 dark:bg-gray-700",
    "In Progress": "bg-blue-100 dark:bg-blue-900/30",
    Review: "bg-yellow-100 dark:bg-yellow-900/30",
    Done: "bg-green-100 dark:bg-green-900/30",
  };

  const handleEditSave = () => {
    if (editTitle.trim() && editTitle !== title) {
      onEditList?.(id, editTitle.trim());
    }
    setIsEditing(false);
    setEditTitle(title);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditTitle(title);
  };

  const handleArchiving = async () => {
    if (
      window.confirm(
        `Are you sure you want to archive "${title}"? This will hide all tasks in this list.`
      ) &&
      user?.sub
    ) {
      console.log(id);
      const userId = await authAPI.getProfile(user.sub);

      const listData = await boardsAPI.getList(id);
      console.log(listData.data);
      await boardsAPI.archiveList(listData.data.boardId, id, {
        isArchived: true,
        userId: userId.data.user.id,
      });
      setShowListMenu(false);
      refresh(); // Refresh the list after archiving
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${title}"? This will also delete all tasks in this list.`
      )
    ) {
      onDeleteList?.(id);
    }
    setShowListMenu(false);
  };

  return (
    <motion.div
      ref={setNodeRef} // Attach the ref for drag-and-drop
      style={style}
      className={cn(
        "flex-shrink-0 w-72 h-full flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700",
        isDragging && "opacity-50 z-10"
      )}
    >
      {/* List header */}
      <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 cursor-move">
        <div
          className="flex items-center gap-2 flex-1"
          {...attributes}
          {...listeners}
        >
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSave();
                if (e.key === "Escape") handleEditCancel();
              }}
              className="font-medium text-gray-900 dark:text-white bg-transparent border-none outline-none flex-1"
              autoFocus
            />
          ) : (
            <h3 className="font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {tasks.filter((task) => !task.isArchived).length}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowListMenu(!showListMenu)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <MoreHorizontal size={16} />
          </button>

          {showListMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[150px]">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowListMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Edit2 size={14} />
                Edit List
              </button>
              <button
                onClick={handleArchiving}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Archive size={14} />
                Archive List
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete List
              </button>
            </div>
          )}
        </div>
      </div>

      {/* List content */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {tasks
          .filter((task) => !task.isArchived)
          .map((task) => (
            <div
              key={task.id}
              onClick={() => {
                console.log("Task clicked:", task.id);
                onTaskClick?.(task);
              }}
            >
              <KanbanCard task={task} refresh={refresh} />
            </div>
          ))}
      </div>

      {/* Add card button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCreateTask}
          className="w-full py-2 rounded-md flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Plus size={16} />
          <span>Add a card</span>
        </button>
      </div>

      {/* Click outside to close menu */}
      {showListMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowListMenu(false)}
        />
      )}
    </motion.div>
  );
}
