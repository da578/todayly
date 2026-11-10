import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Enable CSS preflight reset
  preflight: true,

  // File matching for static analysis
  include: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Exclude test and build artifacts
  exclude: [],

  // Presets providing shorthands (bg, p, w, h, etc.), conditions, and utilities
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],

  // SolidJS JSX Integration
  jsxFramework: "solid",

  // Responsive breakpoints
  theme: {
    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      tokens: {
        fonts: {
          sans: { value: "'Google Sans', 'Google Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
          mono: { value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
        },
        radii: {
          xs: { value: "4px" },
          sm: { value: "8px" },
          md: { value: "12px" },
          lg: { value: "16px" },
          xl: { value: "20px" },
          "2xl": { value: "24px" },
          "3xl": { value: "28px" },
          full: { value: "9999px" },
        },
      },
      semanticTokens: {
        colors: {
          primary: {
            value: { base: "#3D5F90", _dark: "#A6C8FF" },
          },
          onPrimary: {
            value: { base: "#FFFFFF", _dark: "#02315F" },
          },
          primaryContainer: {
            value: { base: "#D5E3FF", _dark: "#234776" },
          },
          onPrimaryContainer: {
            value: { base: "#234776", _dark: "#D5E3FF" },
          },
          secondary: {
            value: { base: "#555F71", _dark: "#BDC7DC" },
          },
          onSecondary: {
            value: { base: "#FFFFFF", _dark: "#273141" },
          },
          secondaryContainer: {
            value: { base: "#D9E3F8", _dark: "#3D4758" },
          },
          onSecondaryContainer: {
            value: { base: "#3D4758", _dark: "#D9E3F8" },
          },
          tertiary: {
            value: { base: "#6F5675", _dark: "#DBBCE1" },
          },
          onTertiary: {
            value: { base: "#FFFFFF", _dark: "#3E2845" },
          },
          tertiaryContainer: {
            value: { base: "#F9D8FE", _dark: "#563E5D" },
          },
          onTertiaryContainer: {
            value: { base: "#281330", _dark: "#F9D8FE" },
          },
          error: {
            value: { base: "#BA1A1A", _dark: "#FFB4AB" },
          },
          onError: {
            value: { base: "#FFFFFF", _dark: "#690005" },
          },
          errorContainer: {
            value: { base: "#FFDAD6", _dark: "#93000A" },
          },
          onErrorContainer: {
            value: { base: "#410002", _dark: "#FFDAD6" },
          },
          background: {
            value: { base: "#F9F9FF", _dark: "#111318" },
          },
          onBackground: {
            value: { base: "#191C20", _dark: "#E1E2E9" },
          },
          surface: {
            value: { base: "#F9F9FF", _dark: "#111318" },
          },
          onSurface: {
            value: { base: "#191C20", _dark: "#E1E2E9" },
          },
          surfaceVariant: {
            value: { base: "#E0E2EC", _dark: "#43474E" },
          },
          onSurfaceVariant: {
            value: { base: "#43474E", _dark: "#C4C6CF" },
          },
          outline: {
            value: { base: "#74777F", _dark: "#8D9199" },
          },
          outlineVariant: {
            value: { base: "#C4C6CF", _dark: "#43474E" },
          },
          surfaceDim: {
            value: { base: "#D9DAE0", _dark: "#111318" },
          },
          surfaceBright: {
            value: { base: "#F9F9FF", _dark: "#37393E" },
          },
          surfaceContainerLowest: {
            value: { base: "#FFFFFF", _dark: "#0C0E13" },
          },
          surfaceContainerLow: {
            value: { base: "#F3F3FA", _dark: "#191C20" },
          },
          surfaceContainer: {
            value: { base: "#EDEDF4", _dark: "#1D2024" },
          },
          surfaceContainerHigh: {
            value: { base: "#E7E8EE", _dark: "#282A2F" },
          },
          surfaceContainerHighest: {
            value: { base: "#E1E2E9", _dark: "#32353A" },
          },
        },
      },
    },
  },

  // Conditions for dark mode toggle via .dark class
  conditions: {
    extend: {
      dark: ".dark &, [data-theme='dark'] &",
    },
  },

  // Directory for compiled CSS helper utilities
  outdir: "styled-system",
});
