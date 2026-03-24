"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly closeOnOverlayClick?: boolean;
  readonly panelClassName?: string;
  readonly bodyClassName?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  closeOnOverlayClick = true,
  panelClassName,
  bodyClassName,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      document.body.style.overflow = "hidden";
      dialog.showModal();
      const handleCancel = () => onCloseRef.current();
      dialog.addEventListener("cancel", handleCancel);
      return () => {
        document.body.style.overflow = "";
        dialog.close();
        dialog.removeEventListener("cancel", handleCancel);
      };
    }
    document.body.style.overflow = "";
    dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-0 flex h-full w-full max-h-none max-w-none items-end justify-center border-0 bg-transparent p-0 pt-8 sm:items-center sm:p-4 backdrop:bg-[var(--overlay-scrim)]"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className={cn(
          "relative z-10 max-h-[min(92dvh,100%)] w-full overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-[var(--background)] shadow-lg sm:max-h-[85dvh] sm:rounded-xl dark:border-[var(--border)]",
          "pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-0",
          panelClassName ?? "max-w-lg"
        )}
      >
        {(title || closeOnOverlayClick) && (
          <div className="flex items-center justify-between border-b border-[var(--border)] p-md sm:p-lg dark:border-[var(--border)]">
            {title && (
              <h2 id="modal-title" className="text-h4 text-[var(--text-primary)]">
                {title}
              </h2>
            )}
            <div className={title ? "" : "ml-auto"}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <div className={cn("p-md sm:p-lg", bodyClassName)}>{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] p-md sm:p-lg dark:border-[var(--border)]">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
