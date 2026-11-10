# Katalog Skenario Use Case – ToDayLy

## Ringkasan Pemetaan Skenario
- `UC-01`: Pembuatan Tugas Detail & Quick Note (`@req:FR-TASK-01`)
- `UC-02`: Penyaringan Cepat & Pengurutan Multi-Kriteria (`@req:FR-TASK-02`)
- `UC-03`: Papan Kanban Interaktif & Drag-and-Drop Status (`@req:FR-TASK-03`)
- `UC-04`: Manajemen Kategori Tag & Kaskade Pembersihan (`@req:FR-TAG-01`)
- `UC-05`: Siklus Arsip & Pemulihan Tugas (`@req:FR-TASK-01`)
- `UC-06`: Tempat Sampah & Penghapusan Permanen (`@req:FR-TASK-01`)
- `UC-07`: Ekspor Data Cadangan Multi-Format (`@req:FR-IO-01`)
- `UC-08`: Impor Data Cadangan dengan Validasi Sintaks (`@req:FR-IO-01`)
- `UC-09`: Evaluasi Notifikasi Tenggat Waktu Lintas Tab (`@req:FR-NOTIF-01`)
- `UC-10`: Pergantian Tema Gelap/Terang Berbasis Panda CSS (`@req:FR-THEME-01`)

---

### UC-01: Pembuatan Tugas Detail & Quick Note
- **Aktor:** Pengguna Utama
- **Preconditions:** Aplikasi terbuka di browser.
- **Happy Path:**
  1. Pengguna menekan tombol FAB tambah (+) atau pintasan keyboard `Ctrl+N` / `Cmd+N`.
  2. Memilih mode "Create Task" untuk formulir lengkap, atau "Quick Note" untuk entri instan satu ketukan.
  3. Mengisi judul dan menyimpan. Tugas seketika muncul di puncak daftar atau urutan yang relevan.
- **Edge Cases:** Judul kosong ditolak dengan validasi status formulir.

### UC-07: Ekspor Data Cadangan Multi-Format
- **Aktor:** Pengguna Utama
- **Preconditions:** Terdapat tugas aktif/arsip di penyimpanan lokal.
- **Happy Path:**
  1. Pengguna membuka modal Settings $\to$ Export Tasks.
  2. Memilih format (JSON, YAML, atau CSV).
  3. Menekan tombol Unduh atau Salin Teks ke Clipboard. Berkas langsung diunduh ke sistem file lokal.

### UC-10: Pergantian Tema Gelap/Terang
- **Aktor:** Pengguna Utama
- **Preconditions:** Sistem mendeteksi tema tersimpan atau default terang.
- **Happy Path:**
  1. Pengguna menekan tombol switch tema di Drawer atau Settings.
  2. Root elemen `html` dan `body` memperoleh/melepas atribut atau kelas tema.
  3. Panda CSS merefleksikan seluruh *semantic tokens* warna secara instan tanpa re-render komputasi.
