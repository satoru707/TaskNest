import { io, Socket } from "socket.io-client";

class SocketManager {
  private socket: Socket | null = null;
  private currentBoardId: string | null = null;

  connect() {
    if (this.socket?.connected) return this.socket;

    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentBoardId = null;
    }
  }

  joinBoard(boardId: string) {
    if (!this.socket) this.connect();

    if (this.currentBoardId && this.currentBoardId !== boardId) {
      this.leaveBoard(this.currentBoardId);
    }

    this.currentBoardId = boardId;
    this.socket?.emit("join-board", boardId);
  }

  leaveBoard(boardId: string) {
    this.socket?.emit("leave-board", boardId);
    if (this.currentBoardId === boardId) {
      this.currentBoardId = null;
    }
  }

  // Real-time event emitters
  emitTaskUpdate(data: any) {
    this.socket?.emit("task-updated", data);
  }

  emitBoardUpdate(data: any) {
    this.socket?.emit("board-updated", data);
  }

  // Real-time event listeners
  onTaskUpdated(callback: (data: any) => void) {
    this.socket?.on("task-updated", callback);
  }

  onBoardUpdated(callback: (data: any) => void) {
    this.socket?.on("board-updated", callback);
  }

  onTaskCreated(callback: (data: any) => void) {
    this.socket?.on("task-created", callback);
  }

  onTaskDeleted(callback: (data: any) => void) {
    this.socket?.on("task-deleted", callback);
  }

  onListCreated(callback: (data: any) => void) {
    this.socket?.on("list-created", callback);
  }

  onListUpdated(callback: (data: any) => void) {
    this.socket?.on("list-updated", callback);
  }

  onListDeleted(callback: (data: any) => void) {
    this.socket?.on("list-deleted", callback);
  }

  onCommentAdded(callback: (data: any) => void) {
    this.socket?.on("comment-added", callback);
  }

  onAttachmentAdded(callback: (data: any) => void) {
    this.socket?.on("attachment-added", callback);
  }

  onAttachmentDeleted(callback: (data: any) => void) {
    this.socket?.on("attachment-deleted", callback);
  }

  onMemberAdded(callback: (data: any) => void) {
    this.socket?.on("member-added", callback);
  }

  onChecklistItemAdded(callback: (data: any) => void) {
    this.socket?.on("checklist-item-added", callback);
  }

  onChecklistItemUpdated(callback: (data: any) => void) {
    this.socket?.on("checklist-item-updated", callback);
  }

  onChecklistItemDeleted(callback: (data: any) => void) {
    this.socket?.on("checklist-item-deleted", callback);
  }

  // Remove event listeners
  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export const socketManager = new SocketManager();
