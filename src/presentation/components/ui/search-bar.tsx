/**
 * Reusable Search Bar component with clear button, focus transitions, and keyboard accessibility.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-01`
 * - Design: `@design:FR-TASK-01`
 */
import { Show, createEffect } from "solid-js";
import { Search, X } from "lucide-solid";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

export interface SearchBarProps {
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
  size?: "sm" | "md";
  class?: string;
  className?: string;
}

export function SearchBar(props: SearchBarProps) {
  let inputRef: HTMLInputElement | undefined;

  createEffect(() => {
    if (props.autoFocus && inputRef) {
      inputRef.focus();
    }
  });

  const handleClear = () => {
    props.onInput("");
    props.onClear?.();
    inputRef?.focus();
  };

  const isSm = () => props.size === "sm";

  return (
    <div
      onClick={() => inputRef?.focus()}
      class={cn(
        css({
          position: "relative",
          display: "flex",
          alignItems: "center",
          w: "full",
          bg: "surfaceContainer",
          borderWidth: "1px",
          borderColor: "outlineVariant",
          borderRadius: "14px",
          transition: "border-color 0.2s, background-color 0.2s",
          cursor: "text",
          _focusWithin: {
            borderColor: "primary",
            bg: "surfaceContainerHighest",
          },
        }),
        isSm()
          ? css({ h: "9", px: "3" })
          : css({ h: "11", px: "3.5" }),
        props.class || props.className
      )}
    >
      <div
        class={css({
          color: "onSurfaceVariant",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          mr: "2.5",
        })}
      >
        <Search class={isSm() ? css({ h: "3.5", w: "3.5" }) : css({ h: "4", w: "4" })} />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={props.value}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        placeholder={props.placeholder || "Search..."}
        class={cn(
          css({
            flex: "1",
            bg: "transparent",
            color: "onSurface",
            outline: "none",
            minW: "0",
            "&::placeholder": {
              color: "onSurfaceVariant",
              opacity: 0.7,
            },
          }),
          isSm() ? css({ fontSize: "xs" }) : css({ fontSize: "sm" })
        )}
      />

      <Show when={props.value}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
          class={css({
            p: "1",
            borderRadius: "full",
            color: "onSurfaceVariant",
            cursor: "pointer",
            flexShrink: 0,
            ml: "1.5",
            _hover: {
              color: "onSurface",
              bg: "surfaceContainerHigh",
            },
          })}
          aria-label="Clear search"
        >
          <X class={isSm() ? css({ h: "3.5", w: "3.5" }) : css({ h: "4", w: "4" })} />
        </button>
      </Show>
    </div>
  );
}
