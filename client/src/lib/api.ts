import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Auth API
export const authAPI = {
  createOrUpdateProfile: (profileData: any) =>
    api.post("/auth/profile", profileData),

  registerUser: (user: any) => api.post("/auth/register", user),

  getProfile: (auth0Id: string) => api.get(`/auth/profile/${auth0Id}`),

  registerWithDetails: (email: string, password: string, name?: string) =>
    api.post("/auth/registerwithdetails", { email, password, name }),

  updateProfile: (auth0Id: string, data: any) =>
    api.put(`/auth/profile/${auth0Id}`, data),
};

// Boards API
export const boardsAPI = {
  getBoards: (userId: string) => api.get("/boards", { params: { userId } }),

  getBoard: (boardId: string) => api.get(`/boards/${boardId}`),

  createBoard: (boardData: any) => api.post("/boards", boardData),

  updateBoard: (boardId: string, data: any) =>
    api.put(`/boards/${boardId}`, data),

  deleteBoard: (boardId: string) => api.delete(`/boards/${boardId}`),

  addMember: (boardId: string, memberData: any) =>
    api.post(`/boards/${boardId}/members`, memberData),

  createList: (boardId: string, listData: any) =>
    api.post(`/boards/${boardId}/lists`, listData),

  updateList: (boardId: string, listId: string, data: any) =>
    api.put(`/boards/${boardId}/lists/${listId}`, data),

  deleteList: (boardId: string, listId: string) =>
    api.delete(`/boards/${boardId}/lists/${listId}`),
};

// Tasks API
export const tasksAPI = {
  createTask: (taskData: any) => api.post("/tasks", taskData),

  updateTask: (taskId: string, data: any) => api.put(`/tasks/${taskId}`, data),

  deleteTask: (taskId: string) => api.delete(`/tasks/${taskId}`),

  addComment: (taskId: string, commentData: any) =>
    api.post(`/tasks/${taskId}/comments`, commentData),

  addChecklistItem: (taskId: string, itemData: any) =>
    api.post(`/tasks/${taskId}/checklist`, itemData),

  updateChecklistItem: (taskId: string, itemId: string, data: any) =>
    api.put(`/tasks/${taskId}/checklist/${itemId}`, data),

  deleteChecklistItem: (taskId: string, itemId: string) =>
    api.delete(`/tasks/${taskId}/checklist/${itemId}`),
};

// AI API
export const aiAPI = {
  generateTasks: (data: { description: string; context?: string }) =>
    api.post("/ai/generate-tasks", data),

  summarizeTasks: (data: { tasks: any[]; boardTitle: string }) =>
    api.post("/ai/summarize-tasks", data),

  suggestImprovements: (data: {
    taskTitle: string;
    taskDescription?: string;
    boardContext?: string;
  }) => api.post("/ai/suggest-improvements", data),
};

// Uploads API
export const uploadsAPI = {
  uploadAttachment: (formData: FormData) =>
    api.post("/uploads/attachments", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteAttachment: (attachmentId: string) =>
    api.delete(`/uploads/attachments/${attachmentId}`),

  uploadAvatar: (formData: FormData) =>
    api.post("/uploads/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Analytics API
export const analyticsAPI = {
  getBoardAnalytics: (boardId: string) =>
    api.get(`/analytics/boards/${boardId}`),

  getUserAnalytics: (userId: string) => api.get(`/analytics/users/${userId}`),

  getGlobalAnalytics: () => api.get("/analytics/global"),
};
