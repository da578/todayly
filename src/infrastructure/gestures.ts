/**
 * Framework-agnostic pointer swipe gesture helper.
 * Zero-dependency, GPU-accelerated touch/mouse swipe handling.
 * Supports full horizontal tracking across the screen with spring physics.
 */
export interface SwipeActionOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function createSwipeGesture(
  el: HTMLElement,
  options: SwipeActionOptions
): () => void {
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let isDragging = false;
  let isHorizontalIntent: boolean | null = null;
  const threshold = options.threshold || 90;

  const onPointerDown = (e: PointerEvent) => {
    // Don't intercept button or interactive clicks inside card
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("a") ||
      target.closest("[data-no-swipe]")
    ) {
      return;
    }

    startX = e.clientX;
    startY = e.clientY;
    currentX = 0;
    isDragging = true;
    isHorizontalIntent = null;
    el.style.transition = "none";
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Determine direction intent on initial movement
    if (isHorizontalIntent === null && Math.abs(deltaX) <= 8 && Math.abs(deltaY) <= 8) {
      return;
    }

    if (isHorizontalIntent === null) {
      isHorizontalIntent = Math.abs(deltaX) > Math.abs(deltaY);
    }

    if (!isHorizontalIntent) {
      isDragging = false;
      return;
    }

    // Follow finger completely across the screen width without artificial clamping!
    currentX = deltaX;
    const opacity = Math.max(0.3, 1 - Math.abs(currentX) / 450);
    el.style.transform = `translate3d(${currentX}px, 0, 0)`;
    el.style.opacity = String(opacity);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    isDragging = false;
    isHorizontalIntent = null;

    const screenWidth = window.innerWidth || 400;
    const triggerThreshold = Math.min(threshold, screenWidth * 0.28);

    // If swiped LEFT past threshold -> Full slide-out off screen & trigger action
    if (currentX < -triggerThreshold && options.onSwipeLeft) {
      el.style.transition = "transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease-out";
      el.style.transform = `translate3d(-120%, 0, 0)`;
      el.style.opacity = "0";
      setTimeout(() => {
        options.onSwipeLeft?.();
      }, 200);
      return;
    }

    // If swiped RIGHT past threshold -> Full slide-out right & trigger action
    if (currentX > triggerThreshold && options.onSwipeRight) {
      el.style.transition = "transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease-out";
      el.style.transform = `translate3d(120%, 0, 0)`;
      el.style.opacity = "0";
      setTimeout(() => {
        options.onSwipeRight?.();
      }, 200);
      return;
    }

    // Spring back smoothly to origin with satisfying spring physics
    el.style.transition = "transform 0.35s cubic-bezier(0.34, 1.35, 0.64, 1), opacity 0.3s ease-out";
    el.style.transform = "translate3d(0, 0, 0)";
    el.style.opacity = "1";
  };

  el.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  return () => {
    el.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  };
}
