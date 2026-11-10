/**
 * Task Management Modal for multi-format import and export (JSON, YAML, CSV).
 *
 * # Traceability
 * - Requirement: `@impl:FR-IO-01`
 * - Design: `@design:FR-IO-01`
 *
 * # Arguments
 * - `props`: TaskManagementModalProps including tasks list, defaultMode, and onImportTasks callback.
 *
 * # Returns
 * SolidJS JSX BottomSheet modal with format selector and drag-and-drop import parser.
 */
import { createSignal, createEffect, Show, Switch, Match } from "solid-js";
import {
  Upload,
  Download,
  Copy,
  Check,
  FileCode,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-solid";
import { Task, FileFormat } from "@/src/domain";
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetFooter,
} from "@/src/presentation/components/ui/bottom-sheet";
import {
  SegmentedControl,
  AnimatedSubPage,
  SegmentedItem,
} from "@/src/presentation/components/ui/segmented-control";
import { Button } from "@/src/presentation/components/ui/button";
import {
  exportTasksToString,
  downloadExportedFile,
  parseImportedTasks,
} from "@/src/services";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

export type ManagementMode = "export" | "import";

interface TaskManagementModalProps {
  tasks: Task[];
  open: boolean;
  defaultMode?: ManagementMode;
  onOpenChange: (open: boolean) => void;
  onImportTasks: (tasks: Task[], mode: "append" | "replace") => void;
}

function detectFileFormat(filename: string, fallback: FileFormat): FileFormat {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "json":
      return "JSON";
    case "yaml":
    case "yml":
      return "YAML";
    case "csv":
      return "CSV";
    default:
      return fallback;
  }
}

const formatIndexMap: Record<FileFormat, number> = {
  JSON: 0,
  YAML: 1,
  CSV: 2,
};

const modeItems: SegmentedItem<ManagementMode>[] = [
  { value: "export", label: "Export", icon: (p) => <Download class={p.class} /> },
  { value: "import", label: "Import", icon: (p) => <Upload class={p.class} /> },
];

const formatItems: SegmentedItem<FileFormat>[] = [
  { value: "JSON", label: "JSON", icon: (p) => <FileCode class={p.class} /> },
  { value: "YAML", label: "YAML", icon: (p) => <FileText class={p.class} /> },
  { value: "CSV", label: "CSV", icon: (p) => <FileSpreadsheet class={p.class} /> },
];

