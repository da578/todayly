/**
 * Trash workspace view for viewing, restoring, and permanently purging deleted tasks.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-01`
 * - Design: `@design:FR-TASK-01`
 *
 * # Arguments
 * - `props`: TrashViewProps with trashed tasks, restore/delete handlers, and origin tracking.
 *
 * # Returns
 * SolidJS JSX workspace page for trash bin with confirmation modal.
 */
import { createSignal, createEffect, onCleanup, Show, For } from "solid-js";
import {
  ArrowLeft,
  Menu,
  Trash2,
  RotateCcw,
  Search,
  X,
  AlertTriangle,
  MoreVertical,
  Info,
  SearchX,
} from "lucide-solid";
import { Task, Tag, ViewMode } from "@/src/domain";
import { Button } from "@/src/presentation/components/ui/button";
import { ViewModeToggle } from "@/src/presentation/components/ui/view-mode-toggle";
import { EmptyState } from "@/src/presentation/components/ui/empty-state";
import { ConfirmDialog } from "@/src/presentation/components/ui/confirm-dialog";
import { TaskItem } from "@/src/presentation/components/task/TaskItem";
import { TaskKanbanView } from "@/src/presentation/components/task/TaskKanbanView";
import { isTaskMatchingQuery } from "@/src/services";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

