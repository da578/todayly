/**
 * Individual Task Item component with swipe gesture, drag-and-drop reordering, and deadline indicator.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-01`
 * - Design: `@design:FR-TASK-01`
 *
 * # Arguments
 * - `props`: TaskItemProps including task data, mode flags, and action callbacks.
 *
 * # Returns
 * SolidJS JSX task card with Panda CSS styling.
 */
import { createSignal, createEffect, onMount, onCleanup, Show, For } from "solid-js";
import {
  Check,
  Bell,
  Clock,
  Menu,
  Trash2,
  RotateCcw,
  Pin,
} from "lucide-solid";
import { Task, Tag } from "@/src/domain";
import { formatDayTime, getCountdownString } from "@/src/services";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";
import { createSwipeGesture } from "@/src/infrastructure";
import { TagBadge } from "@/src/presentation/components/ui/tag-badge";

export interface TaskItemProps {
  task: Task;
  index?: number;
  totalTasks?: number;
  isTrashMode?: boolean;
  isArchiveMode?: boolean;
  allTags?: Tag[];
  onToggleStatus?: (id: number) => void;
  onOpenDetail?: (task: Task) => void;
  onDeleteDirect?: (task: Task) => void;
  onRestore?: (task: Task) => void;
  onUnarchive?: (task: Task) => void;
  onArchive?: (task: Task) => void;
  onPermanentDelete?: (id: number) => void;
  onTogglePin?: (id: number) => void;
  onDragStart?: (index: number, e: DragEvent) => void;
  onDragOver?: (index: number, e: DragEvent) => void;
  onDrop?: (index: number, e: DragEvent) => void;
  onDragEnd?: () => void;
  isDragOver?: boolean;
  dragPosition?: "top" | "bottom";
  isDragging?: boolean;
}

