import { create } from "zustand";

interface RenameModalState {
  isOpen: boolean;
  id: string | null;
  title: string | null;
  onOpen: (id: string, title: string) => void;
  onClose: () => void;
}

export const useRenameModal = create<RenameModalState>((set) => ({
  isOpen: false,
  id: null,
  title: null,
  onOpen: (id, title) => set({ isOpen: true, id, title }),
  onClose: () => set({ isOpen: false, id: null, title: null }),
}));
