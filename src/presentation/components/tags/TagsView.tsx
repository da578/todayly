/**
 * Tags workspace view for categorizing, filtering, creating, and editing tags.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TAG-01`
 * - Design: `@design:FR-TAG-01`
 *
 * # Arguments
 * - `props`: TagsViewProps with tags list, tasks list, navigation, and CRUD event callbacks.
 *
 * # Returns
 * SolidJS JSX workspace page for tags with list and kanban views.
 */
import { createSignal, createEffect, onCleanup, Show, For } from "solid-js";
import { Portal } from "solid-js/web";
import {
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
  Layers,
  MoreVertical,
  SearchX,
  Search,
  X,
  ArrowLeft,
  Menu,
} from "lucide-solid";
import { Tag, Task, ViewMode } from "@/src/domain";
import { Button } from "@/src/presentation/components/ui/button";
import { TaskItem } from "@/src/presentation/components/task/TaskItem";
import { TaskKanbanView } from "@/src/presentation/components/task/TaskKanbanView";
import { TagCreateModal } from "@/src/presentation/components/tags/TagCreateModal";
import { ViewModeToggle } from "@/src/presentation/components/ui/view-mode-toggle";
import { EmptyState } from "@/src/presentation/components/ui/empty-state";
import { isTaskMatchingQuery } from "@/src/services";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

interface TagsViewProps {
  tags: Tag[];
  tasks: Task[];
  onBackToHome: () => void;
  onOpenDrawer?: () => void;
  onCreateTag: (data: { name: string; color: string }) => void;
  onUpdateTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
  onToggleStatus: (id: number) => void;
  onOpenDetail: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onTogglePin?: (id: number) => void;
  onOpenCreateTask?: (defaultTagId?: string) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

function getViewSlideClass(direction: "left" | "right" | null): string {
  if (direction === "right") return "animate-swipe-right";
  if (direction === "left") return "animate-swipe-left";
  return "";
}

export function TagsView(props: TagsViewProps) {
  const [selectedTagId, setSelectedTagId] = createSignal<string | null>(null);
  const [activeMenuTarget, setActiveMenuTarget] = createSignal<{
    x: number;
    y: number;
    tag: Tag;
  } | null>(null);
  const [isCreateTagOpen, setIsCreateTagOpen] = createSignal(false);
  const [editingTag, setEditingTag] = createSignal<Tag | null>(null);
  const [localViewMode, setLocalViewMode] = createSignal<ViewMode>("list");
  const [viewDirection, setViewDirection] = createSignal<"left" | "right" | null>(null);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [isSearching, setIsSearching] = createSignal(false);
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

  const selectedTag = () => props.tags.find((t) => t.id === selectedTagId()) || null;

  const tagScopedTasks = () =>
    props.tasks.filter((task) => {
      if (task.deletedAt || task.isArchived) return false;
      const tagId = selectedTagId();
      if (!tagId) return true;
      return task.tags?.includes(tagId);
    });

  const matchingCount = () =>
    tagScopedTasks().filter((task) => isTaskMatchingQuery(task, searchQuery())).length;

  const pinnedTasks = () => tagScopedTasks().filter((t) => t.isPinned);
  const unpinnedTasks = () => tagScopedTasks().filter((t) => !t.isPinned);
  const hasPinnedGrouping = () => pinnedTasks().length > 0;
  const matchingPinnedCount = () =>
    pinnedTasks().filter((t) => isTaskMatchingQuery(t, searchQuery())).length;
  const matchingUnpinnedCount = () =>
    unpinnedTasks().filter((t) => isTaskMatchingQuery(t, searchQuery())).length;

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

  const handleOpenTagOptions = (e: MouseEvent, tag: Tag) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dropdownWidth = 160;
    const x = Math.min(rect.left, window.innerWidth - dropdownWidth - 16);
    const y = rect.bottom + 8;
    setActiveMenuTarget({ x, y, tag });
  };

