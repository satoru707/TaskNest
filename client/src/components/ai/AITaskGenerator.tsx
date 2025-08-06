import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus, X } from "lucide-react";
import Button from "../ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { aiAPI } from "../../lib/api";
import { toast } from "sonner";

//send the neccesaary with the ai generated from user prompt to the backend on a new list i guess
interface AITaskGeneratorProps {
  onTasksGenerated: (tasks: any[], listNumber: string) => void;
  boardContext?: string;
}

export default function AITaskGenerator({
  onTasksGenerated,
  boardContext,
}: AITaskGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [summary, setSummary] = useState("");
  const [listNumber, setListNumber] = useState("");

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error("Please enter a project description");
      return;
    }

    setIsGenerating(true);
    try {
      console.log(description, boardContext);

      const response = await aiAPI.generateTasks({
        description,
        context: boardContext,
      });

      if (response.data.tasks) {
        setGeneratedTasks(response.data.tasks);
        setSummary(response.data.summary);
      } else {
        toast.error("Failed to generate tasks");
      }
    } catch (error) {
      console.error("Error generating tasks:", error);
      toast.error("Failed to generate tasks");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTasks = () => {
    console.log("Generated tasks:", generatedTasks, listNumber);
    //supposed to add task to board and listNumber
    onTasksGenerated(generatedTasks, listNumber);
    setIsOpen(false);
    setDescription("");
    setGeneratedTasks([]);
    setSummary("");
    toast.success(`Added ${generatedTasks.length} AI-generated tasks`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        icon={<Sparkles size={18} />}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        AI Generate Tasks
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-purple-600" size={24} />
              AI Task Generator
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Project Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project goals, requirements, or what you want to accomplish..."
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              isLoading={isGenerating}
              icon={!isGenerating ? <Sparkles size={18} /> : undefined}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? "Generating..." : "Generate Tasks"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>

          {generatedTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {summary && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    AI Summary
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    {summary}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Generated Tasks ({generatedTasks.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generatedTasks.map((task, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          {task.estimatedHours && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ~{task.estimatedHours}h
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {task.description}
                      </p>
                      {task.category && (
                        <span className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                          {task.category}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleAddTasks}
                  icon={<Plus size={18} />}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add All Tasks
                </Button>
                <input
                  type="number"
                  value={listNumber}
                  onChange={(e) => setListNumber(e.target.value)}
                  placeholder="List #"
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedTasks([]);
                    setSummary("");
                  }}
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
