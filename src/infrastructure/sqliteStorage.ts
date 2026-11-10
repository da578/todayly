/**
 * SQLite WASM Persistence Service with IndexedDB binary backing and task_tags junction table.
 *
 * # Traceability
 * - Requirement: `@impl:FR-TASK-01`, `@impl:FR-TAG-01`
 * - Design: `@design:FR-TASK-01`, `@design:FR-TAG-01`, `@design:FR-TASK-04`
 */
import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { Task, Tag } from "@/src/domain";
import { initialStarterTasks, initialStarterTags } from "./storage";

const IDB_NAME = "todayly_sqlite_db";
const IDB_STORE = "sqlite_binary";
const IDB_KEY = "database_file";

const STORAGE_KEY_TASKS = "todayly_tasks_v1";
const STORAGE_KEY_TAGS = "todayly_tags_v1";

function loadStoredMigrationData(): { tasks: Task[]; tags: Tag[] } {
  if (typeof window === "undefined" || !window.localStorage) {
    return { tasks: initialStarterTasks, tags: initialStarterTags };
  }
  let tasks = initialStarterTasks;
  let tags = initialStarterTags;

  try {
    const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    const parsedTasks = storedTasks ? JSON.parse(storedTasks) : null;
    const hasValidTasks = Array.isArray(parsedTasks) && parsedTasks.length > 0;
    if (hasValidTasks) {
      tasks = parsedTasks;
    }

    const storedTags = localStorage.getItem(STORAGE_KEY_TAGS);
    const parsedTags = storedTags ? JSON.parse(storedTags) : null;
    const hasValidTags = Array.isArray(parsedTags) && parsedTags.length > 0;
    if (hasValidTags) {
      tags = parsedTags;
    }
  } catch (e) {
    console.warn("Could not read localStorage for SQLite migration, using starter data", e);
  }

  return { tasks, tags };
}

