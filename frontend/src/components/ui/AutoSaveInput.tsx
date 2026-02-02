"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface AutoSaveInputProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  debounceMs?: number;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
  saveOnlyOnBlur?: boolean;
}

export function AutoSaveInput({
  initialValue,
  onSave,
  debounceMs = 500,
  className = "",
  placeholder,
  autoFocus,
  onBlur: onBlurProp,
  saveOnlyOnBlur = false,
}: AutoSaveInputProps) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef(initialValue);

  // Update value if initialValue changes from parent
  useEffect(() => {
    setValue(initialValue);
    lastSavedRef.current = initialValue;
  }, [initialValue]);

  const saveValue = useCallback(
    async (newValue: string) => {
      if (newValue === lastSavedRef.current) return;

      setSaving(true);
      try {
        await onSave(newValue);
        lastSavedRef.current = newValue;
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    },
    [onSave]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Skip debounced save if saveOnlyOnBlur is true
    if (saveOnlyOnBlur) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      saveValue(newValue);
    }, debounceMs);
  };

  // Save on blur immediately
  const handleBlur = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Only save if value is not empty (avoid validation errors)
    if (value.trim()) {
      await saveValue(value);
    }
    onBlurProp?.();
  };

  // Handle Enter key to save and blur
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValue(lastSavedRef.current);
      (e.target as HTMLInputElement).blur();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={`bg-transparent border-0 outline-none focus:bg-bg-300 rounded px-1 -mx-1 transition-colors ${
        saving ? "opacity-50" : ""
      } ${className}`}
    />
  );
}
