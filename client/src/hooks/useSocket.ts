import { useEffect } from 'react';
import { socketManager } from '../lib/socket';
import { useBoardStore } from '../stores/useBoardStore';

export const useSocket = (boardId?: string) => {
  const { 
    addTask, 
    updateTask, 
    removeTask, 
    addList, 
    updateList, 
    removeList,
    updateBoard 
  } = useBoardStore();

  useEffect(() => {
    // Connect to socket
    socketManager.connect();

    // Set up event listeners
    socketManager.onTaskCreated((data) => {
      addTask(data.task);
    });

    socketManager.onTaskUpdated((data) => {
      updateTask(data.task.id, data.task);
    });

    socketManager.onTaskDeleted((data) => {
      removeTask(data.taskId);
    });

    socketManager.onListCreated((data) => {
      addList(data.list);
    });

    socketManager.onListUpdated((data) => {
      updateList(data.list.id, data.list);
    });

    socketManager.onListDeleted((data) => {
      removeList(data.listId);
    });

    socketManager.onBoardUpdated((data) => {
      updateBoard(data.board.id, data.board);
    });

    // Join board if boardId is provided
    if (boardId) {
      socketManager.joinBoard(boardId);
    }

    return () => {
      if (boardId) {
        socketManager.leaveBoard(boardId);
      }
      socketManager.removeAllListeners();
    };
  }, [boardId, addTask, updateTask, removeTask, addList, updateList, removeList, updateBoard]);

  return {
    emitTaskUpdate: socketManager.emitTaskUpdate.bind(socketManager),
    emitBoardUpdate: socketManager.emitBoardUpdate.bind(socketManager),
  };
};