/**
 * Archive workspace view for viewing, searching, and restoring archived tasks.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-01`
 * - Design: `@design:FR-TASK-01`
 *
 * # Arguments
 * - `props`: ArchiveViewProps with archived tasks array, unarchive handlers, and navigation.
 *
 * # Returns
 * SolidJS JSX workspace page for archived tasks with list and kanban view support.
 */
import { createSignal, createEffect, onCleanup, Show, For } from "solid-js";
import {
  Archive,
  ArrowLeft,
  RotateCcw,
  SearchX,
  Search,
  X,
  Menu,
} from "lucide-solid";
import { Task, Tag, ViewMode } from "@/src/domain";
import { Button } from "@/src/presentation/components/ui/button";
import { TaskItem } from "@/src/presentation/components/task/TaskItem";
import { TaskKanbanView } from "@/src/presentation/components/task/TaskKanbanView";
import { ViewModeToggle } from "@/src/presentation/components/ui/view-mode-toggle";
import { EmptyState } from "@/src/presentation/components/ui/empty-state";
import { isTaskMatchingQuery } from "@/src/services";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

interface ArchiveViewProps {
  archiveTasks: Task[];
  allTags?: Tag[];
  onBackToHome: () => void;
  onOpenDrawer?: () => void;
  onUnarchiveTask: (task: Task) => void;
  onUnarchiveAllTasks: () => void;
  onDeleteDirect: (task: Task) => void;
  onEmptyArchiveToTrash: () => void;
  onOpenDetail?: (task: Task) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

function getViewSlideClass(direction: "left" | "right" | null): string {
  if (direction === "right") return "animate-swipe-right";
  if (direction === "left") return "animate-swipe-left";
  return "";
}

export function ArchiveView(props: ArchiveViewProps) {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [isSearching, setIsSearching] = createSignal(false);
  const [localViewMode, setLocalViewMode] = createSignal<ViewMode>("list");
  const [viewDirection, setViewDirection] = createSignal<"left" | "right" | null>(null);
  let searchInputRef: HTMLInputElement | undefined;

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

  const effectiveViewMode = () => props.viewMode ?? localViewMode();

  const matchingCount = () =>
    props.archiveTasks.filter((t) => isTaskMatchingQuery(t, searchQuery())).length;

  const handleViewChange = (newMode: ViewMode) => {
    if (newMode === effectiveViewMode()) return;
    const dir = newMode === "kanban" ? "right" : "left";
    setViewDirection(dir);
    if (props.onViewModeChange) {
      props.onViewModeChange(newMode);
      return;
    }
    setLocalViewMode(newMode);
  };

  return (
    <div class={css({ flex: "1", display: "flex", flexDirection: "column", minH: "screen", bg: "background", color: "onBackground", pb: "20" })}>
      {/* Sticky Header with integrated search matching Inbox, Tags, and Trash */}
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
              when={props.onOpenDrawer}
              fallback={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={props.onBackToHome}
                  class={css({ borderRadius: "full", color: "onSurface", cursor: "pointer", ml: "-1" })}
                  aria-label="Back to tasks"
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

            <h1 class={css({ fontSize: "xl", fontWeight: "bold", letterSpacing: "tight", color: "onSurface", lineHeight: "none" })}>
              Archive
            </h1>
          </div>

          {/* Right Header Action Controls + Expanding Search Bar */}
          <div class={css({ display: "flex", alignItems: "center", justifyContent: "flex-end", flex: "1", minW: "0", gap: "1.5" })}>
            {/* View Mode Toggle and Unarchive All (hidden during search) */}
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
              <Show when={props.archiveTasks.length > 0}>
                <ViewModeToggle
                  value={effectiveViewMode()}
                  onChange={handleViewChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={props.onUnarchiveAllTasks}
                  class={css({ borderRadius: "12px", h: "9", px: "3", gap: "1.5", fontSize: "xs", color: "primary", cursor: "pointer" })}
                >
                  <RotateCcw class={css({ h: "3.5", w: "3.5" })} />
                  <span class={css({ display: { base: "none", sm: "inline" } })}>Unarchive All</span>
                </Button>
              </Show>
            </div>

            {/* Expanding Search Bar */}
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
                placeholder="Search in archive..."
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
              aria-label={isSearching() ? "Close search" : "Search in archive"}
              title={isSearching() ? "Close search" : "Search in archive"}
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

      {/* Main Content Area */}
      <main class={css({ maxW: "7xl", mx: "auto", w: "full", px: { base: "4", sm: "6", lg: "8" }, py: "6", display: "flex", flexDirection: "column", gap: "5", flex: "1", overflowX: "clip", position: "relative" })}>
        <Show
          when={props.archiveTasks.length > 0}
          fallback={
            <EmptyState
              icon={(p) => <Archive {...p} />}
              title="Archive is empty"
              description="Completed or inactive tasks moved to the archive will appear here."
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
                <For each={props.archiveTasks}>
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
                              totalTasks={props.archiveTasks.length}
                              allTags={props.allTags}
                              isArchiveMode={true}
                              onUnarchive={props.onUnarchiveTask}
                              onDeleteDirect={props.onDeleteDirect}
                              onOpenDetail={props.onOpenDetail}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </For>

                <Show when={searchQuery().trim().length > 0 && matchingCount() === 0}>
                  <div class="animate-in fade-in duration-200">
                    <EmptyState
                      icon={(p) => <SearchX {...p} />}
                      iconColor="muted"
                      title="No tasks found"
                      description={
                        <>
                          No tasks matched your search for <span class={css({ fontWeight: "semibold", color: "onSurface" })}>"{searchQuery()}"</span>.
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
                tasks={props.archiveTasks}
                searchQuery={searchQuery()}
                allTags={props.allTags}
                isArchiveMode={true}
                onUnarchive={props.onUnarchiveTask}
                onDeleteDirect={props.onDeleteDirect}
                onOpenDetail={props.onOpenDetail}
              />
            </div>
          </Show>
        </Show>
      </main>
    </div>
  );
}