export function TaskManagementModal(props: TaskManagementModalProps) {
  const [activeMode, setActiveMode] = createSignal<ManagementMode>(props.defaultMode || "export");
  const [slideDirection, setSlideDirection] = createSignal<"left" | "right" | null>(null);

  // Export States
  const [exportFormat, setExportFormat] = createSignal<FileFormat>("JSON");
  const [exportFormatDir, setExportFormatDir] = createSignal<"left" | "right" | null>(null);
  const [copied, setCopied] = createSignal(false);

  // Import States
  const [importFormat, setImportFormat] = createSignal<FileFormat>("JSON");
  const [importFormatDir, setImportFormatDir] = createSignal<"left" | "right" | null>(null);
  const [inputText, setInputText] = createSignal("");
  const [parsedTasks, setParsedTasks] = createSignal<Task[] | null>(null);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
  const [importMode, setImportMode] = createSignal<"append" | "replace">("append");
  const [fileName, setFileName] = createSignal<string | null>(null);

  let fileInputRef: HTMLInputElement | undefined;

  createEffect(() => {
    if (props.open) {
      setActiveMode(props.defaultMode || "export");
      setSlideDirection(null);
      setExportFormatDir(null);
      setImportFormatDir(null);
    }
  });

  const handleSwitchMode = (targetMode: ManagementMode) => {
    if (targetMode === activeMode()) return;
    const direction = targetMode === "import" ? "right" : "left";
    setSlideDirection(direction);
    setActiveMode(targetMode);
  };

  const exportString = () => exportTasksToString(props.tasks, exportFormat());

  const handleExportFormatChange = (newFormat: FileFormat) => {
    if (newFormat === exportFormat()) return;
    const currentIdx = formatIndexMap[exportFormat()];
    const nextIdx = formatIndexMap[newFormat];
    setExportFormatDir(nextIdx > currentIdx ? "right" : "left");
    setExportFormat(newFormat);
  };

  const handleImportFormatChange = (newFormat: FileFormat) => {
    if (newFormat === importFormat()) return;
    const currentIdx = formatIndexMap[importFormat()];
    const nextIdx = formatIndexMap[newFormat];
    setImportFormatDir(nextIdx > currentIdx ? "right" : "left");
    setImportFormat(newFormat);
    setParsedTasks(null);
    setErrorMessage(null);
    setInputText("");
    setFileName(null);
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(exportString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadExportedFile(exportString(), exportFormat());
    props.onOpenChange(false);
  };

  const validateAndSetContent = (content: string, format: FileFormat) => {
    if (!content.trim()) {
      setParsedTasks(null);
      setErrorMessage(null);
      return;
    }
    try {
      const tasks = parseImportedTasks(content, format);
      const hasValidTasks = Boolean(tasks && tasks.length > 0);
      if (!hasValidTasks) {
        setParsedTasks(null);
        setErrorMessage(`No valid task objects could be extracted from this ${format} content.`);
        return;
      }
      setParsedTasks(tasks);
      setErrorMessage(null);
    } catch (err: unknown) {
      setParsedTasks(null);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || `Invalid ${format} syntax.`);
    }
  };

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const detectedFormat = detectFileFormat(file.name, importFormat());
    handleImportFormatChange(detectedFormat);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      validateAndSetContent(text, detectedFormat);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const detectedFormat = detectFileFormat(file.name, importFormat());
    handleImportFormatChange(detectedFormat);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      validateAndSetContent(text, detectedFormat);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const tasksToImport = parsedTasks();
    if (!tasksToImport || tasksToImport.length === 0) return;
    props.onImportTasks(tasksToImport, importMode());
    props.onOpenChange(false);
  };

  return (
    <BottomSheet open={props.open} onOpenChange={props.onOpenChange}>
      <BottomSheetHeader onClose={() => props.onOpenChange(false)}>
        <div class={css({ display: "flex", flexDirection: "column", gap: { base: "2.5", sm: "2" } })}>
          <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
            <BottomSheetTitle class={css({ fontSize: "xl", fontWeight: "bold", letterSpacing: "tight", color: "onSurface" })}>
              {activeMode() === "export" ? "Export Tasks" : "Import Tasks"}
            </BottomSheetTitle>

            {/* Segmented Mode Switcher (Desktop) */}
            <div class={css({ display: { base: "none", sm: "flex" } })}>
              <SegmentedControl<ManagementMode>
                items={modeItems}
                value={activeMode()}
                onChange={handleSwitchMode}
                size="sm"
              />
            </div>
          </div>

          {/* Modal Description */}
          <div class={css({ minH: "22px", overflow: "hidden" })}>
            <Show
              when={activeMode() === "export"}
              fallback={
                <p class={cn(css({ fontSize: "xs", color: "onSurfaceVariant", lineHeight: "normal", m: "0", p: "0" }), "animate-mode-fade")}>
                  Restore tasks from a backup file or paste your raw task data below.
                </p>
              }
            >
              <p class={cn(css({ fontSize: "xs", color: "onSurfaceVariant", lineHeight: "normal", m: "0", p: "0" }), "animate-mode-fade")}>
                Download or copy your tasks backup in JSON, YAML, or CSV format.
              </p>
            </Show>
          </div>

          {/* Segmented Mode Switcher (Mobile) */}
          <div class={css({ display: { base: "flex", sm: "none" }, w: "full", mt: "0.5" })}>
            <SegmentedControl<ManagementMode>
              items={modeItems}
              value={activeMode()}
              onChange={handleSwitchMode}
              class={css({ w: "full" })}
            />
          </div>
        </div>
      </BottomSheetHeader>

      {/* Main Body Area */}
      <div class={css({ flex: "1", w: "full", minH: "0", overflow: "hidden", position: "relative", py: "1" })}>
        <Switch>
          {/* EXPORT SECTION */}
          <Match when={activeMode() === "export"}>
            <AnimatedSubPage direction={slideDirection()}>
              <div class={css({ display: "flex", flexDirection: "column", gap: "4", flex: "1", minH: "0", overflowY: "auto", py: "1" })}>
                {/* Unified Segmented Slider for Export Format */}
                <div class={css({ display: "flex", flexDirection: "column", gap: "1.5" })}>
                  <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", display: "flex", alignItems: "center", gap: "1.5", userSelect: "none" })}>
                    <FileCode class={css({ h: "3.5", w: "3.5" })} />
                    <span>Choose Export Format</span>
                  </label>

                  <SegmentedControl<FileFormat>
                    items={formatItems}
                    value={exportFormat()}
                    onChange={handleExportFormatChange}
                  />
                </div>

                {/* Sub-page preview with guaranteed directional animations across all 3 formats */}
                <Switch>
                  <Match when={exportFormat() === "JSON"}>
                    <AnimatedSubPage direction={exportFormatDir()}>
                      <div class={css({ display: "flex", flexDirection: "column", gap: "1.5" })}>
                        <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
                          <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", userSelect: "none" })}>
                            JSON Data Preview ({props.tasks.length} tasks)
                          </label>
                          <button
                            type="button"
                            onClick={handleCopy}
                            class={css({ display: "inline-flex", alignItems: "center", gap: "1.5", fontSize: "xs", color: "primary", fontWeight: "medium", cursor: "pointer", _hover: { textDecoration: "underline" } })}
                          >
                            <Show
                              when={copied()}
                              fallback={
                                <>
                                  <Copy class={css({ h: "3.5", w: "3.5" })} />
                                  <span>Copy Raw JSON</span>
                                </>
                              }
                            >
                              <Check class={css({ h: "3.5", w: "3.5", color: "emerald.500" })} />
                              <span class={css({ color: "emerald.500", fontWeight: "bold" })}>Copied!</span>
                            </Show>
                          </button>
                        </div>
                        <div class={css({ position: "relative", borderRadius: "12px", bg: "surfaceContainerHighest", borderWidth: "1px", borderColor: "outlineVariant", p: "3", maxH: "44", overflowY: "auto", fontFamily: "mono", fontSize: "xs", color: "onSurface" })}>
                          <pre class={css({ whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: "relaxed", m: "0" })}>{exportString()}</pre>
                        </div>
                      </div>
                    </AnimatedSubPage>
                  </Match>

                  <Match when={exportFormat() === "YAML"}>
                    <AnimatedSubPage direction={exportFormatDir()}>
                      <div class={css({ display: "flex", flexDirection: "column", gap: "1.5" })}>
                        <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
                          <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", userSelect: "none" })}>
                            YAML Data Preview ({props.tasks.length} tasks)
                          </label>
                          <button
                            type="button"
                            onClick={handleCopy}
                            class={css({ display: "inline-flex", alignItems: "center", gap: "1.5", fontSize: "xs", color: "primary", fontWeight: "medium", cursor: "pointer", _hover: { textDecoration: "underline" } })}
                          >
                            <Show
                              when={copied()}
                              fallback={
                                <>
                                  <Copy class={css({ h: "3.5", w: "3.5" })} />
                                  <span>Copy Raw YAML</span>
                                </>
                              }
                            >
                              <Check class={css({ h: "3.5", w: "3.5", color: "emerald.500" })} />
                              <span class={css({ color: "emerald.500", fontWeight: "bold" })}>Copied!</span>
                            </Show>
                          </button>
                        </div>
                        <div class={css({ position: "relative", borderRadius: "12px", bg: "surfaceContainerHighest", borderWidth: "1px", borderColor: "outlineVariant", p: "3", maxH: "44", overflowY: "auto", fontFamily: "mono", fontSize: "xs", color: "onSurface" })}>
                          <pre class={css({ whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: "relaxed", m: "0" })}>{exportString()}</pre>
                        </div>
                      </div>
                    </AnimatedSubPage>
                  </Match>

                  <Match when={exportFormat() === "CSV"}>
                    <AnimatedSubPage direction={exportFormatDir()}>
                      <div class={css({ display: "flex", flexDirection: "column", gap: "1.5" })}>
                        <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
                          <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", userSelect: "none" })}>
                            CSV Data Preview ({props.tasks.length} tasks)
                          </label>
                          <button
                            type="button"
                            onClick={handleCopy}
                            class={css({ display: "inline-flex", alignItems: "center", gap: "1.5", fontSize: "xs", color: "primary", fontWeight: "medium", cursor: "pointer", _hover: { textDecoration: "underline" } })}
                          >
                            <Show
                              when={copied()}
                              fallback={
                                <>
                                  <Copy class={css({ h: "3.5", w: "3.5" })} />
                                  <span>Copy Raw CSV</span>
                                </>
                              }
                            >
                              <Check class={css({ h: "3.5", w: "3.5", color: "emerald.500" })} />
                              <span class={css({ color: "emerald.500", fontWeight: "bold" })}>Copied!</span>
                            </Show>
                          </button>
                        </div>
                        <div class={css({ position: "relative", borderRadius: "12px", bg: "surfaceContainerHighest", borderWidth: "1px", borderColor: "outlineVariant", p: "3", maxH: "44", overflowY: "auto", fontFamily: "mono", fontSize: "xs", color: "onSurface" })}>
                          <pre class={css({ whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: "relaxed", m: "0" })}>{exportString()}</pre>
                        </div>
                      </div>
                    </AnimatedSubPage>
                  </Match>
                </Switch>
              </div>

              {/* Export Footer */}
              <BottomSheetFooter class={css({ mt: "auto", flexShrink: 0 })}>
                <Button
                  onClick={handleDownload}
                  class={css({ w: "full", h: "12", py: "0", borderRadius: "12px", bg: "primary", color: "onPrimary", gap: "2", fontWeight: "semibold", fontSize: "base", shadow: "sm", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" })}
                >
                  <Download class={css({ h: "5", w: "5", flexShrink: 0 })} />
                  <span>Download .{exportFormat().toLowerCase()} Backup</span>
                </Button>
              </BottomSheetFooter>
            </AnimatedSubPage>
          </Match>

          {/* IMPORT SECTION */}
          <Match when={activeMode() === "import"}>
            <AnimatedSubPage direction={slideDirection()}>
              <div class={css({ display: "flex", flexDirection: "column", gap: "4", flex: "1", minH: "0", overflowY: "auto", py: "1" })}>
                {/* Unified Segmented Slider for Import Format */}
                <div class={css({ display: "flex", flexDirection: "column", gap: "1.5" })}>
                  <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", display: "flex", alignItems: "center", gap: "1.5", userSelect: "none" })}>
                    <FileCode class={css({ h: "3.5", w: "3.5" })} />
                    <span>Import Format</span>
                  </label>

                  <SegmentedControl<FileFormat>
                    items={formatItems}
                    value={importFormat()}
                    onChange={handleImportFormatChange}
                  />
                </div>

                {/* Sub-page import form with guaranteed directional animation */}
                <Switch>
                  <Match when={importFormat() === "JSON" || importFormat() === "YAML" || importFormat() === "CSV"}>
                    <AnimatedSubPage direction={importFormatDir()}>
                      <div class={css({ display: "flex", flexDirection: "column", gap: "4" })}>
                        {/* Drag and Drop Box */}
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef?.click()}
                          class={css({
                            borderWidth: "2px",
                            borderStyle: "dashed",
                            borderColor: "outlineVariant",
                            borderRadius: "16px",
                            p: "4",
                            textAlign: "center",
                            cursor: "pointer",
                            transition: "colors 0.2s",
                            bg: "surfaceContainer/50",
                            _hover: { borderColor: "primary", bg: "surfaceContainer" },
                          })}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json,.yaml,.yml,.csv"
                            onChange={handleFileSelect}
                            class={css({ display: "none" })}
                          />
                          <Upload class={css({ h: "7", w: "7", mx: "auto", color: "onSurfaceVariant", mb: "1.5" })} />
                          <p class={css({ fontSize: "xs", fontWeight: "bold", color: "onSurface" })}>
                            {fileName() ? fileName() : `Click to browse or drop ${importFormat()} file here`}
                          </p>
                          <p class={css({ fontSize: "11px", color: "onSurfaceVariant", mt: "0.5" })}>
                            Supports .json, .yaml, .yml, .csv
                          </p>
                        </div>

                        {/* Raw Content Textarea */}
                        <div class={css({ display: "flex", flexDirection: "column", gap: "1.5" })}>
                          <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
                            <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", userSelect: "none" })}>
                              Or Paste Raw {importFormat()} Text
                            </label>
                            <Show when={inputText()}>
                              <button
                                type="button"
                                onClick={() => {
                                  setInputText("");
                                  setParsedTasks(null);
                                  setErrorMessage(null);
                                  setFileName(null);
                                }}
                                class={css({ fontSize: "11px", color: "error", cursor: "pointer", _hover: { textDecoration: "underline" } })}
                              >
                                Clear
                              </button>
                            </Show>
                          </div>
                          <textarea
                            value={inputText()}
                            onInput={(e) => {
                              const val = e.currentTarget.value;
                              setInputText(val);
                              validateAndSetContent(val, importFormat());
                            }}
                            placeholder={`Paste your ${importFormat()} content here...`}
                            rows={3}
                            class={css({
                              w: "full",
                              p: "3",
                              fontFamily: "mono",
                              fontSize: "xs",
                              borderRadius: "12px",
                              bg: "surfaceContainer",
                              borderWidth: "1px",
                              borderColor: "outlineVariant",
                              color: "onSurface",
                              outline: "none",
                              resize: "none",
                              _focus: { borderColor: "primary" },
                              "&::placeholder": { color: "onSurfaceVariant", opacity: 0.7 },
                            })}
                          />
                        </div>

                        {/* Validation Status / Error banner */}
                        <Show when={errorMessage()}>
                          <div class={css({ p: "3", borderRadius: "12px", bg: "errorContainer", color: "onErrorContainer", display: "flex", alignItems: "flex-start", gap: "2.5", fontSize: "xs" })}>
                            <AlertCircle class={css({ h: "4", w: "4", flexShrink: 0, mt: "0.5" })} />
                            <span>{errorMessage()}</span>
                          </div>
                        </Show>

                        <Show when={parsedTasks() && !errorMessage()}>
                          <div class={css({ p: "3", borderRadius: "12px", bg: "primary/10", borderWidth: "1px", borderColor: "primary/30", color: "onSurface", display: "flex", alignItems: "flex-start", gap: "2.5", fontSize: "xs" })}>
                            <CheckCircle2 class={css({ h: "4", w: "4", color: "primary", flexShrink: 0, mt: "0.5" })} />
                            <div>
                              <p class={css({ fontWeight: "bold", color: "primary" })}>
                                Valid data detected: {parsedTasks()?.length} task(s) ready to import
                              </p>
                              <p class={css({ fontSize: "11px", color: "onSurfaceVariant", mt: "0.5" })}>
                                Choose whether to append to your current list or replace everything.
                              </p>
                            </div>
                          </div>

                          {/* Strategy selector: Append vs Replace */}
                          <div class={css({ display: "flex", flexDirection: "column", gap: "1.5" })}>
                            <label class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", userSelect: "none" })}>
                              Import Strategy
                            </label>
                            <div class={css({ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2" })}>
                              <button
                                type="button"
                                onClick={() => setImportMode("append")}
                                class={cn(
                                  css({ py: "2.5", px: "3", borderRadius: "12px", fontSize: "xs", fontWeight: "semibold", borderWidth: "1px", transition: "all 0.2s", textAlign: "center", cursor: "pointer", userSelect: "none" }),
                                  importMode() === "append"
                                    ? css({ bg: "primary", color: "onPrimary", borderColor: "primary", shadow: "xs" })
                                    : css({ bg: "surfaceContainer", borderColor: "outlineVariant", color: "onSurface", _hover: { bg: "surfaceContainerHigh" } })
                                )}
                              >
                                Append to Existing
                              </button>
                              <button
                                type="button"
                                onClick={() => setImportMode("replace")}
                                class={cn(
                                  css({ py: "2.5", px: "3", borderRadius: "12px", fontSize: "xs", fontWeight: "semibold", borderWidth: "1px", transition: "all 0.2s", textAlign: "center", cursor: "pointer", userSelect: "none" }),
                                  importMode() === "replace"
                                    ? css({ bg: "error", color: "onError", borderColor: "error", shadow: "xs" })
                                    : css({ bg: "surfaceContainer", borderColor: "outlineVariant", color: "onSurface", _hover: { bg: "surfaceContainerHigh" } })
                                )}
                              >
                                Replace All Tasks
                              </button>
                            </div>
                          </div>
                        </Show>
                      </div>
                    </AnimatedSubPage>
                  </Match>
                </Switch>
              </div>

              {/* Import Confirmation Button */}
              <BottomSheetFooter class={css({ mt: "auto", flexShrink: 0 })}>
                <Button
                  onClick={handleConfirmImport}
                  disabled={!parsedTasks() || parsedTasks()?.length === 0}
                  class={cn(
                    css({ w: "full", h: "12", py: "0", borderRadius: "12px", gap: "2", fontWeight: "semibold", fontSize: "base", shadow: "sm", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }),
                    importMode() === "replace"
                      ? css({ bg: "error", color: "onError", _hover: { opacity: 0.9 } })
                      : css({ bg: "primary", color: "onPrimary", _hover: { opacity: 0.9 } })
                  )}
                >
                  <Upload class={css({ h: "5", w: "5", flexShrink: 0 })} />
                  <span>
                    Import {parsedTasks()?.length || 0} Task
                    {(parsedTasks()?.length || 0) > 1 ? "s" : ""}
                  </span>
                </Button>
              </BottomSheetFooter>
            </AnimatedSubPage>
          </Match>
        </Switch>
      </div>
    </BottomSheet>
  );
}
