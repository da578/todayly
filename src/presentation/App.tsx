/**
 * Main application shell orchestrating routing, reactive stores, and global dialogs.
 *
 * # Traceability
 * - Requirement: `@impl:FR-APP-01`
 * - Design: `@design:FR-APP-01`
 *
 * # Arguments
 * - None (Root application component).
 *
 * # Returns
 * SolidJS JSX application layout with navigation drawer, tab routing, and modal overlays.
 */
import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { useSolidTaskStore } from "./stores";
import { Task, ViewMode, ActiveTab, SortOption } from "@/src/domain";
import { TaskAppBar } from "./components/task/TaskAppBar";
import { TaskListView } from "./components/task/TaskListView";
import { TaskKanbanView } from "./components/task/TaskKanbanView";
import { TaskCreateModal, CreateTaskModalMode } from "./components/task/TaskCreateModal";
import { TaskDetailModal } from "./components/task/TaskDetailModal";
import { TaskManagementModal, ManagementMode } from "./components/task/TaskManagementModal";
import { TagsView } from "./components/tags/TagsView";
import { ArchiveView } from "./components/archive/ArchiveView";
import { TrashView } from "./components/trash/TrashView";
import { SettingsView } from "./components/settings/SettingsView";
import { AboutModal } from "./components/about/AboutModal";
import { NavDrawer } from "./components/navigation/NavDrawer";
import { QuickNoteBar } from "./components/task/QuickNoteBar";
import { checkAndNotifyMissedDeadlines } from "@/src/infrastructure";
import { isTaskMatchingFilter } from "@/src/services";
import { css } from "@/styled-system/css";
import { cn } from "./utils";

const tabIndexMap: Record<ActiveTab, number> = {
  home: 0,
  inbox: 0,
  tags: 1,
  archive: 2,
  trash: 3,
  settings: 4,
};

function getViewSlideClass(direction: "left" | "right" | null): string {
  if (direction === "right") return "animate-swipe-right";
  if (direction === "left") return "animate-swipe-left";
  return "";
}

function getPageRollClass(direction: "up" | "down" | null): string {
  if (direction === "up") return "animate-roll-up";
  if (direction === "down") return "animate-roll-down";
  return "";
}

function sortTaskList(taskList: Task[], sort: SortOption): Task[] {
  const list = [...taskList];
  switch (sort) {
    case "ascending":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "descending":
      return list.sort((a, b) => b.name.localeCompare(a.name));
    case "completed_first":
      return list.sort((a, b) => (b.status ? 1 : 0) - (a.status ? 1 : 0));
    case "nearest_deadline":
      return list.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    case "farthest_deadline":
      return list.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      });
    case "nearest_reminder":
      return list.sort((a, b) => {
        if (!a.reminder && !b.reminder) return 0;
        if (!a.reminder) return 1;
        if (!b.reminder) return -1;
        return new Date(a.reminder).getTime() - new Date(b.reminder).getTime();
      });
    case "farthest_reminder":
      return list.sort((a, b) => {
        if (!a.reminder && !b.reminder) return 0;
        if (!a.reminder) return 1;
        if (!b.reminder) return -1;
        return new Date(b.reminder).getTime() - new Date(a.reminder).getTime();
      });
    case "newest_first":
      return list.sort(
        (a, b) =>
          new Date(b.onCreated).getTime() - new Date(a.onCreated).getTime()
      );
    case "oldest_first":
      return list.sort(
        (a, b) =>
          new Date(a.onCreated).getTime() - new Date(b.onCreated).getTime()
      );
    case "custom":
    default:
      return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
}

