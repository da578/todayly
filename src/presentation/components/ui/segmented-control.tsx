/**
 * Shared Segmented Control and Animated Sub-Page components with sliding indicator and gesture support.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`, `@impl:FR-IO-01`
 * - Design: `@design:FR-THEME-01`, `@design:FR-IO-01`
 */
import { JSX, For, Show } from "solid-js";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

export interface SegmentedItem<T extends string = string> {
  value: T;
  label: string;
  icon?: (props: { class?: string }) => JSX.Element;
}

interface SegmentedControlProps<T extends string = string> {
  items: SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  class?: string;
  className?: string;
}

/**
 * Reusable segmented slider with animated sliding pill background
 */
export function SegmentedControl<T extends string = string>(props: SegmentedControlProps<T>) {
  const activeIndex = () => Math.max(0, props.items.findIndex((item) => item.value === props.value));
  const count = () => Math.max(1, props.items.length);
  const isSmall = () => props.size === "sm";

  return (
    <div
      class={cn(
        css({
          position: "relative",
          display: "grid",
          alignItems: "center",
          bg: "surfaceContainerHighest",
          borderRadius: "10px",
          p: "0.5",
          borderWidth: "1px",
          borderColor: "outlineVariant",
          userSelect: "none",
          overflow: "hidden",
          boxSizing: "border-box",
        }),
        props.class || props.className
      )}
      style={{
        "grid-template-columns": `repeat(${count()}, minmax(0, 1fr))`,
      }}
    >
      {/* Animated Sliding Pill */}
      <div
        class={css({
          position: "absolute",
          top: "2px",
          bottom: "2px",
          left: "2px",
          borderRadius: "7px",
          bg: "primary",
          shadow: "xs",
          pointerEvents: "none",
          zIndex: 1,
          transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        })}
        style={{
          width: `calc((100% - 4px) / ${count()})`,
          transform: `translateX(calc(${activeIndex()} * 100%))`,
        }}
      />

      {/* Segmented Buttons */}
      <For each={props.items}>
        {(item) => {
          const isActive = () => item.value === props.value;
          return (
            <button
              type="button"
              onClick={() => props.onChange(item.value)}
              class={cn(
                css({
                  position: "relative",
                  zIndex: 2,
                  w: "full",
                  minW: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.5",
                  borderRadius: "7px",
                  fontWeight: "semibold",
                  transition: "color 0.25s ease",
                  cursor: "pointer",
                  userSelect: "none",
                  outline: "none",
                  whiteSpace: "nowrap",
                }),
                isSmall()
                  ? css({ h: "8", px: "2.5", fontSize: "xs" })
                  : css({ h: "9", px: "3.5", fontSize: "xs" }),
                isActive()
                  ? css({ color: "onPrimary", fontWeight: "bold" })
                  : css({ color: "onSurfaceVariant", _hover: { color: "onSurface" } })
              )}
            >
              <Show when={item.icon}>
                {(IconComp) => (
                  <span class={css({ display: "inline-flex", flexShrink: 0 })}>
                    {IconComp()({ class: isSmall() ? css({ h: "3.5", w: "3.5" }) : css({ h: "4", w: "4" }) })}
                  </span>
                )}
              </Show>
              <span class={css({ truncate: true })}>{item.label}</span>
            </button>
          );
        }}
      </For>
    </div>
  );
}

function getSubPageAnimation(direction?: "left" | "right" | null): string {
  if (direction === "right") return "animate-swipe-right";
  if (direction === "left") return "animate-swipe-left";
  return "";
}

/**
 * Animated sub-page wrapper providing directional swipe-in animations
 */
export function AnimatedSubPage(props: {
  direction?: "left" | "right" | null;
  children: JSX.Element;
  class?: string;
  className?: string;
}) {
  return (
    <div
      class={cn(
        css({
          w: "full",
          h: "full",
          display: "flex",
          flexDirection: "column",
          flex: "1",
          minH: "0",
        }),
        getSubPageAnimation(props.direction),
        props.class || props.className
      )}
    >
      {props.children}
    </div>
  );
}
