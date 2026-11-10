/**
 * Top app bar header with search input, view mode switcher, and sort options popover.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-02`
 * - Design: `@design:FR-TASK-02`
 *
 * # Arguments
 * - `props`: TaskAppBarProps with search state, sort options, view mode, and modal triggers.
 *
 * # Returns
 * SolidJS JSX sticky header component with Panda CSS styles.
 */
import { createSignal, createEffect, onCleanup, Show, For } from "solid-js";
import {
  Search,
  X,
  FilePlus,
  SlidersHorizontal,
  Check,
  Menu,
} from "lucide-solid";
import { SortOption, ViewMode, StatusFilter, AttributeFilter } from "@/src/domain";
import { Button } from "@/src/presentation/components/ui/button";
import { ViewModeToggle } from "@/src/presentation/components/ui/view-mode-toggle";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

const headerStyle = css({
  position: "sticky",
  top: "0",
  zIndex: 30,
  w: "full",
  bg: "surface/90",
  backdropFilter: "blur(12px)",
  borderBottomWidth: "1px",
  borderColor: "outlineVariant",
  transition: "colors 0.2s",
});

const headerContainer = css({
  maxW: "7xl",
  mx: "auto",
  px: { base: "4", sm: "6", lg: "8" },
  h: "16",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3",
  position: "relative",
});

interface TaskAppBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  statusFilter?: StatusFilter;
  onStatusFilterChange?: (filter: StatusFilter) => void;
  attributeFilter?: AttributeFilter;
  onAttributeFilterChange?: (filter: AttributeFilter) => void;
  onOpenCreateModal: () => void;
  onOpenDrawer?: () => void;
  trashCount?: number;
  archiveCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  onOpenManagementModal?: (mode: "export" | "import") => void;
  onOpenExportModal?: () => void;
  onOpenImportModal?: () => void;
  onResetSampleData?: () => void;
  onOpenSettings?: () => void;
  onOpenTrash?: () => void;
  onOpenTags?: () => void;
  onOpenArchive?: () => void;
}

const sortOptionsList: { label: string; value: SortOption }[] = [
  { label: "Default Order", value: "custom" },
  { label: "Alphabetical (A - Z)", value: "ascending" },
  { label: "Alphabetical (Z - A)", value: "descending" },
  { label: "Newest First", value: "newest_first" },
  { label: "Oldest First", value: "oldest_first" },
];

const statusFilterOptions: { label: string; value: StatusFilter }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Incomplete Only", value: "incomplete" },
  { label: "Completed Only", value: "completed" },
];

const attributeFilterOptions: { label: string; value: AttributeFilter }[] = [
  { label: "All Tasks", value: "all" },
  { label: "With Deadline", value: "has_deadline" },
  { label: "With Reminder / Alarm", value: "has_reminder" },
  { label: "Pinned Only", value: "pinned_only" },
];

