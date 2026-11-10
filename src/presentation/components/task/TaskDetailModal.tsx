/**
 * Task details modal with undo/redo history, pin toggle, duplicate, share, and status updates.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-01`
 * - Design: `@design:FR-TASK-01`
 *
 * # Arguments
 * - `props`: TaskDetailModalProps containing selected task, tags, and callback handlers.
 *
 * # Returns
 * SolidJS JSX BottomSheet modal with comprehensive task metadata editors.
 */
import { createSignal, createEffect, onCleanup, Show, For } from "solid-js";
import {
  Undo2,
  Redo2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Copy,
  Share2,
  Trash2,
  Bell,
  Clock,
  X,
  Save,
  Check,
  Pin,
  Archive,
  Tag as TagIcon,
  AlignLeft,
} from "lucide-solid";
import { Task, Tag } from "@/src/domain";
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetFooter,
} from "@/src/presentation/components/ui/bottom-sheet";
import { Button } from "@/src/presentation/components/ui/button";
import { Input } from "@/src/presentation/components/ui/input";
import { formatDayTime, toLocalDatetimeInputValue, getCountdownString } from "@/src/services";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  allTags?: Tag[];
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (task: Task) => void;
  onDuplicateTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onArchiveTask?: (task: Task) => void;
  onTogglePin?: (id: number) => void;
}

const fallbackEmptyTask: Task = {
  id: 0,
  name: "",
  description: "",
  status: false,
  order: 0,
  reminder: null,
  deadline: null,
  isPinned: false,
  tags: [],
  onCreated: new Date().toISOString(),
  onUpdated: new Date().toISOString(),
};

