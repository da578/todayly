# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- @gov:GOV-RELEASE -->

## [1.0.0] - 2026-11-10

### Added
- Core 4-Ring Clean Architecture separating Domain, Services, Infrastructure, and Presentation.
- SQLite WASM persistence engine backed by IndexedDB binary snapshots (`sqliteStorage.ts`).
- Dual-view workspace system with List View and 2-column Kanban Board (To Do vs Completed).
- Drag-and-drop physical relocation animation for task cards between Kanban columns.
- Expanding search bar with rotate and fade transition icons in app bars across all workspaces.
- Filter and sort popover using `SlidersHorizontal` icon with status, attribute, and alphabetical sorting.
- Progressive strikethrough animation across completed tasks (300ms inline animation).
- Vertical sliding navigation indicator pill in sidebar drawer.
- Roll-film directional vertical page navigation animations between workspaces.
- Color tag management system with preset palettes and custom hex input support.
- Multi-format data backup engine supporting JSON, YAML, and CSV export/import.
- Browser-native deadline monitoring with desktop notifications.
- Dual-mode Material 3 theme engine with clockwise rotate and fade transitions.
- Taskfile automation pipeline (`Taskfile.yml`) with 4-gate verification (`task ci`).
- GitHub Actions continuous integration and Cloudflare Pages deployment workflows.

### Changed
- Migrated styling system from Tailwind CSS runtime to compile-time Panda CSS design tokens.
- Replaced monolithic reactive stores with framework-agnostic singleton store and SolidJS adapter.
- Standardized maximum viewport layout container to 1280px (`maxW: "7xl"`).
- Flattened all control flow paths across the codebase: eliminated all `else` blocks and nested `if` statements.

### Fixed
- Fixed task title and description text truncation by applying inline strikethrough spans with ellipsis overflow.
- Resolved virtual keyboard occlusion on mobile viewports by integrating dynamic `visualViewport` height tracking.
- Corrected input focus outline clipping by adding proper internal padding to modal form containers.
- Fixed trash restoration bug by synchronizing deleted task state filters directly from store collections.
- Removed superfluous action buttons and counter badges on empty state views.
