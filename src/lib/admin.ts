import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { COOKIE, verifyToken } from "./auth";
import { TAG } from "./config";
import { db, tabelHilang } from "./db";

export async function ipKlien() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "tidak-dikenal").trim().slice(0, 64);
}

export async function bacaAdmin(): Promise<{ hash: string | null; sv: number }> {
  if (!db) return { hash: null, sv: 0 };
  const { data, error } = await db.from("admin").select("pass_hash,sesi_versi").eq("id", 1).maybeSingle();
  if (error) {
    if (tabelHilang(error)) return { hash: null, sv: 0 };
    throw error;
  }
  return { hash: data?.pass_hash ?? null, sv: Number(data?.sesi_versi ?? 0) };
}

// Wajib dipanggil di setiap halaman & aksi admin (middleware hanya pemeriksaan pertama).
export const requireAdmin = cache(async () => {
  const v = await verifyToken((await cookies()).get(COOKIE)?.value);
  if (!v) redirect("/admin/login");
  let sv = -1;
  try {
    sv = (await bacaAdmin()).sv;
  } catch (e) {
    console.error("requireAdmin:", e);
  }
  if (sv !== v.sv) redirect("/admin/login");
});

export async function guard() {
  await requireAdmin();
  if (!db) throw new Error("Supabase belum diatur. Isi .env.local lalu jalankan supabase.sql.");
  return db;
}

export async function catat(aksi: string, detail = "") {
  if (!db) return;
  try {
    await db.from("log_admin").insert({ aksi: aksi.slice(0, 60), detail: detail.slice(0, 300), ip: await ipKlien() });
  } catch {
    /* log tidak boleh menggagalkan aksi */
  }
}

export function segarkan() {
  revalidateTag(TAG);
  revalidatePath("/", "layout");
}

export function kembali(path: string, pesan: { ok?: string; err?: string }): never {
  const q = pesan.ok ? `ok=${encodeURIComponent(pesan.ok)}` : `err=${encodeURIComponent(pesan.err ?? "Terjadi kesalahan.")}`;
  redirect(`${path}${path.includes("?") ? "&" : "?"}${q}`);
}

export const pesanError = (e: unknown) => (e instanceof Error ? e.message : "Terjadi kesalahan.");

// Pembaca isian form yang aman
export const teks = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);
export const angka = (fd: FormData, k: string, min: number, max: number) => {
  const n = Math.round(Number(String(fd.get(k) ?? "").replace(/[^\d.-]/g, "")));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
};
export const centang = (fd: FormData, k: string) => fd.get(k) === "on";
export const tanggal = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) ? v : "";
};
export const urlAman = (v: string) => {
  if (!v) return "";
  try {
    const u = new URL(v);
    return u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
};
