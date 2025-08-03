import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ArchivedItem {
  id: string;
  type: "board" | "list" | "task";
  title: string;
  description?: string;
  boardId?: string;
  boardTitle?: string;
  listId?: string;
  listTitle?: string;
  archivedAt: string;
  archivedBy: string;
  archivedById: string;
  originalData: any; // Store original data for restoration
}

interface ArchiveState {
  archivedItems: ArchivedItem[];
  archiveItem: (item: ArchivedItem) => void;
  restoreItem: (id: string, type: string) => ArchivedItem | null;
  permanentlyDelete: (id: string, type: string) => void;
  getArchivedItems: (type?: string) => ArchivedItem[];
  isArchived: (type: string, id: string) => boolean;
}

export const useArchiveStore = create<ArchiveState>()(
  persist(
    (set, get) => ({
      archivedItems: [],

      archiveItem: (item) =>
        set((state) => ({
          archivedItems: [
            ...state.archivedItems.filter(
              (a) => !(a.type === item.type && a.id === item.id)
            ),
            { ...item, archivedAt: new Date().toISOString() },
          ],
        })),

      restoreItem: (id, type) => {
        const state = get();
        const item = state.archivedItems.find(
          (a) => a.type === type && a.id === id
        );
        if (item) {
          set((state) => ({
            archivedItems: state.archivedItems.filter(
              (a) => !(a.type === type && a.id === id)
            ),
          }));
          return item;
        }
        return null;
      },

      permanentlyDelete: (id, type) =>
        set((state) => ({
          archivedItems: state.archivedItems.filter(
            (a) => !(a.type === type && a.id === id)
          ),
        })),

      getArchivedItems: (type) => {
        const items = get().archivedItems;
        return type ? items.filter((a) => a.type === type) : items;
      },

      isArchived: (type, id) => {
        const items = get().archivedItems;
        return items.some((a) => a.type === type && a.id === id);
      },
    }),
    {
      name: "tasknest-archive",
    }
  )
);
