import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Clock,
  Users,
  BarChart2,
  CheckSquare,
  Sparkles,
  TrendingUp,
  Star,
  ArrowRight,
  Activity,
  Target,
  Lock,
  Globe,
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
import { useCurrentUser } from "../lib/auth";
import { toast } from "sonner";
import { cn } from "../utils/cn";

export default function Dashboard() {
  const navigate = useNavigate();
  const { boards, setBoards } = useBoardStore();
  const { dbUser } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadDashboardData();
  }, [dbUser]);
  // console.log("User", user);
  // console.log("DB User", dbUser);

  const loadDashboardData = async () => {
    if (!dbUser) return;

    setIsLoading(true);
    try {
      // Load boards
      const boardsResponse = await boardsAPI.getBoards(dbUser.id);
      setBoards(
        boardsResponse.data.boards.filter(
          (board: { isArchived: boolean }) => !board.isArchived
        )
      );

      // Load analytics if user has data
      if (boardsResponse.data.boards.length > 0) {
        try {
          const analyticsResponse = await analyticsAPI.getUserAnalytics(
            dbUser.id,
            {
              timeRange: "all",
              priorityFilter: null,
              statusFilter: null,
            }
          );
          console.log(analyticsResponse.data);

          setAnalytics(analyticsResponse.data.recentActivities);
          setRecentActivity(analyticsResponse.data.recentActivities || []);
        } catch (analyticsError) {
          console.warn("Analytics not available:", analyticsError);
          setAnalytics(null);
          setRecentActivity([]);
        }
      } else {
        setAnalytics(null);
        setRecentActivity([]);
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
    toast.success(`Generated ${tasks.length} AI tasks`);
    setIsAIGeneratorOpen(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "create-board":
        setIsCreateBoardModalOpen(true);
        break;
      case "ai-generate":
        toast.info("Tasks can only be generated within a board.");
        break;
      case "analytics":
        navigate("/analytics");
        break;
      case "settings":
        navigate("/settings");
        break;
    }
  };

  const filteredBoards = boards.filter((board) => {
    const matchesSearch =
      board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterBy === "all") return matchesSearch;
    if (filterBy === "owned")
      return matchesSearch && board.ownerId === dbUser?.id;
    if (filterBy === "shared")
      return matchesSearch && board.ownerId !== dbUser?.id;

    return matchesSearch;
  });

  // Calculate real stats from boards data
  const stats = {
    totalBoards: boards.length,
    totalTasks: boards.reduce(
      (acc, board) =>
        acc +
        board.lists?.reduce(
          (listAcc: number, list: any) => listAcc + (list.tasks?.length || 0),
          0
        ),
      0
    ),
    completedTasks: boards.reduce(
      (acc, board) =>
        acc +
        board.lists?.reduce(
          (listAcc: number, list: any) =>
            listAcc +
            (list.tasks?.filter((task: any) => task.completed).length || 0),
          0
        ),
      0
    ),
    teamMembers: boards.reduce(
      (acc, board) => acc + (board.members?.length || 0),
      0
    ),
  };

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"
                  ></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {dbUser?.name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {boards.length > 0
              ? `You have ${stats.totalTasks} tasks across ${stats.totalBoards} boards`
              : "Ready to start your first project?"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() =>
              toast.info("Tasks can only be generated within a board.")
            }
            icon={<Sparkles size={18} />}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none hover:from-purple-700 hover:to-blue-700"
          >
            AI Generate
          </Button>
          <Button
            onClick={() => handleQuickAction("create-board")}
            icon={<Plus size={18} />}
          >
            New Board
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              id: 1,
              name: "Total Boards",
              value: stats.totalBoards.toString(),
              icon: <BarChart2 size={20} />,
              change: boards.length > 0 ? "+1 this week" : "Get started",
              changeType: "increase",
              color: "text-primary-600 dark:text-primary-400",
              bgColor: "bg-primary-100 dark:bg-primary-900/30",
            },
            {
              id: 2,
              name: "Total Tasks",
              value: stats.totalTasks.toString(),
              icon: <CheckSquare size={20} />,
              change:
                stats.totalTasks > 0
                  ? `${stats.completedTasks} completed`
                  : "No tasks yet",
              changeType: "increase",
              color: "text-secondary-600 dark:text-secondary-400",
              bgColor: "bg-secondary-100 dark:bg-secondary-900/30",
            },
            {
              id: 3,
              name: "Team Members",
              value: stats.teamMembers.toString(),
              icon: <Users size={20} />,
              change:
                stats.teamMembers > 0 ? "Across all boards" : "Invite team",
              changeType: "increase",
              color: "text-accent-600 dark:text-accent-400",
              bgColor: "bg-accent-100 dark:bg-accent-900/30",
            },
            {
              id: 4,
              name: "Completion Rate",
              value: `${completionRate}%`,
              icon: <TrendingUp size={20} />,
              change: completionRate > 0 ? "Keep it up!" : "Start completing",
              changeType: "increase",
              color: "text-success-600 dark:text-success-400",
              bgColor: "bg-success-100 dark:bg-success-900/30",
            },
          ].map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: stat.id * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mr-4",
                          stat.bgColor
                        )}
                      >
                        <span className={stat.color}>{stat.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {stat.name}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-4">
              <Target size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to TaskNest!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Get started by creating your first board to organize your tasks
              and collaborate with your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setIsCreateBoardModalOpen(true)}
                icon={<Plus size={18} />}
              >
                Create Your First Board
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/*       
  {
confirm && 


  } */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Boards Section */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Boards
            </h2>
            <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search boards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Boards</option>
                <option value="owned">Owned by me</option>
                <option value="shared">Shared with me</option>
              </select>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "px-3 py-2 text-sm",
                    viewMode === "grid"
                      ? "bg-primary-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "px-3 py-2 text-sm border-l border-gray-300 dark:border-gray-600",
                    viewMode === "list"
                      ? "bg-primary-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {filteredBoards.length > 0 ? (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                  : "space-y-4"
              )}
            >
              {filteredBoards.map((board, index) => (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link to={`/boards/${board.id}`}>
                    <Card
                      className={cn(
                        "h-full hover:shadow-lg transition-all duration-200 group cursor-pointer",
                        viewMode === "list" && "flex items-center p-4"
                      )}
                    >
                      {viewMode === "grid" ? (
                        <>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {board.title}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                {board.isPublic ? (
                                  <Globe
                                    size={16}
                                    className="text-green-500"
                                    title="Public board"
                                  />
                                ) : (
                                  <Lock
                                    size={16}
                                    className="text-gray-400"
                                    title="Private board"
                                  />
                                )}
                              </div>
                            </div>
                            {board.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                {board.description}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Progress
                                </span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {board.lists?.reduce(
                                    (acc: number, list: any) =>
                                      acc +
                                      (list.tasks?.filter(
                                        (task: any) => task.completed
                                      ).length || 0),
                                    0
                                  ) || 0}
                                  /
                                  {board.lists?.reduce(
                                    (acc: number, list: any) =>
                                      acc + (list.tasks?.length || 0),
                                    0
                                  ) || 0}{" "}
                                  tasks
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${
                                      board.lists?.reduce(
                                        (acc: number, list: any) =>
                                          acc + (list.tasks?.length || 0),
                                        0
                                      ) > 0
                                        ? (board.lists.reduce(
                                            (acc: number, list: any) =>
                                              acc +
                                              (list.tasks?.filter(
                                                (task: any) => task.completed
                                              ).length || 0),
                                            0
                                          ) /
                                            board.lists.reduce(
                                              (acc: number, list: any) =>
                                                acc + (list.tasks?.length || 0),
                                              0
                                            )) *
                                          100
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Users size={16} className="mr-1" />
                                  <span>
                                    {board.members?.length + 1 || 0}{" "}
                                    {board.members?.length + 1 === 1
                                      ? "member"
                                      : "members"}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Clock size={16} className="mr-1" />
                                  <span>
                                    {new Date(
                                      board.updatedAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                              <BarChart2
                                size={20}
                                className="text-primary-600 dark:text-primary-400"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {board.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {board.lists?.reduce(
                                  (acc: number, list: any) =>
                                    acc + (list.tasks?.length || 0),
                                  0
                                ) || 0}{" "}
                                tasks • {board.members?.length || 0} members
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {board.isPublic ? (
                              <Globe size={16} className="text-green-500" />
                            ) : (
                              <Lock size={16} className="text-gray-400" />
                            )}
                            <ArrowRight
                              size={16}
                              className="text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                            />
                          </div>
                        </div>
                      )}
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
                  delay: filteredBoards.length * 0.1,
                }}
              >
                <Card
                  className={cn(
                    "border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer group",
                    viewMode === "grid"
                      ? "h-full flex flex-col items-center justify-center p-8"
                      : "flex items-center justify-center p-6"
                  )}
                  onClick={() => setIsCreateBoardModalOpen(true)}
                >
                  <div
                    className={cn(
                      "flex items-center",
                      viewMode === "grid" ? "flex-col text-center" : "space-x-3"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                      <Plus size={24} />
                    </div>
                    <div className={viewMode === "grid" ? "mt-4" : ""}>
                      <h3 className="text-gray-900 dark:text-white font-medium">
                        Create New Board
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Start a new project
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mx-auto mb-4">
                  <BarChart2 size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery ? "No boards found" : "No boards yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchQuery
                    ? `No boards match "${searchQuery}". Try a different search term.`
                    : "Create your first board to get started with organizing your tasks."}
                </p>
                <Button
                  onClick={() => setIsCreateBoardModalOpen(true)}
                  icon={<Plus size={16} />}
                >
                  Create Board
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    title: "Create Board",
                    icon: <Plus size={18} />,
                    color: "text-primary-600 dark:text-primary-400",
                    bgColor: "bg-primary-100 dark:bg-primary-900/30",
                    action: "create-board",
                  },
                  {
                    title: "View Analytics",
                    icon: <BarChart2 size={18} />,
                    color: "text-secondary-600 dark:text-secondary-400",
                    bgColor: "bg-secondary-100 dark:bg-secondary-900/30",
                    action: "analytics",
                  },
                  {
                    title: "AI Generate",
                    icon: <Sparkles size={18} />,
                    color: "text-purple-600 dark:text-purple-400",
                    bgColor: "bg-purple-100 dark:bg-purple-900/30",
                    action: "ai-generate",
                  },
                  {
                    title: "Settings",
                    icon: <Users size={18} />,
                    color: "text-accent-600 dark:text-accent-400",
                    bgColor: "bg-accent-100 dark:bg-accent-900/30",
                    action: "settings",
                  },
                ].map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className="cursor-pointer"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform",
                          action.bgColor
                        )}
                      >
                        <span className={action.color}>{action.icon}</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {action.title}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={18} />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.length > 0 ? (
                <div className="space-y-4">
                  {analytics.slice(0, 5).map((activity: any, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <CheckSquare
                          size={14}
                          className="text-primary-600 dark:text-primary-400"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.type
                            .replace("_", " ")
                            .toLowerCase()
                            .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {activity.board?.title} •{" "}
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No recent activity
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Start working on boards to see activity here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productivity Tip */}
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Star
                    size={20}
                    className="text-primary-600 dark:text-primary-400"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Productivity Tip
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {boards.length === 0
                      ? "Start by creating your first board and organizing your tasks into lists like 'To Do', 'In Progress', and 'Done'."
                      : "Use AI task generation to break down complex projects into manageable tasks. It can save you hours of planning!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
