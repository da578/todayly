/**
 * Central unidirectional state container managing tasks, tags, theme, and view modes.
 *
 * # Traceability
 * - Requirement: `@impl:FR-STORE-01`
 * - Design: `@design:FR-STORE-01`
 */
import { Task, Tag, SortOption, ActiveTab, ViewMode, StatusFilter, AttributeFilter } from "@/src/domain";
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  loadTrashFromStorage,
  saveTrashToStorage,
  loadArchiveFromStorage,
  saveArchiveToStorage,
  loadTagsFromStorage,
  saveTagsToStorage,
  loadThemeFromStorage,
  saveThemeToStorage,
  initialStarterTasks,
  initialStarterTags,
  ensureUniqueTaskIds,
} from "@/src/infrastructure/storage";
import { sqliteStorage } from "@/src/infrastructure/sqliteStorage";

export interface TaskStoreState {
  theme: "dark" | "light";
  tasks: Task[];
  archiveTasks: Task[];
  trashTasks: Task[];
  tags: Tag[];
  activeTab: ActiveTab;
  navDirection: number;
  viewMode: ViewMode;
  viewDirection: number;
  searchQuery: string;
  currentSort: SortOption;
  statusFilter: StatusFilter;
  attributeFilter: AttributeFilter;
  trashSourceTab: "home" | "settings";
}

type Listener = () => void;

