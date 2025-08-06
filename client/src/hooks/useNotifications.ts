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
    member_removed: {
      title: "Member Removed",
      message: `You have been removed from "${data.boardTitle}"`,
    },
    member_updated: {
      title: "Role Updated",
      message: `Your role in "${data.boardTitle}" has been updated to ${data.newRole}`,
    },
    board_updated: {
      title: "Board Updated",
      message: `"${data.boardTitle}" has been updated`,
    },
    list_created: {
      title: "List Created",
      message: `New list "${data.listTitle}" created in "${data.boardTitle}"`,
    },
    list_updated: {
      title: "List Updated",
      message: `List "${data.listTitle}" was updated in "${data.boardTitle}"`,
    },
    list_deleted: {
      title: "List Deleted",
      message: `List "${data.listTitle}" was deleted from "${data.boardTitle}"`,
    },
    task_due: {
      title: "Task Due Soon",
      message: `"${data.taskTitle}" is due ${data.dueDate}`,
    },
    mention: {
      title: "You were mentioned",
      message: `${data.mentionedBy} mentioned you in "${data.taskTitle}"`,
    },
    task_archived: {
      title: "Task Archived",
      message: `"${data.taskTitle}" was archived by ${data.archivedBy}`,
    },
    list_archived: {
      title: "List Archived",
      message: `List "${data.listTitle}" was archived by ${data.archivedBy}`,
    },
    board_archived: {
      title: "Board Archived",
      message: `Board "${data.boardTitle}" was archived by ${data.archivedBy}`,
    },
    task_restored: {
      title: "Task Restored",
      message: `"${data.taskTitle}" was restored from archive`,
    },
    invitation_sent: {
      title: "Invitation Sent",
      message: `Invitation sent to ${data.email} for "${data.boardTitle}"`,
    },
    message_received: {
      title: "New Message",
      message: `${data.senderName} sent you a message: "${
        data.subject || "No subject"
      }"`,
    },
    board_bookmarked: {
      title: "Board Bookmarked",
      message: `"${data.boardTitle}" was added to your bookmarks`,
    },
    task_bookmarked: {
      title: "Task Bookmarked",
      message: `"${data.taskTitle}" was added to your bookmarks`,
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

  // Generate notifications for various actions
  const generateTaskNotification = (
    action: string,
    taskData: any,
    targetUserId?: string
  ) => {
    if (!dbUser || !targetUserId || targetUserId === dbUser.id) return;

    generateNotification(
      action,
      {
        ...taskData,
        userId: targetUserId,
      },
      dbUser
    );
  };

  const generateBoardNotification = (
    action: string,
    boardData: any,
    targetUserIds: string[] = []
  ) => {
    if (!dbUser) return;

    targetUserIds.forEach((userId) => {
      if (userId !== dbUser.id) {
        generateNotification(
          action,
          {
            ...boardData,
            userId,
          },
          dbUser
        );
      }
    });
  };

  const generateMemberNotification = (action: string, memberData: any) => {
    if (!dbUser) return;

    generateNotification(action, memberData, dbUser);
  };

  return {
    notifications: userNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    generateTaskNotification,
    generateBoardNotification,
    generateMemberNotification,
  };
};
