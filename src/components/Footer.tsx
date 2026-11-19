import Link from "next/link";
import { NAMA } from "@/lib/config";
import { adaTautan, jamBukaTeks, teleponLokal, telHref, waLink } from "@/lib/pengaturan";
import type { Kategori, Pengaturan } from "@/lib/types";
import Ikon from "./Ikon";

export default function Footer({ s, kategori }: { s: Pengaturan; kategori: Kategori[] }) {
  const jam = jamBukaTeks(s);
  const sosial = [
    ["Instagram", s.instagram],
    ["TikTok", s.tiktok],
    ["Facebook", s.facebook],
  ].filter(([, u]) => adaTautan(u));

  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <p className="footer-judul">{NAMA}</p>
          <p>Toko bunga di {s.kota || "Bandung"} untuk papan bunga, buket, standing flower, bunga meja, dan parcel. Pesan mudah lewat WhatsApp.</p>
          <ul className="footer-kontak">
            <li>
              <Ikon n="wa" size={20} />
              <a href={waLink(s)} target="_blank" rel="noopener noreferrer">WhatsApp {teleponLokal(s.wa)}</a>
            </li>
            <li>
              <Ikon n="telepon" size={20} />
              <a href={telHref(s)}>{teleponLokal(s.wa)}</a>
            </li>
            {s.alamat && (
              <li>
                <Ikon n="lokasi" size={20} />
                <span>{s.alamat}</span>
              </li>
            )}
            {jam && (
              <li>
                <Ikon n="jam" size={20} />
                <span>{jam}</span>
              </li>
            )}
          </ul>
          {sosial.length > 0 && (
            <p className="footer-sosial">
              {sosial.map(([n, u]) => (
                <a key={n} href={u} target="_blank" rel="noopener noreferrer me">
                  {n}
                </a>
              ))}
            </p>
          )}
        </div>
        <nav aria-label="Kategori bunga">
          <p className="footer-judul">Kategori</p>
          <ul className="footer-daftar">
            {kategori.map((k) => (
              <li key={k.slug}>
                <Link href={`/kategori/${k.slug}`}>{k.nama} Bandung</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Halaman">
          <p className="footer-judul">Halaman</p>
          <ul className="footer-daftar">
            <li><Link href="/produk">Semua Produk</Link></li>
            <li><Link href="/promo">Promo & Diskon</Link></li>
            <li><Link href="/#cara-pesan">Cara Pesan</Link></li>
            <li><Link href="/#faq">Pertanyaan Umum</Link></li>
            <li><Link href="/#kontak">Lokasi & Kontak</Link></li>
          </ul>
        </nav>
      </div>
      <p className="footer-hak">&copy; {new Date().getFullYear()} {NAMA} — Toko Bunga Bandung</p>
    </footer>
  );
}
