/**
 * 2-column interactive Kanban Board view (To Do vs Completed) with drag-and-drop card status updates.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-03`
 * - Design: `@design:FR-TASK-03`
 *
 * # Arguments
 * - `props`: TaskKanbanViewProps containing task list, tags, modes, and event callbacks.
 *
 * # Returns
 * SolidJS JSX Kanban Board element with Panda CSS styling.
 */
import { createSignal, createEffect, Show, For } from "solid-js";
import {
  Check,
  Bell,
  Clock,
  Pin,
  Trash2,
  RotateCcw,
  Plus,
  CheckCircle2,
  SearchX,
  Archive,
} from "lucide-solid";
import { Task, Tag } from "@/src/domain";
import { formatDayTime, getCountdownString, isTaskMatchingQuery } from "@/src/services";
import { Button } from "@/src/presentation/components/ui/button";
import { TagBadge } from "@/src/presentation/components/ui/tag-badge";
import { EmptyState } from "@/src/presentation/components/ui/empty-state";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

interface TaskKanbanViewProps {
  tasks: Task[];
  allTags?: Tag[];
  searchQuery?: string;
  isArchiveMode?: boolean;
  isTrashMode?: boolean;
  onToggleStatus?: (id: number) => void;
  onOpenDetail?: (task: Task) => void;
  onDeleteDirect?: (task: Task) => void;
  onRestore?: (task: Task) => void;
  onUnarchive?: (task: Task) => void;
  onPermanentDelete?: (id: number) => void;
  onTogglePin?: (id: number) => void;
  onOpenCreateModal?: () => void;
}

interface KanbanCardItemProps {
  task: Task;
  allTags?: Tag[];
  isMatch: boolean;
  isTrashMode?: boolean;
  isArchiveMode?: boolean;
  isDragged: boolean;
  onDragStart: (e: DragEvent, id: number) => void;
  onDragEnd: () => void;
  onOpenDetail?: (task: Task) => void;
  onToggleStatus?: (id: number) => void;
  onTogglePin?: (id: number) => void;
  onDeleteDirect?: (task: Task) => void;
  onUnarchive?: (task: Task) => void;
  onRestore?: (task: Task) => void;
  onPermanentDelete?: (id: number) => void;
  onTransferStart?: (nextStatus: boolean) => void;
}