class SqliteStorageService {
  private db: SqlJsDatabase | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private persistTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Initializes the SQLite WASM instance and loads persistent DB from IndexedDB.
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => {
            if (file.endsWith(".wasm")) {
              return sqlWasmUrl;
            }
            return `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`;
          },
        });

        // Attempt to load existing binary from IndexedDB
        const existingBinary = await this.loadFromIndexedDB();
        const hasExisting = Boolean(existingBinary && existingBinary.byteLength > 0);

        if (hasExisting && existingBinary) {
          this.db = new SQL.Database(existingBinary);
          this.bootstrapSchema();
          this.isInitialized = true;
          return;
        }

        this.db = new SQL.Database();
        this.bootstrapSchema();
        this.migrateOrSeed();
        await this.persistToIndexedDBNow();
        this.bootstrapSchema();
        this.isInitialized = true;
      } catch (err) {
        console.error("Failed to initialize SQLite WASM:", err);
        // Fallback: create in-memory database
        const SQL = await initSqlJs({
          locateFile: () => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm`,
        });
        this.db = new SQL.Database();
        this.bootstrapSchema();
        this.migrateOrSeed();
        this.isInitialized = true;
      }
    })();

    return this.initPromise;
  }

  /**
   * Ensures all tables and indexes exist.
   * Uses task_tags junction table for M:N relationship between tasks and tags.
   */
  private bootstrapSchema(): void {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status INTEGER NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        reminder TEXT,
        deadline TEXT,
        is_pinned INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0,
        archived_at TEXT,
        deleted_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS task_tags (
        task_id INTEGER NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (task_id, tag_id),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_task_tags_task ON task_tags(task_id);
      CREATE INDEX IF NOT EXISTS idx_task_tags_tag ON task_tags(tag_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON tasks(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks("order");
    `);
  }

  /**
   * Migrates from legacy localStorage if present, or seeds initial starter tasks and tags.
   */
  private migrateOrSeed(): void {
    if (!this.db) return;

    // Check if tasks table is already populated
    const countRes = this.db.exec("SELECT COUNT(*) AS count FROM tasks");
    const count = (countRes[0]?.values[0]?.[0] as number) || 0;
    if (count > 0) return;

    // Check localStorage for existing data to migrate
    const { tasks: tasksToSeed, tags: tagsToSeed } = loadStoredMigrationData();

    // Seed tags
    for (const tag of tagsToSeed) {
      this.db.run(
        `INSERT OR REPLACE INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)`,
        [tag.id, tag.name, tag.color, tag.onCreated || new Date().toISOString()]
      );
    }

    // Seed tasks & task_tags junction
    for (const task of tasksToSeed) {
      this.insertTaskInternal(task);
    }
  }

  /**
   * Internal helper to insert or replace a task and its junction rows in task_tags.
   */
  private insertTaskInternal(task: Task): void {
    if (!this.db) return;

    this.db.run(
      `INSERT OR REPLACE INTO tasks (
        id, name, description, status, "order", reminder, deadline,
        is_pinned, is_archived, archived_at, deleted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.name,
        task.description || "",
        task.status ? 1 : 0,
        task.order ?? 0,
        task.reminder || null,
        task.deadline || null,
        task.isPinned ? 1 : 0,
        task.isArchived ? 1 : 0,
        task.archivedAt || null,
        task.deletedAt || null,
        task.onCreated || new Date().toISOString(),
        task.onUpdated || new Date().toISOString(),
      ]
    );

    // Delete existing task_tags for this task
    this.db.run(`DELETE FROM task_tags WHERE task_id = ?`, [task.id]);

    // Insert junction rows
    const tags = Array.isArray(task.tags) ? task.tags : [];
    for (const tagId of tags) {
      if (!tagId) continue;
      this.db.run(
        `INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)`,
        [task.id, tagId]
      );
    }
  }

  /**
   * Loads all tasks joined with their tag identifiers via the task_tags junction table.
   */
  public getAllTasks(): Task[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT
        id, name, description, status, "order", reminder, deadline,
        is_pinned, is_archived, archived_at, deleted_at, created_at, updated_at
      FROM tasks
      ORDER BY "order" ASC, id ASC
    `);

    const tasks: Task[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      tasks.push({
        id: Number(row.id),
        name: String(row.name || ""),
        description: String(row.description || ""),
        status: Boolean(row.status),
        order: Number(row.order ?? 0),
        reminder: row.reminder ? String(row.reminder) : null,
        deadline: row.deadline ? String(row.deadline) : null,
        isPinned: Boolean(row.is_pinned),
        isArchived: Boolean(row.is_archived),
        archivedAt: row.archived_at ? String(row.archived_at) : undefined,
        deletedAt: row.deleted_at ? String(row.deleted_at) : undefined,
        onCreated: String(row.created_at || new Date().toISOString()),
        onUpdated: String(row.updated_at || new Date().toISOString()),
        tags: [],
      });
    }
    stmt.free();

    // Query task_tags junction table for tags mapping
    const tagsStmt = this.db.prepare(`
      SELECT task_id, tag_id FROM task_tags ORDER BY task_id ASC
    `);

    const tagsMap = new Map<number, string[]>();
    while (tagsStmt.step()) {
      const row = tagsStmt.getAsObject() as any;
      const taskId = Number(row.task_id);
      const tagId = String(row.tag_id);
      if (!tagsMap.has(taskId)) {
        tagsMap.set(taskId, []);
      }
      tagsMap.get(taskId)!.push(tagId);
    }
    tagsStmt.free();

    // Attach tags array to each task
    for (const task of tasks) {
      task.tags = tagsMap.get(task.id) || [];
    }

    return tasks;
  }

  /**
   * Loads all tags from SQLite database.
   */
  public getAllTags(): Tag[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT id, name, color, created_at FROM tags ORDER BY created_at ASC
    `);

    const tags: Tag[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      tags.push({
        id: String(row.id),
        name: String(row.name || ""),
        color: String(row.color || "#3B82F6"),
        onCreated: String(row.created_at || new Date().toISOString()),
      });
    }
    stmt.free();

    return tags;
  }

  /**
   * Persists a task and updates the task_tags junction table.
   */
  public saveTask(task: Task): void {
    if (!this.db) return;
    this.insertTaskInternal(task);
    this.schedulePersist();
  }

  /**
   * Saves an entire batch of tasks (e.g. during reorder, import, or bulk operations).
   */
  public saveAllTasks(tasks: Task[]): void {
    if (!this.db) return;

    this.db.run("BEGIN TRANSACTION");
    try {
      this.db.run("DELETE FROM task_tags");
      this.db.run("DELETE FROM tasks");
      for (const task of tasks) {
        this.insertTaskInternal(task);
      }
      this.db.run("COMMIT");
    } catch (e) {
      this.db.run("ROLLBACK");
      throw e;
    }

    this.schedulePersist();
  }

  /**
   * Deletes a task by ID. Cascades deletion from task_tags junction table.
   */
  public deleteTask(id: number): void {
    if (!this.db) return;
    this.db.run("DELETE FROM task_tags WHERE task_id = ?", [id]);
    this.db.run("DELETE FROM tasks WHERE id = ?", [id]);
    this.schedulePersist();
  }

  /**
   * Saves or updates a tag.
   */
  public saveTag(tag: Tag): void {
    if (!this.db) return;
    this.db.run(
      `INSERT OR REPLACE INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)`,
      [tag.id, tag.name, tag.color, tag.onCreated || new Date().toISOString()]
    );
    this.schedulePersist();
  }

  /**
   * Saves all tags (e.g. reset to sample or bulk import).
   */
  public saveAllTags(tags: Tag[]): void {
    if (!this.db) return;
    this.db.run("BEGIN TRANSACTION");
    try {
      this.db.run("DELETE FROM tags");
      for (const tag of tags) {
        this.db.run(
          `INSERT OR REPLACE INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)`,
          [tag.id, tag.name, tag.color, tag.onCreated || new Date().toISOString()]
        );
      }
      this.db.run("COMMIT");
    } catch (e) {
      this.db.run("ROLLBACK");
      throw e;
    }
    this.schedulePersist();
  }

  /**
   * Deletes a tag and removes references in the task_tags junction table.
   */
  public deleteTag(id: string): void {
    if (!this.db) return;
    this.db.run("DELETE FROM task_tags WHERE tag_id = ?", [id]);
    this.db.run("DELETE FROM tags WHERE id = ?", [id]);
    this.schedulePersist();
  }

  /**
   * Gets an app setting string value.
   */
  public getSetting(key: string): string | null {
    if (!this.db) return null;
    const stmt = this.db.prepare("SELECT value FROM app_settings WHERE key = ?");
    stmt.bind([key]);
    if (stmt.step()) {
      const res = stmt.getAsObject() as any;
      stmt.free();
      return String(res.value);
    }
    stmt.free();
    return null;
  }

  /**
   * Saves an app setting key-value pair.
   */
  public saveSetting(key: string, value: string): void {
    if (!this.db) return;
    this.db.run(
      "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
      [key, value]
    );
    this.schedulePersist();
  }

  /**
   * Resets the database to starter sample tasks and tags.
   */
  public resetToSample(): void {
    if (!this.db) return;
    this.db.run("BEGIN TRANSACTION");
    try {
      this.db.run("DELETE FROM task_tags");
      this.db.run("DELETE FROM tasks");
      this.db.run("DELETE FROM tags");

      for (const tag of initialStarterTags) {
        this.db.run(
          `INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)`,
          [tag.id, tag.name, tag.color, tag.onCreated]
        );
      }

      for (const task of initialStarterTasks) {
        this.insertTaskInternal(task);
      }

      this.db.run("COMMIT");
    } catch (e) {
      this.db.run("ROLLBACK");
      throw e;
    }
    this.schedulePersist();
  }

  /**
   * Exports the raw SQLite binary for external file download / backup.
   */
  public exportBinary(): Uint8Array | null {
    if (!this.db) return null;
    return this.db.export();
  }

  /**
   * Debounced persistence to IndexedDB to avoid excessive I/O writes.
   */
  private schedulePersist(): void {
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout);
    }
    this.persistTimeout = setTimeout(() => {
      this.persistToIndexedDBNow();
    }, 150);
  }

  /**
   * Writes the exported SQLite Uint8Array to IndexedDB.
   */
  private async persistToIndexedDBNow(): Promise<void> {
    if (!this.db || typeof window === "undefined" || !window.indexedDB) return;

    try {
      const binary = this.db.export();
      const db = await this.openIndexedDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, "readwrite");
        const store = tx.objectStore(IDB_STORE);
        const req = store.put(binary, IDB_KEY);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("Failed to persist SQLite binary to IndexedDB:", err);
    }
  }

  /**
   * Loads the exported SQLite Uint8Array from IndexedDB.
   */
  private async loadFromIndexedDB(): Promise<Uint8Array | null> {
    if (typeof window === "undefined" || !window.indexedDB) return null;

    try {
      const db = await this.openIndexedDB();
      return await new Promise<Uint8Array | null>((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, "readonly");
        const store = tx.objectStore(IDB_STORE);
        const req = store.get(IDB_KEY);
        req.onsuccess = () => {
          if (req.result instanceof Uint8Array) {
            resolve(req.result);
            return;
          }
          if (req.result instanceof ArrayBuffer) {
            resolve(new Uint8Array(req.result));
            return;
          }
          resolve(null);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn("Could not read from IndexedDB, starting fresh database:", err);
      return null;
    }
  }

  /**
   * Helper to open the persistent IndexedDB database.
   */
  private openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const sqliteStorage = new SqliteStorageService();