export function App() {
  const [state, actions] = useSolidTaskStore();

  // Reactive state getters
  const tasks = () => state().tasks;
  const tags = () => state().tags;
  const theme = () => state().theme;
  const activeTab = () => state().activeTab;
  const viewMode = () => state().viewMode;
  const searchQuery = () => state().searchQuery;
  const currentSort = () => state().currentSort;
  const statusFilter = () => state().statusFilter;
  const attributeFilter = () => state().attributeFilter;
  const trashSourceTab = () => state().trashSourceTab;

  // Local UI states
  const [isDrawerOpen, setIsDrawerOpen] = createSignal(false);
  const [isCreateOpen, setIsCreateOpen] = createSignal(false);
  const [createModalMode, setCreateModalMode] = createSignal<CreateTaskModalMode>("create");
  const [createTaskDefaultTagId, setCreateTaskDefaultTagId] = createSignal<string | undefined>(undefined);
  const [isDetailOpen, setIsDetailOpen] = createSignal(false);
  const [editingTask, setEditingTask] = createSignal<Task | null>(null);

  const handleOpenDetail = (task: Task) => {
    setEditingTask(task);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => {
      if (!isDetailOpen()) {
        setEditingTask(null);
      }
    }, 350);
  };
  const [isManagementOpen, setIsManagementOpen] = createSignal(false);
  const [managementMode, setManagementMode] = createSignal<ManagementMode>("export");
  const [isAboutOpen, setIsAboutOpen] = createSignal(false);
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [animationKey, setAnimationKey] = createSignal(Date.now());

  // Check and trigger notifications every 30 seconds
  onMount(() => {
    checkAndNotifyMissedDeadlines(tasks());
    const interval = setInterval(() => {
      checkAndNotifyMissedDeadlines(tasks());
    }, 30000);

    onCleanup(() => clearInterval(interval));
  });

  // Reactive theme synchronization on html and body
  onMount(() => {
    const isDark = theme() === "dark";
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark);
      document.body.classList.toggle("dark", isDark);
    }
  });

  // Tab Navigation with vertical roll-film page animations
  const [pageRollDirection, setPageRollDirection] = createSignal<"up" | "down" | null>(null);

  const handleNavigateTab = (newTab: ActiveTab) => {
    const currentIdx = tabIndexMap[activeTab()] ?? 0;
    const targetIdx = tabIndexMap[newTab] ?? 0;
    setViewDirection(null);
    if (currentIdx !== targetIdx) {
      const dir = targetIdx > currentIdx ? "up" : "down";
      setPageRollDirection(dir);
      setTimeout(() => {
        setPageRollDirection(null);
      }, 360);
    }
    actions.setActiveTab(newTab, targetIdx >= currentIdx ? 1 : -1);
    setIsDrawerOpen(false);
  };

  const handleNavigateHome = () => {
    handleNavigateTab("home");
  };

  const handleOpenSettings = () => {
    handleNavigateTab("settings");
  };

  const handleOpenTrash = (source: "home" | "settings" = "home") => {
    actions.setTrashSourceTab(source);
    handleNavigateTab("trash");
  };

  // Reorder tasks via Drag and Drop
  const handleReorderTasks = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return;
    const currentFiltered = filteredTasks();
    const sourceTask = currentFiltered[sourceIndex];
    const targetTask = currentFiltered[targetIndex];
    if (!sourceTask || !targetTask) return;

    const allTasks = [...tasks()];
    const sIdx = allTasks.findIndex((t) => t.id === sourceTask.id);
    const tIdx = allTasks.findIndex((t) => t.id === targetTask.id);
    if (sIdx === -1 || tIdx === -1) return;

    const [removed] = allTasks.splice(sIdx, 1);
    allTasks.splice(tIdx, 0, removed);

    actions.reorderTasks(allTasks);
    if (currentSort() !== "custom") {
      actions.setCurrentSort("custom");
    }
  };

  // Refresh tasks
  const handleRefresh = () => {
    setIsRefreshing(true);
    setAnimationKey(Date.now());
    setTimeout(() => {
      setIsRefreshing(false);
    }, 300);
  };

  // Filter & Sort for Inbox (Active Tasks: not deleted, not archived)
  const activeInboxTasks = () =>
    tasks().filter((task: Task) => !task.deletedAt && !task.isArchived);

  const archiveTasks = () => state().archiveTasks;

  const trashTasks = () => state().trashTasks;

  const sortedInboxTasks = () => sortTaskList(activeInboxTasks(), currentSort());

  const filteredTasks = () => {
    const active = activeInboxTasks();
    const query = searchQuery();
    const sFilter = statusFilter();
    const aFilter = attributeFilter();

    const result = active.filter((task) =>
      isTaskMatchingFilter(task, {
        searchQuery: query,
        statusFilter: sFilter,
        attributeFilter: aFilter,
      })
    );
    return sortTaskList(result, currentSort());
  };

  const [viewDirection, setViewDirection] = createSignal<"left" | "right" | null>(null);

  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === viewMode()) return;
    const dir = mode === "kanban" ? "right" : "left";
    setViewDirection(dir);
    actions.setViewMode(mode);
    setTimeout(() => {
      setViewDirection(null);
    }, 320);
  };

  const isAnyModalOpen = () =>
    isCreateOpen() ||
    isDetailOpen() ||
    isManagementOpen() ||
    isAboutOpen();

  const screenContainerStyle = css({
    flex: "1",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "background",
    color: "onSurface",
    overflowY: "auto",
    overflowX: "hidden",
  });

  return (
    <div
      class={css({
        minHeight: "100vh",
        backgroundColor: "background",
        color: "foreground",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
      })}
    >
      {/* Main App Container with Spring physics translation */}
      <div
        class={cn(
          css({
            flex: "1",
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            position: "relative",
            willChange: "transform",
            transitionProperty: "transform",
            transitionDuration: "0.4s",
          }),
          isDrawerOpen()
            ? css({
                transform: "translateX(16rem)",
                sm: { transform: "translateX(18rem)" },
                transitionTimingFunction: "cubic-bezier(0.34, 1.35, 0.64, 1)",
                boxShadow: "2xl",
              })
            : isAnyModalOpen()
            ? css({
                transform: "translateY(-1rem)",
                sm: { transform: "translateY(-1.25rem)" },
                transitionTimingFunction: "cubic-bezier(0.34, 1.35, 0.64, 1)",
              })
            : css({
                transform: "translate(0, 0)",
                transitionTimingFunction: "cubic-bezier(0.34, 1.2, 0.64, 1)",
              })
        )}
      >
        {/* Continuous Left Extensions: Fills background seamlessly when main screen shifts right */}
        <div
          class={css({
            position: "absolute",
            left: "-100vw",
            top: 0,
            bottom: 0,
            width: "100vw",
            backgroundColor: "background",
            pointerEvents: "none",
          })}
        />
        <div
          class={css({
            position: "absolute",
            left: "-100vw",
            top: 0,
            height: "4rem",
            width: "100vw",
            backgroundColor: "color-mix(in srgb, var(--colors-surface) 90%, transparent)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid",
            borderColor: "outlineVariant",
            pointerEvents: "none",
          })}
        />

        {/* Inbox / Home Screen */}
        <Show when={activeTab() === "home" || activeTab() === "inbox"}>
          <div
            class={cn(
              css({
                flex: "1",
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                overflowX: "hidden",
              }),
              getPageRollClass(pageRollDirection())
            )}
          >
            {/* Main App Bar */}
            <TaskAppBar
              searchQuery={searchQuery()}
              onSearchChange={actions.setSearchQuery}
              currentSort={currentSort()}
              onSortChange={actions.setCurrentSort}
              statusFilter={statusFilter()}
              onStatusFilterChange={actions.setStatusFilter}
              attributeFilter={attributeFilter()}
              onAttributeFilterChange={actions.setAttributeFilter}
              onOpenCreateModal={() => {
                setCreateModalMode("create");
                setCreateTaskDefaultTagId(undefined);
                setIsCreateOpen(true);
              }}
              onOpenManagementModal={(mode) => {
                setManagementMode(mode);
                setIsManagementOpen(true);
              }}
              onResetSampleData={actions.resetToSampleData}
              onOpenSettings={handleOpenSettings}
              onOpenTrash={() => handleOpenTrash("home")}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              onOpenTags={() => handleNavigateTab("tags")}
              onOpenArchive={() => handleNavigateTab("archive")}
              trashCount={trashTasks().length}
              archiveCount={archiveTasks().length}
              viewMode={viewMode()}
              onViewModeChange={handleViewModeChange}
            />

            {/* Inbox View */}
            <main
              class={css({
                flex: "1",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                minWidth: 0,
                overflowX: "hidden",
              })}
            >
              <Show
                when={viewMode() === "kanban"}
                fallback={
                  <div
                    class={cn(
                      css({
                        flex: "1",
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        minWidth: 0,
                      }),
                      getViewSlideClass(viewDirection())
                    )}
                  >
                    <TaskListView
                      tasks={sortedInboxTasks()}
                      filteredTasks={filteredTasks()}
                      allTags={tags()}
                      searchQuery={searchQuery()}
                      isRefreshing={isRefreshing()}
                      animationKey={animationKey()}
                      onRefresh={handleRefresh}
                      onToggleStatus={actions.toggleStatus}
                      onOpenDetail={handleOpenDetail}
                      onDeleteDirect={actions.deleteTask}
                      onTogglePin={actions.togglePin}
                      onOpenCreateModal={() => {
                        setCreateModalMode("create");
                        setCreateTaskDefaultTagId(undefined);
                        setIsCreateOpen(true);
                      }}
                      onReorderTasks={handleReorderTasks}
                    />
                  </div>
                }
              >
                <div
                  class={cn(
                    css({
                      flex: "1",
                      display: "flex",
                      flexDirection: "column",
                      maxWidth: "7xl",
                      width: "100%",
                      marginX: "auto",
                      paddingX: { base: "1rem", sm: "1.5rem", lg: "2rem" },
                      paddingY: "1rem",
                      paddingBottom: "7rem",
                      minWidth: 0,
                    }),
                    getViewSlideClass(viewDirection())
                  )}
                >
                  <TaskKanbanView
                    tasks={sortedInboxTasks()}
                    allTags={tags()}
                    searchQuery={searchQuery()}
                    onToggleStatus={actions.toggleStatus}
                    onOpenDetail={handleOpenDetail}
                    onDeleteDirect={actions.deleteTask}
                    onTogglePin={actions.togglePin}
                    onOpenCreateModal={() => {
                      setCreateModalMode("create");
                      setIsCreateOpen(true);
                    }}
                  />
                </div>
              </Show>
            </main>
          </div>
        </Show>

        {/* Tags Screen */}
        <Show when={activeTab() === "tags"}>
          <div class={cn(screenContainerStyle, getPageRollClass(pageRollDirection()))}>
            <TagsView
              tags={tags()}
              tasks={tasks()}
              viewMode={viewMode()}
              onViewModeChange={handleViewModeChange}
              onBackToHome={handleNavigateHome}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              onCreateTag={actions.createTag}
              onUpdateTag={actions.updateTag}
              onDeleteTag={actions.deleteTag}
              onToggleStatus={actions.toggleStatus}
              onOpenDetail={handleOpenDetail}
              onDeleteTask={actions.deleteTask}
              onTogglePin={actions.togglePin}
              onOpenCreateTask={(defaultTagId) => {
                setCreateModalMode("create");
                setCreateTaskDefaultTagId(defaultTagId);
                setIsCreateOpen(true);
              }}
            />
          </div>
        </Show>

        {/* Archive Screen */}
        <Show when={activeTab() === "archive"}>
          <div class={cn(screenContainerStyle, getPageRollClass(pageRollDirection()))}>
            <ArchiveView
              archiveTasks={archiveTasks()}
              allTags={tags()}
              viewMode={viewMode()}
              onViewModeChange={handleViewModeChange}
              onBackToHome={handleNavigateHome}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              onUnarchiveTask={actions.unarchiveTask}
              onUnarchiveAllTasks={() => {
                archiveTasks().forEach((t: Task) => actions.unarchiveTask(t));
              }}
              onDeleteDirect={actions.deleteTask}
              onEmptyArchiveToTrash={() => {
                archiveTasks().forEach((t: Task) => actions.deleteTask(t));
              }}
              onOpenDetail={handleOpenDetail}
            />
          </div>
        </Show>

        {/* Settings Screen */}
        <Show when={activeTab() === "settings"}>
          <div class={cn(screenContainerStyle, getPageRollClass(pageRollDirection()))}>
            <SettingsView
              isDarkMode={theme() === "dark"}
              onToggleTheme={actions.toggleTheme}
              tasks={activeInboxTasks()}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              onOpenExportModal={() => {
                setManagementMode("export");
                setIsManagementOpen(true);
              }}
              onOpenImportModal={() => {
                setManagementMode("import");
                setIsManagementOpen(true);
              }}
              onResetSampleData={actions.resetToSampleData}
              onClearAllTasks={actions.resetAllData}
              onBackToHome={handleNavigateHome}
              onOpenTrash={() => handleOpenTrash("settings")}
              trashCount={trashTasks().length}
            />
          </div>
        </Show>

        {/* Trash Screen */}
        <Show when={activeTab() === "trash"}>
          <div class={cn(screenContainerStyle, getPageRollClass(pageRollDirection()))}>
            <TrashView
              trashTasks={trashTasks()}
              allTags={tags()}
              viewMode={viewMode()}
              onViewModeChange={handleViewModeChange}
              source={trashSourceTab()}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              onBackToHome={() => {
                if (trashSourceTab() === "settings") {
                  handleOpenSettings();
                  return;
                }
                handleNavigateHome();
              }}
              onRestoreTask={actions.restoreTrashTask}
              onRestoreAllTasks={() => {
                trashTasks().forEach((t: Task) => actions.restoreTrashTask(t));
              }}
              onPermanentDeleteTask={actions.permanentDeleteTask}
              onEmptyTrash={actions.emptyTrash}
            />
          </div>
        </Show>
      </div>

      {/* Floating Quick Note FAB: ONLY displayed when on Inbox / Home page */}
      <Show when={activeTab() === "home" || activeTab() === "inbox"}>
        <QuickNoteBar
          onOpenQuickCreate={() => {
            setCreateModalMode("quick");
            setCreateTaskDefaultTagId(undefined);
            setIsCreateOpen(true);
          }}
        />
      </Show>

      {/* Navigation Drawer (Inbox, Tags, Archive, Trash, Settings, About) */}
      <NavDrawer
        open={isDrawerOpen()}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab()}
        onSelectTab={handleNavigateTab}
        inboxCount={activeInboxTasks().length}
        tagsCount={tags().length}
        archiveCount={archiveTasks().length}
        trashCount={trashTasks().length}
        isDarkMode={theme() === "dark"}
        onToggleTheme={actions.toggleTheme}
        onOpenSettings={handleOpenSettings}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Create Task / Quick Note Modal */}
      <TaskCreateModal
        open={isCreateOpen()}
        defaultMode={createModalMode()}
        allTags={tags()}
        defaultTagId={createTaskDefaultTagId()}
        onOpenChange={setIsCreateOpen}
        onCreateTask={(data) => {
          actions.createTask(data);
          setCreateTaskDefaultTagId(undefined);
        }}
        onQuickCreateTask={actions.createQuickTask}
      />

      {/* Task Detail Modal */}
      <Show when={editingTask()}>
        {(task) => (
          <TaskDetailModal
            task={task()}
            open={isDetailOpen()}
            allTags={tags()}
            onOpenChange={(open) => {
              if (!open) handleCloseDetail();
            }}
            onUpdateTask={actions.updateTask}
            onDuplicateTask={actions.duplicateTask}
            onArchiveTask={(t) => {
              handleCloseDetail();
              actions.archiveTask(t);
            }}
            onTogglePin={actions.togglePin}
            onDeleteTask={(t) => {
              handleCloseDetail();
              actions.deleteTask(t);
            }}
          />
        )}
      </Show>

      {/* Management Tasks Modal */}
      <TaskManagementModal
        tasks={tasks()}
        open={isManagementOpen()}
        defaultMode={managementMode()}
        onOpenChange={setIsManagementOpen}
        onImportTasks={actions.importTasks}
      />

      {/* About Modal */}
      <AboutModal
        open={isAboutOpen()}
        onOpenChange={setIsAboutOpen}
        isDarkMode={theme() === "dark"}
        onToggleTheme={actions.toggleTheme}
      />
    </div>
  );
}

export default App;
