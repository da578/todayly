/**
 * Sliding navigation drawer with spring physics, workspace counters, and theme toggle.
 *
 * # Traceability
 * - Requirement: `@impl:FR-THEME-01`
 * - Design: `@design:FR-THEME-01`
 *
 * # Arguments
 * - `props`: NavDrawerProps containing open state, counters, theme state, and navigation triggers.
 *
 * # Returns
 * SolidJS JSX navigation drawer with smooth backdrop and spring physics.
 */
import { For, Component, Show } from "solid-js";
import {
  Inbox,
  Tag as TagIcon,
  Archive,
  Trash2,
  Settings,
  Info,
} from "lucide-solid";
import { ThemeIconToggle } from "@/src/presentation/components/ui/theme-icon-toggle";
import { ActiveTab } from "@/src/domain";
import { css } from "@/styled-system/css";
import { cn } from "@/src/presentation/utils";

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  inboxCount: number;
  tagsCount: number;
  archiveCount: number;
  trashCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenAbout?: () => void;
}

export function NavDrawer(props: NavDrawerProps) {
  const navItems = () => [
    {
      id: "inbox" as ActiveTab,
      label: "Inbox",
      icon: Inbox,
    },
    {
      id: "tags" as ActiveTab,
      label: "Tags",
      icon: TagIcon,
    },
    {
      id: "archive" as ActiveTab,
      label: "Archive",
      icon: Archive,
    },
    {
      id: "trash" as ActiveTab,
      label: "Trash",
      icon: Trash2,
    },
  ];

  const activeIndex = () => {
    const current = props.activeTab === "home" ? "inbox" : props.activeTab;
    return navItems().findIndex((item) => item.id === current);
  };

  return (
    <div
      class={cn(
        css({
          position: "fixed",
          inset: "0",
          zIndex: 50,
          display: "flex",
          transition: "all 0.3s",
        }),
        props.open
          ? css({ pointerEvents: "auto", visibility: "visible" })
          : css({ pointerEvents: "none", visibility: "hidden" })
      )}
      aria-hidden={!props.open}
    >
      {/* Backdrop */}
      <div
        onClick={props.onClose}
        class={cn(
          css({
            position: "fixed",
            inset: "0",
            bg: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            transition: "opacity 0.35s ease-out",
          }),
          props.open ? css({ opacity: 1 }) : css({ opacity: 0, pointerEvents: "none" })
        )}
      />

      {/* Drawer Body with Spring Physics */}
      <aside
        class={cn(
          css({
            position: "relative",
            w: "72",
            maxW: "78vw",
            h: "full",
            bg: "surfaceContainerLow",
            borderRightWidth: "1px",
            borderColor: "outlineVariant",
            display: "flex",
            flexDirection: "column",
            shadow: "2xl",
            zIndex: 10,
            userSelect: "none",
            willChange: "transform",
          }),
          props.open
            ? css({
                transform: "translateX(0)",
                transition: "transform 0.4s cubic-bezier(0.34, 1.35, 0.64, 1)",
              })
            : css({
                transform: "translateX(-100%)",
                transition: "transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1)",
                pointerEvents: "none",
              })
        )}
      >
        {/* Continuous Left Extensions */}
        <div class={css({ position: "absolute", left: "-600px", top: "0", bottom: "0", w: "600px", bg: "surfaceContainerLow", pointerEvents: "none" })} />
        <div class={css({ position: "absolute", left: "-600px", top: "0", h: "81px", w: "600px", bg: "surfaceContainerLow", borderBottomWidth: "1px", borderColor: "outlineVariant/40", pointerEvents: "none" })} />
        <div class={css({ position: "absolute", left: "-600px", bottom: "0", h: "155px", w: "600px", bg: "surfaceContainerLowest/50", borderTopWidth: "1px", borderColor: "outlineVariant/40", pointerEvents: "none" })} />

        {/* Drawer Header */}
        <div class={css({ p: "5", borderBottomWidth: "1px", borderColor: "outlineVariant/40", display: "flex", alignItems: "center", justifyContent: "space-between" })}>
          <div class={css({ userSelect: "none" })}>
            <h2 class={css({ fontSize: "lg", fontWeight: "bold", letterSpacing: "tight", color: "onSurface" })}>
              ToDayLy
            </h2>
            <p class={css({ fontSize: "xs", color: "onSurfaceVariant" })}>Your Daily Task Manager</p>
          </div>
        </div>

        {/* Navigation Menu List */}
        <div class={css({ flex: "1", p: "3", display: "flex", flexDirection: "column", gap: "1.5", overflowY: "auto" })}>
          <div class={css({ px: "3", py: "2", fontSize: "11px", fontWeight: "bold", letterSpacing: "wider", color: "onSurfaceVariant", opacity: 0.7, textTransform: "uppercase" })}>
            Workspaces
          </div>

          <div class={css({ position: "relative", display: "flex", flexDirection: "column", gap: "1.5" })}>
            {/* Sliding Vertical Pill Indicator */}
            <div
              class={cn(
                css({
                  position: "absolute",
                  left: "0",
                  right: "0",
                  top: "0",
                  h: "12",
                  borderRadius: "12px",
                  pointerEvents: "none",
                  transition: "transform 320ms cubic-bezier(0.34, 1.35, 0.64, 1), background-color 320ms ease, opacity 200ms ease",
                }),
                activeIndex() === 3
                  ? css({ bg: "error", shadow: "sm" })
                  : css({ bg: "primary", shadow: "sm" })
              )}
              style={{
                transform: `translateY(calc(${Math.max(0, activeIndex())} * 54px))`,
                opacity: activeIndex() !== -1 ? 1 : 0,
              }}
            />

            <For each={navItems()}>
              {(item) => {
                const Icon = item.icon as Component<{ class?: string }>;
                const isActive = () =>
                  props.activeTab === item.id || (item.id === "inbox" && props.activeTab === "home");
                const isTrash = () => item.id === "trash";

                return (
                  <button
                    type="button"
                    onClick={() => {
                      props.onSelectTab(item.id);
                      setTimeout(() => {
                        props.onClose();
                      }, 160);
                    }}
                    class={cn(
                      css({
                        position: "relative",
                        zIndex: 1,
                        w: "full",
                        h: "12",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: "3.5",
                        borderRadius: "12px",
                        fontSize: "sm",
                        fontWeight: "medium",
                        transition: "color 300ms ease",
                        cursor: "pointer",
                        bg: "transparent",
                        _hover: { bg: "surfaceContainerHigh/40" },
                      }),
                      isActive()
                        ? isTrash()
                          ? css({ color: "onError", fontWeight: "semibold", _hover: { bg: "transparent" } })
                          : css({ color: "onPrimary", fontWeight: "semibold", _hover: { bg: "transparent" } })
                        : isTrash()
                        ? css({ color: "red.500", _dark: { color: "red.400" } })
                        : css({ color: "onSurface" })
                    )}
                  >
                    <div class={css({ display: "flex", alignItems: "center", gap: "3" })}>
                      <Icon
                        class={cn(
                          css({ h: "5", w: "5", transition: "color 300ms ease, transform 0.2s" }),
                          isActive()
                            ? isTrash()
                              ? css({ color: "onError" })
                              : css({ color: "onPrimary" })
                            : isTrash()
                            ? css({ color: "red.500", _dark: { color: "red.400" } })
                            : css({ color: "onSurfaceVariant" })
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              }}
            </For>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div class={css({ p: "3", borderTopWidth: "1px", borderColor: "outlineVariant/40", display: "flex", flexDirection: "column", gap: "1", bg: "surfaceContainerLowest/50" })}>
          {/* Settings button */}
          <button
            type="button"
            onClick={() => {
              props.onOpenSettings();
              props.onClose();
            }}
            class={css({ w: "full", display: "flex", alignItems: "center", gap: "3", px: "3.5", py: "2.5", borderRadius: "12px", fontSize: "sm", fontWeight: "medium", color: "onSurface", cursor: "pointer", transition: "colors 0.2s", _hover: { bg: "surfaceContainerHigh" } })}
          >
            <Settings class={css({ h: "5", w: "5", color: "onSurfaceVariant" })} />
            <span>Settings</span>
          </button>

          {/* About button */}
          <Show when={props.onOpenAbout}>
            <button
              type="button"
              onClick={() => {
                props.onOpenAbout?.();
                props.onClose();
              }}
              class={css({ w: "full", display: "flex", alignItems: "center", gap: "3", px: "3.5", py: "2.5", borderRadius: "12px", fontSize: "sm", fontWeight: "medium", color: "onSurface", cursor: "pointer", transition: "colors 0.2s", _hover: { bg: "surfaceContainerHigh" } })}
            >
              <Info class={css({ h: "5", w: "5", color: "onSurfaceVariant" })} />
              <span>About</span>
            </button>
          </Show>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={props.onToggleTheme}
            class={css({ w: "full", display: "flex", alignItems: "center", justifyContent: "space-between", px: "3.5", py: "2.5", borderRadius: "12px", fontSize: "sm", fontWeight: "medium", color: "onSurface", cursor: "pointer", transition: "colors 0.2s", _hover: { bg: "surfaceContainerHigh" } })}
          >
            <div class={css({ display: "flex", alignItems: "center", gap: "3" })}>
              <ThemeIconToggle isDarkMode={props.isDarkMode} size="sm" />
              <span>Theme</span>
            </div>
            <span class={css({ fontSize: "xs", color: "onSurfaceVariant", textTransform: "capitalize" })}>
              {props.isDarkMode ? "Dark" : "Light"}
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
}
