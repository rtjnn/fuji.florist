import Link from "next/link";
import Notice from "@/components/Notice";
import { logTerbaru, semuaKategori, semuaProduk, bacaPengaturan, semuaTestimoni } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin";
import { secretOk } from "@/lib/auth";
import { db } from "@/lib/db";
import { hargaInfo } from "@/lib/price";

export const dynamic = "force-dynamic";

export default async function Ringkasan() {
  await requireAdmin();
  const [produk, kat, s, testi, log] = await Promise.all([semuaProduk(), semuaKategori(), bacaPengaturan(), semuaTestimoni(), logTerbaru(6)]);
  const sedangDiskon = produk.filter((p) => hargaInfo(p).status === "aktif").length;
  const kenal = new Set(kat.daftar.map((k) => k.slug));
  const asing = produk.filter((p) => !kenal.has(p.kategori)).length;

  const peringatan: string[] = [];
  if (!db) peringatan.push("Supabase belum terhubung: perubahan tidak bisa disimpan. Isi .env.local / pengaturan Vercel.");
  if (db && !kat.tabelAda) peringatan.push("Tabel baru belum ada di database. Jalankan file supabase.sql di Supabase > SQL Editor.");
  if (!secretOk()) peringatan.push("ADMIN_SECRET belum diisi atau kurang dari 32 karakter.");
  if (!s.alamat) peringatan.push("Alamat toko belum diisi. Isi di menu Pengaturan agar Google Maps & pencarian lokal lebih akurat.");
  if (!s.jam_buka_dari) peringatan.push("Jam buka belum diisi (Pengaturan). Ini membantu SEO lokal.");
  if (asing) peringatan.push(`${asing} produk memakai kategori yang tidak dikenal, jadi tidak muncul di halaman kategori. Perbaiki di menu Produk.`);
  const tanpaHarga = produk.filter((p) => p.harga <= 0).length;

  return (
    <>
      <div className="adm-kepala"><div><h1>Ringkasan</h1><p className="bantu">Selamat datang. Pilih menu di atas untuk mengelola toko.</p></div>
        <Link href="/admin/produk/baru" className="adm-tombol utama">+ Tambah produk</Link></div>
      <Notice />
      {peringatan.map((t) => <p key={t} className="adm-notice info">{t}</p>)}
      <div className="adm-grid">
        <Link href="/admin/produk" className="adm-stat"><b>{produk.length}</b><span>Total produk</span></Link>
        <Link href="/admin/produk?status=tampil" className="adm-stat"><b>{produk.filter((p) => p.aktif).length}</b><span>Tampil di situs</span></Link>
        <Link href="/admin/produk?status=sembunyi" className="adm-stat"><b>{produk.filter((p) => !p.aktif).length}</b><span>Disembunyikan</span></Link>
        <Link href="/admin/diskon" className="adm-stat"><b>{sedangDiskon}</b><span>Sedang diskon</span></Link>
        <Link href="/admin/produk?status=habis" className="adm-stat"><b>{produk.filter((p) => p.stok === "habis").length}</b><span>Stok habis</span></Link>
        <Link href="/admin/produk?status=tanpa-harga" className="adm-stat"><b>{tanpaHarga}</b><span>Belum ada harga</span></Link>
        <Link href="/admin/kategori" className="adm-stat"><b>{kat.daftar.length}</b><span>Kategori</span></Link>
        <Link href="/admin/testimoni" className="adm-stat"><b>{testi.length}</b><span>Testimoni</span></Link>
      </div>
      <div className="adm-kartu">
        <h2>Jalan pintas</h2>
        <div className="adm-aksi" style={{ marginTop: 0 }}>
          <Link href="/admin/diskon" className="adm-tombol">Atur diskon</Link>
          <Link href="/admin/pengaturan" className="adm-tombol">Banner promo & kontak</Link>
          <a href="/admin/export" className="adm-tombol">Unduh data produk (CSV)</a>
        </div>
      </div>
      <div className="adm-kartu">
        <h2>Aktivitas terakhir</h2>
        {log.length ? (
          <table className="adm-tabel"><tbody>
            {log.map((l) => <tr key={l.id}><td>{new Date(l.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "short" })}</td><td>{l.aksi}</td><td>{l.detail}</td></tr>)}
          </tbody></table>
        ) : <p className="bantu">Belum ada aktivitas.</p>}
        <p><Link href="/admin/log">Lihat semua riwayat</Link></p>
      </div>
    </>
  );
}