export function TaskAppBar(props: TaskAppBarProps) {
  const [isSearching, setIsSearching] = createSignal(false);
  const [isSortOpen, setIsSortOpen] = createSignal(false);

  let searchInputRef: HTMLInputElement | undefined;
  let sortRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (isSearching()) {
      setTimeout(() => {
        searchInputRef?.focus();
      }, 50);
    }
  });

  createEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef && !sortRef.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    onCleanup(() => document.removeEventListener("mousedown", handleClickOutside));
  });

  const handleViewChange = (newMode: ViewMode) => {
    if (newMode === props.viewMode) return;
    props.onViewModeChange?.(newMode);
  };

  return (
    <header class={headerStyle}>
      <div class={headerContainer}>
        {/* Left Side: Drawer Hamburger Button + Inbox Title */}
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
          <Show when={props.onOpenDrawer}>
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
            Inbox
          </h1>
        </div>

        {/* Right Side: Action Controls + Expanding Search Bar + Search/Close Toggle */}
        <div class={css({ display: "flex", alignItems: "center", justifyContent: "flex-end", flex: "1", minW: "0", gap: "1.5" })}>
          {/* Action buttons (View Switcher, Add Task) - hidden during search */}
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
                : css({ opacity: 1, transform: "scale(1)" })
            )}
          >
            {/* View Mode Toggle Switch */}
            <Show when={props.onViewModeChange}>
              <ViewModeToggle
                value={props.viewMode || "list"}
                onChange={handleViewChange}
                class={css({ mr: "1" })}
              />
            </Show>

            {/* Create Task Icon Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={props.onOpenCreateModal}
              class={css({ borderRadius: "full", color: "onSurface", cursor: "pointer" })}
              aria-label="Add task"
              title="Add task"
            >
              <FilePlus class={css({ h: "5", w: "5" })} />
            </Button>
          </div>

          {/* Animated Expanding Search Bar: sits immediately to the left of the search icon */}
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
                _focusWithin: {
                  borderColor: "primary",
                  boxShadow: "0 0 0 1px var(--colors-primary)",
                },
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
              value={props.searchQuery}
              onInput={(e) => props.onSearchChange(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsSearching(false);
                  props.onSearchChange("");
                }
              }}
              placeholder="Search tasks..."
              class={css({
                flex: "1",
                minW: "0",
                bg: "transparent",
                fontSize: { base: "sm", sm: "base" },
                color: "onSurface",
                outline: "none",
                px: "2",
                "&::placeholder": { color: "onSurfaceVariant", opacity: 0.7 },
              })}
            />

            <Show when={props.searchQuery}>
              <button
                type="button"
                onClick={() => {
                  props.onSearchChange("");
                  searchInputRef?.focus();
                }}
                class={css({
                  p: "1",
                  borderRadius: "full",
                  color: "onSurfaceVariant",
                  cursor: "pointer",
                  _hover: { color: "onSurface", bg: "surfaceContainerHigh" },
                })}
                aria-label="Clear search"
              >
                <X class={css({ h: "4", w: "4" })} />
              </button>
            </Show>

            {/* Filter & Sort Option within search view */}
            <div class={css({ position: "relative" })} ref={sortRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen())}
                class={cn(
                  css({
                    p: "1.5",
                    borderRadius: "full",
                    transition: "colors 0.2s",
                    cursor: "pointer",
                    ml: "1",
                  }),
                  isSortOpen() ||
                    props.currentSort !== "custom" ||
                    (props.statusFilter && props.statusFilter !== "all") ||
                    (props.attributeFilter && props.attributeFilter !== "all")
                    ? css({ bg: "primary", color: "onPrimary" })
                    : css({ color: "onSurfaceVariant", _hover: { color: "onSurface", bg: "surfaceContainerHigh" } })
                )}
                aria-label="Filter and sort options"
                title="Filter and sort tasks"
              >
                <SlidersHorizontal class={css({ h: "4", w: "4" })} />
              </button>

              <Show when={isSortOpen()}>
                <div
                  class={cn(
                    css({
                      position: "absolute",
                      right: "0",
                      mt: "2",
                      w: "64",
                      borderRadius: "14px",
                      borderWidth: "1px",
                      borderColor: "outlineVariant",
                      bg: "surfaceContainerHigh",
                      p: "2",
                      shadow: "2xl",
                      zIndex: 50,
                      maxH: "85vh",
                      overflowY: "auto",
                      transformOrigin: "top right",
                    }),
                    "animate-dropdown-spring"
                  )}
                >
                  {/* Section 1: Sort Alphabetical / Time */}
                  <div class={css({ px: "3", py: "1.5", fontSize: "11px", fontWeight: "bold", color: "primary", textTransform: "uppercase", letterSpacing: "wider" })}>
                    Sort Order
                  </div>
                  <For each={sortOptionsList}>
                    {(opt) => (
                      <button
                        type="button"
                        onClick={() => {
                          props.onSortChange(opt.value);
                          setIsSortOpen(false);
                        }}
                        class={cn(
                          css({
                            w: "full",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: "3",
                            py: "1.5",
                            fontSize: "xs",
                            borderRadius: "8px",
                            transition: "colors 0.2s",
                            cursor: "pointer",
                            textAlign: "left",
                          }),
                          props.currentSort === opt.value
                            ? css({ bg: "primary", color: "onPrimary", fontWeight: "semibold" })
                            : css({ color: "onSurface", _hover: { bg: "surfaceContainerHighest" } })
                        )}
                      >
                        <span>{opt.label}</span>
                        <Show when={props.currentSort === opt.value}>
                          <Check class={css({ h: "3.5", w: "3.5", flexShrink: 0 })} />
                        </Show>
                      </button>
                    )}
                  </For>

                  <div class={css({ my: "2", borderTopWidth: "1px", borderColor: "outlineVariant/40" })} />

                  {/* Section 2: Filter by Status */}
                  <div class={css({ px: "3", py: "1.5", fontSize: "11px", fontWeight: "bold", color: "primary", textTransform: "uppercase", letterSpacing: "wider" })}>
                    Status Filter
                  </div>
                  <For each={statusFilterOptions}>
                    {(opt) => (
                      <button
                        type="button"
                        onClick={() => {
                          props.onStatusFilterChange?.(opt.value);
                          setIsSortOpen(false);
                        }}
                        class={cn(
                          css({
                            w: "full",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: "3",
                            py: "1.5",
                            fontSize: "xs",
                            borderRadius: "8px",
                            transition: "colors 0.2s",
                            cursor: "pointer",
                            textAlign: "left",
                          }),
                          (props.statusFilter ?? "all") === opt.value
                            ? css({ bg: "primary", color: "onPrimary", fontWeight: "semibold" })
                            : css({ color: "onSurface", _hover: { bg: "surfaceContainerHighest" } })
                        )}
                      >
                        <span>{opt.label}</span>
                        <Show when={(props.statusFilter ?? "all") === opt.value}>
                          <Check class={css({ h: "3.5", w: "3.5", flexShrink: 0 })} />
                        </Show>
                      </button>
                    )}
                  </For>

                  <div class={css({ my: "2", borderTopWidth: "1px", borderColor: "outlineVariant/40" })} />

                  {/* Section 3: Filter by Attributes & Alerts */}
                  <div class={css({ px: "3", py: "1.5", fontSize: "11px", fontWeight: "bold", color: "primary", textTransform: "uppercase", letterSpacing: "wider" })}>
                    Alerts & Deadlines
                  </div>
                  <For each={attributeFilterOptions}>
                    {(opt) => (
                      <button
                        type="button"
                        onClick={() => {
                          props.onAttributeFilterChange?.(opt.value);
                          setIsSortOpen(false);
                        }}
                        class={cn(
                          css({
                            w: "full",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: "3",
                            py: "1.5",
                            fontSize: "xs",
                            borderRadius: "8px",
                            transition: "colors 0.2s",
                            cursor: "pointer",
                            textAlign: "left",
                          }),
                          (props.attributeFilter ?? "all") === opt.value
                            ? css({ bg: "primary", color: "onPrimary", fontWeight: "semibold" })
                            : css({ color: "onSurface", _hover: { bg: "surfaceContainerHighest" } })
                        )}
                      >
                        <span>{opt.label}</span>
                        <Show when={(props.attributeFilter ?? "all") === opt.value}>
                          <Check class={css({ h: "3.5", w: "3.5", flexShrink: 0 })} />
                        </Show>
                      </button>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </div>

          {/* Search / X Toggle Button with Rotate & Fade Transition */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isSearching()) {
                setIsSearching(false);
                props.onSearchChange("");
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
            aria-label={isSearching() ? "Close search" : "Open search"}
            title={isSearching() ? "Close search" : "Search tasks"}
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
  );
}
