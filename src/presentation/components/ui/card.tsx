/**
 * Card component suite styled with Panda CSS.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 *
 * # Arguments
 * - `props`: Standard HTML div / heading / paragraph properties.
 *
 * # Returns
 * SolidJS JSX element container styled with Material 3 surface elevation.
 */
import { JSX, splitProps } from "solid-js";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

const cardStyle = css({
  borderRadius: "16px",
  borderWidth: "1px",
  borderColor: "outlineVariant",
  bg: { base: "surfaceContainerLow", _dark: "surfaceContainer" },
  color: "onSurface",
  shadow: "xs",
  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
});

export function Card(props: JSX.HTMLAttributes<HTMLDivElement> & { class?: string; className?: string }) {
  const [local, others] = splitProps(props, ["class", "className", "children"]);
  return (
    <div class={cn(cardStyle, local.class || local.className)} {...others}>
      {local.children}
    </div>
  );
}

export function CardHeader(props: JSX.HTMLAttributes<HTMLDivElement> & { class?: string; className?: string }) {
  const [local, others] = splitProps(props, ["class", "className", "children"]);
  return (
    <div
      class={cn(
        css({ display: "flex", flexDirection: "column", gap: "2", p: "6" }),
        local.class || local.className
      )}
      {...others}
    >
      {local.children}
    </div>
  );
}

export function CardTitle(props: JSX.HTMLAttributes<HTMLHeadingElement> & { class?: string; className?: string }) {
  const [local, others] = splitProps(props, ["class", "className", "children"]);
  return (
    <h3
      class={cn(
        css({
          fontSize: "xl",
          fontWeight: "bold",
          lineHeight: "tight",
          letterSpacing: "tight",
          color: "onSurface",
        }),
        local.class || local.className
      )}
      {...others}
    >
      {local.children}
    </h3>
  );
}

export function CardDescription(props: JSX.HTMLAttributes<HTMLParagraphElement> & { class?: string; className?: string }) {
  const [local, others] = splitProps(props, ["class", "className", "children"]);
  return (
    <p
      class={cn(
        css({ fontSize: "xs", color: "onSurfaceVariant", lineHeight: "normal" }),
        local.class || local.className
      )}
      {...others}
    >
      {local.children}
    </p>
  );
}

export function CardContent(props: JSX.HTMLAttributes<HTMLDivElement> & { class?: string; className?: string }) {
  const [local, others] = splitProps(props, ["class", "className", "children"]);
  return (
    <div class={cn(css({ p: "6", pt: "0" }), local.class || local.className)} {...others}>
      {local.children}
    </div>
  );
}

export function CardFooter(props: JSX.HTMLAttributes<HTMLDivElement> & { class?: string; className?: string }) {
  const [local, others] = splitProps(props, ["class", "className", "children"]);
  return (
    <div
      class={cn(
        css({ display: "flex", alignItems: "center", p: "6", pt: "0" }),
        local.class || local.className
      )}
      {...others}
    >
      {local.children}
    </div>
  );
}
