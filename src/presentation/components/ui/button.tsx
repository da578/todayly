/**
 * Reusable Button component styled with Panda CSS cva recipe.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 *
 * # Arguments
 * - `props`: Button attributes along with variant ('default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link')
 *   and size ('default' | 'sm' | 'lg' | 'icon').
 *
 * # Returns
 * JSX button element with atomic recipe classes.
 *
 * # Examples
 * ```tsx
 * <Button variant="default" size="sm" onClick={handleClick}>Submit</Button>
 * ```
 */
import { JSX, splitProps } from "solid-js";
import { cva, type RecipeVariantProps } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

export const buttonRecipe = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    borderRadius: "20px",
    fontWeight: "medium",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    cursor: "pointer",
    userSelect: "none",
    outline: "none",
    lineHeight: "normal",
    verticalAlign: "middle",
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "primary",
      outlineOffset: "2px",
    },
    _disabled: {
      pointerEvents: "none",
      opacity: 0.5,
    },
  },
  variants: {
    variant: {
      default: {
        bg: "primary",
        color: "onPrimary",
        shadow: "xs",
        _hover: { opacity: 0.92, transform: "scale(1.01)" },
        _active: { transform: "scale(0.98)" },
      },
      destructive: {
        bg: "error",
        color: "onError",
        shadow: "xs",
        _hover: { opacity: 0.92, transform: "scale(1.01)" },
        _active: { transform: "scale(0.98)" },
      },
      outline: {
        borderWidth: "1px",
        borderColor: "outlineVariant",
        bg: "transparent",
        color: "onSurface",
        shadow: "xs",
        _hover: { bg: "surfaceContainerHigh", color: "onSurface" },
        _active: { transform: "scale(0.98)" },
      },
      secondary: {
        bg: "secondary",
        color: "onSecondary",
        shadow: "xs",
        _hover: { opacity: 0.88 },
        _active: { transform: "scale(0.98)" },
      },
      ghost: {
        bg: "transparent",
        color: "onSurface",
        _hover: { bg: "surfaceContainerHigh", color: "onSurface" },
      },
      link: {
        bg: "transparent",
        color: "primary",
        textDecoration: "underline",
        _hover: { opacity: 0.85 },
      },
    },
    size: {
      default: {
        h: "10",
        px: "6",
        py: "2",
        fontSize: "sm",
      },
      sm: {
        h: "8",
        borderRadius: "16px",
        px: "4",
        py: "1",
        fontSize: "xs",
      },
      lg: {
        h: "12",
        borderRadius: "24px",
        px: "8",
        py: "3",
        fontSize: "base",
      },
      icon: {
        h: "10",
        w: "10",
        borderRadius: "20px",
        p: "2",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ButtonVariants = RecipeVariantProps<typeof buttonRecipe>;

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  class?: string;
  className?: string;
}

export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, [
    "variant",
    "size",
    "class",
    "className",
    "children",
  ]);

  return (
    <button
      class={cn(
        buttonRecipe({ variant: local.variant, size: local.size }),
        local.class || local.className
      )}
      {...others}
    >
      {local.children}
    </button>
  );
}

export const buttonVariants = buttonRecipe;
