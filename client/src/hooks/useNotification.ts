import { useEffect } from "react";
import { useNotificationStore } from "../stores/useNotificationStore";
import { useCurrentUser } from "../lib/auth";
import { toast } from "sonner";

// Notification generator utility
export const generateNotification = (
  type: string,
  data: any,
  currentUser: any
) => {
  const { addNotification } = useNotificationStore.getState();

  const notificationTemplates = {
    task_assigned: {
      title: "Task Assigned",
      message: `You've been assigned to "${data.taskTitle}"`,
    },
    task_completed: {
      title: "Task Completed",
      message: `${data.completedBy} completed "${data.taskTitle}"`,
    },
    task_comment: {
      title: "New Comment",
      message: `${data.commenterName} commented on "${data.taskTitle}"`,
    },
    board_invite: {
      title: "Board Invitation",
      message: `You've been invited to join "${data.boardTitle}"`,
    },
    task_moved: {
      title: "Task Moved",
      message: `"${data.taskTitle}" was moved from ${data.fromList} to ${data.toList}`,
    },
    member_added: {
      title: "New Member",
      message: `${data.memberName} joined "${data.boardTitle}"`,
    },
    board_updated: {
      title: "Board Updated",
      message: `"${data.boardTitle}" has been updated`,
    },
    list_created: {
      title: "List Created",
      message: `New list "${data.listTitle}" created in "${data.boardTitle}"`,
    },
    task_due: {
      title: "Task Due Soon",
      message: `"${data.taskTitle}" is due ${data.dueDate}`,
    },
    mention: {
      title: "You were mentioned",
      message: `${data.mentionedBy} mentioned you in "${data.taskTitle}"`,
    },
  };

  const template =
    notificationTemplates[type as keyof typeof notificationTemplates];

  if (template && data.userId && data.userId !== currentUser?.id) {
    addNotification({
      type: type as any,
      title: template.title,
      message: template.message,
      userId: data.userId,
      boardId: data.boardId,
      taskId: data.taskId,
      listId: data.listId,
      triggeredBy: currentUser?.id || "system",
      triggeredByName: currentUser?.name || "System",
      data,
      read: false,
    });
  }
};

// Hook for managing notifications
export const useNotifications = () => {
  const { dbUser } = useCurrentUser();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    getNotificationsForUser,
  } = useNotificationStore();

  const userNotifications = dbUser ? getNotificationsForUser(dbUser.id) : [];
  const unreadCount = getUnreadCount();

  // Auto-show toast for new notifications
  useEffect(() => {
    if (dbUser && userNotifications.length > 0) {
      const latestNotification = userNotifications[0];
      const isRecent =
        new Date(latestNotification.createdAt).getTime() > Date.now() - 5000; // 5 seconds

      if (!latestNotification.read && isRecent) {
        toast.info(latestNotification.message, {
          description: latestNotification.title,
          action: {
            label: "View",
            onClick: () => markAsRead(latestNotification.id),
          },
        });
      }
    }
  }, [userNotifications, dbUser, markAsRead]);

  return {
    notifications: userNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
