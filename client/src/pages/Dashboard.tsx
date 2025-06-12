import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  BarChart2,
  Calendar,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import CreateBoardModal from "../components/board/CreateBoardModal";
import AITaskGenerator from "../components/ai/AITaskGenerator";
import { boardsAPI, analyticsAPI } from "../lib/api";
import { useBoardStore } from "../stores/useBoardStore";
import { toast } from "sonner";
import { cn } from "../utils/cn";

export default function Dashboard() {
  const navigate = useNavigate();
  const { boards, setBoards } = useBoardStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    teamMembers: 0,
    completionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load boards
      const boardsResponse = await boardsAPI.getBoards("current-user-id"); // This should come from auth context
      setBoards(boardsResponse.data.boards);

      // Load analytics
      try {
        const analyticsResponse = await analyticsAPI.getUserAnalytics(
          "current-user-id"
        );
        setStats({
          totalTasks:
            analyticsResponse.data.overview.assignedTasks +
            analyticsResponse.data.overview.createdTasks,
          teamMembers: boardsResponse.data.boards.reduce(
            (acc: number, board: any) => acc + board.members.length,
            0
          ),
          completionRate:
            analyticsResponse.data.overview.assignedCompletionRate,
        });
      } catch (analyticsError) {
        // Analytics might fail, but we can still show boards
        console.warn("Failed to load analytics:", analyticsError);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoardCreated = (board: any) => {
    setBoards([board, ...boards]);
    navigate(`/boards/${board.id}`);
  };

  const handleAITasksGenerated = async (tasks: any[]) => {
    // For dashboard AI generation, we might want to create a new board
    // or add tasks to an existing board
    toast.success(`Generated ${tasks.length} AI tasks`);
  };

  const filteredBoards = boards.filter(
    (board) =>
      board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentBoards = filteredBoards.slice(0, 6);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Welcome back! Here's an overview of your projects.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAIGeneratorOpen(true)}
            icon={<Sparkles size={18} />}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none hover:from-purple-700 hover:to-blue-700"
          >
            AI Generate
          </Button>
          <Button
            onClick={() => setIsCreateBoardModalOpen(true)}
            icon={<Plus size={18} />}
          >
            New Board
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            id: 1,
            name: "Total Tasks",
            value: stats.totalTasks.toString(),
            icon: <CheckSquare size={20} />,
            change: "+12%",
            changeType: "increase",
          },
          {
            id: 2,
            name: "Team Members",
            value: stats.teamMembers.toString(),
            icon: <Users size={20} />,
            change: "+2",
            changeType: "increase",
          },
          {
            id: 3,
            name: "Completion Rate",
            value: `${Math.round(stats.completionRate)}%`,
            icon: <BarChart2 size={20} />,
            change: "+5%",
            changeType: "increase",
          },
        ].map((stat) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: stat.id * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mr-4",
                      stat.id === 1
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                        : stat.id === 2
                        ? "bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400"
                        : "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400"
                    )}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        stat.changeType === "increase"
                          ? "bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-400"
                          : "bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-400"
                      )}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Boards */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Boards
          </h2>
          <div className="mt-2 sm:mt-0 flex space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <Button variant="outline" size="sm" icon={<Filter size={16} />}>
              Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentBoards.map((board, index) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            >
              <Link to={`/boards/${board.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow duration-200 group">
                  <CardHeader>
                    <CardTitle className="truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {board.title}
                    </CardTitle>
                    {board.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {board.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Progress
                        </span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {board.lists?.reduce(
                            (acc: number, list: any) =>
                              acc +
                              list.tasks.filter((task: any) => task.completed)
                                .length,
                            0
                          ) || 0}
                          /
                          {board.lists?.reduce(
                            (acc: number, list: any) => acc + list.tasks.length,
                            0
                          ) || 0}{" "}
                          tasks
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              board.lists?.reduce(
                                (acc: number, list: any) =>
                                  acc + list.tasks.length,
                                0
                              ) > 0
                                ? (board.lists.reduce(
                                    (acc: number, list: any) =>
                                      acc +
                                      list.tasks.filter(
                                        (task: any) => task.completed
                                      ).length,
                                    0
                                  ) /
                                    board.lists.reduce(
                                      (acc: number, list: any) =>
                                        acc + list.tasks.length,
                                      0
                                    )) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <Users size={16} className="mr-1" />
                          <span>{board.members?.length || 0} members</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Updated{" "}
                          {new Date(board.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}

          {/* Create new board card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.2 + recentBoards.length * 0.1,
            }}
          >
            <Card
              className="h-full border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 flex flex-col items-center justify-center p-6 cursor-pointer group"
              onClick={() => setIsCreateBoardModalOpen(true)}
            >
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-3 group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <h3 className="text-gray-900 dark:text-white font-medium text-lg mb-1">
                Create New Board
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                Start a new project or organize tasks
              </p>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Create Task",
              icon: <Plus size={20} />,
              color:
                "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400",
              onClick: () => setIsCreateBoardModalOpen(true),
            },
            {
              title: "View Analytics",
              icon: <BarChart2 size={20} />,
              color:
                "bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400",
              onClick: () => navigate("/analytics"),
            },
            {
              title: "Team Members",
              icon: <Users size={20} />,
              color:
                "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400",
              onClick: () => navigate("/settings"),
            },
            {
              title: "AI Generate",
              icon: <Sparkles size={20} />,
              color:
                "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
              onClick: () => setIsAIGeneratorOpen(true),
            },
          ].map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="cursor-pointer"
              onClick={action.onClick}
            >
              <Card className="hover:shadow-md transition-shadow duration-200 group">
                <CardContent className="p-4 flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform",
                      action.color
                    )}
                  >
                    {action.icon}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {action.title}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={() => setIsCreateBoardModalOpen(false)}
        onBoardCreated={handleBoardCreated}
      />

      {isAIGeneratorOpen && (
        <AITaskGenerator
          onTasksGenerated={handleAITasksGenerated}
          boardContext="Dashboard"
        />
      )}
    </div>
  );
}
