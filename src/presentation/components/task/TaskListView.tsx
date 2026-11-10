/**
 * List view component for tasks featuring pull-to-refresh, pinned grouping, and drag reordering.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-03`
 * - Design: `@design:FR-TASK-03`
 *
 * # Arguments
 * - `props`: TaskListViewProps containing task arrays, search query, and interaction handlers.
 *
 * # Returns
 * SolidJS JSX list view element with smooth touch gestures.
 */
import { createSignal, Show, For } from "solid-js";
import { CheckCircle2, SearchX, Plus, RefreshCw, ArrowDown, Pin, ListOrdered } from "lucide-solid";
import { Task, Tag } from "@/src/domain";
import { TaskItem } from "@/src/presentation/components/task/TaskItem";
import { Button } from "@/src/presentation/components/ui/button";
import { EmptyState } from "@/src/presentation/components/ui/empty-state";
import { isTaskMatchingQuery } from "@/src/services";
import { cn } from "@/src/presentation/utils";
import { css } from "@/styled-system/css";

interface TaskListViewProps {
  tasks: Task[];
  filteredTasks: Task[];
  allTags?: Tag[];
  searchQuery: string;
  isRefreshing: boolean;
  animationKey?: number;
  onRefresh: () => void;
  onToggleStatus: (id: number) => void;
  onOpenDetail: (task: Task) => void;
  onDeleteDirect: (task: Task) => void;
  onTogglePin?: (id: number) => void;
  onOpenCreateModal: () => void;
  onReorderTasks: (startIndex: number, endIndex: number) => void;
}

