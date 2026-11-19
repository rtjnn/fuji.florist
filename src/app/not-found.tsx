import Link from "next/link";
import Ikon from "@/components/Ikon";
import { PENGATURAN_DEFAULT, waLink } from "@/lib/pengaturan";

export const metadata = { title: "Halaman tidak ditemukan", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="wrap" style={{ minHeight: "70vh", display: "grid", alignContent: "center", gap: 16, padding: "48px 0", textAlign: "center", justifyItems: "center" }}>
      <h1>Halaman tidak ditemukan</h1>
      <p style={{ maxWidth: "32rem", color: "var(--muted)" }}>Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan. Silakan kembali ke beranda atau lihat produk kami.</p>
      <div className="hero-aksi" style={{ width: "100%" }}>
        <Link href="/" className="btn btn-primer">Ke Beranda</Link>
        <Link href="/produk" className="btn btn-ghost">Lihat Produk</Link>
        <a href={waLink(PENGATURAN_DEFAULT)} className="btn btn-wa" target="_blank" rel="noopener noreferrer"><Ikon n="wa" size={22} />Chat WhatsApp</a>
      </div>
    </main>
  );
}
