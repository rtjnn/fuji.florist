import type { Metadata } from "next";
import Link from "next/link";
import Ikon from "@/components/Ikon";
import ProdukCard from "@/components/ProdukCard";
import { getTampil } from "@/lib/data";
import { waLink } from "@/lib/pengaturan";
import { hargaInfo } from "@/lib/price";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { produk } = await getTampil();
  const ada = produk.some((p) => hargaInfo(p).status === "aktif");
  return {
    title: "Promo & Diskon Bunga Bandung",
    description: "Promo dan diskon bunga dari Fuji Florist Bandung: papan bunga, buket, dan parcel dengan harga spesial. Pesan lewat WhatsApp.",
    alternates: { canonical: "/promo" },
    robots: ada ? undefined : { index: false, follow: true }, // halaman kosong tidak perlu diindeks
  };
}

export default async function Promo() {
  const { produk, semuaKategori, pengaturan: s } = await getTampil();
  const namaKat = new Map(semuaKategori.map((k) => [k.slug, k.nama]));
  const promo = produk.filter((p) => hargaInfo(p).status === "aktif");
  return (
    <div className="wrap">
      <div className="halaman-judul">
        <h1>Promo & Diskon Bunga Bandung</h1>
        <p>Harga spesial dari Fuji Florist. Promo berlaku selama periode yang tertera pada tiap produk.</p>
      </div>
      {promo.length ? (
        <ul className="grid-produk" style={{ margin: "28px 0 64px" }}>
          {promo.map((p, i) => (
            <li key={p.id}><ProdukCard p={p} s={s} kategori={namaKat.get(p.kategori)} prioritas={i < 2} /></li>
          ))}
        </ul>
      ) : (
        <div className="kosong" style={{ margin: "28px 0 64px" }}>
          <p>Belum ada promo saat ini. Tanyakan promo terbaru lewat WhatsApp, atau lihat semua produk kami.</p>
          <div className="hero-aksi" style={{ margin: "0 auto" }}>
            <a href={waLink(s, "Halo Fuji Florist, apakah ada promo saat ini?")} target="_blank" rel="noopener noreferrer" className="btn btn-wa"><Ikon n="wa" size={22} />Tanya Promo</a>
            <Link href="/produk" className="btn btn-ghost">Lihat Semua Produk</Link>
          </div>
        </div>
      )}
    </div>
  );
}
