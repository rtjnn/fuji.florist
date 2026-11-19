import kategoriJson from "@/data/kategori.json";
import produkJson from "@/data/produk.json";
import type { DiskonTipe, Kategori, Produk, Stok, Testimoni } from "./types";

export const KATEGORI_DEFAULT: Kategori[] = kategoriJson;

// Mengubah baris database (dari versi lama maupun baru) menjadi Produk yang lengkap.
export function normProduk(r: Record<string, unknown>): Produk {
  const s = (v: unknown, d = "") => (typeof v === "string" ? v : d);
  const n = (v: unknown, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const tipe = (["none", "persen", "nominal"] as const).includes(r.diskon_tipe as DiskonTipe) ? (r.diskon_tipe as DiskonTipe) : "none";
  return {
    id: n(r.id),
    nama: s(r.nama),
    kategori: s(r.kategori),
    deskripsi: s(r.deskripsi),
    harga: Math.max(0, n(r.harga)),
    gambar: s(r.gambar),
    diskon_tipe: tipe,
    diskon_nilai: Math.max(0, n(r.diskon_nilai)),
    diskon_mulai: typeof r.diskon_mulai === "string" ? r.diskon_mulai : null,
    diskon_selesai: typeof r.diskon_selesai === "string" ? r.diskon_selesai : null,
    aktif: r.aktif === undefined ? true : r.aktif === true,
    unggulan: r.unggulan === true,
    stok: (r.stok === "habis" ? "habis" : "tersedia") as Stok,
    created_at: s(r.created_at, "2025-01-01T00:00:00Z"),
    updated_at: s(r.updated_at, s(r.created_at, "2025-01-01T00:00:00Z")),
  };
}

export const PRODUK_SEED: Produk[] = produkJson.map((p, i) => normProduk({ ...p, id: i + 1 })).reverse();
export const TESTIMONI_SEED: Testimoni[] = [];
