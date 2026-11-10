# ToDayLy User and Technical Operations Manual

> Comprehensive guide for users, developers, and operators structured according to the Diátaxis documentation framework and ISO/IEC/IEEE 26514:2022.

---

## Reader Navigation Map

| Persona | Primary Goal | Recommended Reading |
| :--- | :--- | :--- |
| **New Users** | Learn daily task management, navigation, and shortcuts | [Part I: User Guide & Quickstart](#part-i-user-guide--quickstart) |
| **Power Users** | Master filters, tags, Kanban workflows, and data backups | [Part II: Feature Guides & Workflows](#part-ii-feature-guides--workflows) |
| **Developers** | Set up local development, run tests, and contribute code | [Part III: Developer Cookbook](#part-iii-developer-cookbook) |
| **Architects** | Understand fine-grained reactivity, SQLite WASM, and design tokens | [Part IV: Architecture & Internal Mechanics](#part-iv-architecture--internal-mechanics) |
| **Auditors** | Review data schemas, storage contracts, and operational limits | [Part V: Technical Reference Appendix](#part-v-technical-reference-appendix) |

---

## Part I: User Guide & Quickstart

### 1. The Core Mental Model
ToDayLy organizes productivity around four primary workspaces accessible via the navigation drawer:
- **Inbox:** Active tasks pending completion, ordered manually or by deadline.
- **Tags:** Filtered workspace organizing tasks under custom colored categories.
- **Archive:** Completed or deprioritized tasks retained for record-keeping without cluttering active views.
- **Trash:** Staging area for deleted tasks with instant restoration and permanent purge capabilities.

Data remains strictly local to your browser. No user account, network connection, or cloud synchronization is required.

### 2. Five-Minute Walkthrough
1. **Create a Task:** Click the circular `+` button in the lower-right corner (or press `N`).
2. **Enter Details:** Provide a task title, optional description, deadline, reminder, and tag associations. Click **Create Task**.
3. **Switch View Mode:** Click the view switcher icon in the header to alternate between **List View** and **Kanban View**.
4. **Complete a Task:** Click the checkbox on any task card. An inline strikethrough animates across the title, and the card transitions to the completed state.
5. **Organize via Drag and Drop:** In List View, drag cards using the handle icon (`≡`) to reorder priorities. In Kanban View, drag cards across columns to change status.

---

## Part II: Feature Guides & Workflows

### 1. Dual-View Operations (List vs Kanban)
- **List View:** Best for sequential daily planning and reordering. Supports pull-to-refresh and swipe gestures on mobile devices.
- **Kanban View:** Visualizes tasks in two discrete columns (**To Do** and **Completed**). When a task is marked complete in Kanban, the card physically lifts with elevation and relocates to the Completed column.

### 2. Advanced Search, Filtering, and Sorting
Click the search icon in the navigation bar to expand the search input. Click the filter icon (`SlidersHorizontal`) to customize display parameters:
- **Sort Order:** Default (custom manual order), Alphabetical (A to Z), Alphabetical (Z to A), Newest First, Oldest First.
- **Status Filter:** All Statuses, Incomplete Only, Completed Only.
- **Alerts & Deadlines:** All Tasks, With Deadline, With Reminder/Alarm, Pinned Only.

Non-matching tasks smoothly scale down and collapse without causing visual layout jump.

### 3. Data Backup and Portability
Navigate to **Settings > Backup & Data Storage**:
- **Export:** Save your task database to a standalone file in JSON, YAML, or CSV format, or copy raw data to the system clipboard.
- **Import:** Restore tasks from a backup file or text payload with automatic deduplication and ID conflict resolution.

---

## Part III: Developer Cookbook

### 1. Prerequisites and Installation
Ensure Bun 1.1+ and Git are installed on your workstation:

```bash
git clone https://github.com/da578/todayly.git
cd todayly
bun install
```

### 2. Local Development Server
Launch the development server with Hot Module Replacement (HMR):

```bash
bun run dev
```

Open `http://localhost:3000` in your browser.

### 3. Automated Verification Pipeline
Execute the full CI pipeline locally before submitting changes:

```bash
task ci
```

Individual verification commands:
- **Type Checking:** `bun run typecheck` (`tsc --noEmit`)
- **Unit Testing:** `bun run test` (`bun test`)
- **Production Build:** `bun run build` (`panda codegen && vite build`)

---

## Part IV: Architecture & Internal Mechanics

### 1. Four-Ring Clean Architecture
The source code under `src/` enforces unidirectional dependency flow:
- **Ring 0 (`src/domain/`):** Pure TypeScript interfaces, domain constants, and value types (`Task`, `Tag`, `SortOption`). Zero framework dependencies.
- **Ring 1 (`src/services/`):** Headless computation algorithms, pure comparator functions (`taskSortUtils.ts`), date/time formatting (`dateTimeUtils.ts`), and serialization parsers (`exportImport.ts`).
- **Ring 2 (`src/infrastructure/`):** Browser subsystem adapters including SQLite WASM persistence (`sqliteStorage.ts`), IndexedDB snapshot caching, pointer gestures (`gestures.ts`), and Web Notifications (`notification.ts`).
- **Ring 3 (`src/presentation/`):** Reactive user interface built with SolidJS signals, unidirectional stores (`taskStore.ts`), and compile-time Panda CSS component recipes.

### 2. Flat Control Flow Standard
To prevent cyclomatic complexity and hidden edge cases, all application logic enforces early returns and guard clauses:
- Zero `else` and zero `else if` blocks across the codebase.
- Zero nested `if` statements.

---

## Part V: Technical Reference Appendix

### 1. Operational System Limits

| Limit ID | Operational Parameter | Enforced Threshold |
| :--- | :--- | :--- |
| `LIM-01` | Maximum Task Title Length | 256 characters |
| `LIM-02` | Maximum Task Description Length | 4,096 characters |
| `LIM-03` | Maximum Tags per Task | 12 tags |
| `LIM-04` | Notification Evaluation Interval | 30 seconds |
| `LIM-05` | Maximum Backup File Import Size | 5 MiB |

### 2. Supported Data Formats

- **JSON:** Native hierarchical array containing full task object definitions.
- **YAML:** Human-readable key-value representation wrapped under top-level `tasks` mapping.
- **CSV:** Comma-separated value format with escaped multiline strings and standard headers (`id,name,description,status,order,reminder,deadline,onCreated,onUpdated`).
