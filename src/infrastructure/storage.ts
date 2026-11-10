import { Task, Tag } from "@/src/domain";

const STORAGE_KEY_TASKS = "todayly_tasks_v1";
const STORAGE_KEY_THEME = "todayly_theme_v1";
const STORAGE_KEY_TRASH = "todayly_trash_v1";
const STORAGE_KEY_ARCHIVE = "todayly_archive_v1";
const STORAGE_KEY_TAGS = "todayly_tags_v1";

export const initialStarterTags: Tag[] = [
  { id: "tag-work", name: "Work", color: "#3B82F6", onCreated: new Date().toISOString() },
  { id: "tag-personal", name: "Personal", color: "#10B981", onCreated: new Date().toISOString() },
  { id: "tag-urgent", name: "Urgent", color: "#EF4444", onCreated: new Date().toISOString() },
  { id: "tag-ideas", name: "Ideas", color: "#F59E0B", onCreated: new Date().toISOString() },
  { id: "tag-design", name: "UI/UX", color: "#8B5CF6", onCreated: new Date().toISOString() },
  { id: "tag-dev", name: "Development", color: "#06B6D4", onCreated: new Date().toISOString() },
];

export const initialStarterTasks: Task[] = [
  {
    id: 1,
    name: "Complete ToDayLy v1 Release Sprint",
    description: "Finalize responsive layout, dark theme contrast, smooth gesture animations, and keyboard shortcuts.",
    status: false,
    order: 0,
    reminder: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours later
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), // 12 hours later
    onCreated: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    onUpdated: new Date().toISOString(),
    isPinned: true,
    tags: ["tag-work", "tag-dev"],
  },
  {
    id: 2,
    name: "Design Interactive BottomSheet Modals",
    description: "Implement swipeable sheets with directional transitions, form inputs, and tag color selectors.",
    status: true,
    order: 1,
    reminder: null,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    onCreated: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    onUpdated: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    isPinned: true,
    tags: ["tag-design", "tag-ideas"],
  },
  {
    id: 3,
    name: "Test Multi-Format Task Export & Import",
    description: "Verify data export in JSON, YAML, and CSV formats, and test file drop validation with error boundaries.",
    status: false,
    order: 2,
    reminder: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    onCreated: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    onUpdated: new Date().toISOString(),
    isPinned: false,
    tags: ["tag-work", "tag-urgent"],
  },
  {
    id: 4,
    name: "Support Dzulkifli Anwar on Saweria",
    description: "Visit https://saweria.co/da578 to send support or tips to the developer for continuous development.",
    status: false,
    order: 3,
    reminder: null,
    deadline: null,
    onCreated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    onUpdated: new Date().toISOString(),
    isPinned: true,
    tags: ["tag-personal", "tag-urgent"],
  },
  {
    id: 5,
    name: "Refactor Notification Scheduling Engine",
    description: "Integrate Web Notification API for smart reminders on tasks approaching their due deadline.",
    status: false,
    order: 4,
    reminder: new Date(Date.now() + 1000 * 60 * 60 * 1).toISOString(),
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    onCreated: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    onUpdated: new Date().toISOString(),
    isPinned: false,
    tags: ["tag-dev", "tag-urgent"],
  },
  {
    id: 6,
    name: "Weekly Sprint Retrospective & Architecture Review",
    description: "Review memory benchmarks, local storage persistence, and task filtering performance across large collections.",
    status: false,
    order: 5,
    reminder: null,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    onCreated: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    onUpdated: new Date().toISOString(),
    isPinned: false,
    tags: ["tag-work"],
  },
  {
    id: 7,
    name: "Plan Weekend Mountain Road Trip & Packing Checklist",
    description: "Prepare hiking gear, reserve mountain campsite, and sync offline maps for the weekend getaway.",
    status: false,
    order: 6,
    reminder: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    onCreated: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    onUpdated: new Date().toISOString(),
    isPinned: false,
    tags: ["tag-personal", "tag-ideas"],
  },
  {
    id: 8,
    name: "Conduct User Feedback Interview Sessions",
    description: "Interview beta testers regarding task drag-and-drop ergonomics and kanban board workflows.",
    status: true,
    order: 7,
    reminder: null,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    onCreated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    onUpdated: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    isPinned: false,
    tags: ["tag-work", "tag-design"],
  },
  {
    id: 9,
    name: "Monthly Financial Budget & Expense Audit",
    description: "Reconcile subscription services, recurring cloud hosting fees, and categorize monthly savings goals.",
    status: true,
    order: 8,
    reminder: null,
    deadline: null,
    onCreated: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    onUpdated: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    isPinned: false,
    tags: ["tag-personal"],
  },
];

