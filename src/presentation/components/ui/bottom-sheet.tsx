/**
 * Swipeable BottomSheet modal component with gesture drag support and spring physics, styled with Panda CSS.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 *
 * # Arguments
 * - `props`: BottomSheetProps including open, onOpenChange, children, class, maxHeight.
 *
 * # Returns
 * SolidJS Portal bottom sheet with swipe drag gesture, escape key dismiss, and Material 3 styling.
 */
import { JSX, createSignal, createEffect, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

const backdropStyle = css({
  position: "fixed",
  inset: "0",
  bg: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(4px)",
  transition: "opacity 320ms ease",
});

const sheetWrapperStyle = css({
  position: "relative",
  zIndex: 50,
  w: "full",
  maxW: "2xl",
  mx: "auto",
  bg: "surfaceContainerHigh",
  color: "onSurface",
  display: "flex",
  flexDirection: "column",
  shadow: "2xl",
  overflow: "hidden",
});

function handleStandardSheetPointerUp(
  currentY: number,
  setExpanded: (v: boolean) => void,
  close: () => void
): void {
  if (currentY < -35 || Math.abs(currentY) < 5) {
    setExpanded(true);
    return;
  }
  if (currentY > 80) {
    close();
  }
}

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: JSX.Element;
  class?: string;
  className?: string;
  maxHeight?: string;
}

export function BottomSheet(props: BottomSheetProps) {
  const [isRendered, setIsRendered] = createSignal(props.open);
  const [isOpenState, setIsOpenState] = createSignal(false);
  const [isExpanded, setIsExpanded] = createSignal(false);
  const [measuredHeight, setMeasuredHeight] = createSignal<number | null>(null);
  const [isHeightReady, setIsHeightReady] = createSignal(false);
  const [dragY, setDragY] = createSignal<number | null>(null);
  const [viewportBottomOffset, setViewportBottomOffset] = createSignal(0);
  let sheetRef: HTMLDivElement | undefined;
  let contentRef: HTMLDivElement | undefined;
  let startY = 0;
  let currentY = 0;
  let currentHeight = 0;
  let isDragging = false;

  createEffect(() => {
    if (!props.open) {
      setViewportBottomOffset(0);
      return;
    }
    if (typeof window === "undefined") return;

    const updateViewportOffset = () => {
      if (!window.visualViewport) {
        setViewportBottomOffset(0);
        return;
      }
      const keyboardHeight = Math.max(
        0,
        window.innerHeight - (window.visualViewport.height + window.visualViewport.offsetTop)
      );
      setViewportBottomOffset(keyboardHeight);
    };

    updateViewportOffset();

    if (window.visualViewport) {
      const vv = window.visualViewport;
      vv.addEventListener("resize", updateViewportOffset);
      vv.addEventListener("scroll", updateViewportOffset);
      onCleanup(() => {
        vv.removeEventListener("resize", updateViewportOffset);
        vv.removeEventListener("scroll", updateViewportOffset);
      });
    }

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        setTimeout(() => {
          target.scrollIntoView({ block: "center", behavior: "smooth" });
        }, 180);
      }
    };

    window.addEventListener("focusin", handleFocusIn);
    onCleanup(() => {
      window.removeEventListener("focusin", handleFocusIn);
    });
  });

  createEffect(() => {
    if (props.open) {
      setIsRendered(true);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        setIsOpenState(true);
      });
      return;
    }
    setIsOpenState(false);
    setIsExpanded(false);
    setIsHeightReady(false);
    const timer = setTimeout(() => {
      setIsRendered(false);
      setMeasuredHeight(null);
      currentHeight = 0;
      document.body.style.overflow = "";
    }, 280);
    onCleanup(() => clearTimeout(timer));
  });

  const attachContentObserver = (el: HTMLDivElement) => {
    contentRef = el;

    const updateHeight = () => {
      if (!contentRef || !props.open) return;
      const h = Math.max(contentRef.offsetHeight, contentRef.scrollHeight);
      if (h <= 0) return;

      if (!isHeightReady()) {
        currentHeight = h;
        setMeasuredHeight(h);
        setTimeout(() => {
          setIsHeightReady(true);
        }, 380);
        return;
      }

      if (Math.abs(h - currentHeight) > 4) {
        currentHeight = h;
        setMeasuredHeight(h);
      }
    };

    updateHeight();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateHeight);
      ro.observe(el);
      onCleanup(() => ro.disconnect());
    }

    if (typeof MutationObserver !== "undefined") {
      const mo = new MutationObserver(() => {
        requestAnimationFrame(updateHeight);
      });
      mo.observe(el, { childList: true, subtree: true });
      onCleanup(() => mo.disconnect());
    }
  };

  createEffect(() => {
    if (!props.open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isExpanded()) {
        setIsExpanded(false);
        return;
      }
      props.onOpenChange(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  const handlePointerDown = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startY = e.clientY;
    currentY = 0;
    isDragging = true;
    setDragY(0);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startY;
    currentY = deltaY;

    if (!isExpanded()) {
      setDragY(deltaY);
      return;
    }
    const pullMultiplier = deltaY > 0 ? 1 : 0.2;
    setDragY(deltaY * pullMultiplier);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already lost
    }

    setDragY(null);

    if (!isExpanded()) {
      handleStandardSheetPointerUp(currentY, setIsExpanded, () => props.onOpenChange(false));
      return;
    }

    if (currentY > 40 || Math.abs(currentY) < 5) {
      setIsExpanded(false);
    }
  };

  return (
    <Show when={isRendered()}>
      <Portal>
        <div
          style={{
            bottom: `${viewportBottomOffset()}px`,
            transition: "bottom 200ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          class={css({
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            overflow: "hidden",
            touchAction: "none",
          })}
        >
          {/* Backdrop */}
          <div
            onClick={() => props.onOpenChange(false)}
            class={cn(
              backdropStyle,
              isOpenState() ? css({ opacity: 1 }) : css({ opacity: 0, pointerEvents: "none" })
            )}
          />

          {/* Bottom Sheet Container */}
          <div
            ref={sheetRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              height:
                isExpanded()
                  ? "100dvh"
                  : measuredHeight()
                  ? `${measuredHeight()}px`
                  : "auto",
              transform: dragY() !== null ? `translateY(${dragY()}px)` : undefined,
              transition:
                dragY() !== null
                  ? "none"
                  : isHeightReady()
                  ? "height 320ms cubic-bezier(0.34, 1.35, 0.64, 1), max-height 320ms ease, border-radius 320ms ease"
                  : "max-height 320ms ease, border-radius 320ms ease",
            }}
            class={cn(
              sheetWrapperStyle,
              dragY() === null && (props.open ? "animate-sheet-spring-in" : "animate-sheet-spring-out"),
              isExpanded()
                ? css({
                    h: "100dvh",
                    maxH: "100dvh",
                    w: "full",
                    maxW: "full",
                    borderRadius: "none",
                    borderWidth: "0px",
                    mx: "0",
                    shadow: "none",
                  })
                : css({
                    maxH: "85dvh",
                    maxW: "2xl",
                    mx: "auto",
                    borderTopRadius: "28px",
                    borderTopWidth: "1px",
                    borderInlineWidth: "1px",
                    borderColor: "outlineVariant",
                    overflowY: "auto",
                  }),
              props.class || props.className
            )}
          >
            {/* Internal content wrapper */}
            <div
              ref={attachContentObserver}
              class={cn(
                css({
                  w: "full",
                  display: "flex",
                  flexDirection: "column",
                  flexShrink: 0,
                  px: { base: "4", sm: "6", lg: "8" },
                }),
                isExpanded()
                  ? css({
                      h: "100dvh",
                      maxH: "100dvh",
                      maxW: "5xl",
                      mx: "auto",
                      pt: "1",
                      pb: "0",
                    })
                  : css({
                      pt: "2",
                      pb: "0",
                    })
              )}
            >
              {/* Grab Handle bar area */}
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                class={css({
                  w: "full",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: "2",
                  mt: "-1",
                  mb: "1",
                  cursor: "ns-resize",
                  userSelect: "none",
                  touchAction: "none",
                  flexShrink: 0,
                  _active: { cursor: "grabbing" },
                })}
                title={
                  isExpanded()
                    ? "Tarik ke bawah atau klik untuk kembali ke tampilan normal"
                    : "Tarik ke atas untuk layar penuh / Tarik ke bawah untuk menutup"
                }
              >
                <div
                  class={css({
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    py: "1",
                    px: "4",
                  })}
                >
                  <div
                    class={cn(
                      css({
                        h: "1.5",
                        borderRadius: "full",
                        bg: "onSurfaceVariant",
                        transition: "all 0.25s ease",
                      }),
                      isExpanded()
                        ? css({ w: "16", opacity: 0.6, bg: "primary" })
                        : css({ w: "14", opacity: 0.4, _hover: { opacity: 0.7 } })
                    )}
                  />
                </div>
              </div>

              <div
                class={css({
                  w: "full",
                  flex: "1",
                  display: "flex",
                  flexDirection: "column",
                  minH: "0",
                  maxH: "full",
                  overflow: "hidden",
                })}
              >
                {props.children}
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}

