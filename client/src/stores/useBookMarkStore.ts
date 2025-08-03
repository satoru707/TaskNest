import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookmarkItem {
  id: string;
  type: "board" | "list" | "task";
  title: string;
  description?: string;
  boardId?: string;
  boardTitle?: string;
  listTitle?: string;
  bookmarkedAt: string;
}

interface BookmarkState {
  bookmarks: BookmarkItem[];
  addBookmark: (item: BookmarkItem) => void;
  removeBookmark: (type: string, id: string) => void;
  isBookmarked: (type: string, id: string) => boolean;
  getBookmarksByType: (type?: string) => BookmarkItem[];
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (item) =>
        set((state) => ({
          bookmarks: [
            ...state.bookmarks.filter(
              (b) => !(b.type === item.type && b.id === item.id)
            ),
            { ...item, bookmarkedAt: new Date().toISOString() },
          ],
        })),

      removeBookmark: (type, id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter(
            (b) => !(b.type === type && b.id === id)
          ),
        })),

      isBookmarked: (type, id) => {
        const bookmarks = get().bookmarks;
        return bookmarks.some((b) => b.type === type && b.id === id);
      },

      getBookmarksByType: (type) => {
        const bookmarks = get().bookmarks;
        return type ? bookmarks.filter((b) => b.type === type) : bookmarks;
      },
    }),
    {
      name: "tasknest-bookmarks",
    }
  )
);
