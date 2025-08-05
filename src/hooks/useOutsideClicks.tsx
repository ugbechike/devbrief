"use client";

import { useEffect, useRef } from "react";

interface UseOutsideClicksOptions {
  onOutsideClick?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useOutsideClicks({
  onOutsideClick,
  onEscape,
  enabled = true,
}: UseOutsideClicksOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick?.();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onOutsideClick, onEscape, enabled]);

  return ref;
}
