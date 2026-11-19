import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import ProdukCard from "@/components/ProdukCard";
import { getTampil } from "@/lib/data";
import { daftarLd, remahLd, slugProduk } from "@/lib/seo";
import { slugify } from "@/lib/config";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Semua Produk Bunga Bandung",
  description: "Katalog lengkap Fuji Florist Bandung: papan bunga, buket, standing flower, bunga meja, dan parcel. Pesan lewat WhatsApp.",
  alternates: { canonical: "/produk" },
};

export default async function Semua() {
  const { produk, kategori, semuaKategori, pengaturan: s } = await getTampil();
  const namaKat = new Map(semuaKategori.map((k) => [k.slug, k.nama]));
  return (
    <div className="wrap">
      <div className="halaman-judul">
        <h1>Semua Produk Bunga Fuji Florist Bandung</h1>
        <p>Pilih kategori di bawah, atau lihat semua produk. Tekan tombol hijau “Pesan” untuk langsung chat WhatsApp.</p>
      </div>
      <nav aria-label="Kategori" style={{ marginTop: 24 }}>
        <ul className="chips">
          <li><Link href="/produk" aria-current="page">Semua</Link></li>
          {kategori.map((k) => (
            <li key={k.slug}><Link href={`/kategori/${k.slug}`}>{k.nama}</Link></li>
          ))}
        </ul>
      </nav>
      <ul className="grid-produk" style={{ paddingBottom: 64 }}>
        {produk.map((p, i) => (
          <li key={p.id}><ProdukCard p={p} s={s} kategori={namaKat.get(p.kategori)} prioritas={i < 2} /></li>
        ))}
      </ul>
      <JsonLd data={remahLd([{ nama: "Beranda", url: "/" }, { nama: "Semua Produk", url: "/produk" }])} />
      <JsonLd data={daftarLd("Semua Produk Fuji Florist", "/produk", produk.map((p) => ({ nama: p.nama, url: `/produk/${slugProduk(p, slugify)}`, gambar: p.gambar })))} />
    </div>
  );
}
