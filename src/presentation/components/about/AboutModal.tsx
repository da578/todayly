/**
 * About Modal presenting application features, developer profile, and donation options.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 *
 * # Arguments
 * - `props`: AboutModalProps with open state and onOpenChange callback.
 *
 * # Returns
 * SolidJS JSX BottomSheet modal with shared segmented tabs, animated subpage transitions, and full-screen handle bar.
 */
import { createSignal, createEffect, Switch, Match, Show } from "solid-js";
import {
  User,
  Heart,
  Phone,
  ExternalLink,
  Send,
  LayoutGrid,
  CheckSquare,
  Calendar,
  Tag as TagIcon,
  Upload,
  Layers,
  Code2,
} from "lucide-solid";
import { ThemeIconToggle } from "@/src/presentation/components/ui/theme-icon-toggle";
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
import { APP_VERSION, APP_NAME } from "@/src/domain";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

function GithubIcon(props: { class?: string }) {
  return (
    <svg class={props.class} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: { class?: string }) {
  return (
    <svg class={props.class} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export type AboutTab = "app" | "developer" | "support";

const tabIndexMap: Record<AboutTab, number> = {
  app: 0,
  developer: 1,
  support: 2,
};

const aboutTabItems: SegmentedItem<AboutTab>[] = [
  { value: "app", label: "App", icon: (p) => <LayoutGrid class={p.class} /> },
  { value: "developer", label: "Developer", icon: (p) => <User class={p.class} /> },
  { value: "support", label: "Support", icon: (p) => <Heart class={p.class} /> },
];

export function AboutModal(props: AboutModalProps) {
  const [activeTab, setActiveTab] = createSignal<AboutTab>("app");
  const [slideDirection, setSlideDirection] = createSignal<"left" | "right" | null>(null);

  createEffect(() => {
    if (props.open) {
      setActiveTab("app");
      setSlideDirection(null);
    }
  });

  const handleTabChange = (newTab: AboutTab) => {
    if (newTab === activeTab()) return;
    const currentIdx = tabIndexMap[activeTab()];
    const nextIdx = tabIndexMap[newTab];
    setSlideDirection(nextIdx > currentIdx ? "right" : "left");
    setActiveTab(newTab);
  };

  return (
    <BottomSheet open={props.open} onOpenChange={props.onOpenChange}>
      <BottomSheetHeader onClose={() => props.onOpenChange(false)}>
        <div class={css({ display: "flex", flexDirection: "column", gap: { base: "2.5", sm: "2" } })}>
          <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
            <div class={css({ display: "flex", alignItems: "center", gap: "2" })}>
              <BottomSheetTitle class={css({ fontSize: "xl", fontWeight: "bold", letterSpacing: "tight", color: "onSurface" })}>
                About {APP_NAME}
              </BottomSheetTitle>
              <Show when={props.onToggleTheme}>
                <button
                  type="button"
                  onClick={props.onToggleTheme}
                  class={css({
                    p: "1.5",
                    borderRadius: "full",
                    color: "onSurfaceVariant",
                    cursor: "pointer",
                    transition: "colors 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    _hover: { color: "onSurface", bg: "surfaceContainerHighest" },
                  })}
                  title="Toggle Theme"
                  aria-label="Toggle Theme"
                >
                  <ThemeIconToggle isDarkMode={Boolean(props.isDarkMode)} size="sm" />
                </button>
              </Show>
            </div>

            {/* Segmented Mode Switcher (Desktop) */}
            <div class={css({ display: { base: "none", sm: "flex" }, minW: "310px" })}>
              <SegmentedControl<AboutTab>
                items={aboutTabItems}
                value={activeTab()}
                onChange={handleTabChange}
                size="sm"
                class={css({ w: "full" })}
              />
            </div>
          </div>

          {/* Description */}
          <div class={css({ minH: "20px", overflow: "hidden" })}>
            <p class={cn(css({ fontSize: "xs", color: "onSurfaceVariant", lineHeight: "normal", m: "0", p: "0" }), "animate-mode-fade")}>
              {activeTab() === "app"
                ? "ToDayLy is a high-performance, Material 3 task manager for daily productivity."
                : activeTab() === "developer"
                ? "Learn more about the developer behind ToDayLy and get in touch."
                : "Support ongoing development or donate to keep this project alive."}
            </p>
          </div>

          {/* Segmented Mode Switcher (Mobile) */}
          <div class={css({ display: { base: "flex", sm: "none" }, w: "full", mt: "0.5" })}>
            <SegmentedControl<AboutTab>
              items={aboutTabItems}
              value={activeTab()}
              onChange={handleTabChange}
              class={css({ w: "full" })}
            />
          </div>
        </div>
      </BottomSheetHeader>

      {/* Main Content Area with directional animated sub-page transitions */}
      <div class={css({ flex: "1", minH: "0", overflow: "hidden", position: "relative", py: "2" })}>
        <Switch>
          <Match when={activeTab() === "app"}>
            <AnimatedSubPage direction={slideDirection()}>
              <div class={css({ h: "full", display: "flex", flexDirection: "column", minH: "0", overflowY: "auto", gap: "4", py: "1" })}>
                {/* App Banner Card */}
                <div class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", bg: "surfaceContainer", borderWidth: "1px", borderColor: "outlineVariant", display: "flex", alignItems: "center", gap: "4" })}>
                  <div class={css({ h: "14", w: "14", borderRadius: "lg", bg: "primary", color: "onPrimary", display: "flex", alignItems: "center", justifyContent: "center", shadow: "sm", flexShrink: 0 })}>
                    <CheckSquare class={css({ h: "7", w: "7", strokeWidth: "2.5" })} />
                  </div>
                  <div class={css({ minW: "0", flex: "1" })}>
                    <div class={css({ display: "flex", alignItems: "center", gap: "2" })}>
                      <h3 class={css({ fontSize: "lg", fontWeight: "bold", color: "onSurface" })}>{APP_NAME}</h3>
                      <span class={css({ fontSize: "11px", fontWeight: "bold", px: "2", py: "0.5", borderRadius: "full", bg: "primary/15", color: "primary" })}>
                        {APP_VERSION}
                      </span>
                    </div>
                    <p class={css({ fontSize: "xs", color: "onSurfaceVariant", mt: "0.5" })}>
                      Your Daily Task Manager • Material 3 Design
                    </p>
                  </div>
                </div>

                {/* Core Features Grid */}
                <div class={css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "repeat(2, 1fr)" }, gap: "3" })}>
                  <div class={css({ p: "3.5", borderRadius: "lg", bg: "surfaceContainerHigh", borderWidth: "1px", borderColor: "outlineVariant/50", display: "flex", flexDirection: "column", gap: "1" })}>
                    <div class={css({ display: "flex", alignItems: "center", gap: "2", fontWeight: "semibold", fontSize: "xs", color: "primary" })}>
                      <Layers class={css({ h: "4", w: "4" })} />
                      <span>List & Kanban Views</span>
                    </div>
                    <p class={css({ fontSize: "11px", color: "onSurfaceVariant", lineHeight: "relaxed" })}>
                      Switch fluidly between organized list view and interactive 2-column Kanban boards with native View Transitions morphing.
                    </p>
                  </div>

                  <div class={css({ p: "3.5", borderRadius: "lg", bg: "surfaceContainerHigh", borderWidth: "1px", borderColor: "outlineVariant/50", display: "flex", flexDirection: "column", gap: "1" })}>
                    <div class={css({ display: "flex", alignItems: "center", gap: "2", fontWeight: "semibold", fontSize: "xs", color: "primary" })}>
                      <Calendar class={css({ h: "4", w: "4" })} />
                      <span>Deadlines & Reminders</span>
                    </div>
                    <p class={css({ fontSize: "11px", color: "onSurfaceVariant", lineHeight: "relaxed" })}>
                      Set precise dates, times, browser push notifications, and live urgency countdown badges.
                    </p>
                  </div>

                  <div class={css({ p: "3.5", borderRadius: "lg", bg: "surfaceContainerHigh", borderWidth: "1px", borderColor: "outlineVariant/50", display: "flex", flexDirection: "column", gap: "1" })}>
                    <div class={css({ display: "flex", alignItems: "center", gap: "2", fontWeight: "semibold", fontSize: "xs", color: "primary" })}>
                      <TagIcon class={css({ h: "4", w: "4" })} />
                      <span>Color Tags & Categories</span>
                    </div>
                    <p class={css({ fontSize: "11px", color: "onSurfaceVariant", lineHeight: "relaxed" })}>
                      Tag tasks with customizable colors, icons, and filter easily across all your workspaces.
                    </p>
                  </div>

                  <div class={css({ p: "3.5", borderRadius: "lg", bg: "surfaceContainerHigh", borderWidth: "1px", borderColor: "outlineVariant/50", display: "flex", flexDirection: "column", gap: "1" })}>
                    <div class={css({ display: "flex", alignItems: "center", gap: "2", fontWeight: "semibold", fontSize: "xs", color: "primary" })}>
                      <Upload class={css({ h: "4", w: "4" })} />
                      <span>Backup & Export</span>
                    </div>
                    <p class={css({ fontSize: "11px", color: "onSurfaceVariant", lineHeight: "relaxed" })}>
                      Full JSON, YAML, and CSV export & import with instant clipboard copy and drag-and-drop file support.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSubPage>
          </Match>

          <Match when={activeTab() === "developer"}>
            <AnimatedSubPage direction={slideDirection()}>
              <div class={css({ h: "full", display: "flex", flexDirection: "column", minH: "0", overflowY: "auto", gap: "3.5", py: "1" })}>
                {/* Developer Profile Banner Card */}
                <div class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", bg: "surfaceContainer", borderWidth: "1px", borderColor: "outlineVariant", display: "flex", alignItems: "center", gap: "4" })}>
                  <div class={css({ position: "relative", flexShrink: 0 })}>
                    <div class={css({ w: "14", h: "14", borderRadius: "full", bg: "primaryContainer", display: "flex", alignItems: "center", justifyContent: "center", shadow: "xs", borderWidth: "2px", borderColor: "primary/40" })}>
                      <span class={css({ fontSize: "xl", fontWeight: "black", color: "onPrimaryContainer" })}>DA</span>
                    </div>
                    <div
                      class={css({ position: "absolute", bottom: "-1", right: "-1", bg: "emerald.600", color: "white", borderRadius: "full", p: "1", borderWidth: "2px", borderColor: "surfaceContainer" })}
                      title="Active Developer"
                    >
                      <Heart class={css({ h: "2.5", w: "2.5", fill: "currentColor" })} />
                    </div>
                  </div>
                  <div class={css({ minW: "0", flex: "1" })}>
                    <div class={css({ display: "flex", alignItems: "center", gap: "2" })}>
                      <h3 class={css({ fontSize: "lg", fontWeight: "bold", color: "onSurface", truncate: true })}>Dzulkifli Anwar</h3>
                      <span class={css({ fontSize: "11px", fontWeight: "bold", px: "2", py: "0.5", borderRadius: "full", bg: "primary/15", color: "primary", flexShrink: 0 })}>
                        Creator
                      </span>
                    </div>
                    <p class={css({ fontSize: "xs", color: "onSurfaceVariant", mt: "0.5" })}>
                      Indie Mobile & Web Developer
                    </p>
                  </div>
                </div>

                {/* Developer Note */}
                <div class={css({ p: "3.5", borderRadius: "lg", borderWidth: "1px", borderColor: "outlineVariant/60", bg: "surfaceContainerHigh", display: "flex", flexDirection: "column", gap: "1.5" })}>
                  <div class={css({ display: "flex", alignItems: "center", gap: "2", fontSize: "xs", fontWeight: "semibold", color: "primary" })}>
                    <Code2 class={css({ h: "4", w: "4" })} />
                    <span>Developer Note</span>
                  </div>
                  <p class={css({ fontSize: "11px", color: "onSurfaceVariant", lineHeight: "relaxed" })}>
                    Hello! I am the creator of <strong>{APP_NAME}</strong>. Originally crafted as a clean Flutter mobile app, now elevated into this highly reactive, full-featured web application with smooth gesture navigation and Material 3 design.
                  </p>
                </div>

                {/* Connect & Social Channels Grid (2x2) */}
                <div class={css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "repeat(2, 1fr)" }, gap: "2.5" })}>
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/+6287878235416"
                    target="_blank"
                    rel="noopener noreferrer"
                    class={css({
                      p: "3",
                      borderRadius: "lg",
                      bg: "surfaceContainerHigh",
                      borderWidth: "1px",
                      borderColor: "outlineVariant/50",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      _hover: { borderColor: "emerald.500", bg: "surfaceContainerHighest" },
                    })}
                  >
                    <div class={css({ display: "flex", alignItems: "center", gap: "2.5", minW: "0" })}>
                      <div class={css({ p: "1.5", borderRadius: "8px", bg: "emerald.500/10", color: "emerald.600", flexShrink: 0 })}>
                        <Phone class={css({ h: "4", w: "4" })} />
                      </div>
                      <div class={css({ minW: "0" })}>
                        <div class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurface" })}>WhatsApp</div>
                        <div class={css({ fontSize: "11px", color: "onSurfaceVariant", truncate: true })}>+62 878-7823-5416</div>
                      </div>
                    </div>
                    <ExternalLink class={css({ h: "3.5", w: "3.5", color: "onSurfaceVariant", flexShrink: 0 })} />
                  </a>

                  {/* GitHub */}
                  <a
                    href="https://github.com/dzulkifli578/flutter-todolist"
                    target="_blank"
                    rel="noopener noreferrer"
                    class={css({
                      p: "3",
                      borderRadius: "lg",
                      bg: "surfaceContainerHigh",
                      borderWidth: "1px",
                      borderColor: "outlineVariant/50",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      _hover: { borderColor: "primary", bg: "surfaceContainerHighest" },
                    })}
                  >
                    <div class={css({ display: "flex", alignItems: "center", gap: "2.5", minW: "0" })}>
                      <div class={css({ p: "1.5", borderRadius: "8px", bg: "primary/10", color: "primary", flexShrink: 0 })}>
                        <GithubIcon class={css({ h: "4", w: "4" })} />
                      </div>
                      <div class={css({ minW: "0" })}>
                        <div class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurface" })}>GitHub</div>
                        <div class={css({ fontSize: "11px", color: "onSurfaceVariant", truncate: true })}>@dzulkifli578</div>
                      </div>
                    </div>
                    <ExternalLink class={css({ h: "3.5", w: "3.5", color: "onSurfaceVariant", flexShrink: 0 })} />
                  </a>

                  {/* Telegram */}
                  <a
                    href="https://t.me/dzul578"
                    target="_blank"
                    rel="noopener noreferrer"
                    class={css({
                      p: "3",
                      borderRadius: "lg",
                      bg: "surfaceContainerHigh",
                      borderWidth: "1px",
                      borderColor: "outlineVariant/50",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      _hover: { borderColor: "blue.500", bg: "surfaceContainerHighest" },
                    })}
                  >
                    <div class={css({ display: "flex", alignItems: "center", gap: "2.5", minW: "0" })}>
                      <div class={css({ p: "1.5", borderRadius: "8px", bg: "blue.500/10", color: "blue.500", flexShrink: 0 })}>
                        <Send class={css({ h: "4", w: "4" })} />
                      </div>
                      <div class={css({ minW: "0" })}>
                        <div class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurface" })}>Telegram</div>
                        <div class={css({ fontSize: "11px", color: "onSurfaceVariant", truncate: true })}>@dzul578</div>
                      </div>
                    </div>
                    <ExternalLink class={css({ h: "3.5", w: "3.5", color: "onSurfaceVariant", flexShrink: 0 })} />
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/in/dzulkifli-anwar"
                    target="_blank"
                    rel="noopener noreferrer"
                    class={css({
                      p: "3",
                      borderRadius: "lg",
                      bg: "surfaceContainerHigh",
                      borderWidth: "1px",
                      borderColor: "outlineVariant/50",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      _hover: { borderColor: "sky.600", bg: "surfaceContainerHighest" },
                    })}
                  >
                    <div class={css({ display: "flex", alignItems: "center", gap: "2.5", minW: "0" })}>
                      <div class={css({ p: "1.5", borderRadius: "8px", bg: "sky.600/10", color: "sky.600", flexShrink: 0 })}>
                        <LinkedinIcon class={css({ h: "4", w: "4" })} />
                      </div>
                      <div class={css({ minW: "0" })}>
                        <div class={css({ fontSize: "xs", fontWeight: "semibold", color: "onSurface" })}>LinkedIn</div>
                        <div class={css({ fontSize: "11px", color: "onSurfaceVariant", truncate: true })}>Dzulkifli Anwar</div>
                      </div>
                    </div>
                    <ExternalLink class={css({ h: "3.5", w: "3.5", color: "onSurfaceVariant", flexShrink: 0 })} />
                  </a>
                </div>
              </div>
            </AnimatedSubPage>
          </Match>

          <Match when={activeTab() === "support"}>
            <AnimatedSubPage direction={slideDirection()}>
              <div class={css({ h: "full", display: "flex", flexDirection: "column", minH: "0", overflowY: "auto", gap: "4", py: "1" })}>
                {/* Saweria Donation Card */}
                <div class={css({ p: { base: "4", sm: "5" }, borderRadius: "xl", borderWidth: "1px", borderColor: "outlineVariant", bg: "surfaceContainer", display: "flex", flexDirection: "column", gap: "3" })}>
                  <div class={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
                    <div class={css({ display: "flex", alignItems: "center", gap: "2", fontSize: "base", fontWeight: "bold", color: "onSurface" })}>
                      <Heart class={css({ h: "5", w: "5", color: "rose.500" })} />
                      <span>Support & Donation</span>
                    </div>
                    <span class={css({ fontSize: "xs", fontWeight: "semibold", textTransform: "uppercase", px: "2.5", py: "1", borderRadius: "full", bg: "rose.500/10", color: "rose.600" })}>
                      Saweria
                    </span>
                  </div>
                  <p class={css({ fontSize: "xs", color: "onSurfaceVariant", lineHeight: "relaxed" })}>
                    Support continuous development and new features. Every donation helps keep this project free, fast, and open!
                  </p>
                  <a
                    href="https://saweria.co/da578"
                    target="_blank"
                    rel="noopener noreferrer"
                    class={css({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: "3.5",
                      borderRadius: "14px",
                      bg: "surfaceContainerHighest",
                      fontSize: "xs",
                      fontWeight: "semibold",
                      color: "onSurface",
                      borderWidth: "1px",
                      borderColor: "outlineVariant",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      _hover: { bg: "surfaceContainerHigh" },
                    })}
                  >
                    <span class={css({ display: "flex", alignItems: "center", gap: "2.5" })}>
                      <span class={css({ fontSize: "base" })}>☕</span>
                      <span>Donate via Saweria (saweria.co/da578)</span>
                    </span>
                    <ExternalLink class={css({ h: "4", w: "4", color: "onSurfaceVariant" })} />
                  </a>
                </div>
              </div>
            </AnimatedSubPage>
          </Match>
        </Switch>
      </div>

      <BottomSheetFooter class={css({ mt: "auto", flexShrink: 0 })}>
        <Button
          type="button"
          onClick={() => props.onOpenChange(false)}
          class={css({ w: "full", h: "11", py: "0", borderRadius: "12px", bg: "primary", color: "onPrimary", fontWeight: "semibold", fontSize: "sm", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" })}
        >
          Close
        </Button>
      </BottomSheetFooter>
    </BottomSheet>
  );
}
