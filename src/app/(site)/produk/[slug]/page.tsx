import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Harga from "@/components/Harga";
import Ikon from "@/components/Ikon";
import JsonLd from "@/components/JsonLd";
import ProdukCard from "@/components/ProdukCard";
import { mutlak, rupiah, SITE, slugify, tanggalID } from "@/lib/config";
import { getTampil } from "@/lib/data";
import { daftarArea, telHref, waLink } from "@/lib/pengaturan";
import { hargaInfo } from "@/lib/price";
import { deskripsiProduk, produkLd, remahLd, slugProduk } from "@/lib/seo";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

const idDariSlug = (slug: string) => Number(slug.match(/-(\d+)$/)?.[1] ?? NaN);

export async function generateStaticParams() {
  try {
    return (await getTampil()).produk.map((p) => ({ slug: slugProduk(p, slugify) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { produk, semuaKategori } = await getTampil();
  const p = produk.find((x) => x.id === idDariSlug(slug));
  if (!p) return {};
  const k = semuaKategori.find((x) => x.slug === p.kategori);
  const url = `/produk/${slugProduk(p, slugify)}`;
  const desc = deskripsiProduk(p, k).slice(0, 158);
  return {
    title: `${p.nama}${k ? ` – ${k.nama}` : ""} Bandung`,
    description: desc,
    alternates: { canonical: url },
    openGraph: { url, title: `${p.nama} | Fuji Florist Bandung`, description: desc, images: [{ url: mutlak(p.gambar), alt: p.nama }] },
  };
}

export default async function Produk({ params }: Props) {
  const { slug } = await params;
  const { produk, semuaKategori, pengaturan: s } = await getTampil();
  const p = produk.find((x) => x.id === idDariSlug(slug));
  if (!p) notFound();
  const benar = slugProduk(p, slugify);
  if (slug !== benar) permanentRedirect(`/produk/${benar}`);

  const k = semuaKategori.find((x) => x.slug === p.kategori);
  const h = hargaInfo(p);
  const url = `/produk/${benar}`;
  const sejenis = produk.filter((x) => x.kategori === p.kategori && x.id !== p.id).slice(0, 4);
  const habis = p.stok === "habis";
  const harga = h.status === "aktif" ? ` (harga promo ${rupiah(h.final)})` : p.harga > 0 ? ` (${rupiah(p.harga)})` : "";
  const pesan = `Halo Fuji Florist, saya mau ${habis ? "menanyakan ketersediaan" : "pesan"} "${p.nama}"${harga}. ${SITE}${url}`;
  const area = daftarArea(s);

  return (
    <div className="wrap">
      <ol className="remah" aria-label="Jejak halaman">
        <li><Link href="/">Beranda</Link></li>
        {k && <li><Link href={`/kategori/${k.slug}`}>{k.nama}</Link></li>}
        <li aria-current="page">{p.nama}</li>
      </ol>

      <div className="detail">
        <div className="detail-foto">
          <Image src={p.gambar} alt={`${p.nama}${k ? ` – ${k.nama}` : ""} Bandung, Fuji Florist`} fill priority sizes="(max-width:900px) 100vw, 580px" />
          {h.status === "aktif" && <span className="lencana lencana-diskon">Hemat {h.persen}%</span>}
        </div>

        <div className="detail-info">
          <h1>{p.nama}</h1>
          {k && <p className="detail-kat"><Link href={`/kategori/${k.slug}`}>{k.nama}</Link></p>}
          <Harga p={p} besar />
          {h.status === "aktif" && (
            <p className="catatan-diskon">
              Hemat {rupiah(h.hemat)}
              {p.diskon_selesai ? ` · promo sampai ${tanggalID(p.diskon_selesai)}` : ""}
            </p>
          )}
          {habis && <p className="catatan-diskon">Stok sedang habis. Tanyakan ketersediaan ke kami.</p>}
          <p>{deskripsiProduk(p, k)}</p>

          <a href={waLink(s, pesan)} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-blok btn-besar">
            <Ikon n="wa" size={26} />
            {habis ? "Tanya Ketersediaan" : "Pesan via WhatsApp"}
          </a>
          <a href={telHref(s)} className="btn btn-ghost btn-blok">
            <Ikon n="telepon" size={22} />
            Telepon Kami
          </a>

          <ul className="poin">
            <li><Ikon n="pena" size={22} />Tulisan kartu atau papan ucapan bisa disesuaikan</li>
            <li><Ikon n="kirim" size={22} />Diantar ke {area.length ? area.join(", ") : "area Bandung"}</li>
            <li><Ikon n="kartu" size={22} />Bayar lewat transfer, QRIS, atau COD</li>
          </ul>
        </div>
      </div>

      {sejenis.length > 0 && (
        <section style={{ paddingBottom: 64 }} aria-labelledby="h-serupa">
          <h2 id="h-serupa" style={{ fontSize: "1.6rem", marginBottom: 20 }}>Pilihan Serupa</h2>
          <ul className="grid-produk">
            {sejenis.map((x) => (
              <li key={x.id}><ProdukCard p={x} s={s} /></li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd data={produkLd(p, k, url)} />
      <JsonLd data={remahLd([{ nama: "Beranda", url: "/" }, ...(k ? [{ nama: k.nama, url: `/kategori/${k.slug}` }] : []), { nama: p.nama, url }])} />
    </div>
  );
}
