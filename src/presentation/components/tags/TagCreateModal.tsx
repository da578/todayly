/**
 * Modal for creating and editing categorization tags with color palette swatches.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TAG-01`
 * - Design: `@design:FR-TAG-01`
 *
 * # Arguments
 * - `props`: TagCreateModalProps containing open state, initialTag, and onCreateTag callback.
 *
 * # Returns
 * SolidJS JSX BottomSheet modal for tag management.
 */
import { createSignal, createEffect, For, Show } from "solid-js";
import { Tag } from "@/src/domain";
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetFooter,
} from "@/src/presentation/components/ui/bottom-sheet";
import { Input } from "@/src/presentation/components/ui/input";
import { Button } from "@/src/presentation/components/ui/button";
import { Plus, Check, Palette, Type } from "lucide-solid";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

interface TagCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTag: (data: { name: string; color: string }) => void;
  initialTag?: Tag | null;
}

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#84CC16", // Lime
  "#64748B", // Slate
];

export function TagCreateModal(props: TagCreateModalProps) {
  const [name, setName] = createSignal("");
  const [color, setColor] = createSignal(PRESET_COLORS[0]);

  createEffect(() => {
    if (!props.open) {
      return;
    }
    if (props.initialTag) {
      setName(props.initialTag.name);
      setColor(props.initialTag.color);
      return;
    }
    setName("");
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const trimmed = name().trim();
    if (!trimmed) return;

    props.onCreateTag({
      name: trimmed,
      color: color(),
    });

    setName("");
    props.onOpenChange(false);
  };

  return (
    <BottomSheet open={props.open} onOpenChange={props.onOpenChange}>
      <BottomSheetHeader onClose={() => props.onOpenChange(false)}>
        <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
          <BottomSheetTitle class={css({ fontSize: "xl", fontWeight: "bold", letterSpacing: "tight", color: "onSurface" })}>
            {props.initialTag ? "Edit Tag" : "Create Tag"}
          </BottomSheetTitle>
          <BottomSheetDescription class={css({ fontSize: "xs", color: "onSurfaceVariant", lineHeight: "normal", m: "0", p: "0" })}>
            {props.initialTag
              ? "Update tag name and color category."
              : "Organize your tasks with color-coded tags."}
          </BottomSheetDescription>
        </div>
      </BottomSheetHeader>

      <form onSubmit={handleSubmit} class={css({ flex: "1", display: "flex", flexDirection: "column", minH: "0" })}>
        <div class={css({ display: "flex", flexDirection: "column", gap: "4", flex: "1", minH: "0", overflowY: "auto", p: "1.5" })}>
          {/* Field 1: Tag Name */}
          <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
            <label
              for="tag-name-input"
              class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", display: "flex", alignItems: "center", gap: "1.5", userSelect: "none" })}
            >
              <Type class={css({ h: "3.5", w: "3.5" })} />
              <span>Tag Name</span>
            </label>
            <Input
              id="tag-name-input"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              placeholder="Tag name (e.g. Work, Urgent, Project)..."
              class={css({ fontSize: "base", fontWeight: "medium", borderRadius: "12px", h: "12" })}
              required
              autofocus
            />
          </div>

          {/* Field 2: Tag Color */}
          <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
            <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", display: "flex", alignItems: "center", gap: "1.5", userSelect: "none" })}>
              <Palette class={css({ h: "3.5", w: "3.5" })} />
              <span>Tag Color</span>
            </label>

            <div class={css({ p: "3.5", bg: "surfaceContainerHighest", borderRadius: "12px", borderWidth: "1px", borderColor: "outlineVariant", display: "flex", flexDirection: "column", gap: "3" })}>
              <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "xs", color: "onSurfaceVariant", fontWeight: "medium" })}>
                <span>Selected Palette</span>
                <div class={css({ display: "flex", alignItems: "center", gap: "2" })}>
                  <div
                    class={css({ h: "4", w: "4", borderRadius: "full", borderWidth: "1px", borderColor: "white/40", shadow: "xs" })}
                    style={{ "background-color": color() }}
                  />
                  <span class={css({ fontFamily: "mono", fontSize: "11px", textTransform: "uppercase", color: "onSurface" })}>{color()}</span>
                </div>
              </div>

              {/* Preset Color Swatches */}
              <div class={css({ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "2", pt: "1" })}>
                <For each={PRESET_COLORS}>
                  {(c) => {
                    const isSelected = () => color().toLowerCase() === c.toLowerCase();
                    return (
                      <button
                        type="button"
                        onClick={() => setColor(c)}
                        style={{ "background-color": c }}
                        class={cn(
                          css({
                            h: "9",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                            cursor: "pointer",
                            shadow: "xs",
                            _hover: { transform: "scale(1.05)" },
                            _active: { transform: "scale(0.95)" },
                          }),
                          isSelected()
                            ? css({ outline: "2px solid", outlineColor: "primary", outlineOffset: "2px", transform: "scale(1.05)" })
                            : css({ opacity: 0.85, _hover: { opacity: 1 } })
                        )}
                        aria-label={`Select color ${c}`}
                      >
                        <Show when={isSelected()}>
                          <Check class={css({ h: "4", w: "4", color: "white", strokeWidth: "3" })} />
                        </Show>
                      </button>
                    );
                  }}
                </For>
              </div>

              {/* Custom Hex input */}
              <div class={css({ display: "flex", alignItems: "center", gap: "2", pt: "1" })}>
                <span class={css({ fontSize: "xs", color: "onSurfaceVariant", flexShrink: 0 })}>Custom Hex:</span>
                <input
                  type="text"
                  value={color()}
                  onInput={(e) => setColor(e.currentTarget.value)}
                  placeholder="#3B82F6"
                  class={css({
                    h: "9",
                    px: "3",
                    borderRadius: "8px",
                    bg: "surfaceContainer",
                    borderWidth: "1px",
                    borderColor: "outlineVariant",
                    fontSize: "xs",
                    color: "onSurface",
                    fontFamily: "mono",
                    textTransform: "uppercase",
                    w: "full",
                    outline: "none",
                    _focus: { borderColor: "primary" },
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Full Width */}
        <BottomSheetFooter class={css({ mt: "auto", flexShrink: 0 })}>
          <Button
            type="submit"
            disabled={!name().trim()}
            class={css({ w: "full", h: "12", py: "0", borderRadius: "12px", bg: "primary", color: "onPrimary", gap: "2", fontWeight: "semibold", fontSize: "base", shadow: "sm", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" })}
          >
            <Plus class={css({ h: "5", w: "5", flexShrink: 0 })} />
            <span>{props.initialTag ? "Save Tag" : "Create Tag"}</span>
          </Button>
        </BottomSheetFooter>
      </form>
    </BottomSheet>
  );
}
