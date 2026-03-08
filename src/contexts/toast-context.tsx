"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastState = {
  toasts: Toast[];
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastState | null>(null);

const TOAST_DURATION_MS = 4000;

function scheduleToastRemoval(
  setToasts: Dispatch<SetStateAction<Toast[]>>,
  id: string
) {
  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, TOAST_DURATION_MS);
}

export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    scheduleToastRemoval(setToasts, id);
  }, []);

  const value = useMemo(() => ({ toasts, toast }), [toasts, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts } = ctx;
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[100] flex max-w-sm flex-col gap-2 sm:left-auto sm:right-4"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { readonly toast: Toast }) {
  const typeStyles = {
    success:
      "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/80 dark:text-green-200",
    error:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/80 dark:text-red-200",
    info:
      "border-neutral-200 bg-[var(--surface)] text-[var(--text-primary)] dark:border-neutral-700",
  };
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-body shadow-lg ${typeStyles[toast.type]}`}
    >
      {toast.message}
    </div>
  );
}

export function useToast(): ToastState["toast"] {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return () => {};
  }
  return ctx.toast;
}
