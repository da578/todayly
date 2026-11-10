/**
 * Toast notifications container styled with Panda CSS.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 *
 * # Arguments
 * - `props`: ToastProps containing toasts array and onDismiss callback.
 *
 * # Returns
 * SolidJS JSX floating toast notifications.
 */
import { For, Show } from "solid-js";
import { CheckCircle2, AlertCircle, X } from "lucide-solid";
import { ToastMessage } from "@/src/domain";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

const toastContainerStyle = css({
  position: "fixed",
  top: "4",
  right: "4",
  zIndex: 50,
  display: "flex",
  flexDirection: "column",
  gap: "2",
  maxW: "sm",
  w: "full",
  pointerEvents: "none",
  px: "4",
});

const toastItemBase = css({
  pointerEvents: "auto",
  display: "flex",
  alignItems: "flex-start",
  gap: "3",
  p: "3.5",
  borderRadius: "2xl",
  borderWidth: "1px",
  shadow: "xl",
  backdropFilter: "blur(12px)",
  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
});

export function ToastContainer(props: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  return (
    <Show when={props.toasts.length > 0}>
      <div class={toastContainerStyle}>
        <For each={props.toasts}>
          {(toast) => (
            <div
              class={cn(
                toastItemBase,
                toast.type === "error"
                  ? css({ bg: "error", borderColor: "error", color: "onError" })
                  : toast.type === "warning"
                  ? css({ bg: "amber.600", borderColor: "amber.600", color: "white" })
                  : css({ bg: "surfaceContainerHigh", borderColor: "outlineVariant", color: "onSurface" }),
                "animate-in slide-in-from-top-3 fade-in duration-200"
              )}
            >
              <Show
                when={toast.type === "error" || toast.type === "warning"}
                fallback={<CheckCircle2 class={css({ h: "5", w: "5", flexShrink: 0, mt: "0.5", color: "primary" })} />}
              >
                <AlertCircle class={css({ h: "5", w: "5", flexShrink: 0, mt: "0.5", color: "white" })} />
              </Show>

              <div class={css({ flex: "1", minW: "0" })}>
                <div class={css({ fontSize: "xs", fontWeight: "bold", lineHeight: "tight" })}>{toast.title}</div>
                <Show when={toast.description}>
                  <div class={css({ fontSize: "11px", opacity: 0.9, mt: "0.5", lineHeight: "snug" })}>
                    {toast.description}
                  </div>
                </Show>
              </div>

              <button
                type="button"
                onClick={() => props.onDismiss(toast.id)}
                class={css({
                  p: "1",
                  borderRadius: "md",
                  opacity: 0.7,
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  _hover: { opacity: 1 },
                })}
                aria-label="Dismiss toast"
              >
                <X class={css({ h: "3.5", w: "3.5" })} />
              </button>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
}
