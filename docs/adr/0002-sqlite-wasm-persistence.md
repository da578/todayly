# ADR 0002: SQLite WASM Persistence dengan IndexedDB Backing & Tabel Perantara `task_tags`

- **Status:** Diterima (Accepted)
- **Tanggal:** 2026-10-09
- **Penulis:** Lead Software Engineer
- **Konteks Kebutuhan:** `@req:FR-TASK-01`, `@req:FR-TAG-01`
- **Desain Terkait:** `@design:FR-TASK-01`, `@design:FR-TASK-04`

---

## 1. Konteks & Permasalahan

Aplikasi ToDayLy memerlukan persistensi data yang lebih terstruktur dan andal dibandingkan penyimpanan raw key-value `localStorage`. Skema data relasional antara entitas tugas (`tasks`) dan kategori (`tags`) memiliki relasi *many-to-many* (satu tugas dapat memiliki banyak tag, dan satu tag dapat dimiliki banyak tugas).

Pengguna meminta migrasi media penyimpanan menjadi persisten menggunakan **SQLite WASM** dengan:
1. Pilihan mesin persistensi WebAssembly di lingkungan browser client (Opsi A: SQLite WASM dengan IndexedDB binary storage).
2. Normalisasi skema relasional dengan tabel perantara `task_tags`.
3. Migrasi mulus (*seamless data migration*) dari data lokal sebelumnya tanpa kehilangan data pengguna.

---

## 2. Keputusan Arsitektur

1. **Mesin Eksekusi SQLite WASM (`sql.js`)**:
   - Menggunakan binary SQLite resmi yang dikompilasi ke WebAssembly (`sql.js`).
   - Beroperasi secara in-memory untuk eksekusi kueri $\mathcal{O}(1)$ mikrodetik, dan mengekspor binary snapshot secara ter-debounce ke **IndexedDB** (`todayly_sqlite_db / sqlite_binary`).
   - Tidak memerlukan *COOP/COEP (Cross-Origin-Opener-Policy)* sehingga kompatibel 100% pada lingkungan pratinjau browser iframe.

2. **Normalisasi Relasional dengan Tabel Perantara (`task_tags`)**:
   - Skema tabel `tasks`, `tags`, dan tabel junction `task_tags (task_id, tag_id)`:
     ```sql
     CREATE TABLE IF NOT EXISTS task_tags (
       task_id INTEGER NOT NULL,
       tag_id TEXT NOT NULL,
       PRIMARY KEY (task_id, tag_id),
       FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
       FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
     );
     ```
   - Integritas referensial terjaga dengan indeks `idx_task_tags_task` dan `idx_task_tags_tag`.

3. **Inisialisasi & Migrasi Otomatis**:
   - Pada siklus inisialisasi aplikasi, modul `sqliteStorage` memeriksa keberadaan binary di IndexedDB.
   - Jika binary belum ada, sistem membaca data lama dari `localStorage` dan melakukan migrasi transaksi ke SQLite.
   - Jika `localStorage` kosong, sistem menabur data awal (*starter sample tasks & tags*).

---

## 3. Konsekuensi

- **Keuntungan**:
  - Standar kueri SQL ACID yang kuat.
  - Normalisasi data relasional dengan tabel junction `task_tags`.
  - Dukungan ekspor binary database `.sqlite` untuk backup penuh.
  - Zero-latency untuk pembaruan UI reaktif karena transaksi in-memory di-debounce sebelum disimpan ke IndexedDB.
- **Mitigasi**:
  - File binary `.wasm` dimuat secara lokal dari `node_modules` dengan fallback CDN andal untuk mencegah kendala jaringan.
