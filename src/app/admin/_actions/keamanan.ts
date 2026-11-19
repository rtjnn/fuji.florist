"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { bacaAdmin, catat, guard, kembali } from "@/lib/admin";
import { COOKIE, SESI_JAM, makeToken } from "@/lib/auth";
import { hashPassword, samaAman, verifyPassword } from "@/lib/password";

const BALIK = "/admin/keamanan";
const LEMAH = ["password", "12345678", "qwerty", "fujiflorist", "admin123", "bungabandung"];

export async function gantiPassword(fd: FormData) {
  const supa = await guard();
  const lama = String(fd.get("lama") ?? "").slice(0, 200);
  const baru = String(fd.get("baru") ?? "").slice(0, 200);
  const ulang = String(fd.get("ulang") ?? "").slice(0, 200);

  const row = await bacaAdmin();
  const envPw = process.env.ADMIN_PASSWORD ?? "";
  const benar = row.hash ? verifyPassword(lama, row.hash) : envPw.length > 0 && samaAman(lama, envPw);
  if (!benar) kembali(BALIK, { err: "Password saat ini salah." });
  if (baru.length < 10) kembali(BALIK, { err: "Password baru minimal 10 karakter. Kalimat panjang yang mudah diingat lebih baik." });
  if (LEMAH.some((w) => baru.toLowerCase().includes(w))) kembali(BALIK, { err: "Password terlalu mudah ditebak. Gunakan kalimat lain." });
  if (baru === lama) kembali(BALIK, { err: "Password baru harus berbeda dari yang lama." });
  if (baru !== ulang) kembali(BALIK, { err: "Pengulangan password baru tidak sama." });

  // Naikkan versi sesi: semua perangkat lain otomatis keluar, perangkat ini tetap masuk.
  const sv = row.sv + 1;
  const { error } = await supa.from("admin").upsert({ id: 1, pass_hash: hashPassword(baru), sesi_versi: sv });
  if (error) kembali(BALIK, { err: `Gagal menyimpan: ${error.message}` });
  (await cookies()).set(COOKIE, await makeToken(sv), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESI_JAM * 3600,
  });
  await catat("ganti password");
  kembali(BALIK, { ok: "Password berhasil diganti. Perangkat lain sudah dikeluarkan." });
}

export async function keluarSemuaPerangkat() {
  const supa = await guard();
  const row = await bacaAdmin();
  const { error } = await supa.from("admin").upsert({ id: 1, pass_hash: row.hash, sesi_versi: row.sv + 1 });
  if (error) kembali(BALIK, { err: error.message });
  await catat("keluar dari semua perangkat");
  (await cookies()).delete(COOKIE);
  redirect("/admin/login");
}
