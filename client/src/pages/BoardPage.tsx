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
  Star,
  Bookmark,
  BookmarkCheck,
  Archive,
  LogOut,
} from "lucide-react";
import Button from "../components/ui/Button";
import KanbanList from "../components/board/KanbanList";
import KanbanCard from "../components/board/KanbanCard";
import TaskModal from "../components/board/TaskModal";
import CreateTaskModal from "../components/board/CreateTaskModal";
// import MemberListComponent from "../components/board/MemberList";
import CreateListModal from "../components/board/CreateListModal";
import AddMemberModal from "../components/board/AddMemberModal";
import AITaskGenerator from "../components/ai/AITaskGenerator";
import AISummaryPanel from "../components/ai/AISummaryPanel";
import EditBoardModal from "../components/board/EditBoardModal";
import { authAPI, boardsAPI, tasksAPI } from "../lib/api";
import { useSocket } from "../hooks/useSocket";
import { useBoardStore } from "../stores/useBoardStore";
import { toast } from "sonner";
import { useAuth0WithUser as useAuth0 } from "../hooks/useAuth0withUser";
import { useBookmarkStore } from "../stores/useBookMarkStore";

// New Component to display members and roles
const MemberListComponent = ({ members, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Board Members
        </h2>
        <ul className="space-y-4 max-h-64 overflow-y-auto">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {member.user.avatar ? (
                  <img
                    src={member.user.avatar}
                    alt={member.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-xs">
                    {member.user.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {member.user.name}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {member.role.toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="mt-6 w-full"
        >
          Close
        </Button>
      </div>
    </div>
  );
};
export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { currentBoard, setCurrentBoard, setLoading } = useBoardStore();
  const [activeId, setActiveId] = useState(null);
  const { addBookmark } = useBookmarkStore();
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
  const [boardIsBookmarked, setBoardIsBookmarked] = useState(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [role, setRole] = useState("ADMIN");

  useSocket(boardId);
  const { user } = useAuth0();
  // console.log(user);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (boardId) loadBoard();
  }, [boardId]);
  useEffect(() => {
    if (boardId) loadBoard();

    if (currentBoard && user?.sub) {
      const userId = authAPI.getProfile(user.sub);
      userId
        .then((id) => {
          const isMember = currentBoard.members.some(
            (member: any) => member.user.auth0Id === id.data.user.auth0Id
          );
          if (!isMember && role !== "ADMIN") {
            toast.error("You are not authorized to view this board.");
            navigate("/dashboard");
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to verify your access.");
          navigate("/dashboard");
        });
    }
  }, [boardId]);
  const handleBoardBookmark = async () => {
    if (!currentBoard) return;

    const newBookmarkState = !boardIsBookmarked;
    setBoardIsBookmarked(newBookmarkState);
    addBookmark({
      id: currentBoard.id,
      type: "board",
      title: currentBoard.title,
      description: currentBoard.description,
      bookmarkedAt: new Date().toISOString(),
    });
    const userId = await authAPI.getProfile(user?.sub);
    await boardsAPI.bookMarkBoard(currentBoard.id, {
      isBookMarked: newBookmarkState,
      userId: userId.data.user.id,
    });
    toast.success(newBookmarkState ? "Board bookmarked" : "Bookmark removed");
    setShowEditBoardModal(false);
  };

  const handleBoardArchive = async () => {
    if (!currentBoard || !user?.sub) return;
    const userId = await authAPI.getProfile(user.sub);
    await boardsAPI.archiveBoard(currentBoard.id, {
      isArchived: true,
      userId: userId.data.user.id,
    });
    toast.success("Board archived");
    navigate("/dashboard");
  };
  //everything apart from insights, search tasks and the circle circle
  console.log(currentBoard);

  const loadBoard = async () => {
    if (!boardId) return;
    setLoading(true);
    try {
      const response = await boardsAPI.getBoard(boardId);
      setCurrentBoard(response.data.board);
      const id = await authAPI.getProfile(user?.sub);
      console.log(response.data.board);

      //overhere nigga
      for (const member of response.data.board.members) {
        if (id.data.user.auth0Id == member.user.auth0Id) {
          setRole(member.role);
        }
      }

      setBoardIsBookmarked(response.data.board.isBookMarked || false);
    } catch (error) {
      console.error("Error loading board:", error);
      toast.error("Failed to load board");
    } finally {
      setLoading(false);
    }
  };

  async function handleLeave() {
    if (user?.sub) {
      const confirm = window.confirm(
        "Are you sure you want to leave the board?"
      );
      const userId = await authAPI.getProfile(user?.sub);

      if (confirm) {
        console.log(currentBoard.id, user.id);

        await boardsAPI.removeMember(currentBoard.id, userId.data.user.id);
        navigate("/dashboard");
        toast.success("You have left the board");
      }
    }
  }

  console.log(currentBoard);

  const handleDragStart = (event: any) => {
    if (role == "VIEWER") return;
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    if (role == "VIEWER") return;
    const { active, over } = event;
    setActiveId(null);

    if (!over || !currentBoard) return;

    if (active.id !== over.id) {
      // Handle list reordering
      if (
        active.id.toString().startsWith("list-") &&
        over.id.toString().startsWith("list-")
      ) {
        const oldIndex = currentBoard.lists.findIndex(
          (list: any) => `list-${list.id}` === active.id
        );
        const newIndex = currentBoard.lists.findIndex(
          (list: any) => `list-${list.id}` === over.id
        );
        const newLists = arrayMove(currentBoard.lists, oldIndex, newIndex);
        setCurrentBoard({ ...currentBoard, lists: newLists });
        await Promise.all(
          newLists.map((list: any, index: number) =>
            boardsAPI.updateList(boardId!, list.id, { position: index })
          )
        );
      }

      // Handle task reordering or moving
      if (active.id.toString().startsWith("task-")) {
        const activeTask = currentBoard.lists
          .flatMap((list: any) => list.tasks)
          .find((task: any) => `task-${task.id}` === active.id);

        if (!activeTask) return;

        let targetListId = activeTask.listId;
        let newPosition = activeTask.position;

        const overList = currentBoard.lists.find(
          (list: any) => `list-${list.id}` === over.id
        );
        const overTask = currentBoard.lists
          .flatMap((list: any) => list.tasks)
          .find((task: any) => `task-${task.id}` === over.id);

        if (overList) {
          targetListId = overList.id;
          newPosition = overList.tasks.length; // Append to end of list
        } else if (overTask) {
          targetListId = overTask.listId;
          const overIndex =
            overList?.tasks.findIndex((t: any) => t.id === overTask.id) || 0;
          newPosition = overIndex + (active.id < over.id ? 0 : 1); // Adjust position based on drag direction
        }

        await tasksAPI.updateTask(activeTask.id, {
          listId: targetListId,
          position: newPosition,
        });
        loadBoard(); // Reload to sync state
      }
    }
  };
  console.log(currentBoard);

  const handleTaskClick = async (task: any) => {
    console.log(task);

    if (typeof task === "string") {
      console.log("task", task);
      const task_data = await tasksAPI.updateTask(task, { id: task });
      setSelectedTask(task_data.data.task);
    } else {
      console.log("task", task);

      setSelectedTask(task);
    }
    setIsTaskModalOpen(true);
  };

  useEffect(() => {
    if (localStorage.getItem("taskId")) {
      handleTaskClick(localStorage.getItem("taskId")!);
      localStorage.clear();
    }
  }, []);

  const handleCreateTask = (listId: string) => {
    if (role == "VIEWER") {
      toast.error("You don't have permission to create tasks");
    } else {
      setSelectedListId(listId);
      setIsCreateTaskModalOpen(true);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (role == "VIEWER") {
      toast.error("You don't have permission to create tasks");
    } else {
      try {
        await boardsAPI.deleteList(boardId!, listId);
        loadBoard();
        toast.success("List deleted successfully");
      } catch (error) {
        console.error("Error deleting list:", error);
        toast.error("Failed to delete list");
      }
    }
  };

  const handleEditList = async (listId: string, title: string) => {
    if (role == "VIEWER") {
      toast.error("You don't have permission to create tasks");
    } else {
      try {
        await boardsAPI.updateList(boardId!, listId, { title });
        loadBoard();
        toast.success("List updated successfully");
      } catch (error) {
        console.error("Error updating list:", error);
        toast.error("Failed to update list");
      }
    }
  };

  const handleAITasksGenerated = async (tasks: any[], list_no: any) => {
    if (role == "VIEWER") {
      toast.error("You don't have permission to create tasks");
    } else {
      try {
        // Create tasks in the first list or a default list
        const targetListId = currentBoard?.lists[list_no - 1]?.id;
        if (!targetListId) {
          toast.error("No list available to add tasks");
          return;
        }
        console.log("At least you reaching here");
        //think I made misatake
        for (const task of tasks) {
          await tasksAPI.createTask({
            title: task.title,
            description: task.description,
            listId: targetListId,
            position: 0,
            priority: task.priority,
            createdById: user?.sub,
          });
        }

        loadBoard(); // Reload to show new tasks
      } catch (error) {
        console.error("Error creating AI-generated tasks:", error);
        toast.error("Failed to create AI-generated tasks");
      }
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
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ">
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
                  onClick={() => {
                    setIsMemberListOpen(true); // Toggle member list instead of add member modal
                  }}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300"
                >
                  <Users size={16} /> <span>View Members</span>
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
              id="ai_button"
              onClick={() => {
                if (role == "ADMIN") {
                  setIsAIGeneratorOpen(true);
                } else {
                  toast.error("You are not allowed to perform this action");
                }
              }}
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
              {[
                {
                  id: currentBoard.owner.id,
                  createdAt: currentBoard.createdAt,
                  role: "ADMIN",
                  user: currentBoard.owner,
                },
              ]
                .concat(currentBoard.members)
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
                onClick={() => {
                  setShowBoardMenu(!showBoardMenu);
                }}
                className="text-gray-600 dark:text-gray-300"
              >
                <MoreHorizontal size={18} />
              </Button>
              {showBoardMenu && role == "ADMIN" ? (
                <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[180px]">
                  <button
                    onClick={() => {
                      setShowEditBoardModal(true);
                      setShowBoardMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Settings size={14} /> Board Settings
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <button
                    onClick={() => {
                      handleBoardBookmark();
                      setShowBoardMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    {boardIsBookmarked ? (
                      <BookmarkCheck size={14} />
                    ) : (
                      <Bookmark size={14} />
                    )}
                    {boardIsBookmarked ? "Remove Bookmark" : "Bookmark Board"}
                  </button>
                  <button
                    onClick={handleBoardArchive}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Archive size={14} /> Archive Board
                  </button>
                  <button
                    onClick={() => {
                      toast.info("Export board functionality coming soon");
                      setShowEditBoardModal(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Star size={14} /> Export Board
                  </button>
                </div>
              ) : showBoardMenu && role != "ADMIN" ? (
                <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[180px]">
                  <button
                    onClick={handleLeave}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Leave Board
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full">
            <SortableContext
              items={filteredLists.map((list: any) => `list-${list.id}`)} // Prefix with "list-"
              strategy={horizontalListSortingStrategy}
            >
              {filteredLists
                .filter((list: any) => !list.isArchived)
                .map((list: any) => (
                  <KanbanList
                    key={list.id}
                    id={`list-${list.id}`} // Prefix id for consistency
                    title={list.title}
                    tasks={list.tasks.map((task: any) => ({
                      ...task,
                      id: `task-${task.id}`, // Prefix task ids
                    }))}
                    onTaskClick={handleTaskClick}
                    onCreateTask={() => handleCreateTask(list.id)}
                    onDeleteList={handleDeleteList}
                    onEditList={handleEditList}
                    refresh={loadBoard}
                    role={role}
                  />
                ))}
            </SortableContext>
            <div className="flex-shrink-0 w-72">
              <button
                onClick={() => {
                  if (role !== "VIEWER") {
                    setIsCreateListModalOpen(true);
                  } else {
                    toast.error("You are not allowed to perform this action");
                  }
                }}
                className="w-full h-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Plus size={18} />
                <span>Add New List</span>
              </button>
            </div>
          </div>
          <DragOverlay>
            {activeId && activeId.toString().startsWith("list-") && (
              <KanbanList
                id={activeId}
                title={
                  currentBoard.lists.find(
                    (list: any) => `list-${list.id}` === activeId
                  )?.title || ""
                }
                tasks={[]}
                onTaskClick={handleTaskClick}
                onCreateTask={() => {}}
                onDeleteList={handleDeleteList}
                onEditList={handleEditList}
                refresh={loadBoard}
              />
            )}
            {activeId && activeId.toString().startsWith("task-") && (
              <KanbanCard
                task={currentBoard.lists
                  .flatMap((list: any) => list.tasks)
                  .find((task: any) => `task-${task.id}` === activeId)}
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>
      {showBoardMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowBoardMenu(false)}
        />
      )}
      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onUpdate={() => loadBoard()}
        boardMembers={currentBoard.members || []}
        boardLabels={currentBoard.labels || []}
        refresh={() => {
          setIsTaskModalOpen(false);
          loadBoard();
        }}
        role={role}
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
      <AISummaryPanel
        board={currentBoard}
        isVisible={isAISummaryOpen}
        onClose={() => setIsAISummaryOpen(false)}
        role={role}
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
      {isMemberListOpen && (
        <MemberListComponent
          members={
            [
              {
                id: currentBoard.owner.id,
                createdAt: currentBoard.createdAt,
                role: "ADMIN",
                user: currentBoard.owner,
              },
            ].concat(currentBoard.members) || []
          }
          onClose={() => setIsMemberListOpen(false)}
        />
      )}
    </div>
  );
}