  return (
    <div class={css({ flex: "1", display: "flex", flexDirection: "column", minH: "screen", bg: "background", color: "onBackground", pb: "28", position: "relative" })}>
      {/* Sticky Header with integrated search matching Inbox and Trash */}
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
              Tags
            </h1>
          </div>

          {/* Right Header Action Controls + Expanding Search Bar */}
          <div class={css({ display: "flex", alignItems: "center", justifyContent: "flex-end", flex: "1", minW: "0", gap: "1.5" })}>
            {/* View Mode Toggle (hidden during search) */}
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
              <ViewModeToggle
                value={effectiveViewMode()}
                onChange={handleViewChange}
                class={css({ mr: "1" })}
              />
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
                placeholder={selectedTag() ? `Search in "${selectedTag()?.name}"...` : "Search in tags..."}
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

            {/* Search / X Toggle Button */}
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
              aria-label={isSearching() ? "Close search" : "Search in tags"}
              title={isSearching() ? "Close search" : "Search in tags"}
            >
              {/* Search Icon */}
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

              {/* X Icon */}
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
      <main class={css({ flex: "1", maxW: "7xl", w: "full", mx: "auto", px: { base: "4", sm: "6", lg: "8" }, py: "4", display: "flex", flexDirection: "column", gap: "4", overflowX: "hidden" })}>
        {/* Tag Filters Header Pills */}
        <div
          class={css({
            display: "flex",
            alignItems: "center",
            gap: "2",
            overflowX: "auto",
            py: "2",
            px: "0.5",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          })}
        >
          {/* All Tasks Pill */}
          <button
            type="button"
            onClick={() => setSelectedTagId(null)}
            class={cn(
              css({
                display: "inline-flex",
                alignItems: "center",
                gap: "2",
                px: "3.5",
                py: "1.5",
                borderRadius: "full",
                fontSize: "xs",
                fontWeight: "semibold",
                whiteSpace: "nowrap",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: "pointer",
                borderWidth: "1px",
                flexShrink: 0,
                userSelect: "none",
              }),
              selectedTagId() === null
                ? css({
                    bg: "primary",
                    color: "onPrimary",
                    borderColor: "primary",
                    shadow: "xs",
                  })
                : css({
                    bg: "surfaceContainer",
                    borderColor: "outlineVariant",
                    color: "onSurface",
                    _hover: { bg: "surfaceContainerHigh", borderColor: "outline" },
                  })
            )}
          >
            <Layers class={css({ h: "3.5", w: "3.5" })} />
            <span>All Tasks</span>
          </button>

          <For each={props.tags}>
            {(tag) => {
              const isSelected = () => selectedTagId() === tag.id;

              return (
                <div
                  class={cn(
                    css({
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "full",
                      borderWidth: "1px",
                      flexShrink: 0,
                      transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                      userSelect: "none",
                      overflow: "hidden",
                    }),
                    isSelected()
                      ? css({
                          shadow: "xs",
                        })
                      : css({
                          bg: "surfaceContainer",
                          borderColor: "outlineVariant",
                          color: "onSurface",
                          _hover: { bg: "surfaceContainerHigh", borderColor: "outline" },
                        })
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
                  {/* Clickable Area to Select Tag */}
                  <button
                    type="button"
                    onClick={() => setSelectedTagId(tag.id)}
                    class={css({
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2",
                      pl: "3.5",
                      pr: "2",
                      py: "1.5",
                      fontSize: "xs",
                      fontWeight: "semibold",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      bg: "transparent",
                      border: "none",
                      color: "inherit",
                    })}
                  >
                    <span
                      class={css({
                        h: "2.5",
                        w: "2.5",
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

                  {/* Integrated More Options Button */}
                  <button
                    type="button"
                    onClick={(e) => handleOpenTagOptions(e, tag)}
                    class={cn(
                      css({
                        pr: "2.5",
                        pl: "1",
                        py: "1.5",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        bg: "transparent",
                        border: "none",
                        transition: "all 0.2s",
                        opacity: 0.75,
                        _hover: { opacity: 1 },
                      }),
                      isSelected()
                        ? css({ color: "inherit" })
                        : css({
                            color: "onSurfaceVariant",
                            _hover: { color: "onSurface" },
                          })
                    )}
                    title={`Options for ${tag.name}`}
                    aria-label={`Options for ${tag.name}`}
                  >
                    <MoreVertical class={css({ h: "3.5", w: "3.5" })} />
                  </button>
                </div>
              );
            }}
          </For>
        </div>

        {/* Fixed Popover Dropdown for Tag Options */}
        <Show when={activeMenuTarget()}>
          {(target) => (
            <>
              <div
                class={css({ position: "fixed", inset: "0", zIndex: 50, cursor: "default" })}
                onClick={() => setActiveMenuTarget(null)}
              />

              <div
                class={cn(
                  css({
                    position: "fixed",
                    zIndex: 50,
                    w: "44",
                    borderRadius: "14px",
                    borderWidth: "1px",
                    borderColor: "outlineVariant",
                    bg: "surfaceContainerHigh",
                    p: "1.5",
                    shadow: "2xl",
                    backdropFilter: "blur(12px)",
                  }),
                  "animate-dropdown-spring"
                )}
                style={{
                  top: `${target().y}px`,
                  left: `${Math.max(12, target().x)}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div class={css({ px: "2.5", py: "1.5", borderBottomWidth: "1px", borderColor: "outlineVariant/40", mb: "1", display: "flex", alignItems: "center", gap: "2" })}>
                  <span
                    class={css({ h: "2.5", w: "2.5", borderRadius: "full", flexShrink: 0 })}
                    style={{ "background-color": target().tag.color }}
                  />
                  <span class={css({ fontSize: "xs", fontWeight: "bold", color: "onSurface", truncate: true })}>
                    {target().tag.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const t = target().tag;
                    setActiveMenuTarget(null);
                    setEditingTag(t);
                    setIsCreateTagOpen(true);
                  }}
                  class={css({ w: "full", display: "flex", alignItems: "center", gap: "2.5", px: "2.5", py: "2", fontSize: "xs", fontWeight: "medium", borderRadius: "10px", color: "onSurface", cursor: "pointer", _hover: { bg: "surfaceContainerHighest" } })}
                >
                  <Edit2 class={css({ h: "3.5", w: "3.5", color: "primary" })} />
                  <span>Edit Tag</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const tagId = target().tag.id;
                    setActiveMenuTarget(null);
                    props.onDeleteTag(tagId);
                    if (selectedTagId() === tagId) {
                      setSelectedTagId(null);
                    }
                  }}
                  class={css({ w: "full", display: "flex", alignItems: "center", gap: "2.5", px: "2.5", py: "2", fontSize: "xs", fontWeight: "medium", borderRadius: "10px", color: "error", cursor: "pointer", _hover: { bg: "errorContainer" } })}
                >
                  <Trash2 class={css({ h: "3.5", w: "3.5" })} />
                  <span>Delete Tag</span>
                </button>
              </div>
            </>
          )}
        </Show>

        {/* Tasks Rendered in List or Kanban view without unwanted menu switch animations */}
        <Show
          when={effectiveViewMode() === "kanban"}
          fallback={
            <div class={cn(css({ display: "flex", flexDirection: "column", pt: "1", w: "full", minW: "0" }), getViewSlideClass(viewDirection()))}>
              <Show
                when={tagScopedTasks().length > 0}
                fallback={
                  <EmptyState
                    icon={(p) => <FolderOpen {...p} />}
                    iconColor="muted"
                    minHeight="240px"
                    title={selectedTag() ? `No tasks in "${selectedTag()?.name}"` : "No tagged tasks"}
                    description={
                      selectedTag()
                        ? `No active tasks found for "${selectedTag()?.name}".`
                        : "There are no tasks with tags."
                    }
                    action={
                      props.onOpenCreateTask && selectedTagId() ? (
                        <Button
                          onClick={() => props.onOpenCreateTask?.(selectedTagId() || undefined)}
                          class={css({ mt: "1", h: "10", px: "4", borderRadius: "10px", fontSize: "xs", fontWeight: "semibold", gap: "1.5", cursor: "pointer", mx: "auto" })}
                        >
                          <Plus class={css({ h: "4", w: "4" })} />
                          <span>Add Task to "{selectedTag()?.name}"</span>
                        </Button>
                      ) : undefined
                    }
                  />
                }
              >
                <Show
                  when={hasPinnedGrouping()}
                  fallback={
                    <div class={css({ display: "flex", flexDirection: "column", w: "full", minW: "0" })}>
                      <For each={tagScopedTasks()}>
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
                                    allTags={props.tags}
                                    onToggleStatus={props.onToggleStatus}
                                    onOpenDetail={props.onOpenDetail}
                                    onDeleteDirect={props.onDeleteTask}
                                    onTogglePin={props.onTogglePin}
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
                  <div class={css({ display: "flex", flexDirection: "column", gap: "6" })}>
                    <section class={css({ display: "flex", flexDirection: "column", gap: "3" })}>
                      <Show when={!searchQuery() || matchingPinnedCount() > 0}>
                        <div class={css({ fontSize: "xs", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "wider", color: "primary", px: "1" })}>
                          Pinned Tasks ({searchQuery() ? matchingPinnedCount() : pinnedTasks().length})
                        </div>
                      </Show>
                      <div class={css({ display: "flex", flexDirection: "column", w: "full", minW: "0" })}>
                        <For each={pinnedTasks()}>
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
                                      allTags={props.tags}
                                      onToggleStatus={props.onToggleStatus}
                                      onOpenDetail={props.onOpenDetail}
                                      onDeleteDirect={props.onDeleteTask}
                                      onTogglePin={props.onTogglePin}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        </For>
                      </div>
                    </section>

                    <Show when={unpinnedTasks().length > 0 && (!searchQuery() || matchingUnpinnedCount() > 0)}>
                      <section class={css({ display: "flex", flexDirection: "column", gap: "3", pt: "2", w: "full", minW: "0" })}>
                        <div class={css({ fontSize: "xs", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "wider", color: "onSurfaceVariant", px: "1" })}>
                          Other Tasks ({searchQuery() ? matchingUnpinnedCount() : unpinnedTasks().length})
                        </div>
                        <div class={css({ display: "flex", flexDirection: "column", w: "full", minW: "0" })}>
                          <For each={unpinnedTasks()}>
                            {(task, idx) => {
                              const visualIdx = () => pinnedTasks().length + idx();
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
                                        index={visualIdx()}
                                        allTags={props.tags}
                                        onToggleStatus={props.onToggleStatus}
                                        onOpenDetail={props.onOpenDetail}
                                        onDeleteDirect={props.onDeleteTask}
                                        onTogglePin={props.onTogglePin}
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
              </Show>
            </div>
          }
        >
          {/* Kanban Board View */}
          <div class={cn(css({ w: "full", minW: "0" }), getViewSlideClass(viewDirection()))}>
            <TaskKanbanView
              tasks={tagScopedTasks()}
              allTags={props.tags}
              searchQuery={searchQuery()}
              onToggleStatus={props.onToggleStatus}
              onOpenDetail={props.onOpenDetail}
              onDeleteDirect={props.onDeleteTask}
              onTogglePin={props.onTogglePin}
              onOpenCreateModal={() => {
                props.onOpenCreateTask?.(selectedTagId() || undefined);
              }}
            />
          </div>
        </Show>
      </main>

      {/* Floating Create Tag Action Button */}
      <Portal>
        <button
          type="button"
          onClick={() => {
            setEditingTag(null);
            setIsCreateTagOpen(true);
          }}
          class={css({
            position: "fixed",
            bottom: "6",
            right: "6",
            zIndex: 40,
            h: "14",
            w: "14",
            borderRadius: "xl",
            bg: "primary",
            color: "onPrimary",
            shadow: "xl",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderWidth: "1px",
            borderColor: "rgba(255, 255, 255, 0.15)",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            _hover: { shadow: "2xl", transform: "scale(1.05)" },
            _active: { transform: "scale(0.95)" },
          })}
          title="Create Tag"
          aria-label="Create new tag"
        >
          <Plus class={css({ h: "6", w: "6" })} />
        </button>
      </Portal>

      {/* Tag Create/Edit Modal */}
      <TagCreateModal
        open={isCreateTagOpen()}
        onOpenChange={setIsCreateTagOpen}
        initialTag={editingTag()}
        onCreateTag={(data) => {
          const currentEditing = editingTag();
          if (currentEditing) {
            props.onUpdateTag({ ...currentEditing, ...data });
            return;
          }
          props.onCreateTag(data);
        }}
      />
    </div>
  );
}
