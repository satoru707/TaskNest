import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bookmark,
  Search,
  Star,
  Calendar,
  Users,
  BookmarkX,
  ExternalLink,
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

export default function BookmarksPage() {
  const { dbUser } = useCurrentUser();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, [dbUser]);

  const loadBookmarks = async () => {
    if (!dbUser) return;

    setIsLoading(true);
    try {
      // Get all boards and filter bookmarked ones
      const response = await boardsAPI.getBoards(dbUser.id);
      const boards = response.data.boards;

      // In a real app, you'd have a bookmarks table
      // For now, we'll simulate some bookmarked boards
      const bookmarkedBoards = boards
        .slice(0, Math.min(3, boards.length))
        .map((board: any) => ({
          ...board,
          bookmarkedAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ), // Random date within last week
          type: "board",
        }));

      // Add some simulated bookmarked tasks
      const bookmarkedTasks = boards
        .flatMap(
          (board: any) =>
            board.lists?.flatMap(
              (list: any) =>
                list.tasks?.slice(0, 1).map((task: any) => ({
                  ...task,
                  boardTitle: board.title,
                  listTitle: list.title,
                  bookmarkedAt: new Date(
                    Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
                  ),
                  type: "task",
                })) || []
            ) || []
        )
        .slice(0, 2);

      setBookmarks([...bookmarkedBoards, ...bookmarkedTasks]);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      toast.error("Failed to load bookmarks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      // In a real app, you'd call an API to remove the bookmark
      setBookmarks((prev) =>
        prev.filter((bookmark) => bookmark.id !== bookmarkId)
      );
      toast.success("Bookmark removed");
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast.error("Failed to remove bookmark");
    }
  };

  const filteredBookmarks = bookmarks.filter(
    (bookmark) =>
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bookmark.type === "task" &&
        bookmark.boardTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"
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
            Bookmarks
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Quick access to your favorite boards and tasks
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((bookmark, index) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          bookmark.type === "board"
                            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                            : "bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400"
                        )}
                      >
                        {bookmark.type === "board" ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {bookmark.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {bookmark.type === "board"
                            ? "Board"
                            : `Task in ${bookmark.boardTitle}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <button
                        onClick={() => handleRemoveBookmark(bookmark.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <BookmarkX size={14} />
                      </button>
                    </div>
                  </div>

                  {bookmark.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {bookmark.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>
                            {new Date(
                              bookmark.bookmarkedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {bookmark.type === "board" && bookmark.members && (
                          <div className="flex items-center space-x-1">
                            <Users size={12} />
                            <span>{bookmark.members.length} members</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        bookmark.type === "board"
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400"
                          : "bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400"
                      )}
                    >
                      <Bookmark size={10} className="mr-1" />
                      {bookmark.type === "board" ? "Board" : "Task"}
                    </span>

                    <Link
                      to={
                        bookmark.type === "board"
                          ? `/boards/${bookmark.id}`
                          : `/boards/${
                              bookmark.list?.boardId || bookmark.boardId
                            }?task=${bookmark.id}`
                      }
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Bookmark className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No bookmarks found" : "No bookmarks yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery
                ? `No bookmarks match "${searchQuery}". Try a different search term.`
                : "Start bookmarking boards and tasks for quick access later."}
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back to Boards
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