class TaskStore {
  private state: TaskStoreState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    const initialTheme = loadThemeFromStorage();
    this.state = {
      theme: initialTheme,
      tasks: loadTasksFromStorage(),
      archiveTasks: loadArchiveFromStorage(),
      trashTasks: loadTrashFromStorage(),
      tags: loadTagsFromStorage(),
      activeTab: "home",
      navDirection: 1,
      viewMode: "list",
      viewDirection: 1,
      searchQuery: "",
      currentSort: "custom",
      statusFilter: "all",
      attributeFilter: "all",
      trashSourceTab: "home",
    };
    this.applyTheme(initialTheme);
    this.initSqlitePersistence();
  }

  /**
   * Initializes SQLite WASM persistence and synchronizes state from IndexedDB-backed SQLite.
   */
  private async initSqlitePersistence() {
    try {
      await sqliteStorage.init();
      const sqliteTasks = sqliteStorage.getAllTasks();
      const sqliteTags = sqliteStorage.getAllTags();

      if (sqliteTasks.length > 0 || sqliteTags.length > 0) {
        const active = sqliteTasks.filter((t) => !t.deletedAt && !t.isArchived);
        const archive = sqliteTasks.filter((t) => !t.deletedAt && t.isArchived);
        const trash = sqliteTasks.filter((t) => Boolean(t.deletedAt));

        this.setState({
          tasks: active,
          archiveTasks: archive,
          trashTasks: trash,
          tags: sqliteTags.length > 0 ? sqliteTags : this.state.tags,
        });
      }
    } catch (e) {
      console.warn("SQLite persistence initialization error:", e);
    }
  }

  // --- Subscription (Framework Agnostic: React, SolidJS, Vue, Svelte) ---
  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private setState(partial: Partial<TaskStoreState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  public getState = (): TaskStoreState => {
    return this.state;
  };

  private applyTheme(theme: "dark" | "light") {
    if (typeof document === "undefined") {
      return;
    }
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.body.classList.toggle("dark", isDark);
  }

  // --- Theme Actions ---
  public toggleTheme = () => {
    const newTheme = this.state.theme === "dark" ? "light" : "dark";
    saveThemeToStorage(newTheme);
    sqliteStorage.saveSetting("theme", newTheme);
    this.applyTheme(newTheme);
    this.setState({ theme: newTheme });
  };

  public setTheme = (theme: "dark" | "light") => {
    saveThemeToStorage(theme);
    sqliteStorage.saveSetting("theme", theme);
    this.applyTheme(theme);
    this.setState({ theme });
  };

  // --- Navigation & View Mode Actions ---
  public setActiveTab = (tab: ActiveTab, direction: number = 1) => {
    this.setState({ activeTab: tab, navDirection: direction });
  };

  public setViewMode = (mode: ViewMode) => {
    if (mode === this.state.viewMode) return;
    const direction = mode === "kanban" ? 1 : -1;
    this.setState({ viewMode: mode, viewDirection: direction });
  };

  public setSearchQuery = (query: string) => {
    this.setState({ searchQuery: query });
  };

  public setCurrentSort = (sort: SortOption) => {
    this.setState({ currentSort: sort });
  };

  public setStatusFilter = (filter: StatusFilter) => {
    this.setState({ statusFilter: filter });
  };

  public setAttributeFilter = (filter: AttributeFilter) => {
    this.setState({ attributeFilter: filter });
  };

  public setTrashSourceTab = (source: "home" | "settings") => {
    this.setState({ trashSourceTab: source });
  };

  // --- Task CRUD Actions ---
  public createTask = (data: {
    name: string;
    description?: string;
    reminder: string | null;
    deadline: string | null;
    tags?: string[];
  }): Task => {
    const maxOrder =
      this.state.tasks.length > 0
        ? Math.max(...this.state.tasks.map((t) => t.order ?? 0))
        : -1;
    const existingIds = new Set(this.state.tasks.map((t) => t.id));
    let newId = Date.now();
    while (existingIds.has(newId)) {
      newId++;
    }

    const newTask: Task = {
      id: newId,
      name: data.name,
      description: data.description || "",
      status: false,
      isPinned: false,
      isArchived: false,
      tags: data.tags || [],
      order: maxOrder + 1,
      reminder: data.reminder,
      deadline: data.deadline,
      onCreated: new Date().toISOString(),
      onUpdated: new Date().toISOString(),
    };

    const updatedTasks = ensureUniqueTaskIds([...this.state.tasks, newTask]);
    saveTasksToStorage(updatedTasks);
    sqliteStorage.saveTask(newTask);
    this.setState({ tasks: updatedTasks });
    return newTask;
  };

  public createQuickTask = (taskName: string): Task => {
    const maxOrder =
      this.state.tasks.length > 0
        ? Math.max(...this.state.tasks.map((t) => t.order ?? 0))
        : -1;
    const existingIds = new Set(this.state.tasks.map((t) => t.id));
    let newId = Date.now();
    while (existingIds.has(newId)) {
      newId++;
    }

    const newTask: Task = {
      id: newId,
      name: taskName,
      description: "",
      status: false,
      isPinned: false,
      isArchived: false,
      tags: [],
      order: maxOrder + 1,
      reminder: null,
      deadline: null,
      onCreated: new Date().toISOString(),
      onUpdated: new Date().toISOString(),
    };

    const updatedTasks = ensureUniqueTaskIds([newTask, ...this.state.tasks]);
    saveTasksToStorage(updatedTasks);
    sqliteStorage.saveTask(newTask);
    this.setState({ tasks: updatedTasks });
    return newTask;
  };

  public toggleStatus = (id: number) => {
    let updatedTaskObj: Task | undefined;
    const updatedTasks = this.state.tasks.map((task) => {
      if (task.id === id) {
        task.status = !task.status;
        task.onUpdated = new Date().toISOString();
        updatedTaskObj = task;
        return task;
      }
      return task;
    });

    saveTasksToStorage(updatedTasks);
    if (updatedTaskObj) sqliteStorage.saveTask(updatedTaskObj);
    this.setState({ tasks: [...updatedTasks] });
  };

  public togglePin = (id: number) => {
    let updatedTaskObj: Task | undefined;
    const updatedTasks = this.state.tasks.map((task) => {
      if (task.id === id) {
        updatedTaskObj = {
          ...task,
          isPinned: !task.isPinned,
          onUpdated: new Date().toISOString(),
        };
        return updatedTaskObj;
      }
      return task;
    });

    saveTasksToStorage(updatedTasks);
    if (updatedTaskObj) sqliteStorage.saveTask(updatedTaskObj);
    this.setState({ tasks: updatedTasks });
  };

  public updateTask = (updatedTask: Task) => {
    const updated = { ...updatedTask, onUpdated: new Date().toISOString() };
    const updatedTasks = this.state.tasks.map((t) =>
      t.id === updatedTask.id ? updated : t
    );
    saveTasksToStorage(updatedTasks);
    sqliteStorage.saveTask(updated);
    this.setState({ tasks: updatedTasks });
  };

  public duplicateTask = (targetTask: Task): Task => {
    const maxOrder =
      this.state.tasks.length > 0
        ? Math.max(...this.state.tasks.map((t) => t.order ?? 0))
        : -1;
    const existingIds = new Set(this.state.tasks.map((t) => t.id));
    let newId = Date.now();
    while (existingIds.has(newId)) {
      newId++;
    }

    const duplicated: Task = {
      ...targetTask,
      id: newId,
      name: `${targetTask.name} (Copy)`,
      order: maxOrder + 1,
      onCreated: new Date().toISOString(),
      onUpdated: new Date().toISOString(),
    };

    const updatedTasks = ensureUniqueTaskIds([...this.state.tasks, duplicated]);
    saveTasksToStorage(updatedTasks);
    sqliteStorage.saveTask(duplicated);
    this.setState({ tasks: updatedTasks });
    return duplicated;
  };

  public deleteTask = (targetTask: Task) => {
    const trashedItem: Task = {
      ...targetTask,
      deletedAt: new Date().toISOString(),
    };

    const updatedTasks = this.state.tasks.filter((t) => t.id !== targetTask.id);
    const updatedArchive = this.state.archiveTasks.filter((t) => t.id !== targetTask.id);
    const updatedTrash = ensureUniqueTaskIds([trashedItem, ...this.state.trashTasks]);

    saveTasksToStorage(updatedTasks);
    saveArchiveToStorage(updatedArchive);
    saveTrashToStorage(updatedTrash);
    sqliteStorage.saveTask(trashedItem);

    this.setState({
      tasks: updatedTasks,
      archiveTasks: updatedArchive,
      trashTasks: updatedTrash,
    });
  };

  public archiveTask = (targetTask: Task) => {
    const archivedItem: Task = {
      ...targetTask,
      isArchived: true,
      archivedAt: new Date().toISOString(),
      onUpdated: new Date().toISOString(),
    };

    const updatedTasks = this.state.tasks.filter((t) => t.id !== targetTask.id);
    const updatedArchive = ensureUniqueTaskIds([archivedItem, ...this.state.archiveTasks]);

    saveTasksToStorage(updatedTasks);
    saveArchiveToStorage(updatedArchive);
    sqliteStorage.saveTask(archivedItem);

    this.setState({
      tasks: updatedTasks,
      archiveTasks: updatedArchive,
    });
  };

  public unarchiveTask = (targetTask: Task) => {
    const restoredItem: Task = {
      ...targetTask,
      isArchived: false,
      archivedAt: undefined,
      onUpdated: new Date().toISOString(),
    };

    const updatedArchive = this.state.archiveTasks.filter((t) => t.id !== targetTask.id);
    const updatedTasks = ensureUniqueTaskIds([restoredItem, ...this.state.tasks]);

    saveArchiveToStorage(updatedArchive);
    saveTasksToStorage(updatedTasks);
    sqliteStorage.saveTask(restoredItem);

    this.setState({
      archiveTasks: updatedArchive,
      tasks: updatedTasks,
    });
  };

  public restoreTrashTask = (taskToRestore: Task) => {
    const restoredItem: Task = {
      ...taskToRestore,
      deletedAt: undefined,
    };

    const updatedTrash = this.state.trashTasks.filter((t) => t.id !== taskToRestore.id);
    const updatedTasks = ensureUniqueTaskIds([restoredItem, ...this.state.tasks]);

    saveTrashToStorage(updatedTrash);
    saveTasksToStorage(updatedTasks);
    sqliteStorage.saveTask(restoredItem);

    this.setState({
      trashTasks: updatedTrash,
      tasks: updatedTasks,
    });
  };

  public permanentDeleteTask = (id: number) => {
    const updatedTrash = this.state.trashTasks.filter((t) => t.id !== id);
    saveTrashToStorage(updatedTrash);
    sqliteStorage.deleteTask(id);
    this.setState({ trashTasks: updatedTrash });
  };

  public emptyTrash = () => {
    saveTrashToStorage([]);
    for (const t of this.state.trashTasks) {
      sqliteStorage.deleteTask(t.id);
    }
    this.setState({ trashTasks: [] });
  };

  public reorderTasks = (newTasks: Task[]) => {
    const indexed = newTasks.map((task, index) => ({
      ...task,
      order: index,
    }));
    saveTasksToStorage(indexed);
    sqliteStorage.saveAllTasks([...indexed, ...this.state.archiveTasks, ...this.state.trashTasks]);
    this.setState({ tasks: indexed });
  };

  // --- Tag Actions ---
  public createTag = (data: { name: string; color: string }): Tag => {
    const newTag: Tag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: data.name.trim(),
      color: data.color,
      onCreated: new Date().toISOString(),
    };

    const updatedTags = [...this.state.tags, newTag];
    saveTagsToStorage(updatedTags);
    sqliteStorage.saveTag(newTag);
    this.setState({ tags: updatedTags });
    return newTag;
  };

  public updateTag = (updatedTag: Tag) => {
    const updatedTags = this.state.tags.map((t) =>
      t.id === updatedTag.id ? updatedTag : t
    );
    saveTagsToStorage(updatedTags);
    sqliteStorage.saveTag(updatedTag);
    this.setState({ tags: updatedTags });
  };

  public deleteTag = (tagId: string) => {
    const updatedTags = this.state.tags.filter((t) => t.id !== tagId);

    // Cascading tag removal across active, archive, and trash tasks
    const updatedTasks = this.state.tasks.map((task) => ({
      ...task,
      tags: task.tags?.filter((id) => id !== tagId) || [],
    }));
    const updatedArchive = this.state.archiveTasks.map((task) => ({
      ...task,
      tags: task.tags?.filter((id) => id !== tagId) || [],
    }));
    const updatedTrash = this.state.trashTasks.map((task) => ({
      ...task,
      tags: task.tags?.filter((id) => id !== tagId) || [],
    }));

    saveTagsToStorage(updatedTags);
    saveTasksToStorage(updatedTasks);
    saveArchiveToStorage(updatedArchive);
    saveTrashToStorage(updatedTrash);
    sqliteStorage.deleteTag(tagId);

    this.setState({
      tags: updatedTags,
      tasks: updatedTasks,
      archiveTasks: updatedArchive,
      trashTasks: updatedTrash,
    });
  };

  // --- Reset & Import Actions ---
  public resetToSampleData = () => {
    const starterTasks = ensureUniqueTaskIds(initialStarterTasks);
    const starterTags = initialStarterTags;

    saveTasksToStorage(starterTasks);
    saveTagsToStorage(starterTags);
    saveArchiveToStorage([]);
    saveTrashToStorage([]);
    sqliteStorage.resetToSample();

    this.setState({
      tasks: starterTasks,
      tags: starterTags,
      archiveTasks: [],
      trashTasks: [],
    });
  };

  public resetAllData = () => {
    saveTasksToStorage([]);
    saveTagsToStorage([]);
    saveArchiveToStorage([]);
    saveTrashToStorage([]);
    sqliteStorage.saveAllTasks([]);
    sqliteStorage.saveAllTags([]);

    this.setState({
      tasks: [],
      tags: [],
      archiveTasks: [],
      trashTasks: [],
    });
  };

  public importTasks = (importedTasks: Task[], mode: "append" | "replace") => {
    if (mode === "replace") {
      const indexed = importedTasks.map((t, idx) => ({ ...t, order: idx }));
      saveTasksToStorage(indexed);
      sqliteStorage.saveAllTasks([...indexed, ...this.state.archiveTasks, ...this.state.trashTasks]);
      this.setState({ tasks: indexed });
      return;
    }

    const maxOrder =
      this.state.tasks.length > 0
        ? Math.max(...this.state.tasks.map((t) => t.order ?? 0))
        : -1;
    const combined = [
      ...this.state.tasks,
      ...importedTasks.map((t, idx) => ({ ...t, order: maxOrder + 1 + idx })),
    ];
    const unique = ensureUniqueTaskIds(combined);
    saveTasksToStorage(unique);
    sqliteStorage.saveAllTasks([...unique, ...this.state.archiveTasks, ...this.state.trashTasks]);
    this.setState({ tasks: unique });
  };
}

// Export singleton instance for the application
export const taskStore = new TaskStore();
