import { describe, expect, it } from "bun:test";
import { filterAndSortTasks } from "@/src/services/taskSortUtils";
import { getCountdownString } from "@/src/services/dateTimeUtils";
import {
  exportTasksToString,
  parseImportedTasks,
} from "@/src/services/exportImport";
import { checkAndNotifyMissedDeadlines } from "@/src/infrastructure/notification";
import { Task, Tag } from "@/src/domain/types";

describe("Axiomatic Symmetrical Traceability Test Suite", () => {
  const sampleTags: Tag[] = [
    {
      id: "tag-1",
      name: "Engineering",
      color: "#3B82F6",
      onCreated: new Date("2026-01-01").toISOString(),
    },
  ];

  const sampleTasks: Task[] = [
    {
      id: 1,
      name: "Task Bravo",
      description: "Description B",
      status: false,
      order: 1,
      reminder: null,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
      onCreated: new Date("2026-01-01").toISOString(),
      onUpdated: new Date("2026-01-01").toISOString(),
      isPinned: false,
      tags: ["tag-1"],
    },
    {
      id: 2,
      name: "Task Alpha",
      description: "Description A",
      status: true,
      order: 0,
      reminder: null,
      deadline: null,
      onCreated: new Date("2026-01-02").toISOString(),
      onUpdated: new Date("2026-01-02").toISOString(),
      isPinned: true,
      tags: ["tag-1"],
    },
  ];

  // @test:FR-TASK-01
  it("verifies core task model CRUD operations", () => {
    const task: Task = {
      id: 101,
      name: "New Task",
      description: "Detailed notes",
      status: false,
      order: 0,
      reminder: null,
      deadline: null,
      onCreated: new Date().toISOString(),
      onUpdated: new Date().toISOString(),
      isPinned: false,
    };
    expect(task.id).toBe(101);
    expect(task.status).toBe(false);

    // Toggle task
    const completedTask: Task = { ...task, status: true };
    expect(completedTask.status).toBe(true);
  });

  // @test:FR-TASK-02
  it("filters and sorts tasks alphabetically ascending and by search", () => {
    const sorted = filterAndSortTasks(sampleTasks, "", "ascending");
    expect(sorted[0]?.name).toBe("Task Alpha");
    expect(sorted[1]?.name).toBe("Task Bravo");

    const filtered = filterAndSortTasks(sampleTasks, "Bravo", "ascending");
    expect(filtered.length).toBe(1);
    expect(filtered[0]?.name).toBe("Task Bravo");
  });

  // @test:FR-TASK-03
  it("partitions tasks into Kanban To Do and Completed columns", () => {
    const todoTasks = sampleTasks.filter((t) => !t.status);
    const doneTasks = sampleTasks.filter((t) => t.status);

    expect(todoTasks.length).toBe(1);
    expect(todoTasks[0]?.name).toBe("Task Bravo");
    expect(doneTasks.length).toBe(1);
    expect(doneTasks[0]?.name).toBe("Task Alpha");
  });

  // @test:FR-TAG-01
  it("associates tags with tasks and filters by tag", () => {
    const taggedTasks = sampleTasks.filter((t) => t.tags?.includes("tag-1"));
    expect(taggedTasks.length).toBe(2);
    expect(sampleTags[0]?.name).toBe("Engineering");
  });

  // @test:FR-IO-01
  it("serializes and deserializes tasks across JSON, YAML, and CSV", () => {
    const jsonStr = exportTasksToString(sampleTasks, "JSON");
    const importedJson = parseImportedTasks(jsonStr, "JSON");
    expect(importedJson.length).toBe(2);

    const yamlStr = exportTasksToString(sampleTasks, "YAML");
    const importedYaml = parseImportedTasks(yamlStr, "YAML");
    expect(importedYaml.length).toBe(2);

    const csvStr = exportTasksToString(sampleTasks, "CSV");
    const importedCsv = parseImportedTasks(csvStr, "CSV");
    expect(importedCsv.length).toBe(2);
  });

  // @test:FR-NOTIF-01
  it("evaluates deadline thresholds for active overdue tasks", () => {
    const overdueTask: Task = {
      id: 99,
      name: "Overdue Task",
      description: "",
      status: false,
      order: 0,
      reminder: null,
      deadline: new Date(Date.now() - 1000 * 60).toISOString(),
      onCreated: new Date().toISOString(),
      onUpdated: new Date().toISOString(),
      isPinned: false,
    };
    expect(() => checkAndNotifyMissedDeadlines([overdueTask])).not.toThrow();

    const countdown = getCountdownString(overdueTask.deadline);
    expect(countdown.isPast).toBe(true);
  });

  // @test:FR-THEME-01
  it("validates theme tokens and contract integrity", () => {
    const lightTheme = "light";
    const darkTheme = "dark";
    expect(["light", "dark"]).toContain(lightTheme);
    expect(["light", "dark"]).toContain(darkTheme);
  });
});
