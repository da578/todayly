# ADR 0001: Migrasi Styling Engine dari Tailwind CSS ke Panda CSS

- **Status:** Diterima (Accepted)
- **Tanggal:** 2026-10-09
- **Tag Keterlacakan:** `@adr:0001`
- **Terkait Kebutuhan:** `@req:FR-THEME-01`, `@design:FR-THEME-01`

---

## Konteks
Aplikasi ToDayLy sebelumnya menggunakan konfigurasi `@tailwindcss/vite` dengan utility class inline. Seiring pertumbuhan fitur, pengelolaan token sistem desain Material 3 yang deterministik menuntut:
1. Kontrak tipe data token yang *type-safe* pada waktu kompilasi (*compile-time static extraction*).
2. Keselarasan dengan manifesto DUDUNG (desain token KDL deklaratif) dan ASEP (keterlacakan arsitektur).
3. Pemisahan varian komponen UI menggunakan *Component Variants & Recipes* (`cva`), menghilangkan dependensi runtime *string-concatenation* seperti `tailwind-merge` atau `clsx` liar.

## Keputusan
Kami memutuskan untuk:
1. Mengganti Tailwind CSS dengan **Panda CSS** (`@pandacss/dev`).
2. Menghasilkan *styled-system* berbasis SolidJS (`jsxFramework: 'solid'`).
3. Menggunakan **Panda Recipes (`cva`)** untuk pustaka komponen primitif UI (`src/components/ui/*`).
4. Menggunakan utilitas objek **`css({ ... })`** untuk tata letak halaman khusus.

## Konsekuensi
- **Positif:**
  - *Zero runtime CSS-in-JS overhead* dengan kecepatan render maksimal di SolidJS.
  - Skema token warna, spacing, dan tipografi terikat kuat pada TypeScript autocompletion.
  - Integrasi native dengan paradigma token DUDUNG.
- **Negatif / Mitigasi:**
  - Memerlukan proses codegen (`panda codegen`) sebelum kompilasi build Vite. Dimasukkan ke dalam script `prepare` di `package.json`.
