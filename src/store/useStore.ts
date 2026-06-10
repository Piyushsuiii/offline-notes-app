import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  // --- Existing ---
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  graphView: 'hidden' | 'split' | 'fullscreen';
  setGraphView: (view: 'hidden' | 'split' | 'fullscreen') => void;
  viewMode: 'editor' | 'canvas';
  setViewMode: (mode: 'editor' | 'canvas') => void;
  sidebarTab: 'notes' | 'chat';
  setSidebarTab: (tab: 'notes' | 'chat') => void;

  // --- Command Palette ---
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // --- Focus Mode ---
  focusMode: boolean;
  setFocusMode: (mode: boolean) => void;

  // --- Tags ---
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;

  // --- Toasts ---
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // --- Modals ---
  exportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
  templatesModalOpen: boolean;
  setTemplatesModalOpen: (open: boolean) => void;
  keyboardShortcutsOpen: boolean;
  setKeyboardShortcutsOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // --- Existing ---
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  activeNoteId: null,
  setActiveNoteId: (id) => set({ activeNoteId: id }),
  graphView: 'hidden',
  setGraphView: (view) => set({ graphView: view }),
  viewMode: 'editor',
  setViewMode: (mode) => set({ viewMode: mode }),
  sidebarTab: 'notes',
  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  // --- Command Palette ---
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // --- Focus Mode ---
  focusMode: false,
  setFocusMode: (mode) => set({ focusMode: mode }),

  // --- Tags ---
  activeTagFilter: null,
  setActiveTagFilter: (tag) => set({ activeTagFilter: tag }),

  // --- Toasts ---
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  // --- Modals ---
  exportModalOpen: false,
  setExportModalOpen: (open) => set({ exportModalOpen: open }),
  templatesModalOpen: false,
  setTemplatesModalOpen: (open) => set({ templatesModalOpen: open }),
  keyboardShortcutsOpen: false,
  setKeyboardShortcutsOpen: (open) => set({ keyboardShortcutsOpen: open }),
}));
