import { create } from 'zustand';

interface BoardState {
  boards: any[];
  currentBoard: any | null;
  isLoading: boolean;
  setBoards: (boards: any[]) => void;
  setCurrentBoard: (board: any | null) => void;
  setLoading: (loading: boolean) => void;
  addBoard: (board: any) => void;
  updateBoard: (boardId: string, updates: any) => void;
  removeBoard: (boardId: string) => void;
  addTask: (task: any) => void;
  updateTask: (taskId: string, updates: any) => void;
  removeTask: (taskId: string) => void;
  addList: (list: any) => void;
  updateList: (listId: string, updates: any) => void;
  removeList: (listId: string) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  isLoading: false,
  
  setBoards: (boards) => set({ boards }),
  setCurrentBoard: (currentBoard) => set({ currentBoard }),
  setLoading: (isLoading) => set({ isLoading }),
  
  addBoard: (board) => set((state) => ({
    boards: [board, ...state.boards]
  })),
  
  updateBoard: (boardId, updates) => set((state) => ({
    boards: state.boards.map(board => 
      board.id === boardId ? { ...board, ...updates } : board
    ),
    currentBoard: state.currentBoard?.id === boardId 
      ? { ...state.currentBoard, ...updates }
      : state.currentBoard
  })),
  
  removeBoard: (boardId) => set((state) => ({
    boards: state.boards.filter(board => board.id !== boardId),
    currentBoard: state.currentBoard?.id === boardId ? null : state.currentBoard
  })),
  
  addTask: (task) => set((state) => {
    if (!state.currentBoard) return state;
    
    const updatedLists = state.currentBoard.lists.map((list: any) => 
      list.id === task.listId 
        ? { ...list, tasks: [...list.tasks, task] }
        : list
    );
    
    return {
      currentBoard: {
        ...state.currentBoard,
        lists: updatedLists
      }
    };
  }),
  
  updateTask: (taskId, updates) => set((state) => {
    if (!state.currentBoard) return state;
    
    const updatedLists = state.currentBoard.lists.map((list: any) => ({
      ...list,
      tasks: list.tasks.map((task: any) => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
    
    return {
      currentBoard: {
        ...state.currentBoard,
        lists: updatedLists
      }
    };
  }),
  
  removeTask: (taskId) => set((state) => {
    if (!state.currentBoard) return state;
    
    const updatedLists = state.currentBoard.lists.map((list: any) => ({
      ...list,
      tasks: list.tasks.filter((task: any) => task.id !== taskId)
    }));
    
    return {
      currentBoard: {
        ...state.currentBoard,
        lists: updatedLists
      }
    };
  }),
  
  addList: (list) => set((state) => {
    if (!state.currentBoard) return state;
    
    return {
      currentBoard: {
        ...state.currentBoard,
        lists: [...state.currentBoard.lists, { ...list, tasks: [] }]
      }
    };
  }),
  
  updateList: (listId, updates) => set((state) => {
    if (!state.currentBoard) return state;
    
    const updatedLists = state.currentBoard.lists.map((list: any) => 
      list.id === listId ? { ...list, ...updates } : list
    );
    
    return {
      currentBoard: {
        ...state.currentBoard,
        lists: updatedLists
      }
    };
  }),
  
  removeList: (listId) => set((state) => {
    if (!state.currentBoard) return state;
    
    return {
      currentBoard: {
        ...state.currentBoard,
        lists: state.currentBoard.lists.filter((list: any) => list.id !== listId)
      }
    };
  }),
}));