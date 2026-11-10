/**
 * Floating action button (FAB) for triggering Quick Note entry with keyboard shortcut.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-01`
 * - Design: `@design:FR-TASK-01`
 *
 * # Arguments
 * - `props.onOpenQuickCreate`: Callback invoked when FAB or Ctrl/Cmd+N is pressed.
 *
 * # Returns
 * SolidJS JSX floating action button.
 */
import { createEffect, onCleanup } from "solid-js";
import { Plus } from "lucide-solid";
import { css } from "@/styled-system/css";

const fabStyle = css({
  position: "fixed",
  bottom: "6",
  right: "6",
  zIndex: 40,
  h: "14",
  w: "14",
  borderRadius: "xl",
  bg: "primary",
  color: "onPrimary",
  shadow: "xl",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderWidth: "1px",
  borderColor: "rgba(255, 255, 255, 0.15)",
  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  _hover: {
    shadow: "2xl",
    transform: "scale(1.05)",
  },
  _active: {
    transform: "scale(0.95)",
  },
});

interface QuickNoteBarProps {
  onOpenQuickCreate: () => void;
}

export function QuickNoteBar(props: QuickNoteBarProps) {
  // Global keyboard shortcut: Ctrl+N or Cmd+N opens TaskCreateModal in Quick Note mode
  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        props.onOpenQuickCreate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
  });

  return (
    <button
      type="button"
      onClick={props.onOpenQuickCreate}
      class={fabStyle}
      title="Quick Task (+ or Ctrl+N)"
      aria-label="Add new quick task"
    >
      <Plus class={css({ h: "6", w: "6" })} />
    </button>
  );
}