export function ensureUniqueTaskIds(tasks: Task[]): Task[] {
  const seenIds = new Set<number>();
  let nextId = Date.now();
  return tasks.map((task, index) => {
    let id = task.id;
    if (typeof id !== "number" || isNaN(id) || seenIds.has(id)) {
      id = nextId + index;
    }
    seenIds.add(id);
    return { ...task, id };
  });
}

export function loadTasksFromStorage(): Task[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!saved) {
      const sanitizedInitial = ensureUniqueTaskIds(initialStarterTasks);
      saveTasksToStorage(sanitizedInitial);
      return sanitizedInitial;
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      const sanitizedInitial = ensureUniqueTaskIds(initialStarterTasks);
      saveTasksToStorage(sanitizedInitial);
      return sanitizedInitial;
    }

    const hasOldSampleTasks = parsed.some(
      (t: Task) =>
        t.name?.includes("Selesaikan prototype") ||
        t.name?.includes("Kirim dukungan donasi") ||
        t.name === "Complete ToDayLy React prototype"
    );
    if (hasOldSampleTasks) {
      const sanitizedInitial = ensureUniqueTaskIds(initialStarterTasks);
      saveTasksToStorage(sanitizedInitial);
      return sanitizedInitial;
    }

    const uniqueTasks = ensureUniqueTaskIds(parsed);
    return uniqueTasks;
  } catch (err) {
    console.error("Error reading tasks from localStorage:", err);
  }
  return ensureUniqueTaskIds(initialStarterTasks);
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    const uniqueTasks = ensureUniqueTaskIds(tasks);
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(uniqueTasks));
  } catch (err) {
    console.error("Error writing tasks to localStorage:", err);
  }
}

export function loadArchiveFromStorage(): Task[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ARCHIVE);
    if (!saved) {
      return [];
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return ensureUniqueTaskIds(parsed);
    }
  } catch (err) {
    console.error("Error reading archive from localStorage:", err);
  }
  return [];
}

export function saveArchiveToStorage(archiveTasks: Task[]): void {
  try {
    const uniqueArchive = ensureUniqueTaskIds(archiveTasks);
    localStorage.setItem(STORAGE_KEY_ARCHIVE, JSON.stringify(uniqueArchive));
  } catch (err) {
    console.error("Error saving archive to localStorage:", err);
  }
}

export function loadTagsFromStorage(): Tag[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TAGS);
    if (!saved) {
      saveTagsToStorage(initialStarterTags);
      return initialStarterTags;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error("Error reading tags from localStorage:", err);
  }
  return initialStarterTags;
}

export function saveTagsToStorage(tags: Tag[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(tags));
  } catch (err) {
    console.error("Error saving tags to localStorage:", err);
  }
}

export function loadTrashFromStorage(): Task[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TRASH);
    if (!saved) {
      return [];
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return ensureUniqueTaskIds(parsed);
    }
  } catch (err) {
    console.error("Error reading trash from localStorage:", err);
  }
  return [];
}

export function saveTrashToStorage(trashTasks: Task[]): void {
  try {
    const uniqueTrash = ensureUniqueTaskIds(trashTasks);
    localStorage.setItem(STORAGE_KEY_TRASH, JSON.stringify(uniqueTrash));
  } catch (err) {
    console.error("Error saving trash to localStorage:", err);
  }
}

export function clearTrashStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_TRASH);
  } catch (err) {
    console.error("Error clearing trash storage:", err);
  }
}

export function loadThemeFromStorage(): "dark" | "light" {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    return "dark";
  } catch {
    return "dark";
  }
}

export function saveThemeToStorage(theme: "dark" | "light"): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch (err) {
    console.error("Error saving theme preference:", err);
  }
}

export function clearTasksStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_TASKS);
  } catch (err) {
    console.error("Error clearing tasks storage:", err);
  }
}

