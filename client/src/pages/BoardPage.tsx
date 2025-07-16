import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  MoreHorizontal,
  Plus,
  UserPlus,
  Search,
  Lock,
  Users,
  Brain,
  Sparkles,
  Settings,
} from "lucide-react";
import Button from "../components/ui/Button";
import KanbanList from "../components/board/KanbanList";
import KanbanCard from "../components/board/KanbanCard";
import TaskModal from "../components/board/TaskModal";
import CreateTaskModal from "../components/board/CreateTaskModal";
import CreateListModal from "../components/board/CreateListModal";
import AddMemberModal from "../components/board/AddMemberModal";
import AITaskGenerator from "../components/ai/AITaskGenerator";
import AISummaryPanel from "../components/ai/AISummaryPanel";
import EditBoardModal from "../components/board/EditBoardModal";
import { boardsAPI, tasksAPI } from "../lib/api";
import { useSocket } from "../hooks/useSocket";
import { useBoardStore } from "../stores/useBoardStore";
import { toast } from "sonner";

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { currentBoard, setCurrentBoard, setLoading } = useBoardStore();
  const [activeId, setActiveId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [showEditBoardModal, setShowEditBoardModal] = useState(false);

  // Initialize socket connection for this board
  useSocket(boardId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId]);

  const loadBoard = async () => {
    if (!boardId) return;

    setLoading(true);
    try {
      const response = await boardsAPI.getBoard(boardId);
      setCurrentBoard(response.data.board);
    } catch (error) {
      console.error("Error loading board:", error);
      toast.error("Failed to load board");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !currentBoard) return;

    if (active.id !== over.id) {
      // Handle list reordering
      if (
        active.id.toString().includes("list-") &&
        over.id.toString().includes("list-")
      ) {
        const oldIndex = currentBoard.lists.findIndex(
          (list: any) => list.id === active.id
        );
        const newIndex = currentBoard.lists.findIndex(
          (list: any) => list.id === over.id
        );

        const newLists = arrayMove(currentBoard.lists, oldIndex, newIndex);
        setCurrentBoard({ ...currentBoard, lists: newLists });

        // Update positions on backend
        try {
          await Promise.all(
            newLists.map((list: any, index: number) =>
              boardsAPI.updateList(boardId!, list.id, { position: index })
            )
          );
        } catch (error) {
          console.error("Error updating list positions:", error);
          toast.error("Failed to update list positions");
          loadBoard(); // Reload to get correct state
        }
      }

      // Handle task reordering or moving between lists
      if (active.id.toString().includes("task-")) {
        const activeTask = currentBoard.lists
          .flatMap((list: any) => list.tasks)
          .find((task: any) => task.id === active.id);

        if (!activeTask) return;

        let targetListId = activeTask.listId;
        let newPosition = activeTask.position;

        // Determine target list and position
        if (over.id.toString().includes("list-")) {
          targetListId = over.id;
          newPosition = 0;
        } else if (over.id.toString().includes("task-")) {
          const overTask = currentBoard.lists
            .flatMap((list: any) => list.tasks)
            .find((task: any) => task.id === over.id);

          if (overTask) {
            targetListId = overTask.listId;
            newPosition = overTask.position;
          }
        }

        // Update task position/list
        try {
          await tasksAPI.updateTask(activeTask.id, {
            listId: targetListId,
            position: newPosition,
          });

          // Reload board to get updated state
          loadBoard();
        } catch (error) {
          console.error("Error moving task:", error);
          toast.error("Failed to move task");
        }
      }
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = (listId: string) => {
    setSelectedListId(listId);
    setIsCreateTaskModalOpen(true);
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await boardsAPI.deleteList(boardId!, listId);
      loadBoard();
      toast.success("List deleted successfully");
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete list");
    }
  };

  const handleEditList = async (listId: string, title: string) => {
    try {
      await boardsAPI.updateList(boardId!, listId, { title });
      loadBoard();
      toast.success("List updated successfully");
    } catch (error) {
      console.error("Error updating list:", error);
      toast.error("Failed to update list");
    }
  };

  const handleAITasksGenerated = async (tasks: any[]) => {
    try {
      // Create tasks in the first list or a default list
      const targetListId = currentBoard?.lists[0]?.id;
      if (!targetListId) {
        toast.error("No list available to add tasks");
        return;
      }

      for (const task of tasks) {
        await tasksAPI.createTask({
          title: task.title,
          description: task.description,
          listId: targetListId,
          position: 0,
          priority: task.priority,
          createdById: "current-user-id", // This should come from auth context
        });
      }

      loadBoard(); // Reload to show new tasks
    } catch (error) {
      console.error("Error creating AI-generated tasks:", error);
      toast.error("Failed to create AI-generated tasks");
    }
  };

  if (!currentBoard) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading board...</p>
        </div>
      </div>
    );
  }

  const filteredLists = currentBoard.lists.map((list: any) => ({
    ...list,
    tasks: list.tasks.filter(
      (task: any) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Board header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentBoard.title}
              </h1>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300"
                >
                  <Users size={16} />
                  <span>Share</span>
                </Button>
                <div className="h-5 border-r border-gray-300 dark:border-gray-600 mx-2"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300"
                >
                  {currentBoard.isPublic ? (
                    <Users size={16} />
                  ) : (
                    <Lock size={16} />
                  )}
                  <span>{currentBoard.isPublic ? "Public" : "Private"}</span>
                </Button>
              </div>
            </div>
            {currentBoard.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {currentBoard.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAIGeneratorOpen(true)}
              icon={<Sparkles size={16} />}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none hover:from-purple-700 hover:to-blue-700"
            >
              AI Generate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAISummaryOpen(true)}
              icon={<Brain size={16} />}
            >
              AI Insights
            </Button>

            <div className="flex -space-x-2">
              {currentBoard.members
                ?.slice(0, 4)
                .map((member: any, i: number) => (
                  <div
                    key={member.id || i}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-medium text-xs bg-primary-500"
                    title={member.user.name}
                  >
                    {member.user.avatar ? (
                      <img
                        src={member.user.avatar}
                        alt={member.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      member.user.name.charAt(0)
                    )}
                  </div>
                ))}
              {currentBoard.members?.length > 4 && (
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium">
                  +{currentBoard.members.length - 4}
                </div>
              )}
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300"
              >
                <UserPlus size={14} />
              </button>
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBoardMenu(!showBoardMenu)}
                className="text-gray-600 dark:text-gray-300"
              >
                <MoreHorizontal size={18} />
              </Button>

              {showBoardMenu && (
                <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[180px]">
                  <button
                    onClick={() => {
                      // Board settings functionality
                      setShowEditBoardModal(true);
                      setShowBoardMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Settings size={14} />
                    Board Settings
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Board content */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full">
            <SortableContext
              items={filteredLists.map((list: any) => list.id)}
              strategy={horizontalListSortingStrategy}
            >
              {filteredLists.map((list: any) => (
                <KanbanList
                  key={list.id}
                  id={list.id}
                  title={list.title}
                  tasks={list.tasks}
                  onTaskClick={handleTaskClick}
                  onCreateTask={() => handleCreateTask(list.id)}
                  onDeleteList={handleDeleteList}
                  onEditList={handleEditList}
                />
              ))}
            </SortableContext>

            {/* Add new list button */}
            {/* the dots on the list,sort em out */}
            <div className="flex-shrink-0 w-72">
              <button
                onClick={() => setIsCreateListModalOpen(true)}
                className="w-full h-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Plus size={18} />
                <span>Add New List</span>
              </button>
            </div>
          </div>

          <DragOverlay>
            {activeId && activeId.toString().includes("task-") && (
              <KanbanCard
                task={currentBoard.lists
                  .flatMap((list: any) => list.tasks)
                  .find((task: any) => task.id === activeId)}
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Click outside to close board menu */}
      {showBoardMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowBoardMenu(false)}
        />
      )}

      {/* Modals */}
      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onUpdate={() => loadBoard()}
        boardMembers={currentBoard.members || []}
        boardLabels={currentBoard.labels || []}
      />

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        listId={selectedListId}
        boardMembers={currentBoard.members || []}
        boardLabels={currentBoard.labels || []}
        onTaskCreated={() => loadBoard()}
      />

      <CreateListModal
        isOpen={isCreateListModalOpen}
        onClose={() => setIsCreateListModalOpen(false)}
        boardId={boardId!}
        onListCreated={() => loadBoard()}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        boardId={boardId!}
        onMemberAdded={() => loadBoard()}
      />

      <AITaskGenerator
        onTasksGenerated={handleAITasksGenerated}
        boardContext={currentBoard.title}
      />

      <AISummaryPanel
        board={currentBoard}
        isVisible={isAISummaryOpen}
        onClose={() => setIsAISummaryOpen(false)}
      />

      <EditBoardModal
        isOpen={!!showEditBoardModal}
        onClose={() => setShowEditBoardModal(false)}
        board={currentBoard}
        onBoardDeleted={() => navigate("/dashboard")}
        onBoardUpdated={() => loadBoard()}
      />

      {isAIGeneratorOpen && (
        <AITaskGenerator
          onTasksGenerated={handleAITasksGenerated}
          boardContext={currentBoard.title}
        />
      )}
    </div>
  );
}
