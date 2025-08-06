import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Download,
  RefreshCw,
  Activity,
  Target,
  Clock,
} from "lucide-react";
import Button from "../components/ui/Button";
import { analyticsAPI } from "../lib/api";
import { useCurrentUser } from "../lib/auth";
import { toast } from "sonner";
import { cn } from "../utils/cn";

// Updated analytics type
interface Analytics {
  overview: {
    assignedTasks: number;
    completedAssignedTasks: number;
    assignedCompletionRate: number;
    createdTasks: number;
    completedCreatedTasks: number;
    createdCompletionRate: number;
  };
  tasksByBoard: {
    boardId: string;
    boardTitle: string;
    assigned: number;
    completed: number;
  }[];
  productivityTrend: { date: string; completed: number }[];
  recentActivities: {
    id: string;
    type: string;
    data: any;
    createdAt: string;
    board: { id: string; title: string } | null;
    task: { id: string; title: string } | null;
  }[];
  avgCompletionTime: string; // Hours as string
  topBoards: { boardId: string; boardTitle: string; taskCount: number }[];
  priorityDistribution: Record<string, number>;
}

export default function AnalyticsPage() {
  const { dbUser } = useCurrentUser();
  const [timeRange, setTimeRange] = useState("week");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, dbUser, priorityFilter, statusFilter]);

  const loadAnalytics = async () => {
    if (!dbUser) return;

    setIsLoading(true);
    try {
      const response = await analyticsAPI.getUserAnalytics(dbUser.id, {
        timeRange,
        priorityFilter,
        statusFilter,
      });
      setAnalytics(response.data);
      console.log(response.data);

      const hasAnyData =
        response.data.overview.assignedTasks > 0 ||
        response.data.overview.createdTasks > 0 ||
        response.data.tasksByBoard.length > 0 ||
        response.data.recentActivities.length > 0 ||
        response.data.topBoards.length > 0;

      setHasData(hasAnyData);
    } catch (error: any) {
      console.error("Error loading analytics:", error);
      setHasData(false);
      setAnalytics(null);
      if (error.response?.status !== 404) {
        toast.error("Failed to load analytics: " + (error.message || ""));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeRangeChange = (range: string) => setTimeRange(range);
  const handlePriorityFilterChange = (priority: string | null) =>
    setPriorityFilter(priority);
  const handleStatusFilterChange = (status: string | null) =>
    setStatusFilter(status);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasData || !analytics) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Track your productivity and task completion metrics.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={16} />}
            onClick={loadAnalytics}
          >
            Refresh
          </Button>
        </div>
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mx-auto mb-6">
            <BarChart3 size={48} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            No Data Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Start creating boards, tasks, and collaborating with your team to
            see detailed analytics and insights here.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-4">
                <Target size={24} />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Create Boards
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Organize your projects into boards
              </p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center text-secondary-600 dark:text-secondary-400 mx-auto mb-4">
                <Activity size={24} />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Add Tasks
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Break down work into manageable tasks
              </p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-600 dark:text-accent-400 mx-auto mb-4">
                <Users size={24} />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Collaborate
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Invite team members and work together
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const getTrendChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  // Calculate previous period's average from productivityTrend
  const getPreviousPeriodAverage = () => {
    if (!analytics?.productivityTrend.length) return 0;
    const sortedTrend = [...analytics.productivityTrend].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const currentPeriodCount = sortedTrend[0]?.completed || 0;
    const previousPeriodData = sortedTrend.slice(1, 4); // Last 3 days/weeks/months
    const previousAverage =
      previousPeriodData.reduce((sum, entry) => sum + entry.completed, 0) /
      Math.max(1, previousPeriodData.length);
    return { current: currentPeriodCount, previous: previousAverage };
  };

  const { current: currentProductivity, previous: previousProductivity } =
    getPreviousPeriodAverage();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track your productivity and task completion metrics.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {["week", "month", "year"].map((range) => (
              <button
                key={range}
                type="button"
                className={cn(
                  "px-4 py-2 text-sm font-medium",
                  range === "week" && "rounded-l-lg",
                  range === "year" && "rounded-r-lg",
                  timeRange === range
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
                onClick={() => handleTimeRangeChange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={16} />}
            onClick={loadAnalytics}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={() => toast.info("Export feature coming soon!")}
          >
            Export
          </Button>
          <select
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={priorityFilter || ""}
            onChange={(e) => handlePriorityFilterChange(e.target.value || null)}
          >
            <option value="">All Priorities</option>
            {Object.keys(analytics.priorityDistribution).map((priority) => (
              <option key={priority} value={priority}>
                {priority} ({analytics.priorityDistribution[priority]})
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={statusFilter || ""}
            onChange={(e) => handleStatusFilterChange(e.target.value || null)}
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Assigned Tasks",
            value: analytics.overview.assignedTasks.toString(),
            icon: <BarChart3 size={20} />,
            change: getTrendChange(
              analytics.overview.assignedTasks,
              (analytics.productivityTrend.length > 1
                ? analytics.productivityTrend
                    .slice(1)
                    .reduce((sum, entry) => sum + entry.completed, 0) /
                  Math.max(1, analytics.productivityTrend.length - 1)
                : analytics.overview.assignedTasks) || 0
            ),
            changeType:
              analytics.overview.assignedTasks >
                (analytics.productivityTrend.length > 1
                  ? analytics.productivityTrend
                      .slice(1)
                      .reduce((sum, entry) => sum + entry.completed, 0) /
                    Math.max(1, analytics.productivityTrend.length - 1)
                  : analytics.overview.assignedTasks) || 0
                ? "increase"
                : "decrease",
            color: "text-primary-600 dark:text-primary-400",
          },
          {
            title: "Created Tasks",
            value: analytics.overview.createdTasks.toString(),
            icon: <TrendingUp size={20} />,
            change: getTrendChange(
              analytics.overview.createdTasks,
              (analytics.productivityTrend.length > 1
                ? analytics.productivityTrend
                    .slice(1)
                    .reduce((sum, entry) => sum + entry.completed, 0) /
                  Math.max(1, analytics.productivityTrend.length - 1)
                : analytics.overview.createdTasks) || 0
            ),
            changeType:
              analytics.overview.createdTasks >
                (analytics.productivityTrend.length > 1
                  ? analytics.productivityTrend
                      .slice(1)
                      .reduce((sum, entry) => sum + entry.completed, 0) /
                    Math.max(1, analytics.productivityTrend.length - 1)
                  : analytics.overview.createdTasks) || 0
                ? "increase"
                : "decrease",
            color: "text-accent-600 dark:text-accent-400",
          },
          {
            title: "Completion Rate",
            value:
              `${
                ((analytics.overview.completedAssignedTasks +
                  analytics.overview.completedCreatedTasks) /
                  (analytics.overview.assignedTasks +
                    analytics.overview.createdTasks)) *
                100
              }%` || "0%",
            icon: <Users size={20} />,
            change: getTrendChange(
              ((analytics.overview.completedAssignedTasks +
                analytics.overview.completedCreatedTasks) /
                (analytics.overview.assignedTasks +
                  analytics.overview.createdTasks)) *
                100,
              (analytics.productivityTrend.length > 1
                ? (analytics.productivityTrend
                    .slice(1)
                    .reduce((sum, entry) => sum + entry.completed, 0) /
                    Math.max(1, analytics.productivityTrend.length - 1) /
                    (analytics.overview.assignedTasks +
                      analytics.overview.createdTasks)) *
                  100
                : (analytics.overview.assignedCompletionRate +
                    analytics.overview.createdCompletionRate) /
                  2) || 0
            ),
            changeType:
              ((analytics.overview.completedAssignedTasks +
                analytics.overview.completedCreatedTasks) /
                (analytics.overview.assignedTasks +
                  analytics.overview.createdTasks)) *
                100 >
                (analytics.productivityTrend.length > 1
                  ? (analytics.productivityTrend
                      .slice(1)
                      .reduce((sum, entry) => sum + entry.completed, 0) /
                      Math.max(1, analytics.productivityTrend.length - 1) /
                      (analytics.overview.assignedTasks +
                        analytics.overview.createdTasks)) *
                    100
                  : (analytics.overview.assignedCompletionRate +
                      analytics.overview.createdCompletionRate) /
                    2) || 0
                ? "increase"
                : "decrease",
            color: "text-secondary-600 dark:text-secondary-400",
          },
          {
            title: "Avg. Completion Time",
            value: `${analytics.avgCompletionTime} hrs`,
            icon: <Clock size={20} />,
            change: getTrendChange(
              Number(analytics.avgCompletionTime),
              (analytics.productivityTrend.length > 1
                ? analytics.productivityTrend
                    .slice(1)
                    .reduce(
                      (sum, entry) => sum + Number(analytics.avgCompletionTime),
                      0
                    ) / Math.max(1, analytics.productivityTrend.length - 1)
                : Number(analytics.avgCompletionTime)) || 0
            ),
            changeType:
              Number(analytics.avgCompletionTime) <
                (analytics.productivityTrend.length > 1
                  ? analytics.productivityTrend
                      .slice(1)
                      .reduce(
                        (sum, entry) =>
                          sum + Number(analytics.avgCompletionTime),
                        0
                      ) / Math.max(1, analytics.productivityTrend.length - 1)
                  : Number(analytics.avgCompletionTime)) || 0
                ? "increase"
                : "decrease",
            color: "text-success-600 dark:text-success-400",
          },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mr-4",
                    {
                      "bg-primary-100 dark:bg-primary-900/30": index === 0,
                      "bg-accent-100 dark:bg-accent-900/30": index === 1,
                      "bg-secondary-100 dark:bg-secondary-900/30": index === 2,
                      "bg-success-100 dark:bg-success-900/30": index === 3,
                    }
                  )}
                >
                  <span className={stat?.color}>{stat?.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat?.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat?.value}
                  </p>
                </div>
                <div className="ml-auto">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      stat?.changeType === "increase"
                        ? "bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-400"
                        : "bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-400"
                    )}
                  >
                    {stat?.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Productivity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.productivityTrend.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.productivityTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      strokeOpacity={0.1}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#6B7280" }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fill: "#6B7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        borderColor: "#374151",
                        color: "#E5E7EB",
                      }}
                      formatter={(value: number) => `${value} tasks`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Tasks Completed"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">
                    No productivity data yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    Complete some tasks to see your trend
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.priorityDistribution).length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(analytics.priorityDistribution).map(
                      ([priority, count]) => ({ priority, count })
                    )}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      strokeOpacity={0.1}
                    />
                    <XAxis dataKey="priority" tick={{ fill: "#6B7280" }} />
                    <YAxis tick={{ fill: "#6B7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        borderColor: "#374151",
                        color: "#E5E7EB",
                      }}
                      formatter={(value: number) => `${value} tasks`}
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Tasks"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">
                    No priority data yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    Assign priorities to tasks
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentActivities.length > 0 ? (
            <div className="space-y-4 overflow-y-auto">
              {analytics.recentActivities.slice(0, 7).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Activity
                      size={16}
                      className="text-primary-600 dark:text-primary-400"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.type
                        .replace("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.board?.title || "N/A"} •{" "}
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
                No recent activities
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Start working on tasks
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
