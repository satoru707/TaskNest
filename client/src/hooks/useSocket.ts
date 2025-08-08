import { useEffect } from "react";
import { socketManager } from "../lib/socket";
import { useBoardStore } from "../stores/useBoardStore";

export const useSocket = (boardId?: string) => {
  const {
    addTask,
    updateTask,
    removeTask,
    addList,
    updateList,
    removeList,
    updateBoard,
    setCurrentBoard,
  } = useBoardStore();

  useEffect(() => {
    // Connect to socket
    socketManager.connect();

    // Set up event listeners
    socketManager.onTaskCreated((data) => {
      console.log("Task created:", data);
      addTask(data.task);
    });

    socketManager.onTaskUpdated((data) => {
      console.log("Task updated:", data);
      updateTask(data.task.id, data.task);
    });

    socketManager.onTaskDeleted((data) => {
      console.log("Task deleted:", data);
      removeTask(data.taskId);
    });

    socketManager.onListCreated((data) => {
      console.log("List created:", data);
      addList(data.list);
    });

    socketManager.onListUpdated((data) => {
      console.log("List updated:", data);
      updateList(data.list.id, data.list);
    });

    socketManager.onListDeleted((data) => {
      console.log("List deleted:", data);
      removeList(data.listId);
    });

    socketManager.onListArchived((data) => {
      console.log("List archived:", data);
      updateList(data.list.id, data.list);
    });

    socketManager.onBoardUpdated((data) => {
      console.log("Board updated:", data);
      updateBoard(data.board.id, data.board);
    });

    socketManager.onBoardDeleted((data) => {
      console.log("Board deleted:", data);
      if (data.boardId === boardId) {
        setCurrentBoard(null);
      }
    });

    // Join board if boardId is provided
    if (boardId) {
      console.log("Joining board:", boardId);
      socketManager.joinBoard(boardId);
    }

    return () => {
      if (boardId) {
        console.log("Leaving board:", boardId);
        socketManager.leaveBoard(boardId);
      }
      socketManager.removeAllListeners();
    };
  }, [
    boardId,
    addTask,
    updateTask,
    removeTask,
    addList,
    updateList,
    removeList,
    updateBoard,
    setCurrentBoard,
  ]);

  return {
    emitTaskUpdate: socketManager.emitTaskUpdate.bind(socketManager),
    emitBoardUpdate: socketManager.emitBoardUpdate.bind(socketManager),
  };
};
