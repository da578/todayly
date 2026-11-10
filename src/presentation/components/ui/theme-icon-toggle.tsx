/**
 * Reusable Theme Toggle Icon component with clockwise rotate and fade animation.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 */
import { createSignal, createEffect } from "solid-js";
import { Sun, Moon } from "lucide-solid";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

interface ThemeIconToggleProps {
  isDarkMode: boolean;
  size?: "sm" | "md" | "lg";
  class?: string;
  className?: string;
}

export function ThemeIconToggle(props: ThemeIconToggleProps) {
  let isInitial = true;
  const [hasInteracted, setHasInteracted] = createSignal(false);

  createEffect(() => {
    props.isDarkMode;
    if (isInitial) {
      isInitial = false;
      return;
    }
    setHasInteracted(true);
  });

  const isLg = () => props.size === "lg";
  const iconClass = () => (isLg() ? css({ h: "6", w: "6" }) : css({ h: "5", w: "5" }));
  const boxClass = () => (isLg() ? css({ h: "6", w: "6" }) : css({ h: "5", w: "5" }));

  return (
    <div
      class={cn(
        css({
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }),
        boxClass(),
        props.class || props.className
      )}
    >
      {/* Sun Icon */}
      <div
        class={cn(
          css({
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transformOrigin: "center center",
          }),
          hasInteracted()
            ? props.isDarkMode
              ? "theme-rotate-out"
              : "theme-rotate-in"
            : props.isDarkMode
            ? css({ opacity: 0, transform: "rotate(90deg) scale(0.4)", pointerEvents: "none" })
            : css({ opacity: 1, transform: "rotate(0deg) scale(1)" })
        )}
      >
        <Sun class={cn(iconClass(), css({ color: "amber.500" }))} />
      </div>

      {/* Moon Icon */}
      <div
        class={cn(
          css({
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transformOrigin: "center center",
          }),
          hasInteracted()
            ? props.isDarkMode
              ? "theme-rotate-in"
              : "theme-rotate-out"
            : props.isDarkMode
            ? css({ opacity: 1, transform: "rotate(0deg) scale(1)" })
            : css({ opacity: 0, transform: "rotate(90deg) scale(0.4)", pointerEvents: "none" })
        )}
      >
        <Moon class={cn(iconClass(), css({ color: "primary" }))} />
      </div>
    </div>
  );
}
