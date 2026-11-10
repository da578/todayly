/**
 * Settings workspace view for toggling theme, reviewing task metrics, and initiating backups.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 *
 * # Arguments
 * - `props`: SettingsViewProps with theme state, tasks, backup triggers, and navigation handlers.
 *
 * # Returns
 * SolidJS JSX Settings view element with Material 3 styled setting cards.
 */
import { createSignal, Show } from "solid-js";
import {
  HelpCircle,
  Trash2,
  RotateCcw,
  Upload,
  Download,
  CheckCircle2,
  Layers,
  Hourglass,
  Clock,
  ChevronRight,
} from "lucide-solid";
import { ThemeIconToggle } from "@/src/presentation/components/ui/theme-icon-toggle";
import { Task } from "@/src/domain";
import { Card } from "@/src/presentation/components/ui/card";
import { Switch } from "@/src/presentation/components/ui/switch";
import { ViewHeader } from "@/src/presentation/components/ui/view-header";
import { ConfirmDialog } from "@/src/presentation/components/ui/confirm-dialog";
import { AboutModal } from "@/src/presentation/components/about/AboutModal";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

interface SettingsViewProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  tasks: Task[];
  onOpenExportModal: () => void;
  onOpenImportModal: () => void;
  onResetSampleData: () => void;
  onClearAllTasks: () => void;
  onBackToHome: () => void;
  onOpenDrawer?: () => void;
  onOpenTrash?: (origin?: { x: number; y: number }) => void;
  trashCount?: number;
}

