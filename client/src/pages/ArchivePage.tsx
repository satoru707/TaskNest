import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  Search,
  RotateCcw,
  Trash2,
  Calendar,
  Users,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import { boardsAPI } from "../lib/api";
import { useCurrentUser } from "../lib/auth";
import { toast } from "sonner";
import { cn } from "../utils/cn";

export default function ArchivePage() {
  const { dbUser } = useCurrentUser();
  const [archivedItems, setArchivedItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArchivedItems();
  }, [dbUser]);

  const loadArchivedItems = async () => {
    if (!dbUser) return;

    setIsLoading(true);
    try {
      // Get all boards
      const response = await boardsAPI.getBoards(dbUser.id);
      const boards = response.data.boards;

      // Simulate some archived items
      const archivedBoards = boards.slice(-2).map((board: any) => ({
        ...board,
        type: "board",
        archivedAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ), // Random date within last 30 days
        archivedBy: dbUser.name,
      }));

      const archivedTasks = boards
        .flatMap(
          (board: any) =>
            board.lists?.flatMap(
              (list: any) =>
                list.tasks?.slice(-1).map((task: any) => ({
                  ...task,
                  type: "task",
                  boardTitle: board.title,
                  listTitle: list.title,
                  archivedAt: new Date(
                    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
                  ),
                  archivedBy: dbUser.name,
                })) || []
            ) || []
        )
        .slice(0, 3);

      const archivedLists = boards.slice(0, 1).flatMap(
        (board: any) =>
          board.lists?.slice(-1).map((list: any) => ({
            ...list,
            type: "list",
            boardTitle: board.title,
            archivedAt: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ),
            archivedBy: dbUser.name,
          })) || []
      );

      setArchivedItems([...archivedBoards, ...archivedTasks, ...archivedLists]);
    } catch (error) {
      console.error("Error loading archived items:", error);
      toast.error("Failed to load archived items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (item: any) => {
    try {
      // In a real app, you'd call an API to restore the item
      setArchivedItems((prev) =>
        prev.filter((archived) => archived.id !== item.id)
      );
      toast.success(`${item.type} restored successfully`);
    } catch (error) {
      console.error("Error restoring item:", error);
      toast.error("Failed to restore item");
    }
  };

  const handlePermanentDelete = async (item: any) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${item.title}"? This action cannot be undone.`
    );

    if (confirmDelete) {
      try {
        // In a real app, you'd call an API to permanently delete the item
        setArchivedItems((prev) =>
          prev.filter((archived) => archived.id !== item.id)
        );
        toast.success(`${item.type} permanently deleted`);
      } catch (error) {
        console.error("Error deleting item:", error);
        toast.error("Failed to delete item");
      }
    }
  };

  const filteredItems = archivedItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.boardTitle &&
        item.boardTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterType === "all") return matchesSearch;
    return matchesSearch && item.type === filterType;
  });

  const getItemIcon = (type: string) => {
    switch (type) {
      case "board":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
      case "list":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "task":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return <Archive size={20} />;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case "board":
        return "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400";
      case "list":
        return "bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400";
      case "task":
        return "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>

          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Archive
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage archived boards, lists, and tasks
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search archived items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Items</option>
          <option value="board">Boards</option>
          <option value="list">Lists</option>
          <option value="task">Tasks</option>
        </select>
      </div>

      {/* Archived Items */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          getItemColor(item.type)
                        )}
                      >
                        {getItemIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize",
                              getItemColor(item.type)
                            )}
                          >
                            {item.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>
                              Archived{" "}
                              {new Date(item.archivedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span>by {item.archivedBy}</span>
                          {item.boardTitle && item.type !== "board" && (
                            <span>from {item.boardTitle}</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(item)}
                        icon={<RotateCcw size={14} />}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePermanentDelete(item)}
                        icon={<Trash2 size={14} />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Archive className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No archived items found" : "No archived items"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery
                ? `No archived items match "${searchQuery}". Try a different search term.`
                : "Archived boards, lists, and tasks will appear here."}
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
