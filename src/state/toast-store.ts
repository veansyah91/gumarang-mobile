import { create } from 'zustand';

export type ToastType = 'danger' | 'success' | 'info';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastStore = {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  hideToast: (id: string) => void;
};

let toastId = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (message, type = 'danger') => {
    const id = String(++toastId);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
