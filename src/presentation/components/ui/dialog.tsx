/**
 * Modal dialog component with spring physics and backdrop, styled with Panda CSS.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 *
 * # Arguments
 * - `props`: Dialog properties (open, onOpenChange, children).
 *
 * # Returns
 * SolidJS Portal dialog with escape key listener and spring animations.
 */
import { JSX, createSignal, createEffect, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { X } from "lucide-solid";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

const backdropStyle = css({
  position: "fixed",
  inset: "0",
  bg: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(4px)",
  transition: "opacity 0.3s ease-out",
});

const dialogContainerStyle = css({
  position: "relative",
  zIndex: 50,
  w: "full",
  maxW: "lg",
  maxH: "85dvh",
  overflowY: "auto",
  borderRadius: "3xl",
  borderWidth: "1px",
  borderColor: "outlineVariant",
  bg: "surfaceContainerHigh",
  p: { base: "4", sm: "6" },
  shadow: "2xl",
  color: "onSurface",
  my: "auto",
  transition: "all 0.3s cubic-bezier(0.34, 1.35, 0.64, 1)",
});

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: JSX.Element;
  class?: string;
  className?: string;
}

export function Dialog(props: DialogProps) {
  const [isRendered, setIsRendered] = createSignal(props.open);

  createEffect(() => {
    if (props.open) {
      setIsRendered(true);
      document.body.style.overflow = "hidden";
      return;
    }
    const timer = setTimeout(() => {
      setIsRendered(false);
      document.body.style.overflow = "";
    }, 260);
    onCleanup(() => clearTimeout(timer));
  });

  createEffect(() => {
    if (!props.open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        props.onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  return (
    <Show when={isRendered()}>
      <Portal>
        <div
          class={css({
            position: "fixed",
            inset: "0",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { base: "4", sm: "6" },
            overflowY: "auto",
          })}
        >
          {/* Backdrop */}
          <div
            onClick={() => props.onOpenChange(false)}
            class={cn(
              backdropStyle,
              props.open ? css({ opacity: 1 }) : css({ opacity: 0, pointerEvents: "none" })
            )}
          />

          {/* Dialog Container */}
          <div
            class={cn(
              dialogContainerStyle,
              props.open ? "animate-dialog-spring-in" : "animate-dialog-spring-out",
              props.class || props.className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {props.children}
          </div>
        </div>
      </Portal>
    </Show>
  );
}

export function DialogHeader(props: JSX.HTMLAttributes<HTMLDivElement> & { class?: string; className?: string; onClose?: () => void }) {
  return (
    <div
      class={cn(
        css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", pb: "4" }),
        props.class || props.className
      )}
    >
      <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>{props.children}</div>
      <Show when={props.onClose}>
        <button
          type="button"
          onClick={props.onClose}
          class={css({
            borderRadius: "full",
            p: "2",
            color: "onSurfaceVariant",
            cursor: "pointer",
            _hover: { bg: "surfaceContainerHighest", color: "onSurface" },
          })}
          aria-label="Close"
        >
          <X class="h-5 w-5" />
        </button>
      </Show>
    </div>
  );
}

export function DialogTitle(props: JSX.HTMLAttributes<HTMLHeadingElement> & { class?: string; className?: string }) {
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

export function DialogDescription(props: JSX.HTMLAttributes<HTMLParagraphElement> & { class?: string; className?: string }) {
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

export function DialogFooter(props: JSX.HTMLAttributes<HTMLDivElement> & { class?: string; className?: string }) {
  return (
    <div
      class={cn(
        css({
          display: "flex",
          flexDirection: { base: "column-reverse", sm: "row" },
          justifyContent: { sm: "flex-end" },
          gap: { base: "2", sm: "3" },
          pt: "4",
          borderTopWidth: "1px",
          borderColor: "outlineVariant",
          mt: "2",
        }),
        props.class || props.className
      )}
    >
      {props.children}
    </div>
  );
}
