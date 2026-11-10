/**
 * Task creation modal supporting both detailed task creation and quick notes entry.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-01`
 * - Design: `@design:FR-TASK-01`
 *
 * # Arguments
 * - `props`: TaskCreateModalProps including tag list, initial values, and creation handlers.
 *
 * # Returns
 * SolidJS JSX BottomSheet modal with animated mode switcher and input validation.
 */
import { createSignal, createEffect, onCleanup, Show, For } from "solid-js";
import {
  Plus,
  Bell,
  Clock,
  Tag as TagIcon,
  Zap,
  FileEdit,
  Type,
  AlignLeft,
} from "lucide-solid";
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetFooter,
} from "@/src/presentation/components/ui/bottom-sheet";
import { Button } from "@/src/presentation/components/ui/button";
import { Input } from "@/src/presentation/components/ui/input";
import { Tag } from "@/src/domain";
import { toLocalDatetimeInputValue, formatDayTime } from "@/src/services";
import { requestNotificationPermission } from "@/src/infrastructure";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

export type CreateTaskModalMode = "create" | "quick";

interface TaskCreateModalProps {
  open: boolean;
  allTags?: Tag[];
  defaultTagId?: string;
  defaultMode?: CreateTaskModalMode;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (data: {
    name: string;
    description?: string;
    reminder: string | null;
    deadline: string | null;
    tags?: string[];
  }) => void;
  onQuickCreateTask?: (name: string) => void;
}

function getSlideAnimationClass(direction: "left" | "right" | null): string {
  if (direction === "right") return "animate-swipe-right";
  if (direction === "left") return "animate-swipe-left";
  return "";
}

