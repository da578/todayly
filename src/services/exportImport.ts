import { dump, load } from "js-yaml";
import { Task, FileFormat } from "@/src/domain";

/**
 * Multi-format task serialization and deserialization engine.
 *
 * # Traceability
 * - Implementation: `// @impl:FR-IO-01`
 */
export function exportTasksToString(tasks: Task[], format: FileFormat): string {
  if (format === "JSON") {
    return JSON.stringify(tasks, null, 2);
  }

  if (format === "YAML") {
    return dump({ tasks });
  }

  if (format === "CSV") {
    const headers = [
      "id",
      "name",
      "description",
      "status",
      "order",
      "reminder",
      "deadline",
      "onCreated",
      "onUpdated",
    ];

    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = tasks.map((t) => [
      t.id,
      escapeCsv(t.name),
      escapeCsv(t.description),
      t.status ? "true" : "false",
      t.order,
      t.reminder ? escapeCsv(t.reminder) : "",
      t.deadline ? escapeCsv(t.deadline) : "",
      t.onCreated ? escapeCsv(t.onCreated) : "",
      t.onUpdated ? escapeCsv(t.onUpdated) : "",
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  throw new Error(`Unsupported export format: ${format}`);
}

export function downloadExportedFile(content: string, format: FileFormat): void {
  const extensionMap: Record<FileFormat, string> = {
    JSON: "json",
    YAML: "yaml",
    CSV: "csv",
  };

  const mimeMap: Record<FileFormat, string> = {
    JSON: "application/json",
    YAML: "text/yaml",
    CSV: "text/csv",
  };

  const extension = extensionMap[format];
  const mime = mimeMap[format];
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `todayly_tasks_${new Date().toISOString().slice(0, 10)}.${extension}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseJsonTasks(trimmed: string): Task[] {
  const parsed = JSON.parse(trimmed);
  const list = Array.isArray(parsed) ? parsed : parsed.tasks;
  if (!Array.isArray(list)) {
    throw new Error("Invalid JSON structure: Expected an array of tasks or an object with a 'tasks' array.");
  }
  return sanitizeImportedTasks(list);
}

function parseYamlTasks(trimmed: string): Task[] {
  const parsed = load(trimmed) as any;
  if (!parsed) {
    throw new Error("Failed to parse YAML content.");
  }
  const list = Array.isArray(parsed) ? parsed : parsed.tasks;
  if (!Array.isArray(list)) {
    throw new Error("YAML file does not contain a 'tasks' list or array.");
  }
  return sanitizeImportedTasks(list);
}

export function parseImportedTasks(rawContent: string, format: FileFormat): Task[] {
  const trimmed = rawContent.trim();
  if (!trimmed) {
    throw new Error("File content is empty.");
  }

  switch (format) {
    case "JSON":
      return parseJsonTasks(trimmed);
    case "YAML":
      return parseYamlTasks(trimmed);
    case "CSV":
      return parseCsvToTasks(trimmed);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function handleQuotedCsvChar(
  char: string,
  nextChar: string | undefined
): { charToAdd: string; skipNext: boolean; closeQuote: boolean } {
  if (char === '"' && nextChar === '"') {
    return { charToAdd: '"', skipNext: true, closeQuote: false };
  }
  if (char === '"') {
    return { charToAdd: "", skipNext: false, closeQuote: true };
  }
  return { charToAdd: char, skipNext: false, closeQuote: false };
}

function pushRowIfNotEmpty(rows: string[][], currentRow: string[]): void {
  const isNonEmpty = currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== "");
  if (!isNonEmpty) return;
  rows.push(currentRow);
}

function parseCsvToTasks(csvText: string): Task[] {
  // Simple CSV parser handling multi-line quoted fields
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      const res = handleQuotedCsvChar(char, nextChar);
      currentField += res.charToAdd;
      i += res.skipNext ? 1 : 0;
      inQuotes = !res.closeQuote;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }
    if (char === "\r" || char === "\n") {
      const isCrlf = char === "\r" && nextChar === "\n";
      i += isCrlf ? 1 : 0;
      currentRow.push(currentField);
      currentField = "";
      pushRowIfNotEmpty(rows, currentRow);
      currentRow = [];
      continue;
    }
    currentField += char;
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
  }
  pushRowIfNotEmpty(rows, currentRow);

  if (rows.length < 2) {
    throw new Error("CSV file does not contain enough data (missing header or rows).");
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf("name");
  if (nameIdx === -1) {
    throw new Error("CSV is missing the required 'name' column.");
  }

  const descIdx = headers.indexOf("description");
  const statusIdx = headers.indexOf("status");
  const orderIdx = headers.indexOf("order");
  const reminderIdx = headers.indexOf("reminder");
  const deadlineIdx = headers.indexOf("deadline");
  const createdIdx = headers.indexOf("oncreated");

  const tasks: Task[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const taskName = row[nameIdx]?.trim();
    if (!taskName) continue;

    const task: Task = {
      id: Date.now() + i,
      name: taskName,
      description: descIdx !== -1 && row[descIdx] ? row[descIdx] : "",
      status: statusIdx !== -1 ? row[statusIdx]?.toLowerCase() === "true" : false,
      order: orderIdx !== -1 && !isNaN(Number(row[orderIdx])) ? Number(row[orderIdx]) : i - 1,
      reminder: reminderIdx !== -1 && row[reminderIdx] ? row[reminderIdx] : null,
      deadline: deadlineIdx !== -1 && row[deadlineIdx] ? row[deadlineIdx] : null,
      onCreated: createdIdx !== -1 && row[createdIdx] ? row[createdIdx] : new Date().toISOString(),
      onUpdated: new Date().toISOString(),
    };
    tasks.push(task);
  }

  if (tasks.length === 0) {
    throw new Error("No valid task records found in CSV.");
  }

  return tasks;
}

function sanitizeImportedTasks(rawList: unknown[]): Task[] {
  const baseTime = Date.now();
  return rawList.map((item, idx) => {
    const raw = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const rawId = raw.id;
    const rawName = raw.name;
    const rawDesc = raw.description;
    const rawOrder = raw.order;
    const rawReminder = raw.reminder;
    const rawDeadline = raw.deadline;
    const rawCreated = raw.onCreated;
    const rawUpdated = raw.onUpdated;

    return {
      id: typeof rawId === "number" && !isNaN(rawId) ? rawId : baseTime + idx,
      name: String(rawName || "Untitled Task"),
      description: String(rawDesc || ""),
      status: Boolean(raw.status),
      order: typeof rawOrder === "number" ? rawOrder : idx,
      reminder: rawReminder ? String(rawReminder) : null,
      deadline: rawDeadline ? String(rawDeadline) : null,
      onCreated: rawCreated ? String(rawCreated) : new Date().toISOString(),
      onUpdated: rawUpdated ? String(rawUpdated) : new Date().toISOString(),
    };
  });
}
