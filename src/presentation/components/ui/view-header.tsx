/**
 * Reusable Sticky View Header component with navigation button, title, and actions slot.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 */
import { JSX, Show } from "solid-js";
import { ArrowLeft, Menu } from "lucide-solid";
import { Button } from "@/src/presentation/components/ui/button";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

export interface ViewHeaderProps {
  title: string | JSX.Element;
  onBack?: () => void;
  onOpenDrawer?: () => void;
  actions?: JSX.Element;
  class?: string;
  className?: string;
  backLabel?: string;
}

export function ViewHeader(props: ViewHeaderProps) {
  return (
    <header
      class={cn(
        css({
          position: "sticky",
          top: "0",
          zIndex: 30,
          w: "full",
          bg: "surface/90",
          backdropFilter: "blur(12px)",
          borderBottomWidth: "1px",
          borderColor: "outlineVariant",
        }),
        props.class || props.className
      )}
    >
      <div
        class={css({
          maxW: "7xl",
          mx: "auto",
          px: { base: "4", sm: "6", lg: "8" },
          h: "16",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "3",
          position: "relative",
        })}
      >
        {/* Navigation & Title */}
        <div class={css({ display: "flex", alignItems: "center", gap: "2", minW: "0", userSelect: "none" })}>
          <Show when={props.onOpenDrawer || props.onBack}>
            <Show
              when={props.onOpenDrawer}
              fallback={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={props.onBack}
                  class={css({ borderRadius: "full", color: "onSurface", cursor: "pointer", ml: "-1", flexShrink: 0 })}
                  aria-label={props.backLabel || "Back"}
                >
                  <ArrowLeft class={css({ h: "5", w: "5" })} />
                </Button>
              }
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={props.onOpenDrawer}
                class={css({ borderRadius: "full", color: "onSurface", cursor: "pointer", ml: "-1", flexShrink: 0 })}
                title="Open Navigation Drawer"
                aria-label="Open Navigation Drawer"
              >
                <Menu class={css({ h: "5", w: "5" })} />
              </Button>
            </Show>
          </Show>

          <h1
            class={css({
              fontSize: "xl",
              fontWeight: "bold",
              letterSpacing: "tight",
              color: "onSurface",
              lineHeight: "none",
              truncate: true,
            })}
          >
            {props.title}
          </h1>
        </div>

        {/* Right Actions Slot */}
        <Show when={props.actions}>
          <div class={css({ display: "flex", alignItems: "center", gap: "2", flexShrink: 0 })}>
            {props.actions}
          </div>
        </Show>
      </div>
    </header>
  );
}