export function TaskListView(props: TaskListViewProps) {
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = createSignal<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = createSignal<number | null>(null);
  const [dragOverPosition, setDragOverPosition] = createSignal<"top" | "bottom">("top");

  // Pull-to-refresh state
  const [pullY, setPullY] = createSignal(0);
  const [isPulling, setIsPulling] = createSignal(false);
  let startY: number | null = null;
  const PULL_THRESHOLD = 70;

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1 && window.scrollY <= 2 && draggedIndex() === null) {
      startY = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling() || startY === null || draggedIndex() !== null) return;
    if (window.scrollY > 2) {
      setPullY(0);
      return;
    }

    const diff = e.touches[0].clientY - startY;
    if (diff <= 0) {
      setPullY(0);
      return;
    }
    const damped = Math.min(85, Math.pow(diff, 0.85) * 2.2);
    setPullY(damped);
  };

  const handleTouchEnd = () => {
    if (!isPulling()) return;
    setIsPulling(false);
    startY = null;

    if (pullY() >= PULL_THRESHOLD && !props.isRefreshing) {
      props.onRefresh();
    }
    setPullY(0);
  };

  // Drag and Drop reordering handlers
  const handleDragStart = (index: number, e: DragEvent) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", `${index}`);
    }
  };

  const handleDragOver = (index: number, e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? "top" : "bottom";
    if (dragOverIndex() !== index || dragOverPosition() !== position) {
      setDragOverIndex(index);
      setDragOverPosition(position);
    }
  };

  const handleDrop = (index: number, e: DragEvent) => {
    e.preventDefault();
    const fromIdx = draggedIndex();
    if (fromIdx !== null && fromIdx !== index) {
      props.onReorderTasks(fromIdx, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragOverPosition("top");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragOverPosition("top");
  };

  const pinnedTasks = () => props.tasks.filter((t) => t.isPinned);
  const unpinnedTasks = () => props.tasks.filter((t) => !t.isPinned);
  const hasPinnedGrouping = () => pinnedTasks().length > 0;
  const matchingPinnedCount = () =>
    pinnedTasks().filter((t) => isTaskMatchingQuery(t, props.searchQuery)).length;
  const matchingUnpinnedCount = () =>
    unpinnedTasks().filter((t) => isTaskMatchingQuery(t, props.searchQuery)).length;
  const matchingCount = () =>
    props.tasks.filter((t) => isTaskMatchingQuery(t, props.searchQuery)).length;

  return (
    <Show
      when={props.tasks.length > 0}
      fallback={
        /* Empty State */
        <EmptyState
          icon={(p) => <CheckCircle2 {...p} />}
          title="No tasks available"
          description="Your to-do list is currently empty. Add your first task or reload demo tasks to get started!"
          action={
            <Button
              onClick={props.onOpenCreateModal}
              class={css({ w: "full", h: "12", borderRadius: "12px", bg: "primary", color: "onPrimary", fontWeight: "semibold", fontSize: "base", shadow: "sm", gap: "2", cursor: "pointer" })}
            >
              <Plus class={css({ h: "5", w: "5" })} />
              <span>Add New Task</span>
            </Button>
          }
        />
      }
    >
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        class={css({
          position: "relative",
          maxW: "7xl",
          w: "full",
          mx: "auto",
          px: { base: "4", sm: "6", lg: "8" },
          py: "4",
          pb: "28",
          minH: "70vh",
          overflowX: "clip",
        })}
      >
        {/* Pull-To-Refresh Indicator */}
        <div
          style={{
            transform: `translateY(${props.isRefreshing ? 60 : pullY()}px)`,
            opacity: pullY() > 15 || props.isRefreshing ? 1 : 0,
            transition: isPulling() ? "none" : "all 0.25s ease-out",
          }}
          class={css({
            pointerEvents: "none",
            position: "absolute",
            left: "0",
            right: "0",
            top: "-12",
            zIndex: 20,
            display: "flex",
            justifyContent: "center",
          })}
        >
          <div class={css({ display: "flex", alignItems: "center", gap: "2", px: "4", py: "2", borderRadius: "full", bg: "primary", color: "onPrimary", shadow: "lg", fontSize: "xs", fontWeight: "semibold" })}>
            <Show
              when={props.isRefreshing}
              fallback={
                <Show
                  when={pullY() >= PULL_THRESHOLD}
                  fallback={
                    <>
                      <ArrowDown class={css({ h: "4", w: "4" })} />
                      <span>Pull down to refresh</span>
                    </>
                  }
                >
                  <RefreshCw class={css({ h: "4", w: "4", transform: "rotate(180deg)", transition: "transform 0.2s" })} />
                  <span>Release to refresh</span>
                </Show>
              }
            >
              <RefreshCw class={css({ h: "4", w: "4", animation: "spin 1s linear infinite" })} />
              <span>Refreshing tasks...</span>
            </Show>
          </div>
        </div>

        {/* Grouped or Flat List */}
        <Show
          when={hasPinnedGrouping()}
          fallback={
            /* Flat List with Survivor vs Eliminated Animations */
            <div class={css({ display: "flex", flexDirection: "column", pt: "1", w: "full", minW: "0" })}>
              <For each={props.tasks}>
                {(task, idx) => {
                  const isMatch = () => isTaskMatchingQuery(task, props.searchQuery);
                  return (
                    <div
                      class={cn(
                        "task-search-slot",
                        !isMatch() && "eliminated"
                      )}
                    >
                      <div class="task-search-content">
                        <div class={css({ position: "relative", w: "full", minW: "0" })}>
                          <TaskItem
                            task={task}
                            index={idx()}
                            totalTasks={props.tasks.length}
                            allTags={props.allTags}
                            onToggleStatus={props.onToggleStatus}
                            onOpenDetail={props.onOpenDetail}
                            onDeleteDirect={props.onDeleteDirect}
                            onTogglePin={props.onTogglePin}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                            isDragOver={dragOverIndex() === idx() && draggedIndex() !== idx()}
                            dragPosition={dragOverPosition()}
                            isDragging={draggedIndex() === idx()}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          }
        >
          {/* Pinned Tasks Grouping */}
          <div class={css({ display: "flex", flexDirection: "column", gap: "6", pt: "1", w: "full", minW: "0" })}>
            <section class={css({ display: "flex", flexDirection: "column", gap: "3", w: "full", minW: "0" })}>
              <Show when={!props.searchQuery || matchingPinnedCount() > 0}>
                <div class={css({ display: "flex", alignItems: "center", gap: "2", fontSize: "xs", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "wider", color: "primary", px: "1" })}>
                  <Pin class={css({ h: "3.5", w: "3.5", fill: "primary" })} />
                  <span>Pinned Tasks ({props.searchQuery ? matchingPinnedCount() : pinnedTasks().length})</span>
                </div>
              </Show>

              <div class={css({ display: "flex", flexDirection: "column", w: "full", minW: "0" })}>
                <For each={pinnedTasks()}>
                  {(task, idx) => {
                    const isMatch = () => isTaskMatchingQuery(task, props.searchQuery);
                    return (
                      <div
                        class={cn(
                          "task-search-slot",
                          !isMatch() && "eliminated"
                        )}
                      >
                        <div class="task-search-content">
                          <div class={css({ position: "relative", w: "full", minW: "0" })}>
                            <TaskItem
                              task={task}
                              index={idx()}
                              totalTasks={props.tasks.length}
                              allTags={props.allTags}
                              onToggleStatus={props.onToggleStatus}
                              onOpenDetail={props.onOpenDetail}
                              onDeleteDirect={props.onDeleteDirect}
                              onTogglePin={props.onTogglePin}
                              onDragStart={handleDragStart}
                              onDragOver={handleDragOver}
                              onDrop={handleDrop}
                              onDragEnd={handleDragEnd}
                              isDragOver={dragOverIndex() === idx() && draggedIndex() !== idx()}
                              dragPosition={dragOverPosition()}
                              isDragging={draggedIndex() === idx()}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </section>

            <Show when={unpinnedTasks().length > 0}>
              <section class={css({ display: "flex", flexDirection: "column", gap: "3", pt: "2", w: "full", minW: "0" })}>
                <Show when={!props.searchQuery || matchingUnpinnedCount() > 0}>
                  <div class={css({ display: "flex", alignItems: "center", gap: "2", fontSize: "xs", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "wider", color: "onSurfaceVariant", px: "1" })}>
                    <ListOrdered class={css({ h: "3.5", w: "3.5" })} />
                    <span>Other Tasks ({props.searchQuery ? matchingUnpinnedCount() : unpinnedTasks().length})</span>
                  </div>
                </Show>

                <div class={css({ display: "flex", flexDirection: "column", w: "full", minW: "0" })}>
                  <For each={unpinnedTasks()}>
                    {(task, idx) => {
                      const visualIdx = () => pinnedTasks().length + idx();
                      const isMatch = () => isTaskMatchingQuery(task, props.searchQuery);
                      return (
                        <div
                          class={cn(
                            "task-search-slot",
                            !isMatch() && "eliminated"
                          )}
                        >
                          <div class="task-search-content">
                            <div class={css({ position: "relative", w: "full", minW: "0" })}>
                              <TaskItem
                                task={task}
                                index={visualIdx()}
                                totalTasks={props.tasks.length}
                                allTags={props.allTags}
                                onToggleStatus={props.onToggleStatus}
                                onOpenDetail={props.onOpenDetail}
                                onDeleteDirect={props.onDeleteDirect}
                                onTogglePin={props.onTogglePin}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onDragEnd={handleDragEnd}
                                isDragOver={dragOverIndex() === visualIdx() && draggedIndex() !== visualIdx()}
                                dragPosition={dragOverPosition()}
                                isDragging={draggedIndex() === visualIdx()}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </section>
            </Show>
          </div>
        </Show>

        {/* Search Empty State */}
        <Show when={props.searchQuery.trim().length > 0 && matchingCount() === 0}>
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
      </div>
    </Show>
  );
}
