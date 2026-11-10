/**
 * Domain entity types, DTO contracts, and shared union types.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-01`, `@impl:FR-TAG-01`, `@impl:FR-IO-01`
 * - Design: `@design:FR-TASK-01`, `@design:FR-TAG-01`, `@design:FR-IO-01`
 */

export interface Tag {
  id: string;
  name: string;
  color: string; // hex color e.g. #3B82F6
  onCreated: string;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  status: boolean;
  order: number;
  reminder: string | null; // ISO string
  deadline: string | null; // ISO string
  onCreated: string; // ISO string
  onUpdated: string; // ISO string
  deletedAt?: string; // ISO string when in trash
  isPinned?: boolean;
  isArchived?: boolean;
  archivedAt?: string; // ISO string when in archive
  tags?: string[]; // Array of tag IDs
}

export type ViewMode = 'list' | 'kanban';

export type SortOption =
  | 'custom'
  | 'ascending'
  | 'descending'
  | 'completed_first'
  | 'nearest_deadline'
  | 'farthest_deadline'
  | 'nearest_reminder'
  | 'farthest_reminder'
  | 'newest_first'
  | 'oldest_first';

export type FileFormat = 'JSON' | 'YAML' | 'CSV';

export type StatusFilter = 'all' | 'incomplete' | 'completed';

export type AttributeFilter = 'all' | 'has_deadline' | 'has_reminder' | 'pinned_only';

export type ActiveTab = 'inbox' | 'tags' | 'archive' | 'trash' | 'settings' | 'home';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}
