// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "editor" | "viewer";
}

// Board related types
export interface Board {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  lists: List[];
  members: BoardMember[];
}

export interface BoardMember {
  userId: string;
  user: User;
  role: "admin" | "editor" | "viewer";
}

// List related types
export interface List {
  id: string;
  title: string;
  boardId: string;
  position: number;
  tasks: Task[];
}

// Task related types
export interface Task {
  id: string;
  title: string;
  description?: string;
  listId: string;
  position: number;
  dueDate?: string;
  labels: Label[];
  assignees: User[];
  checklistItems: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
  position: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

// Analytics types
export interface TaskAnalytics {
  completed: number;
  pending: number;
  overdue: number;
  total: number;
  completionRate: number;
}

export interface TeamAnalytics {
  userId: string;
  userName: string;
  tasksCompleted: number;
  tasksAssigned: number;
  completionRate: number;
}