function KanbanCardItem(props: KanbanCardItemProps) {
  const [isCompleted, setIsCompleted] = createSignal(props.task.status);
  const [transferClass, setTransferClass] = createSignal<string | null>(null);

  createEffect(() => {
    setIsCompleted(props.task.status);
    setTransferClass(null);
  });

  const handleCheckboxClick = (e: MouseEvent) => {
    e.stopPropagation();
    const nextStatus = !isCompleted();
    setIsCompleted(nextStatus);
    const animClass = nextStatus ? "kanban-transfer-to-completed" : "kanban-transfer-to-todo";
    setTransferClass(animClass);
    props.onTransferStart?.(nextStatus);
    setTimeout(() => {
      props.onToggleStatus?.(props.task.id);
    }, 320);
  };

  const hasReminderOrDeadline = () => Boolean(props.task.reminder || props.task.deadline);
  const countdown = () => getCountdownString(props.task.deadline);
  const taskTags = () => (props.allTags || []).filter((tag) => props.task.tags?.includes(tag.id));

  return (
    <div
      class={cn(
        "kanban-search-slot",
        !props.isMatch && "eliminated",
        transferClass() && "transferring"
      )}
    >
      <div class={cn("task-search-content", transferClass() && "transferring")}>
        <div
          draggable={!props.isTrashMode}
          onDragStart={(e) => props.onDragStart(e, props.task.id)}
          onDragEnd={props.onDragEnd}
          onClick={() => !props.isTrashMode && props.onOpenDetail?.(props.task)}
          class={cn(
            css({
              position: "relative",
              p: "3.5",
              borderRadius: "12px",
              borderWidth: "1px",
              transition:
                "background-color 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1), color 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              shadow: "xs",
              userSelect: "none",
              bg: { base: "surfaceContainerLow", _dark: "surfaceContainer" },
            }),
            isCompleted()
              ? css({ bg: { base: "surfaceContainerLowest", _dark: "surfaceContainerLow" }, borderColor: "outlineVariant/40" })
              : props.task.isPinned
              ? css({ borderColor: "primary/50", _hover: { borderColor: "primary" } })
              : hasReminderOrDeadline()
              ? css({ borderColor: "primary/30", _hover: { borderColor: "primary/70" } })
              : css({ borderColor: "outlineVariant", _hover: { borderColor: "outline" } }),
            props.isDragged && css({ opacity: 0.4, transform: "scale(0.95)" }),
            transferClass(),
            !props.isTrashMode && css({ cursor: "pointer", _hover: { shadow: "sm" } })
          )}
        >
          {/* Pinned Ribbon */}
          <Show when={props.task.isPinned}>
            <div class={css({ display: "flex", alignItems: "center", gap: "1", fontSize: "11px", fontWeight: "semibold", color: "primary", mb: "1.5", userSelect: "none" })}>
              <Pin class={css({ h: "3", w: "3", fill: "primary" })} />
              <span>Pinned</span>
            </div>
          </Show>

          <div class={css({ display: "flex", alignItems: "flex-start", gap: "2.5" })}>
            {/* Status Checkbox */}
            <Show when={!props.isTrashMode}>
              <button
                type="button"
                onClick={handleCheckboxClick}
                class={cn(
                  css({
                    display: "flex",
                    h: "4",
                    w: "4",
                    flexShrink: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "full",
                    borderWidth: "1.5px",
                    transition:
                      "background-color 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1), color 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                    mt: "0.5",
                    cursor: "pointer",
                  }),
                  isCompleted()
                    ? css({ bg: "primary", borderColor: "primary", color: "onPrimary" })
                    : css({ borderColor: "outline", _hover: { borderColor: "primary" } })
                )}
              >
                <div
                  class={cn(
                    css({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition:
                        "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }),
                    isCompleted()
                      ? css({ opacity: 1, transform: "scale(1)" })
                      : css({ opacity: 0, transform: "scale(0.5)" })
                  )}
                >
                  <Check class={css({ h: "2.5", w: "2.5", strokeWidth: "3" })} />
                </div>
              </button>
            </Show>

            {/* Title & Description */}
            <div class={css({ flex: "1", minW: "0" })}>
              <h4
                class={cn(
                  css({
                    fontSize: "sm",
                    fontWeight: "semibold",
                    lineHeight: "snug",
                    lineClamp: 2,
                    transition:
                      "color 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }),
                  isCompleted()
                    ? css({ color: "onSurface/60" })
                    : css({ color: "onSurface", _hover: { color: "primary" } })
                )}
              >
                <span
                  class={cn(
                    "task-strikethrough",
                    isCompleted() && "active"
                  )}
                >
                  {props.task.name}
                </span>
              </h4>

              <Show when={props.task.description}>
                <p
                  class={cn(
                    css({
                      fontSize: "xs",
                      color: "onSurfaceVariant",
                      lineClamp: 2,
                      mt: "1",
                      lineHeight: "relaxed",
                      transition:
                        "color 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }),
                    isCompleted() && css({ color: "onSurfaceVariant/40" })
                  )}
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

              {/* Tags Pills */}
              <Show when={taskTags().length > 0}>
                <div class={css({ display: "flex", flexWrap: "wrap", gap: "1.5", mt: "2" })}>
                  <For each={taskTags()}>
                    {(tag) => (
                      <TagBadge name={tag.name} color={tag.color} size="sm" />
                    )}
                  </For>
                </div>
              </Show>

              {/* Meta: Reminder / Deadline */}
              <Show when={hasReminderOrDeadline()}>
                <div class={css({ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2", mt: "2", pt: "1", fontSize: "11px", color: "onSurfaceVariant" })}>
                  <Show when={props.task.reminder}>
                    <span class={css({ display: "flex", alignItems: "center", gap: "1", bg: "primary/10", color: "primary", px: "1.5", py: "0.5", borderRadius: "6px", fontWeight: "medium" })}>
                      <Bell class={css({ h: "3", w: "3" })} />
                      <span>{formatDayTime(props.task.reminder!)}</span>
                    </span>
                  </Show>
                  <Show when={props.task.deadline}>
                    <span
                      class={cn(
                        css({ display: "flex", alignItems: "center", gap: "1", px: "1.5", py: "0.5", borderRadius: "6px", fontWeight: "medium" }),
                        countdown().isPast
                          ? css({ bg: "errorContainer", color: "onErrorContainer", fontWeight: "semibold" })
                          : countdown().isUrgent
                          ? css({ bg: "amber.600", color: "white", fontWeight: "semibold" })
                          : css({ bg: "surfaceContainerHighest", color: "onSurfaceVariant" })
                      )}
                    >
                      <Clock class={css({ h: "3", w: "3" })} />
                      <span>{formatDayTime(props.task.deadline!)}</span>
                    </span>
                  </Show>
                </div>
              </Show>
            </div>

            {/* Quick Actions */}
            <div
              class={css({ display: "flex", alignItems: "center", gap: "1", opacity: 0.8, _hover: { opacity: 1 }, transition: "opacity 0.2s" })}
              onClick={(e) => e.stopPropagation()}
            >
              <Show
                when={props.isTrashMode}
                fallback={
                  <Show
                    when={props.isArchiveMode}
                    fallback={
                      /* Standard Active Mode */
                      <>
                        <Show when={props.onTogglePin}>
                          <button
                            type="button"
                            onClick={() => props.onTogglePin?.(props.task.id)}
                            class={cn(
                              css({ p: "1", borderRadius: "md", transition: "all 0.2s", cursor: "pointer" }),
                              props.task.isPinned
                                ? css({ color: "primary", bg: "primary/15" })
                                : css({ color: "onSurfaceVariant", _hover: { color: "primary", bg: "surfaceContainerHighest" } })
                            )}
                            title={props.task.isPinned ? "Unpin task" : "Pin task"}
                          >
                            <Pin class={cn(css({ h: "3.5", w: "3.5" }), props.task.isPinned && css({ fill: "currentColor" }))} />
                          </button>
                        </Show>

                        <Show when={props.onDeleteDirect}>
                          <button
                            type="button"
                            onClick={() => props.onDeleteDirect?.(props.task)}
                            class={css({ p: "1", borderRadius: "md", color: "onSurfaceVariant", cursor: "pointer", _hover: { color: "error", bg: "surfaceContainerHighest" } })}
                            title="Move to trash"
                          >
                            <Trash2 class={css({ h: "3.5", w: "3.5" })} />
                          </button>
                        </Show>
                      </>
                    }
                  >
                    {/* Archive Mode */}
                    <button
                      type="button"
                      onClick={() => props.onUnarchive?.(props.task)}
                      class={css({ p: "1", borderRadius: "md", color: "primary", cursor: "pointer", _hover: { bg: "primaryContainer" } })}
                      title="Unarchive"
                    >
                      <RotateCcw class={css({ h: "3.5", w: "3.5" })} />
                    </button>
                    <button
                      type="button"
                      onClick={() => props.onDeleteDirect?.(props.task)}
                      class={css({ p: "1", borderRadius: "md", color: "error", cursor: "pointer", _hover: { bg: "errorContainer" } })}
                      title="Move to trash"
                    >
                      <Trash2 class={css({ h: "3.5", w: "3.5" })} />
                    </button>
                  </Show>
                }
              >
                {/* Trash Mode */}
                <button
                  type="button"
                  onClick={() => props.onRestore?.(props.task)}
                  class={css({ p: "1", borderRadius: "md", color: "primary", cursor: "pointer", _hover: { bg: "primaryContainer" } })}
                  title="Restore"
                >
                  <RotateCcw class={css({ h: "3.5", w: "3.5" })} />
                </button>
                <button
                  type="button"
                  onClick={() => props.onPermanentDelete?.(props.task.id)}
                  class={css({ p: "1", borderRadius: "md", color: "error", cursor: "pointer", _hover: { bg: "errorContainer" } })}
                  title="Delete permanently"
                >
                  <Trash2 class={css({ h: "3.5", w: "3.5" })} />
                </button>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskKanbanView(props: TaskKanbanViewProps) {
  const [draggedTaskId, setDraggedTaskId] = createSignal<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = createSignal<boolean | null>(null);
  const [transferringSource, setTransferringSource] = createSignal<boolean | null>(null);

  const todoTasks = () => props.tasks.filter((t) => !t.status);
  const completedTasks = () => props.tasks.filter((t) => t.status);

  const todoPinned = () => todoTasks().filter((t) => t.isPinned);
  const todoUnpinned = () => todoTasks().filter((t) => !t.isPinned);

  const completedPinned = () => completedTasks().filter((t) => t.isPinned);
  const completedUnpinned = () => completedTasks().filter((t) => !t.isPinned);

  const matchingCount = () =>
    props.tasks.filter((t) => isTaskMatchingQuery(t, props.searchQuery)).length;

  const handleTransferStart = (nextStatus: boolean) => {
    // nextStatus = true means moving from To Do (false) -> Completed (true)
    // nextStatus = false means moving from Completed (true) -> To Do (false)
    setTransferringSource(nextStatus ? false : true);
    setTimeout(() => {
      setTransferringSource(null);
    }, 340);
  };

  const handleCardDragStart = (e: DragEvent, id: number) => {
    e.dataTransfer?.setData("text/plain", String(id));
    setDraggedTaskId(id);
  };

  const handleDragOverColumn = (e: DragEvent, targetStatus: boolean) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
    if (dragOverColumn() !== targetStatus) {
      setDragOverColumn(targetStatus);
    }
  };

  const handleDropOnColumn = (e: DragEvent, targetStatus: boolean) => {
    e.preventDefault();
    const idStr = e.dataTransfer?.getData("text/plain");
    const id = Number(idStr) || draggedTaskId();
    setDraggedTaskId(null);
    setDragOverColumn(null);

    if (!id) return;
    const task = props.tasks.find((t) => t.id === id);
    if (!task || task.status === targetStatus) return;

    props.onToggleStatus?.(id);
  };

  const renderCard = (task: Task) => (
    <KanbanCardItem
      task={task}
      allTags={props.allTags}
      isMatch={isTaskMatchingQuery(task, props.searchQuery)}
      isTrashMode={props.isTrashMode}
      isArchiveMode={props.isArchiveMode}
      isDragged={draggedTaskId() === task.id}
      onDragStart={handleCardDragStart}
      onDragEnd={() => setDraggedTaskId(null)}
      onOpenDetail={props.onOpenDetail}
      onToggleStatus={props.onToggleStatus}
      onTogglePin={props.onTogglePin}
      onDeleteDirect={props.onDeleteDirect}
      onUnarchive={props.onUnarchive}
      onRestore={props.onRestore}
      onPermanentDelete={props.onPermanentDelete}
      onTransferStart={handleTransferStart}
    />
  );

  return (
    <Show
      when={props.tasks.length > 0}
      fallback={
        /* Empty State */
        <EmptyState
          icon={
            props.isTrashMode
              ? (p) => <Trash2 {...p} />
              : props.isArchiveMode
              ? (p) => <Archive {...p} />
              : (p) => <CheckCircle2 {...p} />
          }
          title={
            props.isTrashMode
              ? "Trash is empty"
              : props.isArchiveMode
              ? "Archive is empty"
              : "No tasks available"
          }
          description={
            props.isTrashMode
              ? "There are no deleted tasks in the trash."
              : props.isArchiveMode
              ? "Completed or inactive tasks moved to the archive will appear here."
              : "Your to-do list is currently empty. Add your first task or reload demo tasks to get started!"
          }
          action={
            !props.isTrashMode && !props.isArchiveMode && props.onOpenCreateModal ? (
              <Button
                onClick={props.onOpenCreateModal}
                class={css({ w: "full", h: "12", borderRadius: "12px", bg: "primary", color: "onPrimary", fontWeight: "semibold", fontSize: "base", shadow: "sm", gap: "2", cursor: "pointer" })}
              >
                <Plus class={css({ h: "5", w: "5" })} />
                <span>Add New Task</span>
              </Button>
            ) : undefined
          }
        />
      }
    >
        <div class={css({ display: "flex", flexDirection: "column", gap: "4", w: "full" })}>
          {/* Search Empty State */}
          <Show when={props.searchQuery && matchingCount() === 0}>
            <div class="animate-in fade-in duration-200">
              <EmptyState
                icon={(p) => <SearchX {...p} />}
                iconColor="muted"
                title="No tasks found"
                description={
                  <>
                    No tasks matched your search for <span class={css({ fontWeight: "semibold", color: "onSurface" })}>"{props.searchQuery}"</span>.
                  </>
                }
              />
            </div>
          </Show>

          {/* 2-Column Kanban Board (To Do vs Completed) */}
          <div class={css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "repeat(2, 1fr)" }, gap: "5", w: "full" })}>
            {/* Column 1: To Do */}
            <div
              onDragOver={(e) => handleDragOverColumn(e, false)}
              onDrop={(e) => handleDropOnColumn(e, false)}
              class={cn(
                css({
                  display: "flex",
                  flexDirection: "column",
                  bg: "surfaceContainer/60",
                  borderWidth: "1px",
                  borderRadius: "16px",
                  p: "4",
                  minH: "380px",
                  transition: "all 0.2s",
                  position: "relative",
                }),
                dragOverColumn() === false
                  ? css({ borderColor: "primary", bg: "primary/5" })
                  : css({ borderColor: "outlineVariant" }),
                transferringSource() === false && css({ zIndex: 40 })
              )}
            >
              <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", pb: "3", mb: "3", borderBottomWidth: "1px", borderColor: "outlineVariant/40" })}>
                <div class={css({ display: "flex", alignItems: "center", gap: "2" })}>
                  <div class={css({ h: "3", w: "3", borderRadius: "full", bg: "amber.500", shadow: "xs" })} />
                  <h3 class={css({ fontWeight: "bold", fontSize: "sm", color: "onSurface" })}>
                    {props.isArchiveMode
                      ? "Archived Incomplete"
                      : props.isTrashMode
                      ? "Trashed Pending"
                      : "To Do"}
                  </h3>
                  <span class={css({ fontSize: "xs", fontWeight: "semibold", px: "2", py: "0.5", borderRadius: "full", bg: "amber.500/15", color: "amber.600", borderWidth: "1px", borderColor: "amber.500/30" })}>
                    {todoTasks().length}
                  </span>
                </div>

                <Show when={!props.isArchiveMode && !props.isTrashMode && props.onOpenCreateModal}>
                  <button
                    type="button"
                    onClick={props.onOpenCreateModal}
                    class={css({ p: "1.5", borderRadius: "full", color: "onSurfaceVariant", cursor: "pointer", transition: "colors 0.2s", _hover: { color: "primary", bg: "surfaceContainerHighest" } })}
                    title="Add task to To Do"
                  >
                    <Plus class={css({ h: "4", w: "4" })} />
                  </button>
                </Show>
              </div>

              {/* Column Items */}
              <div class={css({ flex: "1", display: "flex", flexDirection: "column", gap: "3" })}>
                <Show
                  when={todoTasks().length > 0}
                  fallback={
                    <div class={css({ h: "40", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", p: "4", borderWidth: "1px", borderStyle: "dashed", borderColor: "outlineVariant/50", borderRadius: "12px", color: "onSurfaceVariant", fontSize: "xs" })}>
                      <span>No incomplete tasks</span>
                      <Show when={!props.isTrashMode && !props.isArchiveMode}>
                        <span class={css({ fontSize: "11px", opacity: 0.7, mt: "1" })}>Drag completed tasks here</span>
                      </Show>
                    </div>
                  }
                >
                  {/* Pinned Tasks in To Do */}
                  <Show when={todoPinned().length > 0}>
                    <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                      <Show when={todoUnpinned().length > 0}>
                        <div class={css({ fontSize: "11px", fontWeight: "bold", color: "primary", textTransform: "uppercase", letterSpacing: "wider", px: "1", display: "flex", alignItems: "center", gap: "1" })}>
                          <Pin class={css({ h: "3", w: "3", fill: "primary" })} />
                          <span>Pinned ({todoPinned().length})</span>
                        </div>
                      </Show>
                      <For each={todoPinned()}>{(task) => renderCard(task)}</For>
                    </div>
                  </Show>

                  {/* Unpinned Tasks in To Do */}
                  <Show when={todoUnpinned().length > 0}>
                    <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                      <Show when={todoPinned().length > 0}>
                        <div class={css({ fontSize: "11px", fontWeight: "bold", color: "onSurfaceVariant", opacity: 0.7, textTransform: "uppercase", letterSpacing: "wider", px: "1", pt: "1" })}>
                          Other Tasks ({todoUnpinned().length})
                        </div>
                      </Show>
                      <For each={todoUnpinned()}>{(task) => renderCard(task)}</For>
                    </div>
                  </Show>
                </Show>
              </div>
            </div>

            {/* Column 2: Completed */}
            <div
              onDragOver={(e) => handleDragOverColumn(e, true)}
              onDrop={(e) => handleDropOnColumn(e, true)}
              class={cn(
                css({
                  display: "flex",
                  flexDirection: "column",
                  bg: "surfaceContainer/60",
                  borderWidth: "1px",
                  borderRadius: "16px",
                  p: "4",
                  minH: "380px",
                  transition: "all 0.2s",
                  position: "relative",
                }),
                dragOverColumn() === true
                  ? css({ borderColor: "emerald.500", bg: "emerald.500/5" })
                  : css({ borderColor: "outlineVariant" }),
                transferringSource() === true && css({ zIndex: 40 })
              )}
            >
              <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", pb: "3", mb: "3", borderBottomWidth: "1px", borderColor: "outlineVariant/40" })}>
                <div class={css({ display: "flex", alignItems: "center", gap: "2" })}>
                  <div class={css({ h: "3", w: "3", borderRadius: "full", bg: "emerald.500", shadow: "xs" })} />
                  <h3 class={css({ fontWeight: "bold", fontSize: "sm", color: "onSurface" })}>
                    {props.isArchiveMode
                      ? "Archived Completed"
                      : props.isTrashMode
                      ? "Trashed Completed"
                      : "Completed"}
                  </h3>
                  <span class={css({ fontSize: "xs", fontWeight: "semibold", px: "2", py: "0.5", borderRadius: "full", bg: "emerald.500/15", color: "emerald.600", borderWidth: "1px", borderColor: "emerald.500/30" })}>
                    {completedTasks().length}
                  </span>
                </div>
              </div>

              {/* Column Items */}
              <div class={css({ flex: "1", display: "flex", flexDirection: "column", gap: "3" })}>
                <Show
                  when={completedTasks().length > 0}
                  fallback={
                    <div class={css({ h: "40", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", p: "4", borderWidth: "1px", borderStyle: "dashed", borderColor: "outlineVariant/50", borderRadius: "12px", color: "onSurfaceVariant", fontSize: "xs" })}>
                      <span>No completed tasks</span>
                      <Show when={!props.isTrashMode}>
                        <span class={css({ fontSize: "11px", opacity: 0.7, mt: "1" })}>
                          Drag tasks here to mark as completed
                        </span>
                      </Show>
                    </div>
                  }
                >
                  {/* Pinned Tasks in Completed */}
                  <Show when={completedPinned().length > 0}>
                    <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                      <Show when={completedUnpinned().length > 0}>
                        <div class={css({ fontSize: "11px", fontWeight: "bold", color: "primary", textTransform: "uppercase", letterSpacing: "wider", px: "1", display: "flex", alignItems: "center", gap: "1" })}>
                          <Pin class={css({ h: "3", w: "3", fill: "primary" })} />
                          <span>Pinned ({completedPinned().length})</span>
                        </div>
                      </Show>
                      <For each={completedPinned()}>{(task) => renderCard(task)}</For>
                    </div>
                  </Show>

                  {/* Unpinned Tasks in Completed */}
                  <Show when={completedUnpinned().length > 0}>
                    <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                      <Show when={completedPinned().length > 0}>
                        <div class={css({ fontSize: "11px", fontWeight: "bold", color: "onSurfaceVariant", opacity: 0.7, textTransform: "uppercase", letterSpacing: "wider", px: "1", pt: "1" })}>
                          Other Completed ({completedUnpinned().length})
                        </div>
                      </Show>
                      <For each={completedUnpinned()}>{(task) => renderCard(task)}</For>
                    </div>
                  </Show>
                </Show>
              </div>
            </div>
          </div>
        </div>
    </Show>
  );
}
