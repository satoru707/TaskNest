import axios from "axios";

const API_BASE_URL =
  import.meta.env.SOCKET_CORS_ORIGIN || "http://localhost:3000/api";
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API
export const authAPI = {
  createOrUpdateProfile: (profileData: any) =>
    api.post("/auth/profile", profileData),

  loginUser: (user: any) => api.post("/auth/login", user),

  registerUser: (user: any) => api.post("/auth/register", user),

  getProfile: (auth0Id: string) => api.get(`/auth/profile/${auth0Id}`),
  updateProfile: (auth0Id: string, data: any) =>
    api.put(`/auth/profile/${auth0Id}`, data),

  searchUsers: (query: string) =>
    api.get(`/auth/search?q=${encodeURIComponent(query)}`),

  getAllUsers: () => api.get("/auth/users"),

  registerWithDetails: (email: string, password: string, name?: string) =>
    api.post("/auth/registerwithdetails", { email, password, name }),
};

// Boards API
export const boardsAPI = {
  getBoards: (userId: string) => api.get("/boards", { params: { userId } }),

  getBoard: (boardId: string) => api.get(`/boards/${boardId}`),

  createBoard: (boardData: any) => api.post("/boards", boardData),

  archiveBoard: (
    boardId: string,
    data: { isArchived: boolean; userId: string }
  ) => api.put(`/boards/${boardId}/archive`, data),

  bookMarkBoard: (
    boardId: string,
    data: { isBookMarked: boolean; userId: string }
  ) => api.put(`/boards/${boardId}/bookmark`, data),

  updateBoard: (boardId: string, data: any) =>
    api.put(`/boards/${boardId}`, data),

  deleteBoard: (boardId: string) => api.delete(`/boards/${boardId}`),

  addMember: (boardId: string, memberData: any) =>
    api.post(`/boards/${boardId}/members`, memberData),

  removeMember: (boardId: string, memberId: string) =>
    api.delete(`/boards/${boardId}/members/${memberId}`),

  updateMemberRole: (boardId: string, memberId: string, role: string) =>
    api.put(`/boards/${boardId}/members/${memberId}`, { role }),

  createList: (boardId: string, listData: any) =>
    api.post(`/boards/${boardId}/lists`, listData),

  getList: (listId: string) => api.get(`/boards/${listId}/list`),

  updateList: (boardId: string, listId: string, data: any) =>
    api.put(`/boards/${boardId}/lists/${listId}`, data),

  deleteList: (boardId: string, listId: string) =>
    api.delete(`/boards/${boardId}/lists/${listId}`),

  archiveList: (
    boardId: string,
    listId: string,
    data: {
      isArchived: boolean;
      userId: string;
    }
  ) => api.put(`/boards/${boardId}/lists/${listId}/archive`, data),

  // bookMarkList: (
  //   boardId: string,
  //   listId: string,
  //   data: {
  //     isBookMarked: boolean;
  //     userId: any;
  //   }
  // ) => api.put(`/boards/${boardId}/lists/${listId}/bookmark`, data),

  createLabel: (boardId: string, labelData: any) =>
    api.post(`/boards/${boardId}/labels`, labelData),

  updateLabel: (boardId: string, labelId: string, data: any) =>
    api.put(`/boards/${boardId}/labels/${labelId}`, data),

  deleteLabel: (boardId: string, labelId: string) =>
    api.delete(`/boards/${boardId}/labels/${labelId}`),
};

// Tasks API
export const tasksAPI = {
  createTask: (taskData: any) => api.post("/tasks", taskData),

  updateTask: (taskId: string, data: any) => api.put(`/tasks/${taskId}`, data),

  deleteTask: (taskId: string) => api.delete(`/tasks/${taskId}`),

  archiveTask: (
    taskId: string,
    data: { isArchived: boolean; userId: string }
  ) => api.put(`/tasks/${taskId}/archive`, data),

  bookMarkTask: (
    taskId: string,
    data: { isBookMarked: boolean; userId: string }
  ) => api.put(`/tasks/${taskId}/bookmark`, data),

  addComment: (taskId: string, commentData: any) =>
    api.post(`/tasks/${taskId}/comments`, commentData),

  addChecklistItem: (taskId: string, itemData: any) =>
    api.post(`/tasks/${taskId}/checklist`, itemData),

  updateChecklistItem: (taskId: string, itemId: string, data: any) =>
    api.put(`/tasks/${taskId}/checklist/${itemId}`, data),

  deleteChecklistItem: (taskId: string, itemId: string) =>
    api.delete(`/tasks/${taskId}/checklist/${itemId}`),

  moveTask: (taskId: string, data: any) =>
    api.put(`/tasks/${taskId}/move`, data),

  duplicateTask: (taskId: string) => api.post(`/tasks/${taskId}/duplicate`),
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

  generateSubtasks: (data: { taskTitle: string; taskDescription?: string }) =>
    api.post("/ai/generate-subtasks", data),

  estimateTime: (data: { taskTitle: string; taskDescription?: string }) =>
    api.post("/ai/estimate-time", data),
};

// Analytics API
export const analyticsAPI = {
  getBoardAnalytics: (boardId: string) =>
    api.get(`/analytics/boards/${boardId}`),

  getUserAnalytics: (
    userId: string,
    data: {
      timeRange: string;
      priorityFilter: string | null;
      statusFilter: string | null;
    }
  ) => api.post(`/analytics/users/${userId} `, data),

  getGlobalAnalytics: () => api.get("/analytics/global"),

  getTeamAnalytics: (boardId: string) => api.get(`/analytics/teams/${boardId}`),

  exportAnalytics: (type: string, params: any) =>
    api.get(`/analytics/export/${type}`, { params }),
};
