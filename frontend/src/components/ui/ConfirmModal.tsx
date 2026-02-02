"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-fg-400 mb-6">{message}</p>
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          isLoading={isLoading}
          className={variant === "danger" ? "bg-red-600 hover:bg-red-700" : ""}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
