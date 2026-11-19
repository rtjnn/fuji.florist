"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, SESI_JAM, makeToken, secretOk } from "@/lib/auth";
import { bacaAdmin, catat, ipKlien } from "@/lib/admin";
import { db } from "@/lib/db";
import { samaAman, verifyPassword } from "@/lib/password";

const JENDELA_MENIT = 15;
const MAKS_GAGAL = 5;
const memori = new Map<string, number[]>(); // cadangan bila database belum tersedia

async function terlaluBanyakGagal(ip: string) {
  if (db) {
    const sejak = new Date(Date.now() - JENDELA_MENIT * 60e3).toISOString();
    const { count, error } = await db.from("login_gagal").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", sejak);
    if (!error) return (count ?? 0) >= MAKS_GAGAL;
  }
  const l = (memori.get(ip) ?? []).filter((t) => t > Date.now() - JENDELA_MENIT * 60e3);
  memori.set(ip, l);
  return l.length >= MAKS_GAGAL;
}

async function catatGagal(ip: string) {
  memori.set(ip, [...(memori.get(ip) ?? []), Date.now()]);
  if (!db) return;
  await db.from("login_gagal").insert({ ip });
  await db.from("login_gagal").delete().lt("created_at", new Date(Date.now() - 864e5).toISOString());
}

export async function login(_prev: string, fd: FormData): Promise<string> {
  if (!secretOk()) return "Admin belum aktif: ADMIN_SECRET belum diisi (minimal 32 karakter).";
  const ip = await ipKlien();
  if (await terlaluBanyakGagal(ip)) return "Terlalu banyak percobaan yang salah. Coba lagi 15 menit lagi.";

  const pw = String(fd.get("password") ?? "").slice(0, 200);
  let row: { hash: string | null; sv: number };
  try {
    row = await bacaAdmin();
  } catch {
    return "Database sedang bermasalah. Coba lagi sebentar.";
  }
  const envPw = process.env.ADMIN_PASSWORD ?? "";
  const ok = row.hash ? verifyPassword(pw, row.hash) : envPw.length > 0 && samaAman(pw, envPw);
  if (!ok) {
    await catatGagal(ip);
    await new Promise((r) => setTimeout(r, 700));
    return "Password salah.";
  }

  memori.delete(ip);
  if (db) await db.from("login_gagal").delete().eq("ip", ip);
  (await cookies()).set(COOKIE, await makeToken(row.sv), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESI_JAM * 3600,
  });
  await catat("login");
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/admin/login");
}