interface TrashViewProps {
  trashTasks: Task[];
  allTags?: Tag[];
  source?: "home" | "settings";
  onBackToHome: () => void;
  onOpenDrawer?: () => void;
  onRestoreTask: (task: Task) => void;
  onRestoreAllTasks: () => void;
  onPermanentDeleteTask: (id: number) => void;
  onEmptyTrash: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

function getViewSlideClass(direction: "left" | "right" | null): string {
  if (direction === "right") return "animate-swipe-right";
  if (direction === "left") return "animate-swipe-left";
  return "";
}

export function TrashView(props: TrashViewProps) {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [isSearching, setIsSearching] = createSignal(false);
  const [isEmptyConfirmOpen, setIsEmptyConfirmOpen] = createSignal(false);
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [localViewMode, setLocalViewMode] = createSignal<ViewMode>("list");
  const [viewDirection, setViewDirection] = createSignal<"left" | "right" | null>(null);

  const effectiveViewMode = () => props.viewMode ?? localViewMode();

  let searchInputRef: HTMLInputElement | undefined;
  let menuRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (isSearching()) {
      searchInputRef?.focus();
      const raf = requestAnimationFrame(() => {
        searchInputRef?.focus();
      });
      const timer = setTimeout(() => {
        searchInputRef?.focus();
      }, 50);
      onCleanup(() => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      });
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

  const filteredTrash = () => {
    const q = searchQuery().trim().toLowerCase();
    if (!q) return props.trashTasks;
    return props.trashTasks.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  };

  const setViewModeWithTransition = (mode: ViewMode) => {
    if (mode === effectiveViewMode()) return;
    const dir = mode === "kanban" ? "right" : "left";
    setViewDirection(dir);
    if (props.onViewModeChange) {
      props.onViewModeChange(mode);
      return;
    }
    setLocalViewMode(mode);
  };

  return (
    <div class={css({ flex: "1", display: "flex", flexDirection: "column", minH: "screen", bg: "background", color: "onBackground", pb: "20" })}>
      {/* Sticky Header */}
      <header class={css({ position: "sticky", top: "0", zIndex: 30, w: "full", bg: "surface/90", backdropFilter: "blur(12px)", borderBottomWidth: "1px", borderColor: "outlineVariant" })}>
        <div class={css({ maxW: "7xl", mx: "auto", px: { base: "4", sm: "6", lg: "8" }, h: "16", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "3", position: "relative" })}>
          {/* Left Title Area */}
          <div
            class={cn(
              css({
                display: "flex",
                alignItems: "center",
                gap: "2",
                userSelect: "none",
                flexShrink: 0,
                transition: "opacity 200ms ease, transform 200ms ease",
              }),
              isSearching()
                ? css({ opacity: 0, transform: "translateX(-8px)", pointerEvents: "none", position: "absolute", left: { base: "4", sm: "6", lg: "8" } })
                : css({ opacity: 1, transform: "translateX(0)" })
            )}
          >
            <Show
              when={props.source === "settings"}
              fallback={
                <Show
                  when={props.onOpenDrawer}
                  fallback={
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={props.onBackToHome}
                      class={css({ borderRadius: "full", color: "onSurface", cursor: "pointer", ml: "-1" })}
                      aria-label="Back to previous screen"
                    >
                      <ArrowLeft class={css({ h: "5", w: "5" })} />
                    </Button>
                  }
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={props.onOpenDrawer}
                    class={css({ borderRadius: "full", color: "onSurface", cursor: "pointer", ml: "-1" })}
                    title="Open Navigation Drawer"
                    aria-label="Open Navigation Drawer"
                  >
                    <Menu class={css({ h: "5", w: "5" })} />
                  </Button>
                </Show>
              }
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={props.onBackToHome}
                class={css({ borderRadius: "full", color: "onSurface", cursor: "pointer", ml: "-1" })}
                title="Back to Settings"
                aria-label="Back to Settings"
              >
                <ArrowLeft class={css({ h: "5", w: "5" })} />
              </Button>
            </Show>
            <h1 class={css({ fontSize: "xl", fontWeight: "bold", letterSpacing: "tight", color: "onSurface", lineHeight: "none" })}>
              Trash
            </h1>
          </div>

          {/* Right Header Action Controls + Expanding Search Bar */}
          <div class={css({ display: "flex", alignItems: "center", justifyContent: "flex-end", flex: "1", minW: "0", gap: "1.5" })}>
            {/* Non-search controls */}
            <div
              class={cn(
                css({
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5",
                  flexShrink: 0,
                  transition: "opacity 200ms ease, transform 200ms ease",
                }),
                isSearching()
                  ? css({ opacity: 0, transform: "scale(0.85)", pointerEvents: "none", display: "none" })
                  : css({ opacity: 1 })
              )}
            >
              {/* View Mode Toggle Switch */}
              <Show when={props.trashTasks.length > 0}>
                <ViewModeToggle
                  value={effectiveViewMode()}
                  onChange={setViewModeWithTransition}
                  class={css({ mr: "1" })}
                />
              </Show>

              <div class={css({ position: "relative" })} ref={menuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen())}
                  class={css({ borderRadius: "full", color: "onSurface", cursor: "pointer" })}
                  title="More options"
                  aria-label="More options"
                >
                  <MoreVertical class={css({ h: "5", w: "5" })} />
                </Button>

                <Show when={isMenuOpen()}>
                  <div class={cn(css({ position: "absolute", right: "0", mt: "2", w: "72", borderRadius: "12px", borderWidth: "1px", borderColor: "outlineVariant", bg: "surfaceContainerHigh", p: "2.5", shadow: "xl", zIndex: 50, display: "flex", flexDirection: "column", gap: "2" }), "animate-dropdown-spring")}>
                    <div class={css({ p: "3", borderRadius: "10px", bg: "surfaceContainer/80", borderWidth: "1px", borderColor: "outlineVariant/40", display: "flex", alignItems: "flex-start", gap: "2.5" })}>
                      <Info class={css({ h: "4", w: "4", color: "primary", flexShrink: 0, mt: "0.5" })} />
                      <span class={css({ fontSize: "xs", color: "onSurfaceVariant", lineHeight: "relaxed" })}>
                        Deleted tasks are moved here. You can restore them to your active tasks or permanently delete them.
                      </span>
                    </div>

                    <div class={css({ my: "1", borderTopWidth: "1px", borderColor: "outlineVariant/40" })} />

                    <Show when={props.trashTasks.length > 0}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          props.onRestoreAllTasks();
                        }}
                        class={css({ w: "full", display: "flex", alignItems: "center", gap: "3", px: "3", py: "2", fontSize: "xs", borderRadius: "10px", color: "onSurface", cursor: "pointer", _hover: { bg: "surfaceContainerHighest" } })}
                      >
                        <RotateCcw class={css({ h: "4", w: "4", color: "primary" })} />
                        <span>Restore All Tasks</span>
                      </button>
                    </Show>

                    <button
                      type="button"
                      disabled={props.trashTasks.length === 0}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsEmptyConfirmOpen(true);
                      }}
                      class={cn(
                        css({ w: "full", display: "flex", alignItems: "center", gap: "3", px: "3", py: "2", fontSize: "xs", borderRadius: "10px" }),
                        props.trashTasks.length === 0
                          ? css({ color: "onSurfaceVariant", opacity: 0.4, cursor: "not-allowed" })
                          : css({ color: "error", cursor: "pointer", _hover: { bg: "errorContainer" } })
                      )}
                    >
                      <Trash2 class={css({ h: "4", w: "4", color: "error" })} />
                      <span>Empty Trash</span>
                    </button>
                  </div>
                </Show>
              </div>
            </div>

            {/* Expanding Search Bar: sits immediately to the left of the search icon */}
            <div
              class={cn(
                css({
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  borderRadius: "full",
                  bg: "surfaceContainerHighest",
                  borderWidth: "1px",
                  borderColor: "outlineVariant",
                  h: "11",
                  minW: "0",
                  shadow: "xs",
                  transformOrigin: "right center",
                  transition: "all 350ms cubic-bezier(0.34, 1.35, 0.64, 1)",
                  _focusWithin: { borderColor: "primary" },
                }),
                isSearching()
                  ? css({
                      flex: "1",
                      opacity: 1,
                      px: "3",
                      py: "1.5",
                      pointerEvents: "auto",
                      visibility: "visible",
                    })
                  : css({
                      w: "0px",
                      flex: "0",
                      opacity: 0,
                      px: "0",
                      borderWidth: "0px",
                      borderColor: "transparent",
                      pointerEvents: "none",
                      visibility: "hidden",
                    })
              )}
            >
              <div
                onClick={() => searchInputRef?.focus()}
                class={css({ p: "1", color: "onSurfaceVariant", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" })}
              >
                <Search class={css({ h: "4", w: "4" })} />
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsSearching(false);
                    setSearchQuery("");
                  }
                }}
                placeholder="Search in trash..."
                class={css({ w: "full", bg: "transparent", fontSize: { base: "sm", sm: "base" }, color: "onSurface", outline: "none", px: "2", "&::placeholder": { color: "onSurfaceVariant", opacity: 0.7 } })}
              />

              <Show when={searchQuery()}>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef?.focus();
                  }}
                  class={css({ p: "1.5", color: "onSurfaceVariant", borderRadius: "full", cursor: "pointer", _hover: { color: "onSurface", bg: "surfaceContainerHighest" } })}
                  aria-label="Clear search query"
                >
                  <X class={css({ h: "4", w: "4" })} />
                </button>
              </Show>
            </div>

            {/* Search / X Toggle Button with Rotate & Fade Transition */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (isSearching()) {
                  setIsSearching(false);
                  setSearchQuery("");
                  return;
                }
                setIsSearching(true);
              }}
              class={css({
                position: "relative",
                borderRadius: "full",
                color: "onSurface",
                cursor: "pointer",
                flexShrink: 0,
                overflow: "hidden",
                w: "10",
                h: "10",
              })}
              aria-label={isSearching() ? "Close search" : "Search in trash"}
              title={isSearching() ? "Close search" : "Search in trash"}
            >
              {/* Search Icon (Rotate 0deg -> 90deg, Fade 1 -> 0) */}
              <div
                class={cn(
                  css({
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }),
                  isSearching()
                    ? css({ transform: "rotate(90deg) scale(0.5)", opacity: 0, pointerEvents: "none" })
                    : css({ transform: "rotate(0deg) scale(1)", opacity: 1 })
                )}
              >
                <Search class={css({ h: "5", w: "5" })} />
              </div>

              {/* X Icon (Rotate -90deg -> 0deg, Fade 0 -> 1) */}
              <div
                class={cn(
                  css({
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }),
                  isSearching()
                    ? css({ transform: "rotate(0deg) scale(1)", opacity: 1 })
                    : css({ transform: "rotate(-90deg) scale(0.5)", opacity: 0, pointerEvents: "none" })
                )}
              >
                <X class={css({ h: "5", w: "5" })} />
              </div>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main class={css({ flex: "1", maxW: "7xl", w: "full", mx: "auto", px: { base: "4", sm: "6", lg: "8" }, py: "6", display: "flex", flexDirection: "column", gap: "4", overflowX: "clip", position: "relative" })}>
        <Show
          when={props.trashTasks.length > 0}
          fallback={
            <EmptyState
              icon={(p) => <Trash2 {...p} />}
              title="Trash is empty"
              description="There are no deleted tasks in the trash."
            />
          }
        >
          <Show
            when={effectiveViewMode() === "kanban"}
            fallback={
              <div
                class={cn(
                  css({ display: "flex", flexDirection: "column", pt: "1", w: "full", minW: "0" }),
                  getViewSlideClass(viewDirection())
                )}
              >
                <For each={props.trashTasks}>
                  {(task, idx) => {
                    const isMatch = () => isTaskMatchingQuery(task, searchQuery());
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
                              totalTasks={props.trashTasks.length}
                              allTags={props.allTags}
                              isTrashMode={true}
                              onRestore={props.onRestoreTask}
                              onPermanentDelete={props.onPermanentDeleteTask}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </For>

                <Show when={searchQuery().trim().length > 0 && filteredTrash().length === 0}>
                  <div class="animate-in fade-in duration-200">
                    <EmptyState
                      icon={(p) => <SearchX {...p} />}
                      iconColor="muted"
                      title="No tasks found"
                      description={
                        <>
                          No tasks found matching <span class={css({ fontWeight: "semibold", color: "onSurface" })}>"{searchQuery()}"</span>.
                        </>
                      }
                    />
                  </div>
                </Show>
              </div>
            }
          >
            <div
              class={cn(
                css({ w: "full", minW: "0" }),
                getViewSlideClass(viewDirection())
              )}
            >
              <TaskKanbanView
                tasks={props.trashTasks}
                searchQuery={searchQuery()}
                allTags={props.allTags}
                isTrashMode={true}
                onRestore={props.onRestoreTask}
                onPermanentDelete={props.onPermanentDeleteTask}
              />
            </div>
          </Show>
        </Show>
      </main>

      {/* Confirmation Dialog for Empty Trash */}
      <ConfirmDialog
        open={isEmptyConfirmOpen()}
        onOpenChange={setIsEmptyConfirmOpen}
        variant="destructive"
        icon={(p) => <AlertTriangle {...p} />}
        title="Empty Trash?"
        description={`All ${props.trashTasks.length} tasks in the trash will be permanently deleted. This action cannot be undone.`}
        confirmText="Empty Trash Now"
        cancelText="Cancel"
        onConfirm={props.onEmptyTrash}
      />
    </div>
  );
}
