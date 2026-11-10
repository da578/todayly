/**
 * Reusable Badge component styled with Panda CSS cva recipe.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 *
 * # Arguments
 * - `props`: HTML div attributes along with variant ('default' | 'secondary' | 'destructive' | 'tertiary' | 'outline' | 'warning' | 'info' | 'success').
 *
 * # Returns
 * JSX element with badge variant styling.
 *
 * # Examples
 * ```tsx
 * <Badge variant="info">New Task</Badge>
 * ```
 */
import { JSX, splitProps } from "solid-js";
import { cva, type RecipeVariantProps } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

export const badgeRecipe = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "full",
    borderWidth: "1px",
    px: "3",
    py: "1",
    fontSize: "xs",
    fontWeight: "medium",
    whiteSpace: "nowrap",
    transition: "colors 0.2s",
  },
  variants: {
    variant: {
      default: {
        borderColor: "transparent",
        bg: "primary",
        color: "onPrimary",
      },
      secondary: {
        borderColor: "transparent",
        bg: "secondaryContainer",
        color: "onSecondaryContainer",
      },
      destructive: {
        borderColor: "transparent",
        bg: "errorContainer",
        color: "onErrorContainer",
      },
      tertiary: {
        borderColor: "transparent",
        bg: "tertiaryContainer",
        color: "onTertiaryContainer",
      },
      outline: {
        borderColor: "outlineVariant",
        color: "onSurface",
      },
      warning: {
        borderColor: "transparent",
        bg: "amber.100",
        color: "amber.900",
        _dark: { bg: "amber.950/60", color: "amber.200" },
      },
      info: {
        borderColor: "transparent",
        bg: "primaryContainer",
        color: "onPrimaryContainer",
      },
      success: {
        borderColor: "transparent",
        bg: "emerald.100",
        color: "emerald.900",
        _dark: { bg: "emerald.950/60", color: "emerald.200" },
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type BadgeVariants = RecipeVariantProps<typeof badgeRecipe>;

export interface BadgeProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    BadgeVariants {
  class?: string;
  className?: string;
}

export function Badge(props: BadgeProps) {
  const [local, others] = splitProps(props, ["variant", "class", "className", "children"]);

  return (
    <div
      class={cn(badgeRecipe({ variant: local.variant }), local.class || local.className)}
      {...others}
    >
      {local.children}
    </div>
  );
}

export const badgeVariants = badgeRecipe;
