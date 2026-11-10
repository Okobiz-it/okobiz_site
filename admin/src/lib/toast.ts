"use client";

type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners: Set<ToastListener> = new Set();

function emit() {
  listeners.forEach((listener) => listener([...toasts]));
}

function addToast(type: ToastType, message: string, duration = 4000): string {
  const id = "toast-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
  toasts.push({ id, type, message });
  emit();

  if (type !== "loading" && duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export const toast = {
  success: (msg: string) => addToast("success", msg),
  error: (msg: string) => addToast("error", msg, 5000),
  warning: (msg: string) => addToast("warning", msg, 5000),
  info: (msg: string) => addToast("info", msg),
  loading: (msg: string) => addToast("loading", msg, 0),
  dismiss: (id?: string) => {
    if (id) {
      removeToast(id);
    } else {
      toasts = [];
      emit();
    }
  },
};

export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}

