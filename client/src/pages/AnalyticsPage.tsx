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

export default function AnalyticsPage() {
  const { dbUser } = useCurrentUser();
  const [timeRange, setTimeRange] = useState("week");
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, dbUser]);

  const loadAnalytics = async () => {
    if (!dbUser) return;

    setIsLoading(true);
    try {
      const response = await analyticsAPI.getUserAnalytics(dbUser.id);
      setAnalytics(response.data);

      // Check if user has any meaningful data
      const hasAnyData =
        response.data.overview.assignedTasks > 0 ||
        response.data.overview.createdTasks > 0 ||
        response.data.tasksByBoard.length > 0 ||
        response.data.recentActivities.length > 0;

      setHasData(hasAnyData);
    } catch (error: any) {
      console.error("Error loading analytics:", error);
      setHasData(false);
      setAnalytics(null);
      // Don't show error toast for empty data
      if (error.response?.status !== 404) {
        toast.error("Failed to load analytics");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

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
            <button
              type="button"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-l-lg focus:z-10",
                timeRange === "week"
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              onClick={() => handleTimeRangeChange("week")}
            >
              Week
            </button>
            <button
              type="button"
              className={cn(
                "px-4 py-2 text-sm font-medium border-t border-b focus:z-10",
                timeRange === "month"
                  ? "bg-primary-600 text-white hover:bg-primary-700 border-primary-600"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              onClick={() => handleTimeRangeChange("month")}
            >
              Month
            </button>
            <button
              type="button"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-r-lg focus:z-10",
                timeRange === "year"
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              onClick={() => handleTimeRangeChange("year")}
            >
              Year
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={16} />}
            onClick={loadAnalytics}
          >
            Refresh
          </Button>
          <Button variant="outline" size="sm" icon={<Download size={16} />}>
            Export
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Assigned Tasks",
            value: analytics.overview.assignedTasks.toString(),
            icon: <BarChart3 size={20} />,
            change: analytics.overview.assignedTasks > 0 ? "+12%" : "No data",
            changeType: "increase",
            color: "text-primary-600 dark:text-primary-400",
          },
          {
            title: "Completion Rate",
            value: `${Math.round(analytics.overview.assignedCompletionRate)}%`,
            icon: <PieChartIcon size={20} />,
            change:
              analytics.overview.assignedCompletionRate > 0 ? "+5%" : "No data",
            changeType: "increase",
            color: "text-secondary-600 dark:text-secondary-400",
          },
          {
            title: "Created Tasks",
            value: analytics.overview.createdTasks.toString(),
            icon: <TrendingUp size={20} />,
            change: analytics.overview.createdTasks > 0 ? "+8" : "No data",
            changeType: "increase",
            color: "text-accent-600 dark:text-accent-400",
          },
          {
            title: "Boards Active",
            value: analytics.tasksByBoard.length.toString(),
            icon: <Users size={20} />,
            change: analytics.tasksByBoard.length > 0 ? "+2" : "No data",
            changeType: "increase",
            color: "text-success-600 dark:text-success-400",
          },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mr-4",
                    index === 0
                      ? "bg-primary-100 dark:bg-primary-900/30"
                      : index === 1
                      ? "bg-secondary-100 dark:bg-secondary-900/30"
                      : index === 2
                      ? "bg-accent-100 dark:bg-accent-900/30"
                      : "bg-success-100 dark:bg-success-900/30"
                  )}
                >
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
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
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Productivity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Productivity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.productivityTrend &&
            analytics.productivityTrend.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.productivityTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      strokeOpacity={0.1}
                    />
                    <XAxis dataKey="date" tick={{ fill: "#6B7280" }} />
                    <YAxis tick={{ fill: "#6B7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        borderColor: "#374151",
                        color: "#E5E7EB",
                      }}
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
                    Complete some tasks to see your productivity trend
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks by Board */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Board</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.tasksByBoard && analytics.tasksByBoard.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.tasksByBoard}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      strokeOpacity={0.1}
                    />
                    <XAxis dataKey="boardTitle" tick={{ fill: "#6B7280" }} />
                    <YAxis tick={{ fill: "#6B7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        borderColor: "#374151",
                        color: "#E5E7EB",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="assigned"
                      name="Assigned"
                      fill="#94a3b8"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="completed"
                      name="Completed"
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
                    No board data yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    Create boards and add tasks to see distribution
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentActivities &&
          analytics.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {analytics.recentActivities.slice(0, 10).map((activity: any) => (
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
                        .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.board?.title} •{" "}
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
                Start working on tasks to see your activity here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
