import { create } from 'zustand';

const useNotesStore = create((set) => ({
  notes: [],
  selectedNote: null,
  isLoading: false,
  filter: { category: null, tag: null },

  setNotes: (notes) => set({ notes }),

  addNote: (note) =>
    set((state) => ({
      notes: [note, ...state.notes]
    })),

  updateNote: (noteId, updates) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.noteId === noteId ? { ...note, ...updates } : note
      )
    })),

  removeNote: (noteId) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.noteId !== noteId)
    })),

  selectNote: (note) => set({ selectedNote: note }),

  setLoading: (isLoading) => set({ isLoading }),

  setFilter: (filter) => set({ filter }),

  clearNotes: () => set({ notes: [], selectedNote: null })
}));

export default useNotesStore;
