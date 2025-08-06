import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import Button from "../ui/Button";
import { aiAPI } from "../../lib/api";

interface AISummaryPanelProps {
  board: any;
  isVisible: boolean;
  onClose: () => void;
  role: string;
}

export default function AISummaryPanel({
  board,
  isVisible,
  onClose,
  role,
}: AISummaryPanelProps) {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible && board) {
      generateSummary();
    }
  }, [isVisible, board]);

  const generateSummary = async () => {
    if (!board) return;

    setIsLoading(true);
    try {
      const tasks = board.lists.flatMap((list: any) =>
        list.tasks.map((task: any) => ({
          title: task.title,
          description: task.description,
          completed: task.completed,
          priority: task.priority,
        }))
      );

      const response = await aiAPI.summarizeTasks({
        tasks,
        boardTitle: board.title,
      });

      setSummary(response.data);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-40 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-purple-600" size={24} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Insights
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-purple-600" size={32} />
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp size={18} />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Completion Rate
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {summary.progress.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${summary.progress.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{summary.progress.completed} completed</span>
                    <span>{summary.progress.total} total</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {summary.summary}
                </p>
              </CardContent>
            </Card>

            {/* Insights */}
            {summary.insights && summary.insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle size={18} />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {summary.insights.map((insight: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2
                          size={16}
                          className="text-blue-500 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-gray-600 dark:text-gray-300">
                          {insight}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {summary.recommendations && summary.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Brain size={18} />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {summary.recommendations.map(
                      (recommendation: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {recommendation}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {role == "ADMIN" && (
              <Button
                onClick={generateSummary}
                variant="outline"
                size="sm"
                className="w-full"
                icon={<Brain size={16} />}
              >
                Refresh Insights
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Brain className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">
              No insights available
            </p>
            <Button
              onClick={generateSummary}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Generate Insights
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
