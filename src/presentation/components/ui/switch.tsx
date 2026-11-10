/**
 * Switch toggle component styled with Panda CSS.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 *
 * # Arguments
 * - `props`: Switch properties (checked, onCheckedChange, disabled, id).
 *
 * # Returns
 * SolidJS JSX toggle button with animated sliding knob.
 */
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

const switchTrackStyle = css({
  display: "inline-flex",
  h: "8",
  w: "14",
  flexShrink: 0,
  cursor: "pointer",
  alignItems: "center",
  borderRadius: "full",
  p: "1",
  borderWidth: "2px",
  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  outline: "none",
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "primary",
    outlineOffset: "2px",
  },
  _disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
});

const switchThumbStyle = css({
  pointerEvents: "none",
  display: "block",
  h: "6",
  w: "6",
  borderRadius: "full",
  boxShadow: "xs",
  transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
});

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  class?: string;
  className?: string;
  id?: string;
}

export function Switch(props: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={props.id}
      aria-checked={props.checked}
      disabled={props.disabled}
      onClick={() => !props.disabled && props.onCheckedChange(!props.checked)}
      class={cn(
        switchTrackStyle,
        props.checked
          ? css({ bg: "primary", borderColor: "primary" })
          : css({ bg: "surfaceContainerHighest", borderColor: "outline" }),
        props.class || props.className
      )}
    >
      <span
        class={cn(
          switchThumbStyle,
          props.checked
            ? css({ transform: "translateX(24px)", bg: "onPrimary" })
            : css({ transform: "translateX(0px)", bg: "outline" })
        )}
      />
    </button>
  );
}
