import { db } from "./db";
import { KATEGORI_DEFAULT, normProduk, PRODUK_SEED } from "./seed";
import { gabungPengaturan, PENGATURAN_DEFAULT } from "./pengaturan";
import type { Kategori, Pengaturan, Produk, Testimoni } from "./types";

// Pembacaan langsung (tanpa cache) khusus admin agar selalu terbaru.
export async function semuaProduk(): Promise<Produk[]> {
  if (!db) return PRODUK_SEED;
  const { data, error } = await db.from("produk").select("*").order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => normProduk(r as Record<string, unknown>));
}

export async function semuaKategori(): Promise<{ daftar: Kategori[]; tabelAda: boolean }> {
  if (!db) return { daftar: KATEGORI_DEFAULT, tabelAda: false };
  const { data, error } = await db.from("kategori").select("*").order("urutan");
  if (error) return { daftar: KATEGORI_DEFAULT, tabelAda: false };
  return { daftar: (data ?? []) as Kategori[], tabelAda: true };
}

export async function bacaPengaturan(): Promise<Pengaturan> {
  if (!db) return PENGATURAN_DEFAULT;
  const { data } = await db.from("pengaturan").select("data").eq("id", 1).maybeSingle();
  return gabungPengaturan(data?.data);
}

export async function semuaTestimoni(): Promise<Testimoni[]> {
  if (!db) return [];
  const { data } = await db.from("testimoni").select("*").order("id", { ascending: false });
  return (data ?? []) as Testimoni[];
}

export async function logTerbaru(n = 100) {
  if (!db) return [];
  const { data } = await db.from("log_admin").select("*").order("id", { ascending: false }).limit(n);
  return (data ?? []) as { id: number; aksi: string; detail: string; ip: string; created_at: string }[];
}
