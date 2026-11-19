import Image from "next/image";
import Link from "next/link";
import { rupiah, SITE, slugify } from "@/lib/config";
import { waLink } from "@/lib/pengaturan";
import { hargaInfo } from "@/lib/price";
import { slugProduk } from "@/lib/seo";
import type { Pengaturan, Produk } from "@/lib/types";
import Harga from "./Harga";
import Ikon from "./Ikon";

export default function ProdukCard({ p, kategori, s, prioritas = false }: { p: Produk; kategori?: string; s: Pengaturan; prioritas?: boolean }) {
  const h = hargaInfo(p);
  const href = `/produk/${slugProduk(p, slugify)}`;
  const harga = h.status === "aktif" ? ` (harga promo ${rupiah(h.final)})` : p.harga > 0 ? ` (${rupiah(p.harga)})` : "";
  const pesan = `Halo Fuji Florist, saya mau ${p.stok === "habis" ? "menanyakan ketersediaan" : "pesan"} "${p.nama}"${harga}. ${SITE}${href}`;

  return (
    <article className="kartu">
      <Link href={href} className="kartu-gambar" tabIndex={-1} aria-hidden="true">
        {p.gambar && (
          <Image src={p.gambar} alt="" fill sizes="(max-width:760px) 50vw, (max-width:1040px) 33vw, 25vw" priority={prioritas} loading={prioritas ? undefined : "lazy"} />
        )}
        {h.status === "aktif" && <span className="lencana lencana-diskon">Hemat {h.persen}%</span>}
        {p.stok === "habis" && <span className="lencana lencana-habis">Stok habis</span>}
      </Link>
      <div className="kartu-isi">
        {kategori && <p className="kartu-kategori">{kategori}</p>}
        <h3>
          <Link href={href}>{p.nama}</Link>
        </h3>
        <Harga p={p} />
        <a href={waLink(s, pesan)} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-blok btn-kartu" aria-label={`Pesan ${p.nama} lewat WhatsApp`}>
          <Ikon n="wa" size={20} />
          {p.stok === "habis" ? "Tanya stok" : "Pesan"}
        </a>
      </div>
    </article>
  );
}
