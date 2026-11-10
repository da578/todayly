# Technical Design Document (TDD) – ToDayLy
- **Nama Sistem:** ToDayLy Reactive Web Client
- **Runtime & Bahasa:** TypeScript 5.8+ / SolidJS 1.9+ / Vite 8+
- **Styling Engine:** Panda CSS (@pandacss/dev)
- **Pola Arsitektur:** Unidirectional Reactive Store + Modular Component Recipes

---

## 1. Keputusan Teknis & Algoritma Inti

<!-- [@design:FR-TASK-01] -->
### 1.1 Penyimpanan State Lokal & Reaktivitas Fine-Grained
Arsitektur state aplikasi dipisahkan menjadi dua lapisan:
1. **Core Domain Store (`src/presentation/stores/taskStore.ts`)**: Singleton murni tanpa ketergantungan framework (*framework-agnostic*), mengelola operasi mutasi data, id sanitization, ordering, local storage persistence, dan event subscription.
2. **SolidJS Reactive Adapter (`src/presentation/stores/solidStore.ts`)**: Menggunakan sinyal SolidJS (`createSignal`, `onCleanup`) untuk mendistribusikan pembaruan ke sub-pohon DOM reaktif tanpa re-render boros virtual DOM.

<!-- [@design:FR-TASK-02] -->
### 1.2 Algoritma Penyaringan & Pengurutan (`src/services/taskSortUtils.ts`)
Fungsi komparator murni (*pure comparator*) $\mathcal{O}(N \log N)$ yang mengisolasi logika sorting berdasarkan kriteria numerik, waktu ISO 8601, atau locale string.

<!-- [@design:FR-TASK-03] -->
### 1.3 Dualitas Workspace (List & Kanban Board)
- Tampilan ganda reaktif (`src/presentation/components/task/TaskListView.tsx` dan `src/presentation/components/task/TaskKanbanView.tsx`).
- Transisi status tugas drag & drop kanban dan animasi pergantian tampilan bebas jank via Document View Transitions API.

<!-- [@design:FR-TAG-01] -->
### 1.4 Manajemen Kategori & Tag Warna (`src/domain/types.ts`)
- Master entitas tag warna heksadesimal dengan kaskade otomatis pada junction table relasi many-to-many.

<!-- [@design:FR-THEME-01] -->
### 1.5 Desain Token & Styling Engine (Panda CSS + DUDUNG)
- Mengadopsi **Panda CSS** sebagai mesin styling statis berbasis kompilasi (*build-time CSS generation*), menggantikan runtime Tailwind CSS.
- Konfigurasi token didefinisikan secara resmi di `tokens/main.tokens.kdl` dan disinkronkan ke `panda.config.ts`.
- Komponen primitif UI (`src/presentation/components/ui/*`) dibangun menggunakan pola **Panda Recipes (`cva`)** untuk memisahkan gaya varian dan struktur JSX secara bersih.

<!-- [@design:FR-IO-01] -->
### 1.6 Serialisasi & Deserialisasi Ekspor/Impor (`src/services/exportImport.ts`)
- Parser multi-format menangani JSON (rekursif/array), YAML (via `js-yaml`), dan CSV (parser streaming toleran koma dalam tanda kutip).

<!-- [@design:FR-NOTIF-01] -->
### 1.7 Mesin Notifikasi Deadline Browser (`src/infrastructure/notification.ts`)
- Mendaftarkan ID tugas yang telah diberi notifikasi ke dalam `Set<number>` pada memori sesi untuk mencegah duplikasi ledakan notifikasi (*notification spamming*).

## 2. Skema Data & Kontrak Penyimpanan (DBML)
Struktur entitas dikunci secara resmi pada `docs/schema.dbml`.
Entitas utama:
- `Table tasks`: Terikat tag `// @design:FR-TASK-01`
- `Table tags`: Terikat tag `// @design:FR-TAG-01`
- `Table task_tags`: Terikat tag `// @design:FR-TASK-04` (Tabel perantara relasi many-to-many)
- `Table app_settings`: Penyimpanan konfigurasi key-value

Penyimpanan persisten menggunakan mesin **SQLite WASM** dengan backing binary snapshot pada **IndexedDB** (`src/services/sqliteStorage.ts`).

## 3. Pengujian Kinerja & Matriks Benchmark
### Micro-Benchmark `[@bench-micro:BM-SORT-01]`
- **Target Latensi Pengurutan 1000 Tasks:** $\le 2.0\text{ ms}$
- **Target Alokasi Memori:** Zero persistent leak.
- **Ambang Batas Derau (Noise Floor):** $\le 64\text{ ns}$.

## 4. Dokumentasi Arsitektur Hidup & Operasional
- **Keputusan Arsitektur:**
  - `docs/adr/0001-migrate-tailwind-to-pandacss.md` (Terikat `@adr:0001`).
  - `docs/adr/0002-sqlite-wasm-persistence.md` (Terikat `@adr:0002`).
- **Katalog Skenario:** Terdokumentasi pada `docs/USE_CASES.md`.
