"use server";

import { angka, catat, centang, guard, kembali, segarkan, teks } from "@/lib/admin";

const BALIK = "/admin/testimoni";

export async function simpanTestimoni(fd: FormData) {
  const supa = await guard();
  const id = angka(fd, "id", 0, 1e12);
  const nama = teks(fd, "nama", 60);
  const isi = teks(fd, "teks", 400);
  if (!nama || !isi) kembali(BALIK, { err: "Nama dan isi testimoni wajib diisi." });
  const row = { nama, teks: isi, bintang: angka(fd, "bintang", 1, 5) || 5, aktif: centang(fd, "aktif") };
  const { error } = id ? await supa.from("testimoni").update(row).eq("id", id) : await supa.from("testimoni").insert(row);
  if (error) kembali(BALIK, { err: error.message });
  await catat(id ? "ubah testimoni" : "tambah testimoni", nama);
  segarkan();
  kembali(BALIK, { ok: "Testimoni tersimpan." });
}

export async function aksiTestimoni(fd: FormData) {
  const supa = await guard();
  const [op, idRaw] = String(fd.get("aksi") ?? "").split(":");
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) kembali(BALIK, { err: "Aksi tidak valid." });
  const { error } =
    op === "hapus"
      ? await supa.from("testimoni").delete().eq("id", id)
      : await supa.from("testimoni").update({ aktif: op === "tampil" }).eq("id", id);
  if (error) kembali(BALIK, { err: error.message });
  await catat(`testimoni: ${op}`, String(id));
  segarkan();
  kembali(BALIK, { ok: op === "hapus" ? "Testimoni dihapus." : op === "tampil" ? "Testimoni ditampilkan." : "Testimoni disembunyikan." });
}
