/**
 * Reusable Tag Badge capsule component with consistent color dot, border accent, and selected states.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TAG-01`
 * - Design: `@design:FR-TAG-01`
 */
import { Show } from "solid-js";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";
import { X } from "lucide-solid";

export interface TagBadgeProps {
  name: string;
  color: string;
  count?: number;
  isSelected?: boolean;
  size?: "sm" | "md";
  class?: string;
  className?: string;
  onClick?: (e: MouseEvent) => void;
  onRemove?: (e: MouseEvent) => void;
  title?: string;
}

export function TagBadge(props: TagBadgeProps) {
  const isSm = () => props.size === "sm";

  return (
    <span
      onClick={(e) => props.onClick?.(e)}
      class={cn(
        css({
          display: "inline-flex",
          alignItems: "center",
          gap: "1.5",
          borderRadius: "full",
          borderWidth: "1px",
          fontWeight: "medium",
          lineHeight: "tight",
          flexShrink: 0,
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          userSelect: "none",
        }),
        isSm()
          ? css({ fontSize: "11px", px: "2", py: "0.5" })
          : css({ fontSize: "xs", px: "2.5", py: "1" }),
        props.onClick ? css({ cursor: "pointer", _hover: { opacity: 0.85 } }) : "",
        props.isSelected ? css({ fontWeight: "semibold", shadow: "xs" }) : "",
        props.class || props.className
      )}
      style={{
        "background-color": props.isSelected ? `${props.color}30` : `${props.color}18`,
        "border-color": props.isSelected ? props.color : `${props.color}40`,
        color: props.color,
      }}
      title={props.title || props.name}
    >
      {/* Color indicator dot */}
      <span
        class={cn(
          css({ borderRadius: "full", flexShrink: 0, transition: "transform 0.2s" }),
          isSm() ? css({ h: "1.5", w: "1.5" }) : css({ h: "2", w: "2" }),
          props.isSelected ? css({ transform: "scale(1.2)" }) : ""
        )}
        style={{
          "background-color": props.color,
          ...(props.isSelected ? { "box-shadow": `0 0 6px ${props.color}80` } : {}),
        }}
      />

      {/* Tag Label */}
      <span
        class={css({
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxW: "120px",
        })}
      >
        {props.name}
      </span>

      {/* Optional Count badge */}
      <Show when={props.count !== undefined}>
        <span
          class={css({
            fontSize: "10px",
            px: "1.5",
            py: "0.2",
            borderRadius: "full",
            fontWeight: "bold",
          })}
          style={{
            color: props.color,
            "background-color": `${props.color}25`,
          }}
        >
          {props.count}
        </span>
      </Show>

      {/* Optional Remove button */}
      <Show when={props.onRemove}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            props.onRemove?.(e);
          }}
          class={css({
            p: "0.5",
            borderRadius: "full",
            color: "currentColor",
            opacity: 0.7,
            cursor: "pointer",
            _hover: { opacity: 1, bg: "black/10" },
          })}
          aria-label={`Remove ${props.name} tag`}
        >
          <X class={isSm() ? css({ h: "3", w: "3" }) : css({ h: "3.5", w: "3.5" })} />
        </button>
      </Show>
    </span>
  );
}
