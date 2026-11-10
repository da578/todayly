/**
 * Reusable Confirmation Dialog for destructive or important actions.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 */
import { JSX, Show } from "solid-js";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/presentation/components/ui/dialog";
import { Button } from "@/src/presentation/components/ui/button";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | JSX.Element;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  icon?: (props: { class?: string }) => JSX.Element;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const isDestructive = () => props.variant === "destructive";

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogHeader onClose={() => props.onOpenChange(false)}>
        <DialogTitle
          class={cn(
            css({ display: "flex", alignItems: "center", gap: "2.5" }),
            isDestructive() ? css({ color: "error" }) : css({ color: "onSurface" })
          )}
        >
          <Show when={props.icon}>
            {(IconComp) => (
              <span class={css({ display: "inline-flex", flexShrink: 0 })}>
                {IconComp()({
                  class: cn(
                    css({ h: "5", w: "5" }),
                    isDestructive() ? css({ color: "error" }) : css({ color: "primary" })
                  ),
                })}
              </span>
            )}
          </Show>
          <span>{props.title}</span>
        </DialogTitle>
        <DialogDescription class={css({ mt: "1.5" })}>
          {props.description}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => props.onOpenChange(false)}
          disabled={props.isLoading}
        >
          {props.cancelText || "Cancel"}
        </Button>
        <Button
          type="button"
          variant={isDestructive() ? "destructive" : "default"}
          onClick={() => {
            props.onConfirm();
            props.onOpenChange(false);
          }}
          disabled={props.isLoading}
        >
          {props.confirmText || "Confirm"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