export function SettingsView(props: SettingsViewProps) {
  const [isAboutOpen, setIsAboutOpen] = createSignal(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = createSignal(false);

  const completedCount = () => props.tasks.filter((t) => t.status).length;
  const activeCount = () => props.tasks.length - completedCount();
  const withDeadlinesCount = () => props.tasks.filter((t) => t.deadline).length;

  return (
    <div class={cn(css({ flex: "1", display: "flex", flexDirection: "column" }), "animate-in fade-in-50")}>
      {/* Sticky Header */}
      <ViewHeader
        title="Settings"
        onBack={props.onBackToHome}
        onOpenDrawer={props.onOpenDrawer}
        backLabel="Back to tasks"
      />

      {/* Main Content Container */}
      <main class={css({ flex: "1", maxW: "7xl", w: "full", mx: "auto", px: { base: "4", sm: "6", lg: "8" }, py: "6", pb: "20", display: "flex", flexDirection: "column", gap: "6" })}>
        {/* Preferences Section: Appearance & App Info */}
        <div class={css({ display: "flex", flexDirection: "column", gap: "3" })}>
          <div class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", px: "1" })}>
            Appearance & App Info
          </div>

          {/* Theme Card */}
          <Card
            onClick={props.onToggleTheme}
            class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", borderColor: "outlineVariant", cursor: "pointer", transition: "all 0.3s ease", _hover: { borderColor: "primary", bg: "primary/5" } })}
          >
            <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4" })}>
              <div class={css({ display: "flex", alignItems: "center", gap: "4", minW: "0", flex: "1" })}>
                <ThemeIconToggle isDarkMode={props.isDarkMode} size="lg" />

                <div class={css({ minW: "0", flex: "1" })}>
                  <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface" })}>Theme</div>
                  <div class={css({ fontSize: "xs", color: "onSurfaceVariant", truncate: true, display: "block" })}>
                    {props.isDarkMode ? "Dark Mode currently enabled" : "Light Mode currently enabled"}
                  </div>
                </div>
              </div>

              <div class={css({ display: "flex", alignItems: "center", gap: "2", flexShrink: 0 })} onClick={(e) => e.stopPropagation()}>
                <Switch
                  id="theme-switch"
                  checked={props.isDarkMode}
                  onCheckedChange={props.onToggleTheme}
                />
              </div>
            </div>
          </Card>

          {/* Trash Shortcut Card */}
          <Show when={props.onOpenTrash}>
            <Card
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                props.onOpenTrash?.({
                  x: e.clientX || rect.left + rect.width / 2,
                  y: e.clientY || rect.top + rect.height / 2,
                });
              }}
              class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", borderColor: "outlineVariant", cursor: "pointer", transition: "all 0.3s ease", _hover: { borderColor: "error", bg: "error/5" } })}
            >
              <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4" })}>
                <div class={css({ display: "flex", alignItems: "center", gap: "4", minW: "0", flex: "1" })}>
                  <div class={css({ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" })}>
                    <Trash2 class={css({ h: "6", w: "6", color: "error" })} />
                  </div>
                  <div class={css({ minW: "0", flex: "1" })}>
                    <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface" })}>
                      Trash
                    </div>
                    <div class={css({ fontSize: "xs", color: "onSurfaceVariant", truncate: true, display: "block" })}>
                      View and restore previously deleted tasks
                    </div>
                  </div>
                </div>

                <ChevronRight class={css({ h: "5", w: "5", color: "onSurfaceVariant", flexShrink: 0 })} />
              </div>
            </Card>
          </Show>

          {/* About Card */}
          <Card
            onClick={() => setIsAboutOpen(true)}
            class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", borderColor: "outlineVariant", cursor: "pointer", transition: "all 0.3s ease", _hover: { borderColor: "primary", bg: "primary/5" } })}
          >
            <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4" })}>
              <div class={css({ display: "flex", alignItems: "center", gap: "4", minW: "0", flex: "1" })}>
                <div class={css({ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" })}>
                  <HelpCircle class={css({ h: "6", w: "6", color: "primary" })} />
                </div>
                <div class={css({ minW: "0", flex: "1" })}>
                  <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface" })}>
                    About
                  </div>
                  <div class={css({ fontSize: "xs", color: "onSurfaceVariant", truncate: true, display: "block" })}>
                    See the developer behind this app
                  </div>
                </div>
              </div>

              <ChevronRight class={css({ h: "5", w: "5", color: "onSurfaceVariant", flexShrink: 0 })} />
            </div>
          </Card>
        </div>

        {/* Task Overview Stats */}
        <div class={css({ display: "flex", flexDirection: "column", gap: "3" })}>
          <div class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", px: "1" })}>
            Task Statistics
          </div>

          <div class={css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "repeat(2, 1fr)" }, gap: "3.5" })}>
            {/* Total Tasks Card */}
            <Card class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", borderColor: "outlineVariant", transition: "all 0.3s ease", cursor: "pointer", _hover: { borderColor: "primary", bg: "primary/5" } })}>
              <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4" })}>
                <div class={css({ display: "flex", alignItems: "center", gap: "4", minW: "0", flex: "1" })}>
                  <div class={css({ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" })}>
                    <Layers class={css({ h: "6", w: "6", color: "primary" })} />
                  </div>
                  <div class={css({ minW: "0", flex: "1" })}>
                    <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface", truncate: true })}>
                      Total Tasks
                    </div>
                    <div class={css({ fontSize: "xs", color: "onSurfaceVariant", truncate: true })}>All registered tasks</div>
                  </div>
                </div>
                <div class={css({ fontSize: { base: "2xl", sm: "3xl" }, fontWeight: "extrabold", color: "primary", flexShrink: 0, pl: "2" })}>
                  {props.tasks.length}
                </div>
              </div>
            </Card>

            {/* In Progress Tasks Card */}
            <Card class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", borderColor: "outlineVariant", transition: "all 0.3s ease", cursor: "pointer", _hover: { borderColor: "blue.500", bg: "blue.500/5" } })}>
              <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4" })}>
                <div class={css({ display: "flex", alignItems: "center", gap: "4", minW: "0", flex: "1" })}>
                  <div class={css({ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" })}>
                    <Hourglass class={css({ h: "6", w: "6", color: "blue.500" })} />
                  </div>
                  <div class={css({ minW: "0", flex: "1" })}>
                    <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface", truncate: true })}>
                      In Progress
                    </div>
                    <div class={css({ fontSize: "xs", color: "onSurfaceVariant", truncate: true })}>Pending completion</div>
                  </div>
                </div>
                <div class={css({ fontSize: { base: "2xl", sm: "3xl" }, fontWeight: "extrabold", color: "blue.500", flexShrink: 0, pl: "2" })}>
                  {activeCount()}
                </div>
              </div>
            </Card>

            {/* Completed Tasks Card */}
            <Card class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", borderColor: "outlineVariant", transition: "all 0.3s ease", cursor: "pointer", _hover: { borderColor: "emerald.500", bg: "emerald.500/5" } })}>
              <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4" })}>
                <div class={css({ display: "flex", alignItems: "center", gap: "4", minW: "0", flex: "1" })}>
                  <div class={css({ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" })}>
                    <CheckCircle2 class={css({ h: "6", w: "6", color: "emerald.500" })} />
                  </div>
                  <div class={css({ minW: "0", flex: "1" })}>
                    <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface", truncate: true })}>
                      Completed
                    </div>
                    <div class={css({ fontSize: "xs", color: "onSurfaceVariant", truncate: true })}>Finished tasks</div>
                  </div>
                </div>
                <div class={css({ fontSize: { base: "2xl", sm: "3xl" }, fontWeight: "extrabold", color: "emerald.500", flexShrink: 0, pl: "2" })}>
                  {completedCount()}
                </div>
              </div>
            </Card>

            {/* With Deadlines Card */}
            <Card class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", borderColor: "outlineVariant", transition: "all 0.3s ease", cursor: "pointer", _hover: { borderColor: "amber.500", bg: "amber.500/5" } })}>
              <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4" })}>
                <div class={css({ display: "flex", alignItems: "center", gap: "4", minW: "0", flex: "1" })}>
                  <div class={css({ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" })}>
                    <Clock class={css({ h: "6", w: "6", color: "amber.500" })} />
                  </div>
                  <div class={css({ minW: "0", flex: "1" })}>
                    <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface", truncate: true })}>
                      With Deadlines
                    </div>
                    <div class={css({ fontSize: "xs", color: "onSurfaceVariant", truncate: true })}>Time-sensitive tasks</div>
                  </div>
                </div>
                <div class={css({ fontSize: { base: "2xl", sm: "3xl" }, fontWeight: "extrabold", color: "amber.500", flexShrink: 0, pl: "2" })}>
                  {withDeadlinesCount()}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Data Management Section */}
        <div class={css({ display: "flex", flexDirection: "column", gap: "3" })}>
          <div class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurfaceVariant", textTransform: "uppercase", letterSpacing: "wider", px: "1" })}>
            Backup & Data Storage
          </div>

          {/* Export Tasks Card */}
          <Card
            onClick={props.onOpenExportModal}
            class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", borderColor: "outlineVariant", cursor: "pointer", transition: "all 0.3s ease", _hover: { borderColor: "primary", bg: "primary/5" } })}
          >
            <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4" })}>
              <div class={css({ display: "flex", alignItems: "center", gap: "4", minW: "0", flex: "1" })}>
                <div class={css({ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" })}>
                  <Upload class={css({ h: "6", w: "6", color: "primary" })} />
                </div>
                <div class={css({ minW: "0", flex: "1" })}>
                  <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface" })}>
                    Export Tasks
                  </div>
                  <div class={css({ fontSize: "xs", color: "onSurfaceVariant", truncate: true, display: "block" })}>
                    Download your tasks as JSON, YAML, or CSV
                  </div>
                </div>
              </div>

              <ChevronRight class={css({ h: "5", w: "5", color: "onSurfaceVariant", flexShrink: 0 })} />
            </div>
          </Card>

          {/* Import Tasks Card */}
          <Card
            onClick={props.onOpenImportModal}
            class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", borderColor: "outlineVariant", cursor: "pointer", transition: "all 0.3s ease", _hover: { borderColor: "primary", bg: "primary/5" } })}
          >
            <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4" })}>
              <div class={css({ display: "flex", alignItems: "center", gap: "4", minW: "0", flex: "1" })}>
                <div class={css({ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" })}>
                  <Download class={css({ h: "6", w: "6", color: "primary" })} />
                </div>
                <div class={css({ minW: "0", flex: "1" })}>
                  <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface" })}>
                    Import Tasks
                  </div>
                  <div class={css({ fontSize: "xs", color: "onSurfaceVariant", truncate: true, display: "block" })}>
                    Restore or merge tasks from a JSON or YAML file
                  </div>
                </div>
              </div>

              <ChevronRight class={css({ h: "5", w: "5", color: "onSurfaceVariant", flexShrink: 0 })} />
            </div>
          </Card>

          {/* Reload Demo Tasks Card */}
          <Card
            onClick={props.onResetSampleData}
            class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", borderColor: "outlineVariant", cursor: "pointer", transition: "all 0.3s ease", _hover: { borderColor: "primary", bg: "primary/5" } })}
          >
            <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4" })}>
              <div class={css({ display: "flex", alignItems: "center", gap: "4", minW: "0", flex: "1" })}>
                <div class={css({ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" })}>
                  <RotateCcw class={css({ h: "6", w: "6", color: "primary" })} />
                </div>
                <div class={css({ minW: "0", flex: "1" })}>
                  <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface" })}>
                    Reload Demo Tasks
                  </div>
                  <div class={css({ fontSize: "xs", color: "onSurfaceVariant", truncate: true, display: "block" })}>
                    Reset and populate the default sample task dataset
                  </div>
                </div>
              </div>

              <ChevronRight class={css({ h: "5", w: "5", color: "onSurfaceVariant", flexShrink: 0 })} />
            </div>
          </Card>

          {/* Clear All Saved Tasks Card */}
          <Card
            onClick={() => setIsClearConfirmOpen(true)}
            class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", borderColor: "outlineVariant", cursor: "pointer", transition: "all 0.3s ease", _hover: { borderColor: "error", bg: "error/5" } })}
          >
            <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4" })}>
              <div class={css({ display: "flex", alignItems: "center", gap: "4", minW: "0", flex: "1" })}>
                <div class={css({ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" })}>
                  <Trash2 class={css({ h: "6", w: "6", color: "error" })} />
                </div>
                <div class={css({ minW: "0", flex: "1" })}>
                  <div class={css({ fontSize: "base", fontWeight: "semibold", color: "onSurface" })}>
                    Clear All Saved Tasks
                  </div>
                  <div class={css({ fontSize: "xs", color: "onSurfaceVariant", truncate: true, display: "block" })}>
                    Permanently remove all tasks from localStorage
                  </div>
                </div>
              </div>

              <ChevronRight class={css({ h: "5", w: "5", color: "onSurfaceVariant", flexShrink: 0 })} />
            </div>
          </Card>
        </div>

        {/* Modals */}
        <AboutModal open={isAboutOpen()} onOpenChange={setIsAboutOpen} />

        {/* Clear All Confirmation Dialog */}
        <ConfirmDialog
          open={isClearConfirmOpen()}
          onOpenChange={setIsClearConfirmOpen}
          variant="destructive"
          icon={(p) => <Trash2 {...p} />}
          title="Clear All Data?"
          description={`This will permanently remove all ${props.tasks.length} tasks from your localStorage.`}
          confirmText="Yes, Clear All"
          cancelText="Cancel"
          onConfirm={props.onClearAllTasks}
        />
      </main>
    </div>
  );
}