export function TaskDetailModal(props: TaskDetailModalProps) {
  const [currentTask, setCurrentTask] = createSignal<Task>(props.task || fallbackEmptyTask);
  const [undoStack, setUndoStack] = createSignal<Task[]>([]);
  const [redoStack, setRedoStack] = createSignal<Task[]>([]);
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [copiedNotification, setCopiedNotification] = createSignal(false);
  const [nameError, setNameError] = createSignal(false);

  let menuRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (props.task) {
      setCurrentTask({ ...props.task });
      setUndoStack([]);
      setRedoStack([]);
      setIsMenuOpen(false);
      setNameError(false);
    }
  });

  createEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef && !menuRef.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    onCleanup(() => document.removeEventListener("mousedown", handleClickOutside));
  });

  const pushChange = (partial: Partial<Task>) => {
    setUndoStack((prev) => [...prev, currentTask()]);
    setRedoStack([]);
    setCurrentTask((prev) => ({
      ...prev,
      ...partial,
      onUpdated: new Date().toISOString(),
    }));
  };

  const handleUndo = () => {
    const stack = undoStack();
    if (stack.length === 0) return;
    const previous = stack[stack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, currentTask()]);
    setCurrentTask(previous);
  };

  const handleRedo = () => {
    const stack = redoStack();
    if (stack.length === 0) return;
    const next = stack[stack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, currentTask()]);
    setCurrentTask(next);
  };

  const handleSave = () => {
    if (!currentTask().name.trim()) {
      setNameError(true);
      return;
    }
    props.onUpdateTask(currentTask());
    props.onOpenChange(false);
  };

  const handleShare = async () => {
    const t = currentTask();
    const shareText = `Task: ${t.name}\n${
      t.description ? `Description: ${t.description}\n` : ""
    }${t.deadline ? `Deadline: ${formatDayTime(t.deadline)}\n` : ""}${
      t.reminder ? `Reminder: ${formatDayTime(t.reminder)}\n` : ""
    }Status: ${t.status ? "Completed" : "In Progress"}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t.name,
          text: shareText,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    } catch {
      // Ignore
    }
  };

  const toggleTag = (tagId: string) => {
    const currentTags = currentTask().tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId];
    pushChange({ tags: newTags });
  };

  const countdown = () => getCountdownString(currentTask().deadline);

  return (
    <BottomSheet open={props.open} onOpenChange={props.onOpenChange}>
      <BottomSheetHeader class={css({ borderBottomWidth: "1px", borderColor: "outlineVariant", pb: "3" })}>
        <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
          <div>
            <BottomSheetTitle class={css({ fontSize: "xl", fontWeight: "bold", letterSpacing: "tight", color: "onSurface" })}>
              Task Details
            </BottomSheetTitle>
            <BottomSheetDescription class={css({ fontSize: "xs", color: "onSurfaceVariant" })}>
              Created {formatDayTime(currentTask().onCreated || new Date().toISOString())}
            </BottomSheetDescription>
          </div>

          {/* Action Icons in Header */}
          <div class={css({ display: "flex", alignItems: "center", gap: "1" })}>
            {/* Undo */}
            <button
              type="button"
              disabled={undoStack().length === 0}
              onClick={handleUndo}
              class={cn(
                css({ p: "2", borderRadius: "12px", transition: "colors 0.2s", cursor: "pointer" }),
                undoStack().length === 0
                  ? css({ color: "onSurfaceVariant", opacity: 0.3, cursor: "not-allowed" })
                  : css({ color: "onSurface", _hover: { bg: "surfaceContainerHighest" } })
              )}
              title="Undo change"
            >
              <Undo2 class={css({ h: "4", w: "4" })} />
            </button>

            {/* Redo */}
            <button
              type="button"
              disabled={redoStack().length === 0}
              onClick={handleRedo}
              class={cn(
                css({ p: "2", borderRadius: "12px", transition: "colors 0.2s", cursor: "pointer" }),
                redoStack().length === 0
                  ? css({ color: "onSurfaceVariant", opacity: 0.3, cursor: "not-allowed" })
                  : css({ color: "onSurface", _hover: { bg: "surfaceContainerHighest" } })
              )}
              title="Redo change"
            >
              <Redo2 class={css({ h: "4", w: "4" })} />
            </button>

            {/* Pin Toggle */}
            <button
              type="button"
              onClick={() => pushChange({ isPinned: !currentTask().isPinned })}
              class={cn(
                css({ p: "2", borderRadius: "12px", transition: "colors 0.2s", cursor: "pointer" }),
                currentTask().isPinned
                  ? css({ color: "primary", bg: "primary/10" })
                  : css({ color: "onSurfaceVariant", _hover: { color: "onSurface", bg: "surfaceContainerHighest" } })
              )}
              title={currentTask().isPinned ? "Unpin task" : "Pin task"}
            >
              <Pin class={cn(css({ h: "4", w: "4" }), currentTask().isPinned && css({ fill: "primary" }))} />
            </button>

            {/* More Menu Dropdown */}
            <div class={css({ position: "relative" })} ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen())}
                class={css({ p: "2", borderRadius: "12px", color: "onSurface", cursor: "pointer", transition: "colors 0.2s", _hover: { bg: "surfaceContainerHighest" } })}
                title="More actions"
              >
                <MoreVertical class={css({ h: "4", w: "4" })} />
              </button>

              <Show when={isMenuOpen()}>
                <div
                  class={cn(
                    css({
                      position: "absolute",
                      right: "0",
                      mt: "2",
                      w: "56",
                      borderRadius: "12px",
                      borderWidth: "1px",
                      borderColor: "outlineVariant",
                      bg: "surfaceContainerHigh",
                      p: "2",
                      shadow: "xl",
                      zIndex: 50,
                      transformOrigin: "top right",
                    }),
                    "animate-dropdown-spring"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      pushChange({ status: !currentTask().status });
                    }}
                    class={css({ w: "full", display: "flex", alignItems: "center", gap: "3", px: "3", py: "2", fontSize: "xs", borderRadius: "10px", color: "onSurface", cursor: "pointer", _hover: { bg: "surfaceContainerHighest" } })}
                  >
                    <Show
                      when={currentTask().status}
                      fallback={
                        <>
                          <CheckCircle2 class={css({ h: "4", w: "4", color: "emerald.500" })} />
                          <span>Mark as finished</span>
                        </>
                      }
                    >
                      <XCircle class={css({ h: "4", w: "4", color: "amber.500" })} />
                      <span>Mark as unfinished</span>
                    </Show>
                  </button>

                  <Show when={props.onArchiveTask}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        props.onArchiveTask?.(currentTask());
                        props.onOpenChange(false);
                      }}
                      class={css({ w: "full", display: "flex", alignItems: "center", gap: "3", px: "3", py: "2", fontSize: "xs", borderRadius: "10px", color: "onSurface", cursor: "pointer", _hover: { bg: "surfaceContainerHighest" } })}
                    >
                      <Archive class={css({ h: "4", w: "4", color: "secondary" })} />
                      <span>Move to Archive</span>
                    </button>
                  </Show>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      props.onDuplicateTask(currentTask());
                      props.onOpenChange(false);
                    }}
                    class={css({ w: "full", display: "flex", alignItems: "center", gap: "3", px: "3", py: "2", fontSize: "xs", borderRadius: "10px", color: "onSurface", cursor: "pointer", _hover: { bg: "surfaceContainerHighest" } })}
                  >
                    <Copy class={css({ h: "4", w: "4", color: "primary" })} />
                    <span>Duplicate Task</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleShare();
                    }}
                    class={css({ w: "full", display: "flex", alignItems: "center", gap: "3", px: "3", py: "2", fontSize: "xs", borderRadius: "10px", color: "onSurface", cursor: "pointer", _hover: { bg: "surfaceContainerHighest" } })}
                  >
                    <Share2 class={css({ h: "4", w: "4", color: "primary" })} />
                    <span>Share Task</span>
                  </button>

                  <div class={css({ my: "1", borderTopWidth: "1px", borderColor: "outlineVariant/40" })} />

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      props.onDeleteTask(currentTask());
                    }}
                    class={css({ w: "full", display: "flex", alignItems: "center", gap: "3", px: "3", py: "2", fontSize: "xs", borderRadius: "10px", color: "error", cursor: "pointer", _hover: { bg: "errorContainer" } })}
                  >
                    <Trash2 class={css({ h: "4", w: "4" })} />
                    <span>Delete Task</span>
                  </button>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </BottomSheetHeader>

      <div class={css({ flex: "1", minH: "0", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4", py: "3" })}>
        {/* Task Name and Status Toggle */}
        <div class={css({ display: "flex", alignItems: "flex-start", gap: "4", bg: "surfaceContainerHighest", p: "4", borderRadius: "12px", borderWidth: "1px", borderColor: "outlineVariant" })}>
          <button
            type="button"
            onClick={() => pushChange({ status: !currentTask().status })}
            class={cn(
              css({
                mt: "1",
                display: "flex",
                h: "8",
                w: "8",
                flexShrink: 0,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "full",
                borderWidth: "2px",
                transition: "all 0.2s",
                cursor: "pointer",
              }),
              currentTask().status
                ? css({ bg: "primary", borderColor: "primary", color: "onPrimary" })
                : css({ borderColor: "outline", _hover: { borderColor: "primary" } })
            )}
            title="Toggle completed state"
          >
            <Show when={currentTask().status}>
              <Check class={css({ h: "4", w: "4", strokeWidth: "3" })} />
            </Show>
          </button>

          <div class={css({ flex: "1" })}>
            <textarea
              value={currentTask().name}
              onInput={(e) => {
                setNameError(false);
                pushChange({ name: e.currentTarget.value });
              }}
              rows={2}
              placeholder="Task name..."
              class={cn(
                css({ w: "full", bg: "transparent", fontSize: "xl", fontWeight: "bold", outline: "none", resize: "none", transition: "colors 0.2s" }),
                currentTask().status
                  ? css({ textDecoration: "line-through", color: "onSurfaceVariant" })
                  : css({ color: "onSurface" })
              )}
            />
            <Show when={nameError()}>
              <p class={css({ fontSize: "xs", color: "error", fontWeight: "medium", mb: "1" })}>
                Task name cannot be empty
              </p>
            </Show>
            <div class={css({ fontSize: "xs", color: "onSurfaceVariant", mt: "1" })}>
              Status: <span class={css({ fontWeight: "semibold", color: "onSurface" })}>{currentTask().status ? "Completed" : "In Progress"}</span>
            </div>
          </div>
        </div>

        {/* Tags Selector */}
        <Show when={(props.allTags || []).length > 0}>
          <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
            <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", display: "flex", alignItems: "center", gap: "1.5" })}>
              <TagIcon class={css({ h: "3.5", w: "3.5" })} />
              <span>Tags</span>
            </label>
            <div class={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
              <For each={props.allTags}>
                {(tag) => {
                  const isSelected = () => currentTask().tags?.includes(tag.id);
                  return (
                    <button
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      class={cn(
                        css({
                          px: "3",
                          py: "1.5",
                          borderRadius: "full",
                          fontSize: "xs",
                          fontWeight: "semibold",
                          borderWidth: "1px",
                          transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "1.5",
                          userSelect: "none",
                        }),
                        isSelected()
                          ? css({ shadow: "xs" })
                          : css({ bg: "surfaceContainer", borderColor: "outlineVariant", color: "onSurface", _hover: { bg: "surfaceContainerHigh", borderColor: "outline" } })
                      )}
                      style={
                        isSelected()
                          ? {
                              "background-color": `${tag.color}28`,
                              "border-color": tag.color,
                              color: tag.color,
                            }
                          : {}
                      }
                    >
                      <span
                        class={css({
                          h: "2",
                          w: "2",
                          borderRadius: "full",
                          flexShrink: 0,
                          transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                        })}
                        style={{
                          "background-color": tag.color,
                          ...(isSelected()
                            ? { transform: "scale(1.2)" }
                            : { transform: "scale(1)" }),
                        }}
                      />
                      <span
                        class={css({ transition: "color 300ms cubic-bezier(0.4, 0, 0.2, 1)" })}
                        style={isSelected() ? { color: tag.color } : {}}
                      >
                        {tag.name}
                      </span>
                    </button>
                  );
                }}
              </For>
            </div>
          </div>
        </Show>

        {/* Task Description */}
        <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
          <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", display: "flex", alignItems: "center", gap: "1.5", userSelect: "none" })}>
            <AlignLeft class={css({ h: "3.5", w: "3.5" })} />
            <span>Description</span>
          </label>
          <textarea
            value={currentTask().description}
            onInput={(e) => pushChange({ description: e.currentTarget.value })}
            placeholder="Add detailed task notes, checklist items, or links..."
            rows={4}
            class={css({
              w: "full",
              borderRadius: "12px",
              borderWidth: "1px",
              borderColor: "outlineVariant",
              bg: "surfaceContainerHighest",
              p: "4",
              fontSize: "base",
              color: "onSurface",
              outline: "none",
              resize: "none",
              transition: "colors 0.2s",
              lineHeight: "relaxed",
              "&::placeholder": { color: "onSurfaceVariant", opacity: 0.7 },
              _focusVisible: { borderColor: "primary" },
            })}
          />
        </div>

        {/* Reminder Selector */}
        <div class={css({ borderRadius: "12px", borderWidth: "1px", borderColor: "outlineVariant", bg: "surfaceContainer", p: "4", display: "flex", flexDirection: "column", gap: "3" })}>
          <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
            <div class={css({ display: "flex", alignItems: "center", gap: "3" })}>
              <div class={css({ p: "2", borderRadius: "10px", bg: "primaryContainer", color: "onPrimaryContainer" })}>
                <Bell class={css({ h: "4", w: "4" })} />
              </div>
              <div>
                <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface" })}>Reminder</div>
                <div class={css({ fontSize: "xs", color: "onSurfaceVariant" })}>
                  {currentTask().reminder
                    ? formatDayTime(currentTask().reminder!)
                    : "No reminder scheduled"}
                </div>
              </div>
            </div>

            <Show when={currentTask().reminder}>
              <button
                type="button"
                onClick={() => pushChange({ reminder: null })}
                class={css({ p: "2", color: "onSurfaceVariant", borderRadius: "10px", cursor: "pointer", transition: "colors 0.2s", _hover: { color: "error" } })}
                title="Remove reminder"
              >
                <X class={css({ h: "4", w: "4" })} />
              </button>
            </Show>
          </div>

          <div class={css({ pt: "1" })}>
            <Input
              type="datetime-local"
              value={toLocalDatetimeInputValue(currentTask().reminder)}
              onInput={(e) => {
                const val = e.currentTarget.value;
                pushChange({ reminder: val ? new Date(val).toISOString() : null });
              }}
              class={css({ h: "10", fontSize: "xs", borderRadius: "10px" })}
            />
          </div>
        </div>

        {/* Deadline Selector */}
        <div class={css({ borderRadius: "12px", borderWidth: "1px", borderColor: "outlineVariant", bg: "surfaceContainer", p: "4", display: "flex", flexDirection: "column", gap: "3" })}>
          <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
            <div class={css({ display: "flex", alignItems: "center", gap: "3" })}>
              <div class={css({ p: "2", borderRadius: "10px", bg: "amber.500/20", color: "amber.600" })}>
                <Clock class={css({ h: "4", w: "4" })} />
              </div>
              <div>
                <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface", display: "flex", alignItems: "center", gap: "2" })}>
                  Deadline
                  <Show when={countdown().text}>
                    <span
                      class={cn(
                        css({ fontSize: "xs", px: "2", py: "1", borderRadius: "8px", fontWeight: "bold", textTransform: "uppercase" }),
                        countdown().isPast
                          ? css({ bg: "errorContainer", color: "onErrorContainer" })
                          : countdown().isUrgent
                          ? css({ bg: "amber.600", color: "white" })
                          : css({ bg: "secondaryContainer", color: "onSecondaryContainer" })
                      )}
                    >
                      {countdown().text}
                    </span>
                  </Show>
                </div>
                <div class={css({ fontSize: "xs", color: "onSurfaceVariant" })}>
                  {currentTask().deadline
                    ? formatDayTime(currentTask().deadline!)
                    : "No deadline specified"}
                </div>
              </div>
            </div>

            <Show when={currentTask().deadline}>
              <button
                type="button"
                onClick={() => pushChange({ deadline: null })}
                class={css({ p: "2", color: "onSurfaceVariant", borderRadius: "10px", cursor: "pointer", transition: "colors 0.2s", _hover: { color: "error" } })}
                title="Remove deadline"
              >
                <X class={css({ h: "4", w: "4" })} />
              </button>
            </Show>
          </div>

          <div class={css({ pt: "1" })}>
            <Input
              type="datetime-local"
              value={toLocalDatetimeInputValue(currentTask().deadline)}
              onInput={(e) => {
                const val = e.currentTarget.value;
                pushChange({ deadline: val ? new Date(val).toISOString() : null });
              }}
              class={css({ h: "10", fontSize: "xs", borderRadius: "10px" })}
            />
          </div>
        </div>

        <Show when={copiedNotification()}>
          <div class={cn(css({ p: "3", borderRadius: "12px", bg: "primaryContainer", color: "onPrimaryContainer", borderWidth: "1px", borderColor: "primary/20", fontSize: "xs", textAlign: "center", fontWeight: "medium" }), "animate-in fade-in-50")}>
            Task details copied to clipboard!
          </div>
        </Show>
      </div>

      {/* Footer with Save Button */}
      <BottomSheetFooter class={css({ mt: "auto", flexShrink: 0 })}>
        <Button
          type="button"
          onClick={handleSave}
          class={css({ w: "full", h: "12", py: "0", borderRadius: "12px", bg: "primary", color: "onPrimary", gap: "2", fontWeight: "semibold", fontSize: "base", shadow: "sm", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" })}
        >
          <Save class={css({ h: "5", w: "5", flexShrink: 0 })} />
          <span>Save Changes</span>
        </Button>
      </BottomSheetFooter>
    </BottomSheet>
  );
}
