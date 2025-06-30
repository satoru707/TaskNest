// import { FastifyPluginAsync } from "fastify";
// import { GoogleGenerativeAI } from "@google/generative-ai";

const aiRoutes = async (fastify) => {
  const genAI = fastify.genAI;

  // Generate tasks from project description
  fastify.post("/generate-tasks", async (request, reply) => {
    try {
      const { description, context } = request.body;

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        You are a project management AI assistant. Based on the following project description, generate a list of actionable tasks that would help complete this project.

        Project Description: ${description}
        ${context ? `Additional Context: ${context}` : ""}

        Please provide a JSON response with the following structure:
        {
          "tasks": [
            {
              "title": "Task title",
              "description": "Detailed description of what needs to be done",
              "priority": "HIGH|MEDIUM|LOW",
              "estimatedHours": number,
              "category": "category name"
            }
          ],
          "summary": "Brief summary of the project and approach"
        }

        Generate 5-10 tasks that are specific, actionable, and well-organized. Focus on breaking down the project into manageable chunks.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        // Try to parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiResponse = JSON.parse(jsonMatch[0]);
          return aiResponse;
        } else {
          // Fallback if JSON parsing fails
          return {
            tasks: [
              {
                title: "Plan project structure",
                description:
                  "Define the overall structure and approach for the project",
                priority: "HIGH",
                estimatedHours: 2,
                category: "Planning",
              },
            ],
            summary:
              "AI-generated task breakdown based on your project description.",
          };
        }
      } catch (parseError) {
        fastify.log.error("Failed to parse AI response:", parseError);
        return {
          tasks: [],
          summary: "Unable to generate tasks at this time. Please try again.",
          error: "Failed to parse AI response",
        };
      }
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to generate tasks" });
    }
  });

  // Generate task summary
  fastify.post("/summarize-tasks", async (request, reply) => {
    try {
      const { tasks, boardTitle } = request.body;
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        You are a project management AI assistant. Please provide a comprehensive summary of the following project board.

        Board Title: ${boardTitle}
        
        Tasks:
        ${tasks
          .map(
            (task, index) => `
        ${index + 1}. ${task.title} (${
              task.completed ? "Completed" : "Pending"
            }) - Priority: ${task.priority}
           Description: ${task.description || "No description"}
        `
          )
          .join("\n")}

        Please provide a JSON response with the following structure:
        {
          "summary": "Overall project summary",
          "progress": {
            "completed": number,
            "total": number,
            "percentage": number
          },
          "insights": [
            "Key insight 1",
            "Key insight 2"
          ],
          "recommendations": [
            "Recommendation 1",
            "Recommendation 2"
          ]
        }

        Focus on providing actionable insights and recommendations for improving project progress.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiResponse = JSON.parse(jsonMatch[0]);
          return aiResponse;
        } else {
          const completed = tasks.filter((t) => t.completed).length;
          const total = tasks.length;
          return {
            summary: `Project "${boardTitle}" contains ${total} tasks with ${completed} completed.`,
            progress: {
              completed,
              total,
              percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            },
            insights: ["Project analysis completed"],
            recommendations: ["Continue working on pending tasks"],
          };
        }
      } catch (parseError) {
        fastify.log.error("Failed to parse AI response:", parseError);
        const completed = tasks.filter((t) => t.completed).length;
        const total = tasks.length;
        return {
          summary: `Project "${boardTitle}" contains ${total} tasks with ${completed} completed.`,
          progress: {
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
          },
          insights: ["Unable to generate detailed insights at this time"],
          recommendations: ["Please try again later"],
        };
      }
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to generate summary" });
    }
  });

  // Generate smart suggestions for task improvement
  fastify.post("/suggest-improvements", async (request, reply) => {
    try {
      const { taskTitle, taskDescription, boardContext } = request.body;

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        You are a project management AI assistant. Please provide suggestions to improve the following task.

        Task Title: ${taskTitle}
        Task Description: ${taskDescription || "No description provided"}
        Board Context: ${boardContext || "No additional context"}

        Please provide a JSON response with the following structure:
        {
          "improvedTitle": "Suggested improved title",
          "improvedDescription": "Suggested improved description",
          "suggestions": [
            "Specific suggestion 1",
            "Specific suggestion 2"
          ],
          "estimatedTime": "Estimated time to complete",
          "dependencies": ["Potential dependency 1", "Potential dependency 2"]
        }

        Focus on making the task more specific, actionable, and clear.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiResponse = JSON.parse(jsonMatch[0]);
          return aiResponse;
        } else {
          return {
            improvedTitle: taskTitle,
            improvedDescription:
              taskDescription || "Consider adding more details to this task",
            suggestions: [
              "Add more specific details",
              "Define clear acceptance criteria",
            ],
            estimatedTime: "2-4 hours",
            dependencies: [],
          };
        }
      } catch (parseError) {
        fastify.log.error("Failed to parse AI response:", parseError);
        return {
          improvedTitle: taskTitle,
          improvedDescription:
            taskDescription || "Consider adding more details to this task",
          suggestions: ["Unable to generate suggestions at this time"],
          estimatedTime: "Unknown",
          dependencies: [],
        };
      }
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to generate suggestions" });
    }
  });
};

export default aiRoutes;
