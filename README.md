# ToDayLy

> Local-first reactive task management with SQLite WASM persistence and Material 3 design tokens.

<!-- @gov:README-HEADER -->
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Framework: SolidJS](https://img.shields.io/badge/Framework-SolidJS_1.9-blue)](https://solidjs.com)
[![Engine: SQLite WASM](https://img.shields.io/badge/Engine-SQLite_WASM-green)](https://sql.js.org)
[![Build: Vite](https://img.shields.io/badge/Build-Vite_8-purple)](https://vitejs.dev)

---

<!-- @gov:README-SUMMARY -->
## Executive Technical Summary

ToDayLy is an offline-capable Single Page Application engineered for task management, deadline tracking, and multi-format data portability. The application operates entirely inside the browser client without external servers or tracking telemetry. Data persistence is managed via an in-memory SQLite WebAssembly engine backed by atomic binary snapshots committed to IndexedDB. The user interface leverages SolidJS fine-grained reactivity and Panda CSS compile-time design tokens for zero virtual DOM overhead.

---

<!-- @gov:README-PREREQ -->
## Target Platform & Prerequisites

- **Runtime & Package Manager:** Bun 1.1+ or Node.js 20+
- **Browser Compatibility:** Modern evergreen browsers supporting WebAssembly, IndexedDB, and CSS View Transitions API (Chromium 111+, Firefox 120+, Safari 18+)

---

<!-- @gov:README-HIGHLIGHTS -->
## Architectural Highlights

- **4-Ring Clean Architecture:** Unidirectional boundaries separating Domain (Ring 0), Services (Ring 1), Infrastructure (Ring 2), and Presentation (Ring 3).
- **Relational Storage:** Normalized 3NF SQLite schema with junction table `task_tags` and indexed B-Tree lookups.
- **Flat Control Flow:** Enforces early returns and guard clauses across the codebase with zero `else` blocks and zero nested `if` statements.
- **Headless Test Suite:** Business logic and sorting algorithms run headlessly in sub-100ms via native `bun test`.
- **Multi-Format Interoperability:** Import and export tasks losslessly in JSON, YAML, and CSV formats.

---

<!-- @gov:README-LAYOUT -->
## Workspace Layout

```text
todayly/
├── src/
│   ├── domain/               # Ring 0: Pure entities, types, and constants
│   ├── services/             # Ring 1: Headless computational engines
│   ├── infrastructure/       # Ring 2: Browser APIs and storage persistence
│   └── presentation/         # Ring 3: Reactive SolidJS views and stores
├── tests/                    # Native test suite (bun:test)
├── docs/                     # Specifications: PRD.md, TDD.md, schema.dbml, ADRs
├── tokens/                   # DUDUNG KDL design tokens specification
├── ARCHITECTURE.md           # Formal 5-part architecture document
└── vite.config.ts            # Vite 8 build pipeline configuration
```

---

<!-- @gov:README-QUICKSTART -->
## Quick Start

1. Install dependencies:
   ```bash
   bun install
   ```

2. Run the development server:
   ```bash
   bun run dev
   ```

3. Execute verification suite:
   ```bash
   task ci
   ```

---

<!-- @gov:README-CONTRIB -->
## Contributing & Quality Gates

All contributions are validated by the four-stage master verification pipeline (`task ci`) covering static type checking, code quality linting, automated unit tests, and production bundle compilation.

Refer to [CONTRIBUTING.md](CONTRIBUTING.md) for branch policies, coding standards, and verification guidelines.

---

<!-- @gov:README-LEGAL -->
## Governance, Provenance & Security

| Artifact | Responsibility & Scope | Traceability |
| :--- | :--- | :--- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 5-part architectural layout, component DAG, and boundary invariants | `<!-- @gov:ARCH-OVERVIEW -->` |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributor workflow, quality gates, and flat control flow policies | `<!-- @gov:CONTRIB-VERIFY -->` |
| [SECURITY.md](SECURITY.md) | Coordinated vulnerability disclosure and private CVSS SLA commitments | `<!-- @gov:SEC-SLA -->` |
| [CHANGELOG.md](CHANGELOG.md) | Release history categorized according to Keep a Changelog v1.1.0 | `<!-- @gov:GOV-RELEASE -->` |
| [LICENSE](LICENSE) | Permissive open-source license terms (MIT) | `<!-- @gov:GOV-LICENSE -->` |
| [PRD.md](docs/PRD.md) | Formal ISO 29148 product requirements and system limits | `<!-- @req:FR-TASK-01 -->` |
| [TDD.md](docs/TDD.md) | Technical architecture specifications and micro-benchmark targets | `<!-- @design:FR-TASK-01 -->` |
