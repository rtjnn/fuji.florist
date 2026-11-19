import { unstable_cache } from "next/cache";
import { TAG } from "./config";
import { db, tabelHilang } from "./db";
import { gabungPengaturan, PENGATURAN_DEFAULT } from "./pengaturan";
import { KATEGORI_DEFAULT, normProduk, PRODUK_SEED, TESTIMONI_SEED } from "./seed";
import type { Kategori, Pengaturan, Produk, Testimoni } from "./types";

export type Katalog = { produk: Produk[]; kategori: Kategori[]; testimoni: Testimoni[]; pengaturan: Pengaturan };

async function muat(): Promise<Katalog> {
  if (!db) return { produk: PRODUK_SEED, kategori: KATEGORI_DEFAULT, testimoni: TESTIMONI_SEED, pengaturan: PENGATURAN_DEFAULT };

  const [p, k, t, s] = await Promise.all([
    db.from("produk").select("*").order("id", { ascending: false }),
    db.from("kategori").select("*").order("urutan"),
    db.from("testimoni").select("*").eq("aktif", true).order("id", { ascending: false }).limit(12),
    db.from("pengaturan").select("data").eq("id", 1).maybeSingle(),
  ]);
  if (p.error) throw new Error(`Gagal membaca produk: ${p.error.message}`);
  // Tabel baru boleh belum ada (jika supabase.sql belum dijalankan): pakai nilai bawaan agar situs tetap hidup.
  for (const e of [k.error, t.error, s.error]) if (e && !tabelHilang(e)) throw new Error(e.message);

  return {
    produk: (p.data ?? []).map((r) => normProduk(r as Record<string, unknown>)),
    kategori: k.error || !k.data?.length ? KATEGORI_DEFAULT : (k.data as Kategori[]),
    testimoni: t.error ? [] : ((t.data ?? []) as Testimoni[]),
    pengaturan: gabungPengaturan(s.data?.data),
  };
}

// Dicache; otomatis disegarkan saat admin menyimpan (revalidateTag) dan paling lambat tiap 60 detik (untuk jadwal diskon).
export const getKatalog = unstable_cache(muat, ["katalog-v2"], { revalidate: 60, tags: [TAG] });

export const urutkanProduk = (l: Produk[]) => [...l].sort((a, b) => Number(b.unggulan) - Number(a.unggulan) || b.id - a.id);

export async function getTampil() {
  const k = await getKatalog();
  const produk = urutkanProduk(k.produk.filter((p) => p.aktif));
  const kategori = k.kategori
    .filter((c) => c.aktif && produk.some((p) => p.kategori === c.slug))
    .sort((a, b) => a.urutan - b.urutan);
  return { ...k, produk, kategori, semuaKategori: k.kategori };
}
