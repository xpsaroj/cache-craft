"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  isConfirming = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const handleCancel = (event: Event) => {
      event.preventDefault();

      if (!isConfirming) {
        onClose();
      }
    };

    dialog.addEventListener("cancel", handleCancel);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [isConfirming, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-description" : undefined}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isConfirming) {
          onClose();
        }
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-surface p-0 text-ink shadow-xl"
    >
      <div className="p-5 sm:p-6">
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-ink"
        >
          {title}
        </h2>
        {description ? (
          <div
            id="confirm-dialog-description"
            className="mt-2 text-sm leading-6 text-ink-muted"
          >
            {description}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface-subtle p-4 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isConfirming}
          autoFocus
        >
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? "destructive" : "primary"}
          onClick={onConfirm}
          isLoading={isConfirming}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
