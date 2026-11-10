import { Task, SortOption, StatusFilter, AttributeFilter } from "@/src/domain";

/**
 * Framework-agnostic pure filtering and sorting function for tasks.
 *
 * # Traceability
 * - Implementation: `// @impl:FR-TASK-02`
 */
export function isTaskMatchingQuery(task: Task, searchQuery?: string): boolean {
  if (!searchQuery) return true;
  const q = searchQuery.trim().toLowerCase();
  if (!q) return true;
  const inName = task.name.toLowerCase().includes(q);
  const inDesc = Boolean(task.description?.toLowerCase().includes(q));
  return inName || inDesc;
}

export function isTaskMatchingFilter(
  task: Task,
  options?: {
    searchQuery?: string;
    statusFilter?: StatusFilter;
    attributeFilter?: AttributeFilter;
  }
): boolean {
  if (!isTaskMatchingQuery(task, options?.searchQuery)) return false;

  const status = options?.statusFilter ?? "all";
  if (status === "incomplete" && task.status) return false;
  if (status === "completed" && !task.status) return false;

  const attr = options?.attributeFilter ?? "all";
  if (attr === "has_deadline" && !task.deadline) return false;
  if (attr === "has_reminder" && !task.reminder) return false;
  if (attr === "pinned_only" && !task.isPinned) return false;

  return true;
}

export function filterAndSortTasks(
  tasks: Task[],
  searchQuery: string,
  sortOption: SortOption
): Task[] {
  let result = tasks.filter(
    (t) => !t.deletedAt && !t.isArchived && isTaskMatchingQuery(t, searchQuery)
  );

  result.sort((a, b) => {
    switch (sortOption) {
      case "ascending":
        return a.name.localeCompare(b.name);
      case "descending":
        return b.name.localeCompare(a.name);
      case "completed_first":
        return Number(b.status) - Number(a.status);
      case "nearest_deadline": {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      case "farthest_deadline": {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
      case "nearest_reminder": {
        if (!a.reminder && !b.reminder) return 0;
        if (!a.reminder) return 1;
        if (!b.reminder) return -1;
        return new Date(a.reminder).getTime() - new Date(b.reminder).getTime();
      }
      case "farthest_reminder": {
        if (!a.reminder && !b.reminder) return 0;
        if (!a.reminder) return 1;
        if (!b.reminder) return -1;
        return new Date(b.reminder).getTime() - new Date(a.reminder).getTime();
      }
      case "newest_first":
        return new Date(b.onCreated).getTime() - new Date(a.onCreated).getTime();
      case "oldest_first":
        return new Date(a.onCreated).getTime() - new Date(b.onCreated).getTime();
      default:
        return (a.order ?? 0) - (b.order ?? 0);
    }
  });

  return result;
}