export function TaskCreateModal(props: TaskCreateModalProps) {
  const [userSelectedMode, setUserSelectedMode] = createSignal<CreateTaskModalMode | null>(null);
  const activeMode = () => userSelectedMode() ?? props.defaultMode ?? "create";
  const [slideDirection, setSlideDirection] = createSignal<"left" | "right" | null>(null);

  // Form states for detailed Create Task
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [reminder, setReminder] = createSignal<string | null>(null);
  const [deadline, setDeadline] = createSignal<string | null>(null);
  const [selectedTags, setSelectedTags] = createSignal<string[]>([]);
  const [showReminderPicker, setShowReminderPicker] = createSignal(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = createSignal(false);

  // Form state for Quick Note
  const [quickText, setQuickText] = createSignal("");

  let createInputRef: HTMLInputElement | undefined;
  let quickInputRef: HTMLInputElement | undefined;

  createEffect(() => {
    if (!props.open) {
      const timer = setTimeout(() => {
        setUserSelectedMode(null);
        setSlideDirection(null);
      }, 300);
      onCleanup(() => clearTimeout(timer));
      return;
    }
    setSlideDirection(null);
    const initMode = props.defaultMode || "create";
    setName("");
    setDescription("");
    setQuickText("");
    setReminder(null);
    setDeadline(null);
    setSelectedTags(props.defaultTagId ? [props.defaultTagId] : []);
    setShowReminderPicker(false);
    setShowDeadlinePicker(false);

    setTimeout(() => {
      const targetRef = initMode === "quick" ? quickInputRef : createInputRef;
      targetRef?.focus({ preventScroll: true });
    }, 100);
  });

  const handleSwitchMode = (targetMode: CreateTaskModalMode) => {
    if (targetMode === activeMode()) return;
    const direction = targetMode === "quick" ? "right" : "left";
    setSlideDirection(direction);
    setUserSelectedMode(targetMode);
    setTimeout(() => {
      const targetRef = targetMode === "quick" ? quickInputRef : createInputRef;
      targetRef?.focus({ preventScroll: true });
    }, 50);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleDetailedSubmit = (e?: Event) => {
    if (e) e.preventDefault();
    const trimmed = name().trim();
    if (!trimmed) return;

    if (deadline()) {
      requestNotificationPermission().catch(() => {});
    }

    props.onCreateTask({
      name: trimmed,
      description: description().trim(),
      reminder: reminder(),
      deadline: deadline(),
      tags: selectedTags(),
    });
    props.onOpenChange(false);
  };

  const handleQuickSubmit = (e?: Event) => {
    if (e) e.preventDefault();
    const trimmed = quickText().trim();
    if (!trimmed) return;

    if (props.onQuickCreateTask) {
      props.onQuickCreateTask(trimmed);
      setQuickText("");
      props.onOpenChange(false);
      return;
    }

    props.onCreateTask({
      name: trimmed,
      description: "",
      reminder: null,
      deadline: null,
      tags: selectedTags(),
    });
    setQuickText("");
    props.onOpenChange(false);
  };

  const setQuickReminder = (hoursAhead: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hoursAhead, 0, 0, 0);
    setReminder(d.toISOString());
    setShowReminderPicker(true);
  };

  const setQuickDeadline = (daysAhead: number, targetHour: number = 20) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(targetHour, 0, 0, 0);
    setDeadline(d.toISOString());
    setShowDeadlinePicker(true);
    requestNotificationPermission().catch(() => {});
  };

  return (
    <BottomSheet open={props.open} onOpenChange={props.onOpenChange}>
      <BottomSheetHeader onClose={() => props.onOpenChange(false)}>
        <div class={css({ display: "flex", flexDirection: "column", gap: { base: "2.5", sm: "2" } })}>
          <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
            <BottomSheetTitle class={css({ fontSize: "xl", fontWeight: "bold", letterSpacing: "tight", color: "onSurface" })}>
              {activeMode() === "create" ? "Create Task" : "Quick Note"}
            </BottomSheetTitle>

            {/* Mode Switcher Toggle Button (desktop) */}
            <div class={css({ display: { base: "none", sm: "flex" }, position: "relative", alignItems: "center", bg: "surfaceContainerHighest", borderRadius: "12px", p: "1", borderWidth: "1px", borderColor: "outlineVariant", userSelect: "none" })}>
              <div
                class={cn(
                  css({
                    position: "absolute",
                    top: "1",
                    bottom: "1",
                    w: "calc(50% - 4px)",
                    borderRadius: "9px",
                    bg: "primary",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    shadow: "xs",
                    pointerEvents: "none",
                  }),
                  activeMode() === "create" ? css({ left: "1" }) : css({ left: "calc(50% + 2px)" })
                )}
              />

              <button
                type="button"
                onClick={() => handleSwitchMode("create")}
                class={cn(
                  css({
                    position: "relative",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5",
                    px: "3.5",
                    py: "1.5",
                    borderRadius: "9px",
                    fontSize: "xs",
                    fontWeight: "semibold",
                    transition: "colors 0.3s",
                    cursor: "pointer",
                    userSelect: "none",
                  }),
                  activeMode() === "create"
                    ? css({ color: "onPrimary", fontWeight: "bold" })
                    : css({ color: "onSurfaceVariant", _hover: { color: "onSurface" } })
                )}
              >
                <FileEdit class={css({ h: "3.5", w: "3.5" })} />
                <span>Create Task</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode("quick")}
                class={cn(
                  css({
                    position: "relative",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5",
                    px: "3.5",
                    py: "1.5",
                    borderRadius: "9px",
                    fontSize: "xs",
                    fontWeight: "semibold",
                    transition: "colors 0.3s",
                    cursor: "pointer",
                    userSelect: "none",
                  }),
                  activeMode() === "quick"
                    ? css({ color: "onPrimary", fontWeight: "bold" })
                    : css({ color: "onSurfaceVariant", _hover: { color: "onSurface" } })
                )}
              >
                <Zap class={css({ h: "3.5", w: "3.5" })} />
                <span>Quick Note</span>
              </button>
            </div>
          </div>

          {/* Modal Description */}
          <div class={css({ minH: "22px", overflow: "hidden" })}>
            <Show
              when={activeMode() === "create"}
              fallback={
                <p class={cn(css({ fontSize: "xs", color: "onSurfaceVariant", lineHeight: "normal", m: "0", p: "0" }), "animate-mode-fade")}>
                  Type your task title and hit Enter to add immediately to your inbox.
                </p>
              }
            >
              <p class={cn(css({ fontSize: "xs", color: "onSurfaceVariant", lineHeight: "normal", m: "0", p: "0" }), "animate-mode-fade")}>
                Add a detailed task with description, tags, reminder, and deadline.
              </p>
            </Show>
          </div>

          {/* Mode Switcher on Mobile */}
          <div class={css({ display: { base: "flex", sm: "none" }, position: "relative", w: "full", alignItems: "center", bg: "surfaceContainerHighest", borderRadius: "12px", p: "1", borderWidth: "1px", borderColor: "outlineVariant", mt: "0.5", userSelect: "none" })}>
            <div
              class={cn(
                css({
                  position: "absolute",
                  top: "1",
                  bottom: "1",
                  w: "calc(50% - 4px)",
                  borderRadius: "9px",
                  bg: "primary",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  shadow: "xs",
                  pointerEvents: "none",
                }),
                activeMode() === "create" ? css({ left: "1" }) : css({ left: "calc(50% + 2px)" })
              )}
            />

            <button
              type="button"
              onClick={() => handleSwitchMode("create")}
              class={cn(
                css({
                  position: "relative",
                  zIndex: 10,
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2",
                  py: "2",
                  borderRadius: "9px",
                  fontSize: "xs",
                  fontWeight: "semibold",
                  transition: "colors 0.3s",
                  cursor: "pointer",
                  userSelect: "none",
                }),
                activeMode() === "create"
                  ? css({ color: "onPrimary", fontWeight: "bold" })
                  : css({ color: "onSurfaceVariant", _hover: { color: "onSurface" } })
              )}
            >
              <FileEdit class={css({ h: "4", w: "4" })} />
              <span>Create Task</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode("quick")}
              class={cn(
                css({
                  position: "relative",
                  zIndex: 10,
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2",
                  py: "2",
                  borderRadius: "9px",
                  fontSize: "xs",
                  fontWeight: "semibold",
                  transition: "colors 0.3s",
                  cursor: "pointer",
                  userSelect: "none",
                }),
                activeMode() === "quick"
                  ? css({ color: "onPrimary", fontWeight: "bold" })
                  : css({ color: "onSurfaceVariant", _hover: { color: "onSurface" } })
              )}
            >
              <Zap class={css({ h: "4", w: "4" })} />
              <span>Quick Note</span>
            </button>
          </div>
        </div>
      </BottomSheetHeader>

      {/* Main Content Area */}
      <div class={css({ w: "full", minH: "0", position: "relative", pt: "1", pb: "0" })}>
        <Show
          when={activeMode() === "create"}
          fallback={
            /* QUICK NOTE MODE */
            <form
              onSubmit={handleQuickSubmit}
              class={cn(
                css({ w: "full", display: "flex", flexDirection: "column", pt: "1", pb: "0", px: "1", gap: "3" }),
                getSlideAnimationClass(slideDirection())
              )}
            >
              <div class={css({ display: "flex", flexDirection: "column", gap: "3", pt: "1" })}>
                <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                  <label
                    for="quick-note-input"
                    class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", display: "flex", alignItems: "center", gap: "1.5", userSelect: "none" })}
                  >
                    <Type class={css({ h: "3.5", w: "3.5" })} />
                    <span>Task Name</span>
                  </label>
                  <Input
                    ref={quickInputRef}
                    id="quick-note-input"
                    value={quickText()}
                    onInput={(e) => setQuickText(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleQuickSubmit();
                      }
                    }}
                    placeholder="Buy milk or pay electricity bill"
                    class={css({ fontSize: { base: "base", sm: "lg" }, fontWeight: "medium", borderRadius: "14px", h: "14", px: "4", bg: "surfaceContainerHighest" })}
                    autofocus
                  />
                </div>

                <p class={css({ fontSize: "xs", color: "onSurfaceVariant", px: "1" })}>
                  Type your task name and press Enter. It will immediately be saved to your inbox without requiring dates, tags, or projects.
                </p>
              </div>

              {/* Action Button */}
              <BottomSheetFooter class={css({ flexShrink: 0 })}>
                <Button
                  type="submit"
                  disabled={!quickText().trim()}
                  class={css({ w: "full", h: "12", py: "0", borderRadius: "12px", bg: "primary", color: "onPrimary", gap: "2", fontWeight: "semibold", fontSize: "base", shadow: "sm", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" })}
                >
                  <Zap class={css({ h: "5", w: "5", flexShrink: 0 })} />
                  <span>Add Quick Note</span>
                </Button>
              </BottomSheetFooter>
            </form>
          }
        >
          {/* DETAILED CREATE TASK MODE */}
          <form
            onSubmit={handleDetailedSubmit}
            class={cn(
              css({ w: "full", display: "flex", flexDirection: "column", gap: "3", pt: "1", pb: "0" }),
              getSlideAnimationClass(slideDirection())
            )}
          >
            <div class={css({ display: "flex", flexDirection: "column", gap: "4", maxH: { base: "52dvh", sm: "58dvh" }, overflowY: "auto", p: "1.5" })}>
              {/* Field 1: Task Name */}
              <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                <label
                  for="create-task-name"
                  class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", display: "flex", alignItems: "center", gap: "1.5", userSelect: "none" })}
                >
                  <Type class={css({ h: "3.5", w: "3.5" })} />
                  <span>Task Name</span>
                  <span class={css({ color: "error" })}>*</span>
                </label>
                <Input
                  ref={createInputRef}
                  id="create-task-name"
                  value={name()}
                  onInput={(e) => setName(e.currentTarget.value)}
                  placeholder="Task title (e.g. Design applet layout)..."
                  class={css({ fontSize: "base", fontWeight: "semibold", borderRadius: "12px", h: "12" })}
                  required
                />
              </div>

              {/* Field 2: Description */}
              <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                <label
                  for="create-task-desc"
                  class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", display: "flex", alignItems: "center", gap: "1.5", userSelect: "none" })}
                >
                  <AlignLeft class={css({ h: "3.5", w: "3.5" })} />
                  <span>Description</span>
                </label>
                <textarea
                  id="create-task-desc"
                  value={description()}
                  onInput={(e) => setDescription(e.currentTarget.value)}
                  placeholder="Additional context, notes, or checklist items..."
                  rows={2}
                  class={css({
                    w: "full",
                    px: "3.5",
                    py: "2.5",
                    borderRadius: "12px",
                    bg: "surfaceContainer",
                    borderWidth: "1px",
                    borderColor: "outlineVariant",
                    fontSize: "sm",
                    color: "onSurface",
                    outline: "none",
                    resize: "none",
                    transition: "all 0.2s",
                    "&::placeholder": { color: "onSurfaceVariant", opacity: 0.7 },
                    _focus: { borderColor: "primary", boxShadow: "0 0 0 2px var(--colors-primary)" },
                  })}
                />
              </div>

              {/* Field 3: Tags Selection */}
              <Show when={props.allTags && props.allTags.length > 0}>
                <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                  <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", display: "flex", alignItems: "center", gap: "1.5", userSelect: "none" })}>
                    <TagIcon class={css({ h: "3.5", w: "3.5" })} />
                    <span>Tags</span>
                  </label>

                  <div class={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
                    <For each={props.allTags}>
                      {(tag) => {
                        const isSelected = () => selectedTags().includes(tag.id);
                        return (
                          <button
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            class={cn(
                              css({
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "1.5",
                                px: "3",
                                py: "1.5",
                                borderRadius: "full",
                                fontSize: "xs",
                                fontWeight: "medium",
                                transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                                cursor: "pointer",
                                borderWidth: "1px",
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

              {/* Field 4: Reminder Section */}
              <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
                  <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", display: "flex", alignItems: "center", gap: "1.5", userSelect: "none" })}>
                    <Bell class={css({ h: "3.5", w: "3.5" })} />
                    <span>Reminder</span>
                  </label>
                  <Show when={reminder()}>
                    <button
                      type="button"
                      onClick={() => {
                        setReminder(null);
                        setShowReminderPicker(false);
                      }}
                      class={css({ fontSize: "11px", color: "error", cursor: "pointer", _hover: { textDecoration: "underline" } })}
                    >
                      Clear
                    </button>
                  </Show>
                </div>

                <Show
                  when={showReminderPicker() || reminder()}
                  fallback={
                    <div class={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
                      <button
                        type="button"
                        onClick={() => setQuickReminder(1)}
                        class={css({ px: "3", py: "1.5", borderRadius: "10px", fontSize: "xs", fontWeight: "medium", bg: "surfaceContainer", borderWidth: "1px", borderColor: "outlineVariant", color: "onSurface", cursor: "pointer", _hover: { bg: "surfaceContainerHigh" } })}
                      >
                        In 1 Hour
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickReminder(3)}
                        class={css({ px: "3", py: "1.5", borderRadius: "10px", fontSize: "xs", fontWeight: "medium", bg: "surfaceContainer", borderWidth: "1px", borderColor: "outlineVariant", color: "onSurface", cursor: "pointer", _hover: { bg: "surfaceContainerHigh" } })}
                      >
                        In 3 Hours
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReminderPicker(true)}
                        class={css({ px: "3", py: "1.5", borderRadius: "10px", fontSize: "xs", fontWeight: "medium", bg: "surfaceContainer", borderWidth: "1px", borderColor: "outlineVariant", color: "primary", cursor: "pointer", _hover: { bg: "surfaceContainerHigh" } })}
                      >
                        Custom Time...
                      </button>
                    </div>
                  }
                >
                  <div class={css({ p: "3", bg: "surfaceContainerHighest", borderRadius: "12px", borderWidth: "1px", borderColor: "outlineVariant", display: "flex", flexDirection: "column", gap: "2" })}>
                    <input
                      type="datetime-local"
                      value={toLocalDatetimeInputValue(reminder())}
                      onInput={(e) => {
                        const val = e.currentTarget.value;
                        setReminder(val ? new Date(val).toISOString() : null);
                      }}
                      class={css({ w: "full", h: "10", px: "3", borderRadius: "8px", bg: "surfaceContainer", borderWidth: "1px", borderColor: "outlineVariant", fontSize: "xs", color: "onSurface", outline: "none", _focus: { borderColor: "primary" } })}
                    />
                    <Show when={reminder()}>
                      <p class={css({ fontSize: "11px", color: "primary", fontWeight: "medium" })}>
                        Reminder scheduled: {formatDayTime(reminder())}
                      </p>
                    </Show>
                  </div>
                </Show>
              </div>

              {/* Field 5: Deadline Section */}
              <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
                  <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", display: "flex", alignItems: "center", gap: "1.5", userSelect: "none" })}>
                    <Clock class={css({ h: "3.5", w: "3.5" })} />
                    <span>Deadline</span>
                  </label>
                  <Show when={deadline()}>
                    <button
                      type="button"
                      onClick={() => {
                        setDeadline(null);
                        setShowDeadlinePicker(false);
                      }}
                      class={css({ fontSize: "11px", color: "error", cursor: "pointer", _hover: { textDecoration: "underline" } })}
                    >
                      Clear
                    </button>
                  </Show>
                </div>

                <Show
                  when={showDeadlinePicker() || deadline()}
                  fallback={
                    <div class={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
                      <button
                        type="button"
                        onClick={() => setQuickDeadline(0, 20)}
                        class={css({ px: "3", py: "1.5", borderRadius: "10px", fontSize: "xs", fontWeight: "medium", bg: "surfaceContainer", borderWidth: "1px", borderColor: "outlineVariant", color: "onSurface", cursor: "pointer", _hover: { bg: "surfaceContainerHigh" } })}
                      >
                        Tonight (20:00)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDeadline(1, 20)}
                        class={css({ px: "3", py: "1.5", borderRadius: "10px", fontSize: "xs", fontWeight: "medium", bg: "surfaceContainer", borderWidth: "1px", borderColor: "outlineVariant", color: "onSurface", cursor: "pointer", _hover: { bg: "surfaceContainerHigh" } })}
                      >
                        Tomorrow (20:00)
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeadlinePicker(true)}
                        class={css({ px: "3", py: "1.5", borderRadius: "10px", fontSize: "xs", fontWeight: "medium", bg: "surfaceContainer", borderWidth: "1px", borderColor: "outlineVariant", color: "primary", cursor: "pointer", _hover: { bg: "surfaceContainerHigh" } })}
                      >
                        Custom Deadline...
                      </button>
                    </div>
                  }
                >
                  <div class={css({ p: "3", bg: "surfaceContainerHighest", borderRadius: "12px", borderWidth: "1px", borderColor: "outlineVariant", display: "flex", flexDirection: "column", gap: "2" })}>
                    <input
                      type="datetime-local"
                      value={toLocalDatetimeInputValue(deadline())}
                      onInput={(e) => {
                        const val = e.currentTarget.value;
                        setDeadline(val ? new Date(val).toISOString() : null);
                        if (val) requestNotificationPermission().catch(() => {});
                      }}
                      class={css({ w: "full", h: "10", px: "3", borderRadius: "8px", bg: "surfaceContainer", borderWidth: "1px", borderColor: "outlineVariant", fontSize: "xs", color: "onSurface", outline: "none", _focus: { borderColor: "primary" } })}
                    />
                    <Show when={deadline()}>
                      <p class={css({ fontSize: "11px", color: "primary", fontWeight: "medium" })}>
                        Due: {formatDayTime(deadline())}
                      </p>
                    </Show>
                  </div>
                </Show>
              </div>
            </div>

            {/* Action Buttons: Footer */}
            <BottomSheetFooter class={css({ mt: "auto", flexShrink: 0 })}>
              <Button
                type="submit"
                disabled={!name().trim()}
                class={css({ w: "full", h: "12", py: "0", borderRadius: "12px", bg: "primary", color: "onPrimary", gap: "2", fontWeight: "semibold", fontSize: "base", shadow: "sm", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" })}
              >
                <Plus class={css({ h: "5", w: "5", flexShrink: 0 })} />
                <span>Create Task</span>
              </Button>
            </BottomSheetFooter>
          </form>
        </Show>
      </div>
    </BottomSheet>
  );
}
