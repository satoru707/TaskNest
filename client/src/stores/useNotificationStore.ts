import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Notification {
  id: string;
  type:
    | "task_assigned"
    | "task_completed"
    | "task_comment"
    | "board_invite"
    | "task_moved"
    | "member_added"
    | "board_updated"
    | "list_created"
    | "task_due"
    | "mention";
  title: string;
  message: string;
  userId: string;
  boardId?: string;
  taskId?: string;
  listId?: string;
  triggeredBy: string;
  triggeredByName: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  getUnreadCount: () => number;
  getNotificationsForUser: (userId: string) => Notification[];
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `notif_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ].slice(0, 100), // Keep only last 100 notifications
        })),

      markAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            read: true,
          })),
        })),

      deleteNotification: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.filter(
            (notif) => notif.id !== notificationId
          ),
        })),

      getUnreadCount: () => {
        const notifications = get().notifications;
        return notifications.filter((notif) => !notif.read).length;
      },

      getNotificationsForUser: (userId) => {
        const notifications = get().notifications;
        return notifications.filter((notif) => notif.userId === userId);
      },
    }),
    {
      name: "tasknest-notifications",
    }
  )
);