export function BottomSheetHeader(props: JSX.HTMLAttributes<HTMLDivElement> & { class?: string; className?: string; onClose?: () => void }) {
  return (
    <div
      class={cn(
        css({ display: "flex", flexDirection: "column", gap: "1", pb: "3", flexShrink: 0 }),
        props.class || props.className
      )}
    >
      {props.children}
    </div>
  );
}

export function BottomSheetTitle(props: JSX.HTMLAttributes<HTMLHeadingElement> & { class?: string; className?: string }) {
  return (
    <h2
      class={cn(
        css({ fontSize: "xl", fontWeight: "bold", lineHeight: "tight", letterSpacing: "tight", color: "onSurface" }),
        props.class || props.className
      )}
    >
      {props.children}
    </h2>
  );
}

export function BottomSheetDescription(props: JSX.HTMLAttributes<HTMLParagraphElement> & { class?: string; className?: string }) {
  return (
    <p
      class={cn(
        css({ fontSize: "xs", color: "onSurfaceVariant", lineHeight: "normal" }),
        props.class || props.className
      )}
    >
      {props.children}
    </p>
  );
}

export function BottomSheetFooter(props: JSX.HTMLAttributes<HTMLDivElement> & { class?: string; className?: string }) {
  return (
    <div
      class={cn(
        css({
          display: "flex",
          flexDirection: { base: "column-reverse", sm: "row" },
          justifyContent: { sm: "flex-end" },
          alignItems: "center",
          gap: "2",
          pt: "4",
          pb: "4",
          mt: "auto",
          borderTopWidth: "1px",
          borderColor: "outlineVariant",
          flexShrink: 0,
        }),
        props.class || props.className
      )}
    >
      {props.children}
    </div>
  );
}
