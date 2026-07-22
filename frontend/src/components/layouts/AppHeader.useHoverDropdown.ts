import { useEffect, useRef, useState } from "react";

export function useHoverDropdown() {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  function clearCloseTimer() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }

  useEffect(() => clearCloseTimer, []);

  function openFromHover() {
    clearCloseTimer();
    setIsOpen(true);
  }

  function closeFromHover() {
    if (isPinned) return;
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setIsOpen(false), 120);
  }

  function onOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen);
    if (!nextOpen) setIsPinned(false);
  }

  function togglePinned() {
    clearCloseTimer();
    setIsPinned((current) => {
      const next = !current;
      setIsOpen((isOpen) => next || !isOpen);
      return next;
    });
  }

  function releaseMenu() {
    clearCloseTimer();
    setIsPinned(false);
    setIsOpen(false);
  }

  return {
    closeFromHover,
    isOpen,
    onOpenChange,
    openFromHover,
    releaseMenu,
    togglePinned,
  };
}
