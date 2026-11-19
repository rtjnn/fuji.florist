import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ProdukCard from "@/components/ProdukCard";
import { slugify } from "@/lib/config";
import { getTampil } from "@/lib/data";
import { waLink } from "@/lib/pengaturan";
import { daftarLd, remahLd, slugProduk } from "@/lib/seo";
import Ikon from "@/components/Ikon";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    return (await getTampil()).kategori.map((k) => ({ slug: k.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { semuaKategori, produk } = await getTampil();
  const k = semuaKategori.find((x) => x.slug === slug && x.aktif);
  if (!k) return {};
  const ada = produk.some((p) => p.kategori === slug);
  const desc = `${k.deskripsi} Pesan lewat WhatsApp.`.slice(0, 158);
  return {
    title: `${k.nama} Bandung`,
    description: desc,
    alternates: { canonical: `/kategori/${slug}` },
    robots: ada ? undefined : { index: false, follow: true },
    openGraph: { url: `/kategori/${slug}`, title: `${k.nama} Bandung | Fuji Florist`, description: desc, ...(k.gambar ? { images: [{ url: k.gambar }] } : {}) },
  };
}

export default async function Kategori({ params }: Props) {
  const { slug } = await params;
  const { semuaKategori, kategori, produk: semua, pengaturan: s } = await getTampil();
  const k = semuaKategori.find((x) => x.slug === slug && x.aktif);
  if (!k) notFound();
  const produk = semua.filter((p) => p.kategori === slug);
  const lain = kategori.filter((x) => x.slug !== slug);

  return (
    <div className="wrap">
      <ol className="remah" aria-label="Jejak halaman">
        <li><Link href="/">Beranda</Link></li>
        <li><Link href="/produk">Produk</Link></li>
        <li aria-current="page">{k.nama}</li>
      </ol>
      <div className="halaman-judul" style={{ paddingTop: 0 }}>
        <h1>{k.nama} Bandung</h1>
        {k.deskripsi && <p>{k.deskripsi}</p>}
      </div>

      {produk.length ? (
        <ul className="grid-produk" style={{ marginTop: 28 }}>
          {produk.map((p, i) => (
            <li key={p.id}><ProdukCard p={p} s={s} prioritas={i < 2} /></li>
          ))}
        </ul>
      ) : (
        <div className="kosong" style={{ marginTop: 28 }}>
          <p>Produk di kategori ini sedang disiapkan. Hubungi kami untuk pilihan terbaru.</p>
          <a href={waLink(s, `Halo Fuji Florist, saya mencari ${k.nama}.`)} target="_blank" rel="noopener noreferrer" className="btn btn-wa"><Ikon n="wa" size={22} />Tanya via WhatsApp</a>
        </div>
      )}

      <section style={{ padding: "48px 0 64px" }} aria-labelledby="h-lain">
        <h2 id="h-lain" style={{ fontSize: "1.5rem", marginBottom: 16 }}>Kategori Bunga Lainnya</h2>
        <ul className="chips">
          {lain.map((x) => (
            <li key={x.slug}><Link href={`/kategori/${x.slug}`}>{x.nama}</Link></li>
          ))}
        </ul>
      </section>

      <JsonLd data={remahLd([{ nama: "Beranda", url: "/" }, { nama: "Produk", url: "/produk" }, { nama: k.nama, url: `/kategori/${slug}` }])} />
      <JsonLd data={daftarLd(`${k.nama} Bandung`, `/kategori/${slug}`, produk.map((p) => ({ nama: p.nama, url: `/produk/${slugProduk(p, slugify)}`, gambar: p.gambar })))} />
    </div>
  );
}
