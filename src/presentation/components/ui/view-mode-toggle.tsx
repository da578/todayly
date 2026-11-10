/**
 * Reusable View Mode Toggle (List vs Kanban) with animated sliding pill background.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-01`
 * - Design: `@design:FR-TASK-01`
 */
import { createSignal } from "solid-js";
import { LayoutList, Kanban as KanbanIcon } from "lucide-solid";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

export interface ViewModeToggleProps {
  value: "list" | "kanban";
  onChange: (mode: "list" | "kanban") => void;
  class?: string;
  className?: string;
}

export function ViewModeToggle(props: ViewModeToggleProps) {
  const [hasInteracted, setHasInteracted] = createSignal(false);

  const handleSelect = (mode: "list" | "kanban") => {
    if (props.value === mode) return;
    setHasInteracted(true);
    props.onChange(mode);
  };

  return (
    <div
      class={cn(
        css({
          position: "relative",
          display: "flex",
          alignItems: "center",
          bg: "surfaceContainerHighest",
          borderRadius: "10px",
          p: "0.5",
          borderWidth: "1px",
          borderColor: "outlineVariant",
          userSelect: "none",
        }),
        props.class || props.className
      )}
    >
      {/* Sliding background pill indicator */}
      <div
        class={cn(
          css({
            position: "absolute",
            top: "0.5",
            bottom: "0.5",
            left: "0.5",
            w: "calc(50% - 2px)",
            borderRadius: "7px",
            bg: "primary",
            shadow: "xs",
            pointerEvents: "none",
          }),
          hasInteracted()
            ? css({ transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)" })
            : css({ transition: "none" }),
          props.value === "list"
            ? css({ transform: "translateX(0)" })
            : css({ transform: "translateX(calc(100% + 2px))" })
        )}
      />

      {/* List View Button */}
      <button
        type="button"
        onClick={() => handleSelect("list")}
        class={cn(
          css({
            position: "relative",
            zIndex: 10,
            p: "1.5",
            borderRadius: "7px",
            transition: "colors 0.3s",
            cursor: "pointer",
          }),
          props.value === "list"
            ? css({ color: "onPrimary", fontWeight: "bold" })
            : css({ color: "onSurfaceVariant", _hover: { color: "onSurface" } })
        )}
        title="List View"
        aria-label="List View"
      >
        <LayoutList class={css({ h: "4", w: "4" })} />
      </button>

      {/* Kanban Board View Button */}
      <button
        type="button"
        onClick={() => handleSelect("kanban")}
        class={cn(
          css({
            position: "relative",
            zIndex: 10,
            p: "1.5",
            borderRadius: "7px",
            transition: "colors 0.3s",
            cursor: "pointer",
          }),
          props.value === "kanban"
            ? css({ color: "onPrimary", fontWeight: "bold" })
            : css({ color: "onSurfaceVariant", _hover: { color: "onSurface" } })
        )}
        title="Kanban Board View"
        aria-label="Kanban Board View"
      >
        <KanbanIcon class={css({ h: "4", w: "4" })} />
      </button>
    </div>
  );
}
