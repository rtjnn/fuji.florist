# Fuji Florist v2 — Toko Bunga Bandung

Next.js 15 + Supabase. Tanpa Tailwind, tanpa font eksternal, tanpa library UI: halaman publik ringan dan di-cache (ISR).

## Pasang (sekali saja)
1. `npm install`  (membuat `package-lock.json` baru)
2. Supabase → **SQL Editor** → tempel isi `supabase.sql` → **Run**.
   Aman untuk database lama: produk lama dipertahankan, kolom & tabel baru ditambahkan.
3. Salin `.env.example` → `.env.local` (lokal) atau isi di **Vercel → Settings → Environment Variables**.
   `ADMIN_SECRET` wajib ≥ 32 karakter acak:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. `npm run dev` → buka `/admin`, login, lalu **Keamanan → Ganti password**.
5. Isi **Pengaturan** (alamat, jam buka, area kirim, media sosial).

## Fitur admin
Ringkasan & peringatan · Produk (cari/filter/urutkan, tambah/ubah/salin/hapus, tampil/sembunyi, unggulan, stok habis, aksi massal) ·
**Diskon** (per produk persen/nominal + jadwal tanggal, diskon massal semua/per kategori, hapus massal, bersihkan yang berakhir) ·
Kategori (tambah/ubah/hapus, gambar, deskripsi SEO, urutan) · Testimoni · Pengaturan (banner promo, WhatsApp, alamat, jam buka, area, sosmed) ·
Keamanan (ganti password, keluar dari semua perangkat) · Riwayat aktivitas · Unduh CSV.

## Keamanan
- Login dibatasi 5 kali salah / 15 menit per IP; password disimpan sebagai hash scrypt; sesi 12 jam, cookie `HttpOnly`, `Secure`, `SameSite=Strict`, `__Host-`.
- Sesi dicek di middleware **dan** di setiap halaman/aksi (versi sesi di database).
- Upload foto: isi file diperiksa, dikecilkan & diubah ke WebP, EXIF/lokasi dihapus.
- Header: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy. Semua tabel Supabase dikunci (RLS + cabut akses anon).
- Lupa password? Di Supabase, tabel `admin`, kosongkan kolom `pass_hash` → login memakai `ADMIN_PASSWORD` lagi.

## SEO yang sudah dipasang
Judul/deskripsi unik per halaman · canonical · Open Graph 1200×630 · JSON-LD (Florist/LocalBusiness, WebSite, Product, BreadcrumbList, FAQPage, ItemList) ·
halaman produk & kategori sendiri · sitemap dinamis (+gambar) · robots · teks kategori unik · FAQ.
Setelah online: daftarkan sitemap di Google Search Console, dan lengkapi **Google Business Profile** (alamat/jam/foto sama persis dengan Pengaturan).
