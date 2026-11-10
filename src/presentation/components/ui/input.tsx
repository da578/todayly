/**
 * Text input component styled with Panda CSS.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 *
 * # Arguments
 * - `props`: Standard HTML input attributes.
 *
 * # Returns
 * SolidJS JSX input element.
 */
import { JSX, splitProps } from "solid-js";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

const inputStyle = css({
  display: "flex",
  h: "12",
  w: "full",
  borderRadius: "16px",
  borderWidth: "1px",
  borderColor: "outlineVariant",
  bg: "surfaceContainerHighest",
  px: "4",
  py: "2",
  fontSize: "base",
  color: "onSurface",
  outline: "none",
  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  "&::placeholder": {
    color: "onSurfaceVariant",
    opacity: 0.7,
  },
  _focusVisible: {
    borderColor: "primary",
    boxShadow: "0 0 0 2px var(--colors-primary)",
  },
  _focus: {
    borderColor: "primary",
    boxShadow: "0 0 0 2px var(--colors-primary)",
  },
  _disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
});

export interface InputProps
  extends JSX.InputHTMLAttributes<HTMLInputElement> {
  class?: string;
  className?: string;
}

export function Input(props: InputProps) {
  const [local, others] = splitProps(props, ["class", "className", "type"]);
  return (
    <input
      type={local.type || "text"}
      class={cn(inputStyle, local.class || local.className)}
      {...others}
    />
  );
}
