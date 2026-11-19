"use server";

import { angka, catat, centang, guard, kembali, segarkan, tanggal, teks } from "@/lib/admin";
import { akhirHariWIB, awalHariWIB } from "@/lib/config";

const BALIK = "/admin/diskon";
const KOSONG = { diskon_tipe: "none", diskon_nilai: 0, diskon_mulai: null, diskon_selesai: null };

export async function diskonMassal(fd: FormData) {
  const supa = await guard();
  const cakupan = teks(fd, "cakupan", 60) || "semua";
  const persen = angka(fd, "persen", 0, 100);
  const mulai = tanggal(fd, "mulai");
  const selesai = tanggal(fd, "selesai");
  if (persen < 1 || persen > 90) kembali(BALIK, { err: "Besar diskon harus antara 1% dan 90%." });
  if (mulai && selesai && selesai < mulai) kembali(BALIK, { err: "Tanggal selesai tidak boleh sebelum tanggal mulai." });

  let q = supa
    .from("produk")
    .update({
      diskon_tipe: "persen",
      diskon_nilai: persen,
      diskon_mulai: mulai ? awalHariWIB(mulai) : null,
      diskon_selesai: selesai ? akhirHariWIB(selesai) : null,
      updated_at: new Date().toISOString(),
    })
    .gt("harga", 0);
  if (cakupan !== "semua") q = q.eq("kategori", cakupan);
  if (!centang(fd, "timpa")) q = q.eq("diskon_tipe", "none");
  const { data, error } = await q.select("id");
  if (error) kembali(BALIK, { err: error.message });

  await catat("diskon massal", `${persen}% - ${cakupan} - ${data?.length ?? 0} produk`);
  segarkan();
  const n = data?.length ?? 0;
  kembali(BALIK, { ok: n ? `Diskon ${persen}% dipasang pada ${n} produk. Produk tanpa harga dilewati.` : "Tidak ada produk yang cocok (produk tanpa harga atau yang sudah berdiskon dilewati)." });
}

export async function hapusDiskonMassal(fd: FormData) {
  const supa = await guard();
  const cakupan = teks(fd, "cakupan", 60) || "semua";
  let q = supa.from("produk").update({ ...KOSONG, updated_at: new Date().toISOString() }).neq("diskon_tipe", "none");
  if (cakupan !== "semua") q = q.eq("kategori", cakupan);
  const { data, error } = await q.select("id");
  if (error) kembali(BALIK, { err: error.message });
  await catat("hapus diskon massal", `${cakupan} - ${data?.length ?? 0} produk`);
  segarkan();
  kembali(BALIK, { ok: `Diskon dihapus dari ${data?.length ?? 0} produk.` });
}

export async function bersihkanDiskonBerakhir() {
  const supa = await guard();
  const { data, error } = await supa
    .from("produk")
    .update({ ...KOSONG, updated_at: new Date().toISOString() })
    .neq("diskon_tipe", "none")
    .lt("diskon_selesai", new Date().toISOString())
    .select("id");
  if (error) kembali(BALIK, { err: error.message });
  await catat("bersihkan diskon berakhir", `${data?.length ?? 0} produk`);
  segarkan();
  kembali(BALIK, { ok: `${data?.length ?? 0} diskon yang sudah berakhir dibersihkan.` });
}
