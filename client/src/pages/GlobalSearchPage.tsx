import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../lib/auth";
import { useBoardStore } from "../stores/useBoardStore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Search, Users, Plus } from "lucide-react";
import { cn } from "../utils/cn";
import { toast } from "sonner";

interface Board {
  id: string;
  title: string;
  description: string | null;
  members: { id: string }[];
  isPublic: boolean;
  lists?: {
    title: string;
    tasks: { id: string; title: string; description?: string }[];
  }[];
}

export default function SearchPage() {
  const { dbUser } = useCurrentUser();
  const navigate = useNavigate();
  const { boards } = useBoardStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showJoinConfirm, setShowJoinConfirm] = useState<{
    boardId: string | null;
    title: string;
  } | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // Load boards initially
  useEffect(() => {
    if (!dbUser || !boards.length) {
      setSearchResults([]);
      return;
    }
  }, [dbUser, boards]);

  // Search functionality (triggered only when query is non-empty)
  useEffect(() => {
    const performSearch = () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsLoadingSearch(true);
      const results: any[] = [];

      boards.forEach((board) => {
        // Filter for public boards only
        if (!board.isPublic) return;

        // Search board titles and descriptions
        if (
          board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          board.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          results.push({
            type: "board",
            id: board.id,
            title: board.title,
            description: board.description,
            memberCount: board.members.length,
            path: `/boards/${board.id}`,
          });
        }

        // Search tasks within public boards
        board.lists?.forEach((list) => {
          list.tasks?.forEach((task) => {
            if (
              task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              task.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
            ) {
              results.push({
                type: "task",
                id: task.id,
                title: task.title,
                description: task.description,
                boardTitle: board.title,
                listTitle: list.title,
                path: `/boards/${board.id}?task=${task.id}`,
              });
            }
          });
        });
      });

      setSearchResults(results.slice(0, 10)); // Limit to 10 results
      setShowSearchResults(true);
      setIsLoadingSearch(false);
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, boards]);

  const handleJoinBoard = (boardId: string, title: string) => {
    setShowJoinConfirm({ boardId, title });
  };

  const confirmJoinBoard = async () => {
    if (!showJoinConfirm || !dbUser) return;

    const confirmed = window.confirm(
      `Are you sure you want to join "${showJoinConfirm.title}" as a viewer?`
    );
    if (confirmed) {
      try {
        // Assume joinBoard API call (placeholder, replace with actual API)
        // await boardsAPI.joinBoard(dbUser.id, showJoinConfirm.boardId, { role: "VIEWER" });
        toast.success(`Joined "${showJoinConfirm.title}" as a viewer!`);
        navigate(`/boards/${showJoinConfirm.boardId}`);
      } catch (error: any) {
        console.error("Error joining board:", error);
        toast.error("Failed to join board: " + (error.message || ""));
      }
    }
    setShowJoinConfirm(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Search Public Boards
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Find and join public boards created by users.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"
            />
          </div>
        </div>
      </div>

      {isLoadingSearch ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults
            .filter((result) => result.type === "board")
            .map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {result.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {result.description || "No description available."}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Users size={16} />
                      {result.memberCount + 1} Members
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleJoinBoard(result.id, result.title)}
                    >
                      <Plus size={16} className="mr-2" />
                      Join as Viewer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mx-auto mb-6">
            <Search size={48} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            No Boards Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Try entering a search query to find public boards.
          </p>
        </div>
      )}

      {showJoinConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-100">
          <div
            className="fixed inset-0 bg-black/40 z-90"
            onClick={() => setShowJoinConfirm(null)}
          />
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 max-w-md w-full z-100">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Join Board
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to join "{showJoinConfirm.title}" as a
              viewer? You will be redirected to the board after joining.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowJoinConfirm(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={confirmJoinBoard}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