export function TaskItem(props: TaskItemProps) {
  let cardRef: HTMLDivElement | undefined;
  let frontCardRef: HTMLDivElement | undefined;
  const [isDeleting, setIsDeleting] = createSignal(false);
  const [isRestoring, setIsRestoring] = createSignal(false);
  const [isCompleted, setIsCompleted] = createSignal(props.task.status);

  createEffect(() => {
    setIsCompleted(props.task.status);
  });

  const countdown = () => getCountdownString(props.task.deadline);
  const taskTags = () => (props.allTags || []).filter((tag) => props.task.tags?.includes(tag.id));
  const hasReminderOrDeadline = () => Boolean(props.task.reminder || props.task.deadline);

  const handleTriggerDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      props.onDeleteDirect?.(props.task);
    }, 290);
  };

  const handleTriggerPermanentDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      props.onPermanentDelete?.(props.task.id);
    }, 290);
  };

  const handleTriggerRestore = () => {
    setIsRestoring(true);
    setTimeout(() => {
      props.onRestore?.(props.task);
    }, 290);
  };

  const handleTriggerUnarchive = () => {
    setIsRestoring(true);
    setTimeout(() => {
      props.onUnarchive?.(props.task);
    }, 290);
  };

  onMount(() => {
    if (frontCardRef && !props.isTrashMode && !props.isArchiveMode && props.onDeleteDirect) {
      const cleanup = createSwipeGesture(frontCardRef, {
        onSwipeLeft: () => handleTriggerDelete(),
        threshold: 80,
      });
      onCleanup(cleanup);
    }
  });

  // Trash Mode or Archive Mode Rendering
  if (props.isTrashMode || props.isArchiveMode) {
    return (
      <div
        style={{
          "view-transition-name": `task-card-${props.task.id}`,
        }}
        class={cn(
          css({
            position: "relative",
            display: "flex",
            alignItems: "center",
            p: { base: "3.5", sm: "4" },
            gap: { base: "3", sm: "4" },
            borderRadius: "12px",
            borderWidth: "1px",
            transition: "background-color 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1), color 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            shadow: "xs",
            userSelect: "none",
            w: "full",
            minW: "0",
          }),
          isDeleting() && "animate-task-pop-out",
          isRestoring() && "animate-task-restore",
          isCompleted()
            ? css({ bg: { base: "surfaceContainerLowest", _dark: "surfaceContainerLow" }, borderColor: "outlineVariant/40" })
            : hasReminderOrDeadline()
            ? css({ bg: { base: "surfaceContainerLow", _dark: "surfaceContainer" }, borderColor: "primary/40" })
            : css({ bg: { base: "surfaceContainerLow", _dark: "surfaceContainer" }, borderColor: "outlineVariant" })
        )}
      >
        {/* Circle Checkbox */}
        <div
          class={cn(
            css({
              display: "flex",
              h: "6",
              w: "6",
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "full",
              borderWidth: "2px",
              userSelect: "none",
              transition: "background-color 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1), color 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            }),
            isCompleted()
              ? css({ bg: "primary", borderColor: "primary", color: "onPrimary" })
              : css({ borderColor: "outline", opacity: 0.6 })
          )}
        >
          <div
            class={cn(
              css({
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              }),
              isCompleted()
                ? css({ opacity: 1, transform: "scale(1)" })
                : css({ opacity: 0, transform: "scale(0.5)" })
            )}
          >
            <Check class={css({ h: "4", w: "4", strokeWidth: "3" })} />
          </div>
        </div>

        {/* Task Content */}
        <div
          onClick={() => props.onOpenDetail?.(props.task)}
          class={cn(
            css({ flex: "1", minW: "0", py: "0.5", overflow: "hidden", pl: "0.5", userSelect: "none" }),
            props.onOpenDetail && css({ cursor: "pointer" })
          )}
        >
          <h3
            class={cn(
              css({
                fontSize: "base",
                fontWeight: "semibold",
                lineHeight: "normal",
                truncate: true,
                display: "block",
                minW: "0",
                w: "full",
                transition: "color 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              }),
              isCompleted()
                ? css({ color: "onSurface/60" })
                : css({ color: "onSurface" })
            )}
            title={props.task.name}
          >
            <span
              class={cn(
                "task-strikethrough",
                isCompleted() && "active"
              )}
            >
              {props.task.name}
            </span>
          </h3>

          <Show when={props.task.description}>
            <p
              class={cn(
                css({
                  fontSize: "xs",
                  mt: "0.5",
                  truncate: true,
                  display: "block",
                  lineHeight: "normal",
                  minW: "0",
                  w: "full",
                  transition: "color 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                }),
                isCompleted()
                  ? css({ color: "onSurfaceVariant/40" })
                  : css({ color: "onSurfaceVariant" })
              )}
              title={props.task.description}
            >
              <span
                class={cn(
                  "task-strikethrough",
                  isCompleted() && "active"
                )}
              >
                {props.task.description}
              </span>
            </p>
          </Show>

          {/* Tag Pills */}
          <Show when={taskTags().length > 0}>
            <div class={css({ display: "flex", flexWrap: "wrap", gap: "1.5", mt: "1.5", maxW: "full", overflow: "hidden" })}>
              <For each={taskTags()}>
                {(tag) => (
                  <TagBadge name={tag.name} color={tag.color} size="sm" />
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Trailing Icon and Action Group */}
        <div class={css({ display: "flex", alignItems: "center", gap: "1.5", flexShrink: 0, userSelect: "none" })}>
          <Show when={props.task.reminder}>
            <div
              title={`Reminder: ${formatDayTime(props.task.reminder!)}`}
              class={css({
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                h: "7",
                w: "7",
                borderRadius: "full",
                color: "primary",
                bg: "primaryContainer",
                flexShrink: 0,
              })}
            >
              <Bell class={css({ h: "4", w: "4" })} />
            </div>
          </Show>

          <Show when={props.task.deadline}>
            <div
              title={`Deadline: ${countdown().text} (${formatDayTime(props.task.deadline!)})`}
              class={cn(
                css({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  h: "7",
                  w: "7",
                  borderRadius: "full",
                  flexShrink: 0,
                }),
                countdown().isPast
                  ? css({ color: "onErrorContainer", bg: "errorContainer", fontWeight: "semibold" })
                  : countdown().isUrgent
                  ? css({ color: "white", bg: "amber.600", fontWeight: "medium" })
                  : css({ color: "onSecondaryContainer", bg: "secondaryContainer", fontWeight: "medium" })
              )}
            >
              <Clock class={css({ h: "4", w: "4" })} />
            </div>
          </Show>

          <Show
            when={props.isTrashMode}
            fallback={
              /* Archive Actions */
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerUnarchive();
                  }}
                  class={css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    h: "8",
                    px: { base: "2", sm: "2.5" },
                    borderRadius: "8px",
                    color: "primary",
                    cursor: "pointer",
                    flexShrink: 0,
                    gap: "1.5",
                    fontSize: "xs",
                    fontWeight: "semibold",
                    _hover: { bg: "primary/10" },
                  })}
                  title="Restore task to Inbox"
                >
                  <RotateCcw class={css({ h: "4", w: "4", flexShrink: 0 })} />
                  <span class={css({ display: { base: "none", sm: "inline" } })}>Unarchive</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerDelete();
                  }}
                  class={css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    h: "8",
                    px: { base: "2", sm: "2.5" },
                    borderRadius: "8px",
                    color: "error",
                    cursor: "pointer",
                    flexShrink: 0,
                    gap: "1.5",
                    fontSize: "xs",
                    fontWeight: "semibold",
                    _hover: { bg: "error/10" },
                  })}
                  title="Move to trash"
                >
                  <Trash2 class={css({ h: "4", w: "4", flexShrink: 0 })} />
                  <span class={css({ display: { base: "none", sm: "inline" } })}>Trash</span>
                </button>
              </>
            }
          >
            {/* Trash Actions */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerRestore();
              }}
              class={css({
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                h: "8",
                px: { base: "2", sm: "2.5" },
                borderRadius: "8px",
                color: "primary",
                cursor: "pointer",
                flexShrink: 0,
                gap: "1.5",
                fontSize: "xs",
                fontWeight: "semibold",
                _hover: { bg: "primary/10" },
              })}
              title="Restore task to active list"
            >
              <RotateCcw class={css({ h: "4", w: "4", flexShrink: 0 })} />
              <span class={css({ display: { base: "none", sm: "inline" } })}>Restore</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerPermanentDelete();
              }}
              class={css({
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                h: "8",
                px: { base: "2", sm: "2.5" },
                borderRadius: "8px",
                color: "error",
                cursor: "pointer",
                flexShrink: 0,
                gap: "1.5",
                fontSize: "xs",
                fontWeight: "semibold",
                _hover: { bg: "error/10" },
              })}
              title="Delete task permanently"
            >
              <Trash2 class={css({ h: "4", w: "4", flexShrink: 0 })} />
              <span class={css({ display: { base: "none", sm: "inline" } })}>Delete</span>
            </button>
          </Show>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      style={{
        "view-transition-name": `task-card-${props.task.id}`,
      }}
      onDragOver={(e) => props.onDragOver?.(props.index ?? 0, e)}
      onDrop={(e) => props.onDrop?.(props.index ?? 0, e)}
      class={cn(
        css({
          position: "relative",
          userSelect: "none",
          w: "full",
          minW: "0",
        }),
        isDeleting() && "animate-task-pop-out",
        isRestoring() && "animate-task-restore",
        (isDeleting() || isRestoring()) && css({ zIndex: 50, position: "relative" }),
        props.isDragging && css({ opacity: 0.4, transform: "scale(0.98)" })
      )}
    >
      {/* Drag & Drop Position Indicator Line */}
      <Show when={props.isDragOver}>
        <div
          class={cn(
            css({
              position: "absolute",
              left: "0",
              right: "0",
              zIndex: 40,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              px: "1",
            }),
            props.dragPosition === "top" ? css({ top: "-2.5" }) : css({ bottom: "-2.5" }),
            "animate-in fade-in duration-150"
          )}
        >
          <div class={css({ h: "3", w: "3", borderRadius: "full", bg: "primary", flexShrink: 0, shadow: "md" })} />
          <div class={css({ flex: "1", h: "1", borderRadius: "full", bg: "primary" })} />
          <div class={css({ h: "3", w: "3", borderRadius: "full", bg: "primary", flexShrink: 0, shadow: "md" })} />
        </div>
      </Show>

      {/* Card Content Container */}
      <div
        class={cn(
          css({
            position: "relative",
            borderRadius: "12px",
            overflow: "hidden",
            transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            w: "full",
            minW: "0",
          }),
          (isDeleting() || isRestoring()) && css({ overflow: "visible", zIndex: 50 }),
          props.isDragOver && (props.dragPosition === "top" ? css({ transform: "translateY(4px)" }) : css({ transform: "translateY(-4px)" }))
        )}
      >
        {/* Swipe Reveal Action Background */}
        <div
          class={css({
            position: "absolute",
            inset: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: "6",
            bg: "errorContainer",
            color: "onErrorContainer",
            borderRadius: "12px",
          })}
        >
          <div class={css({ display: "flex", alignItems: "center", gap: "2", fontWeight: "semibold", fontSize: "xs", color: "error" })}>
            <span>Move to Trash</span>
            <Trash2 class={css({ h: "5", w: "5" })} />
          </div>
        </div>

        {/* Front Card with touch/mouse swipe and DND handle */}
        <div
          ref={frontCardRef}
          class={cn(
            css({
              position: "relative",
              display: "flex",
              alignItems: "center",
              p: { base: "3.5", sm: "4" },
              gap: { base: "3", sm: "4" },
              borderRadius: "12px",
              borderWidth: "1px",
              transition: "background-color 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              shadow: "xs",
              cursor: "pointer",
              w: "full",
              minW: "0",
              bg: { base: "surfaceContainerLow", _dark: "surfaceContainer" },
            }),
            isCompleted()
              ? css({ bg: { base: "surfaceContainerLowest", _dark: "surfaceContainerLow" }, borderColor: "outlineVariant/40" })
              : props.task.deadline && countdown().isPast
              ? css({ borderColor: "error" })
              : props.task.deadline
              ? css({ borderColor: "primary" })
              : props.task.reminder
              ? css({ borderColor: "primary/40", _hover: { borderColor: "primary/70" } })
              : css({ borderColor: "outlineVariant", _hover: { borderColor: "outline" } })
          )}
        >
          {/* Deadline blinking border indicator */}
          <Show when={props.task.deadline && !isCompleted()}>
            <div
              class={cn(
                css({
                  position: "absolute",
                  inset: "0",
                  borderRadius: "12px",
                  pointerEvents: "none",
                }),
                countdown().isPast
                  ? "border-2 border-error ring-1 ring-error/50 animate-deadline-blink-fast"
                  : "border-2 border-primary ring-1 ring-primary/40 animate-deadline-blink"
              )}
            />
          </Show>

          {/* Circle Checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCompleted(!isCompleted());
              props.onToggleStatus?.(props.task.id);
            }}
            aria-label={isCompleted() ? "Mark as incomplete" : "Mark as completed"}
            class={cn(
              css({
                display: "flex",
                h: "6",
                w: "6",
                flexShrink: 0,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "full",
                borderWidth: "2px",
                transition: "background-color 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1), color 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
              }),
              isCompleted()
                ? css({ bg: "primary", borderColor: "primary", color: "onPrimary", transform: "scale(1)" })
                : css({ borderColor: "outline", _hover: { borderColor: "primary", transform: "scale(1.05)" } })
            )}
          >
            <div
              class={cn(
                css({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                }),
                isCompleted()
                  ? css({ opacity: 1, transform: "scale(1)" })
                  : css({ opacity: 0, transform: "scale(0.5)" })
              )}
            >
              <Check class={css({ h: "4", w: "4", strokeWidth: "3" })} />
            </div>
          </button>

          {/* Content Clickable to open detail */}
          <div
            onClick={() => props.onOpenDetail?.(props.task)}
            class={css({ flex: "1", minW: "0", userSelect: "none", cursor: "pointer", py: "0.5", overflow: "hidden", pl: "0.5" })}
          >
            <div class={css({ display: "flex", alignItems: "center", gap: "2", minW: "0", w: "full" })}>
              <h3
                class={cn(
                  css({
                    fontSize: "base",
                    fontWeight: "semibold",
                    lineHeight: "normal",
                    truncate: true,
                    display: "block",
                    minW: "0",
                    flex: "1",
                    transition: "color 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }),
                  isCompleted()
                    ? css({ color: "onSurface/60" })
                    : countdown().isPast
                    ? css({ color: "onSurface", _hover: { color: "error" } })
                    : css({ color: "onSurface", _hover: { color: "primary" } })
                )}
                title={props.task.name}
              >
                <span
                  class={cn(
                    "task-strikethrough",
                    isCompleted() && "active"
                  )}
                >
                  {props.task.name}
                </span>
              </h3>
            </div>

            <Show when={props.task.description}>
              <p
                class={cn(
                  css({
                    fontSize: "xs",
                    mt: "0.5",
                    truncate: true,
                    display: "block",
                    lineHeight: "normal",
                    minW: "0",
                    w: "full",
                    transition: "color 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }),
                  isCompleted()
                    ? css({ color: "onSurfaceVariant/40" })
                    : css({ color: "onSurfaceVariant" })
                )}
                title={props.task.description}
              >
                <span
                  class={cn(
                    "task-strikethrough",
                    isCompleted() && "active"
                  )}
                >
                  {props.task.description}
                </span>
              </p>
            </Show>

            {/* Tag Pills */}
            <Show when={taskTags().length > 0}>
              <div class={css({ display: "flex", flexWrap: "wrap", gap: "1.5", mt: "1.5", maxW: "full", overflow: "hidden" })}>
                <For each={taskTags()}>
                  {(tag) => (
                    <TagBadge name={tag.name} color={tag.color} size="sm" />
                  )}
                </For>
              </div>
            </Show>
          </div>

          {/* Trailing Icon Group */}
          <div class={css({ display: "flex", alignItems: "center", gap: "1.5", flexShrink: 0, userSelect: "none" })}>
            {/* Pin Toggle Button */}
            <Show when={props.onTogglePin}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onTogglePin?.(props.task.id);
                }}
                class={cn(
                  css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    h: "7",
                    w: "7",
                    borderRadius: "8px",
                    transition: "colors 0.2s",
                    cursor: "pointer",
                  }),
                  props.task.isPinned
                    ? css({ color: "primary", bg: "primary/10" })
                    : css({ color: "onSurfaceVariant", opacity: 0.5, _hover: { opacity: 1, color: "onSurface", bg: "surfaceContainerHighest" } })
                )}
                title={props.task.isPinned ? "Unpin task" : "Pin task to top"}
              >
                <Pin
                  class={cn(
                    css({ h: "4", w: "4" }),
                    props.task.isPinned && css({ fill: "primary" })
                  )}
                />
              </button>
            </Show>

            {/* Reminder Badge */}
            <Show when={props.task.reminder}>
              <div
                onClick={() => props.onOpenDetail?.(props.task)}
                title={`Reminder: ${formatDayTime(props.task.reminder!)}`}
                class={css({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  h: "7",
                  w: "7",
                  borderRadius: "full",
                  color: "primary",
                  bg: "primaryContainer",
                  flexShrink: 0,
                  transition: "transform 0.2s",
                  cursor: "pointer",
                  _hover: { transform: "scale(1.1)" },
                })}
              >
                <Bell class={css({ h: "4", w: "4" })} />
              </div>
            </Show>

            {/* Deadline Badge */}
            <Show when={props.task.deadline}>
              <div
                onClick={() => props.onOpenDetail?.(props.task)}
                title={`Deadline: ${countdown().text} (${formatDayTime(props.task.deadline!)})`}
                class={cn(
                  css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    h: "7",
                    w: "7",
                    borderRadius: "full",
                    flexShrink: 0,
                    transition: "transform 0.2s",
                    cursor: "pointer",
                    _hover: { transform: "scale(1.1)" },
                  }),
                  props.task.status
                    ? css({ color: "onSurfaceVariant", opacity: 0.4, bg: "surfaceContainerHighest" })
                    : countdown().isPast
                    ? css({ color: "error", bg: "errorContainer" })
                    : css({ color: "primary", bg: "primaryContainer" })
                )}
              >
                <Clock class={css({ h: "4", w: "4" })} />
              </div>
            </Show>

            {/* Drag Handle: 3 Horizontal Lines (≡) */}
            <div
              draggable={true}
              onDragStart={(e) => {
                e.stopPropagation();
                if (cardRef) {
                  const rect = cardRef.getBoundingClientRect();
                  const offsetX = Math.max(10, Math.min(e.clientX - rect.left, rect.width - 10));
                  const offsetY = Math.max(10, Math.min(e.clientY - rect.top, rect.height - 10));
                  e.dataTransfer?.setDragImage(cardRef, offsetX, offsetY);
                }
                props.onDragStart?.(props.index ?? 0, e);
              }}
              onDragEnd={props.onDragEnd}
              onClick={(e) => e.stopPropagation()}
              class={css({
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                h: "7",
                w: "7",
                borderRadius: "8px",
                color: "onSurfaceVariant",
                cursor: "grab",
                transition: "colors 0.2s",
                flexShrink: 0,
                _hover: { color: "onSurface", bg: "surfaceContainerHighest" },
                _active: { cursor: "grabbing" },
              })}
              title="Drag to reorder task"
            >
              <Menu class={css({ h: "4", w: "4", pointerEvents: "none" })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
