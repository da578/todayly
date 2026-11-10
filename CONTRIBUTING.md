# Contributing to ToDayLy

<!-- @gov:CONTRIB-VERIFY -->

Thank you for contributing to ToDayLy. All contributions must pass the deterministic verification pipeline before acceptance.

## Code of Conduct

Maintain an objective, constructive, and respectful environment. Technical decisions are governed by verified measurements, test coverage, and specification contracts.

## Development Workflow

1. Fork or clone the repository:
   ```bash
   git clone https://github.com/da578/todayly.git
   cd todayly
   bun install
   ```

2. Create a focused topic branch from `main`:
   - Feature branches: `feat/<topic-name>`
   - Bug fix branches: `fix/<topic-name>`
   - Refactor branches: `refactor/<topic-name>`

3. Make minimal, surgical edits preserving the existing architecture.

## Non-Negotiable Engineering Invariants

Every code contribution must uphold the following rules:

1. **Flat Control Flow Invariant:**<br>
   The codebase strictly enforces early returns and guard clauses. Zero `else` blocks and zero nested `if` statements are permitted anywhere in source code.
2. **1:1 Symmetrical Traceability:**<br>
   New functional capabilities must correspond to functional requirements in `docs/PRD.md`, technical design in `docs/TDD.md`, domain implementation in `src/`, and test coverage in `tests/`.
3. **Zero Untyped Values:**<br>
   All data contracts must use strict TypeScript interfaces or union types. Avoid `any` declarations.
4. **Compile-Time Styling:**<br>
   Styles must use Panda CSS compile-time functions (`css`, `cva`). Runtime Tailwind classes are prohibited.

## Verification Pipeline

Before committing or opening a pull request, execute the full master verification pipeline:

```bash
task ci
```

The pipeline executes the four verification gates in sequence:
- **Gate 1 (Typecheck):** `bun run typecheck` (`tsc --noEmit`)
- **Gate 2 (Lint):** `bun run lint`
- **Gate 3 (Test):** `bun run test` (All unit tests must pass)
- **Gate 4 (Build):** `bun run build` (Panda codegen and production Vite compilation)

Pull requests that fail any verification gate or introduce control flow regressions will not be merged.
