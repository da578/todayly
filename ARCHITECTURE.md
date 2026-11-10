# Architecture Specification: ToDayLy

<!-- @gov:ARCH-OVERVIEW -->
## 1. High-Level Architectural Overview

ToDayLy is a local-first reactive task management Single Page Application engineered with SolidJS, Panda CSS, and SQLite WASM. The application enforces a strict 4-Ring Clean Architecture based on the Functional Core, Imperative Shell (FC/IS) paradigm:

```mermaid
graph TD
    subgraph Presentation [Ring 3: Presentation Layer]
        App[App.tsx Shell]
        Views[Views: List, Kanban, Archive, Trash, Tags, Settings]
        Stores[Stores: TaskStore, SolidStore]
        Components[UI Primitives: Button, Card, Dialog, Sheet]
    end

    subgraph Infrastructure [Ring 2: Infrastructure Layer]
        Sqlite[SQLite WASM & IndexedDB Persistence]
        Storage[LocalStorage Fallback & Seed Data]
        Notif[Web Notification API]
        Gestures[Pointer Swipe Engine]
        Transitions[CSS View Transitions Wrapper]
    end

    subgraph Services [Ring 1: Services Layer]
        Sort[taskSortUtils: Pure Comparator]
        DateUtil[dateTimeUtils: Formatters & Countdown]
        IO[exportImport: Multi-Format Parser]
    end

    subgraph Domain [Ring 0: Domain Layer]
        Types[types.ts: Task, Tag, Filter Contracts]
        Const[constants.ts: System Constants]
    end

    Presentation --> Infrastructure
    Presentation --> Services
    Presentation --> Domain
    Infrastructure --> Services
    Infrastructure --> Domain
    Services --> Domain
```

<!-- @gov:ARCH-TOPOLOGY -->
## 2. Physical Directory Topology

```text
todayly/
├── src/
│   ├── domain/               # Ring 0: Pure entities, types, and constants (Zero DOM, zero framework)
│   │   ├── types.ts          # Core data models: Task, Tag, SortOption, ViewMode, ActiveTab
│   │   ├── constants.ts      # Immutable application metadata
│   │   └── index.ts          # Domain barrel exports
│   ├── services/             # Ring 1: Headless computational engines (Tested via bun:test)
│   │   ├── taskSortUtils.ts  # Pure O(N log N) sorting and text query filter
│   │   ├── dateTimeUtils.ts  # Date formatters and deadline countdown calculations
│   │   ├── exportImport.ts   # Multi-format serialization (JSON, YAML, CSV)
│   │   └── index.ts          # Services barrel exports
│   ├── infrastructure/       # Ring 2: Browser APIs and storage persistence
│   │   ├── sqliteStorage.ts  # SQLite WASM engine backed by IndexedDB binary snapshot
│   │   ├── storage.ts        # LocalStorage fallback and starter seed definitions
│   │   ├── notification.ts   # Native Web Notification API dispatcher
│   │   ├── gestures.ts       # GPU-accelerated touch and mouse swipe coordinator
│   │   ├── viewTransition.ts # Document View Transitions API wrapper
│   │   └── index.ts          # Infrastructure barrel exports
│   ├── presentation/         # Ring 3: Reactive SolidJS views and presentation adapters
│   │   ├── App.tsx           # Root presentation shell and view switcher
│   │   ├── stores/           # Unidirectional task store and SolidJS reactive adapter
│   │   ├── components/       # Reusable UI primitives, view components, and bottom sheets
│   │   └── utils/            # Presentation styling utilities (cn)
│   ├── index.css             # Base styles, Panda CSS layers, and spring physics keyframes
│   └── main.tsx              # Application bootstrap entrypoint
├── tests/
│   └── services.test.ts      # Headless unit verification suite (bun:test)
├── docs/
│   ├── PRD.md                # ISO 29148 requirements specification
│   ├── TDD.md                # Technical design document and architecture contracts
│   ├── schema.dbml           # Database schema definition (DBML)
│   └── adr/                  # Architecture Decision Records (0001, 0002)
├── tokens/
│   └── main.tokens.kdl       # DUDUNG KDL design tokens specification
├── panda.config.ts           # Compile-time Panda CSS configuration
├── tsconfig.json             # Strictest TypeScript compiler configuration
└── vite.config.ts            # Vite 8 build pipeline configuration
```

<!-- @gov:ARCH-BINDING -->
## 3. Formal Specification Alignment

- **Requirements Grammar (`docs/PRD.md`):** All 7 functional requirements (`FR-TASK-01` through `FR-THEME-01`) adhere to ISO/IEC/IEEE 29148.
- **Technical Design (`docs/TDD.md`):** Component recipes, storage contracts, and micro-benchmark matrices.
- **Relational Storage Model (`docs/schema.dbml`):** Relational 3NF tables with `tasks`, `tags`, and `task_tags` junction table.
- **Design Tokens (`tokens/main.tokens.kdl`):** Material 3 semantic color mapping and layout dimensions with explicit units.

<!-- @gov:ARCH-LIFELINE -->
## 4. Cross-Module Data Flow Lifeline

```mermaid
sequenceDiagram
    autonumber
    actor User as User Action
    participant View as Presentation View
    participant Store as TaskStore (Ring 3)
    participant SQLite as SQLite WASM (Ring 2)
    participant IDB as IndexedDB (Ring 2)

    User->>View: Create / Toggle / Reorder Task
    View->>Store: Invoke action method (e.g. createTask)
    Store->>Store: Calculate in-memory state & ensure unique ID
    Store->>SQLite: Persist mutation to SQLite tables
    SQLite->>IDB: Debounced binary snapshot write (150ms)
    Store->>View: Notify reactive subscriber (SolidJS signal update)
    View->>User: Re-render affected DOM node
```

<!-- @gov:ARCH-INVARIANTS -->
## 5. Architectural Boundary Invariants

1. **Unidirectional Dependency Invariant:**
   Ring 0 (`domain/`) must never import from outer rings. Ring 1 (`services/`) may only import from Ring 0. Ring 2 (`infrastructure/`) may import from Rings 0 and 1. Ring 3 (`presentation/`) may consume all inner rings.
2. **Headless Execution Invariant:**
   All modules in `src/services/` must execute headlessly in native Bun tests (`bun test`) with zero DOM dependencies or JSDOM mocks.
3. **Flat Control Flow Invariant:**
   The codebase strictly enforces early returns and guard clauses. Zero `else` blocks and zero nested `if` statements are permitted.
4. **Local-First Zero Telemetry Invariant:**
   All user task and tag records remain exclusively on the local client device via SQLite WASM and IndexedDB. Zero cloud telemetry or external network calls are executed.
