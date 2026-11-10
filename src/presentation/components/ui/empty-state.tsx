/**
 * Reusable Empty State component for lists, search results, archives, and trash views.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-01`
 * - Design: `@design:FR-TASK-01`
 */
import { JSX, Show } from "solid-js";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

export interface EmptyStateProps {
  icon?: (props: { class?: string }) => JSX.Element;
  title: string;
  description?: string | JSX.Element;
  action?: JSX.Element;
  children?: JSX.Element;
  minHeight?: string;
  iconColor?: "primary" | "muted";
  class?: string;
  className?: string;
}

export function EmptyState(props: EmptyStateProps) {
  const isMuted = () => props.iconColor === "muted";

  return (
    <div
      class={cn(
        css({
          flex: "1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { base: "4", sm: "6", lg: "8" },
          py: "8",
          textAlign: "center",
          userSelect: "none",
          w: "full",
          maxW: "7xl",
          mx: "auto",
          my: "auto",
        }),
        props.class || props.className
      )}
      style={{
        "min-height": props.minHeight || "calc(100dvh - 140px)",
      }}
    >
      <Show when={props.icon}>
        {(IconComp) => (
          <div class={css({ mb: "4", flexShrink: 0 })}>
            {IconComp()({
              class: cn(
                css({ h: "16", w: "16", flexShrink: 0 }),
                isMuted() ? css({ color: "onSurfaceVariant" }) : css({ color: "primary" })
              ),
            })}
          </div>
        )}
      </Show>

      <h3 class={css({ fontSize: "xl", fontWeight: "bold", color: "onSurface" })}>
        {props.title}
      </h3>

      <Show when={props.description}>
        <div
          class={css({
            fontSize: "xs",
            color: "onSurfaceVariant",
            maxW: "xs",
            mx: "auto",
            mt: "2",
            mb: props.action || props.children ? "6" : "0",
            lineHeight: "relaxed",
            textAlign: "center",
          })}
        >
          {props.description}
        </div>
      </Show>

      <Show when={props.action}>
        <div class={css({ w: "full", maxW: "xs" })}>
          {props.action}
        </div>
      </Show>

      <Show when={props.children}>
        {props.children}
      </Show>
    </div>
  );
}
