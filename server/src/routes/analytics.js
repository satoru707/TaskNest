const analyticsRoutes = async (fastify) => {
  const prisma = fastify.prisma;

  // Get board analytics
  fastify.get("/boards/:boardId", async (request, reply) => {
    try {
      const { boardId } = request.params;
      // Get basic task statistics
      const taskStats = await prisma.task.groupBy({
        by: ["completed", "priority"],
        where: {
          list: {
            boardId,
          },
        },
        _count: {
          id: true,
        },
      });

      // Get task completion over time (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const completionTrend = await prisma.task.findMany({
        where: {
          list: {
            boardId,
          },
          completed: true,
          updatedAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "asc",
        },
      });

      // Get member activity
      const memberActivity = await prisma.user.findMany({
        where: {
          OR: [
            {
              ownedBoards: {
                some: {
                  id: boardId,
                },
              },
            },
            {
              boardMembers: {
                some: {
                  boardId,
                },
              },
            },
          ],
        },
        include: {
          assignedTasks: {
            where: {
              task: {
                list: {
                  boardId,
                },
              },
            },
            include: {
              task: true,
            },
          },
          createdTasks: {
            where: {
              list: {
                boardId,
              },
            },
          },
          activities: {
            where: {
              boardId,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          },
        },
      });

      // Get list statistics
      const listStats = await prisma.list.findMany({
        where: {
          boardId,
        },
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
          tasks: {
            where: {
              completed: true,
            },
            select: {
              id: true,
            },
          },
        },
      });

      // Process data for response
      const totalTasks = taskStats.reduce(
        (sum, stat) => sum + stat._count.id,
        0
      );
      const completedTasks = taskStats
        .filter((stat) => stat.completed)
        .reduce((sum, stat) => sum + stat._count.id, 0);

      const priorityBreakdown = {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        URGENT: 0,
      };

      taskStats.forEach((stat) => {
        priorityBreakdown[stat.priority] += stat._count.id;
      });

      // Group completion trend by day
      const completionByDay = completionTrend.reduce((acc, task) => {
        const date = task.updatedAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return {
        overview: {
          totalTasks,
          completedTasks,
          completionRate:
            totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
          priorityBreakdown,
        },
        completionTrend: Object.entries(completionByDay).map(
          ([date, count]) => ({
            date,
            completed: count,
          })
        ),
        memberActivity: memberActivity.map((member) => ({
          user: {
            id: member.id,
            name: member.name,
            avatar: member.avatar,
          },
          assignedTasks: member.assignedTasks.length,
          completedTasks: member.assignedTasks.filter((at) => at.task.completed)
            .length,
          createdTasks: member.createdTasks.length,
          recentActivities: member.activities,
        })),
        listStats: listStats.map((list) => ({
          id: list.id,
          title: list.title,
          totalTasks: list._count.tasks,
          completedTasks: list.tasks.length,
          completionRate:
            list._count.tasks > 0
              ? (list.tasks.length / list._count.tasks) * 100
              : 0,
        })),
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to fetch board analytics" });
    }
  });

  // Get user analytics
  fastify.get("/users/:userId", async (request, reply) => {
    try {
      const { userId } = request.params;

      // Get user's task statistics
      const userTasks = await prisma.taskAssignee.findMany({
        where: {
          userId,
        },
        include: {
          task: {
            include: {
              list: {
                include: {
                  board: true,
                },
              },
            },
          },
        },
      });

      // Get user's created tasks
      const createdTasks = await prisma.task.findMany({
        where: {
          createdById: userId,
        },
        include: {
          list: {
            include: {
              board: true,
            },
          },
        },
      });

      // Get user's recent activities
      const recentActivities = await prisma.activity.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        include: {
          board: true,
          task: true,
        },
      });

      // Process statistics
      const assignedTasksCount = userTasks.length;
      const completedAssignedTasks = userTasks.filter(
        (ut) => ut.task.completed
      ).length;
      const createdTasksCount = createdTasks.length;
      const completedCreatedTasks = createdTasks.filter(
        (t) => t.completed
      ).length;

      // Group tasks by board
      const tasksByBoard = userTasks.reduce((acc, ut) => {
        const boardId = ut.task.list.board.id;
        const boardTitle = ut.task.list.board.title;

        if (!acc[boardId]) {
          acc[boardId] = {
            boardId,
            boardTitle,
            assigned: 0,
            completed: 0,
          };
        }

        acc[boardId].assigned++;
        if (ut.task.completed) {
          acc[boardId].completed++;
        }

        return acc;
      }, {});

      // Get productivity trend (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const productivityTrend = await prisma.task.findMany({
        where: {
          OR: [
            {
              assignees: {
                some: {
                  userId,
                },
              },
            },
            {
              createdById: userId,
            },
          ],
          completed: true,
          updatedAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "asc",
        },
      });

      // Group by day
      const productivityByDay = productivityTrend.reduce((acc, task) => {
        const date = task.updatedAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return {
        overview: {
          assignedTasks: assignedTasksCount,
          completedAssignedTasks,
          assignedCompletionRate:
            assignedTasksCount > 0
              ? (completedAssignedTasks / assignedTasksCount) * 100
              : 0,
          createdTasks: createdTasksCount,
          completedCreatedTasks,
          createdCompletionRate:
            createdTasksCount > 0
              ? (completedCreatedTasks / createdTasksCount) * 100
              : 0,
        },
        tasksByBoard: Object.values(tasksByBoard),
        productivityTrend: Object.entries(productivityByDay).map(
          ([date, count]) => ({
            date,
            completed: count,
          })
        ),
        recentActivities: recentActivities.map((activity) => ({
          id: activity.id,
          type: activity.type,
          data: activity.data,
          createdAt: activity.createdAt,
          board: activity.board
            ? {
                id: activity.board.id,
                title: activity.board.title,
              }
            : null,
          task: activity.task
            ? {
                id: activity.task.id,
                title: activity.task.title,
              }
            : null,
        })),
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to fetch user analytics" });
    }
  });

  // Get global analytics (for admin users)
  fastify.get("/global", async (request, reply) => {
    try {
      // Get total counts
      const [totalUsers, totalBoards, totalTasks, totalComments] =
        await Promise.all([
          prisma.user.count(),
          prisma.board.count(),
          prisma.task.count(),
          prisma.comment.count(),
        ]);

      // Get completion statistics
      const completedTasks = await prisma.task.count({
        where: { completed: true },
      });

      // Get recent activity
      const recentActivity = await prisma.activity.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
        include: {
          user: true,
          board: true,
          task: true,
        },
      });

      // Get user growth (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      const newBoards = await prisma.board.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      return {
        overview: {
          totalUsers,
          totalBoards,
          totalTasks,
          totalComments,
          completedTasks,
          completionRate:
            totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
          newUsersThisMonth: newUsers,
          newBoardsThisMonth: newBoards,
        },
        recentActivity: recentActivity.map((activity) => ({
          id: activity.id,
          type: activity.type,
          data: activity.data,
          createdAt: activity.createdAt,
          user: {
            id: activity.user.id,
            name: activity.user.name,
            avatar: activity.user.avatar,
          },
          board: activity.board
            ? {
                id: activity.board.id,
                title: activity.board.title,
              }
            : null,
          task: activity.task
            ? {
                id: activity.task.id,
                title: activity.task.title,
              }
            : null,
        })),
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to fetch global analytics" });
    }
  });
};

export default analyticsRoutes;
