import type { MetadataRoute } from "next";
import { mutlak, slugify } from "@/lib/config";
import { getTampil } from "@/lib/data";
import { hargaInfo } from "@/lib/price";
import { slugProduk } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { produk, kategori } = await getTampil();
  const terbaru = (l: { updated_at: string }[]) => new Date(Math.max(...l.map((x) => Date.parse(x.updated_at) || 0), 0) || Date.now());
  const adaPromo = produk.some((p) => hargaInfo(p).status === "aktif");
  return [
    { url: mutlak("/"), lastModified: terbaru(produk), changeFrequency: "weekly", priority: 1 },
    { url: mutlak("/produk"), lastModified: terbaru(produk), changeFrequency: "weekly", priority: 0.9 },
    ...(adaPromo ? [{ url: mutlak("/promo"), lastModified: terbaru(produk), changeFrequency: "daily" as const, priority: 0.7 }] : []),
    ...kategori.map((k) => ({
      url: mutlak(`/kategori/${k.slug}`),
      lastModified: terbaru(produk.filter((p) => p.kategori === k.slug)),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...produk.map((p) => ({
      url: mutlak(`/produk/${slugProduk(p, slugify)}`),
      lastModified: new Date(p.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: [mutlak(p.gambar)],
    })),
  ];
}
