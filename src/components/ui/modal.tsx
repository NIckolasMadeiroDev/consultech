"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly closeOnOverlayClick?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  closeOnOverlayClick = true,
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
      className="fixed inset-0 z-50 m-0 flex h-full w-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4 backdrop:bg-neutral-900/50 backdrop:dark:bg-neutral-950/60"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-neutral-200 bg-[var(--background)] shadow-lg dark:border-neutral-700">
        {(title || closeOnOverlayClick) && (
          <div className="flex items-center justify-between border-b border-neutral-200 p-lg dark:border-neutral-700">
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
        <div className="p-lg">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-neutral-200 p-lg dark:border-neutral-700">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
