"use server";

import { angka, catat, centang, guard, kembali, pesanError, segarkan, tanggal, teks } from "@/lib/admin";
import { akhirHariWIB, awalHariWIB } from "@/lib/config";
import { KATEGORI_DEFAULT } from "@/lib/seed";
import type { DiskonTipe } from "@/lib/types";
import { hapusGambar, unggahGambar } from "@/lib/upload";

export async function simpanProduk(fd: FormData) {
  const supa = await guard();
  const id = angka(fd, "id", 0, 1e12);
  const balik = id ? `/admin/produk/${id}` : "/admin/produk/baru";

  const nama = teks(fd, "nama", 120);
  const kategori = teks(fd, "kategori", 60);
  if (!nama || !kategori) kembali(balik, { err: "Nama dan kategori wajib diisi." });
  const { data: kat } = await supa.from("kategori").select("slug").eq("slug", kategori).maybeSingle();
  if (!kat && !KATEGORI_DEFAULT.some((k) => k.slug === kategori)) kembali(balik, { err: "Kategori tidak dikenal." });

  const harga = angka(fd, "harga", 0, 100_000_000);
  const tipeRaw = teks(fd, "diskon_tipe", 10);
  const tipe: DiskonTipe = tipeRaw === "persen" || tipeRaw === "nominal" ? tipeRaw : "none";
  const nilai = tipe === "none" ? 0 : angka(fd, "diskon_nilai", 0, 100_000_000);
  const mulai = tanggal(fd, "diskon_mulai");
  const selesai = tanggal(fd, "diskon_selesai");
  if (tipe !== "none") {
    if (harga <= 0) kembali(balik, { err: "Isi harga dulu sebelum memberi diskon." });
    if (nilai <= 0) kembali(balik, { err: "Isi besar diskon." });
    if (tipe === "persen" && nilai > 90) kembali(balik, { err: "Diskon persen maksimal 90%." });
    if (tipe === "nominal" && nilai >= harga) kembali(balik, { err: "Potongan harga harus lebih kecil dari harga produk." });
    if (mulai && selesai && selesai < mulai) kembali(balik, { err: "Tanggal selesai tidak boleh sebelum tanggal mulai." });
  }

  // Foto lama selalu dibaca dari database (bukan dari isian form).
  let lama = "";
  if (id) {
    const { data } = await supa.from("produk").select("gambar").eq("id", id).maybeSingle();
    if (!data) kembali("/admin/produk", { err: "Produk tidak ditemukan." });
    lama = data.gambar ?? "";
  }
  let gambar = lama;
  const f = fd.get("gambar");
  if (f instanceof File && f.size > 0) {
    try {
      gambar = await unggahGambar(f);
    } catch (e) {
      kembali(balik, { err: pesanError(e) });
    }
  }
  if (!gambar) kembali(balik, { err: "Foto produk wajib diisi." });

  const row = {
    nama,
    kategori,
    deskripsi: teks(fd, "deskripsi", 1000),
    harga,
    gambar,
    diskon_tipe: tipe,
    diskon_nilai: nilai,
    diskon_mulai: tipe !== "none" && mulai ? awalHariWIB(mulai) : null,
    diskon_selesai: tipe !== "none" && selesai ? akhirHariWIB(selesai) : null,
    aktif: centang(fd, "aktif"),
    unggulan: centang(fd, "unggulan"),
    stok: fd.get("stok") === "habis" ? "habis" : "tersedia",
    updated_at: new Date().toISOString(),
  };
  const { error } = id ? await supa.from("produk").update(row).eq("id", id) : await supa.from("produk").insert(row);
  if (error) kembali(balik, { err: `Gagal menyimpan: ${error.message}` });

  if (lama && lama !== gambar) await hapusGambar(lama);
  await catat(id ? "ubah produk" : "tambah produk", nama);
  segarkan();
  kembali("/admin/produk", { ok: `"${nama}" berhasil disimpan.` });
}

// Satu aksi untuk semua tombol di daftar produk. Format nilai tombol: "<op>:<id>" (per baris) atau "m-<op>" (massal).
export async function aksiProduk(fd: FormData) {
  const supa = await guard();
  const balikRaw = String(fd.get("balik") ?? "");
  const balik = balikRaw.startsWith("/admin/produk") && !balikRaw.startsWith("//") ? balikRaw.slice(0, 300) : "/admin/produk";
  const [op, arg] = String(fd.get("aksi") ?? "").split(":");
  const massal = op.startsWith("m-");
  const aksi = massal ? op.slice(2) : op;
  const ids = (massal ? fd.getAll("ids").map(Number) : [Number(arg)]).slice(0, 300);
  if (!ids.length || ids.some((i) => !Number.isInteger(i) || i <= 0)) kembali(balik, { err: "Pilih produk terlebih dahulu." });

  const sekarang = new Date().toISOString();
  const ubah = async (v: Record<string, unknown>, pesan: string) => {
    const { error } = await supa.from("produk").update({ ...v, updated_at: sekarang }).in("id", ids);
    if (error) kembali(balik, { err: error.message });
    await catat(`produk: ${aksi}`, `${ids.length} produk (id ${ids.slice(0, 10).join(", ")})`);
    segarkan();
    kembali(balik, { ok: `${pesan} (${ids.length} produk).` });
  };

  switch (aksi) {
    case "tampil": return ubah({ aktif: true }, "Produk ditampilkan");
    case "sembunyi": return ubah({ aktif: false }, "Produk disembunyikan");
    case "unggul": return ubah({ unggulan: true }, "Dijadikan produk unggulan");
    case "biasa": return ubah({ unggulan: false }, "Label unggulan dilepas");
    case "habis": return ubah({ stok: "habis" }, "Ditandai stok habis");
    case "ada": return ubah({ stok: "tersedia" }, "Ditandai tersedia");
    case "hapusdiskon": return ubah({ diskon_tipe: "none", diskon_nilai: 0, diskon_mulai: null, diskon_selesai: null }, "Diskon dihapus");
    case "salin": {
      const { data } = await supa.from("produk").select("*").eq("id", ids[0]).maybeSingle();
      if (!data) kembali(balik, { err: "Produk tidak ditemukan." });
      const { id: _id, created_at: _c, updated_at: _u, ...sisa } = data;
      const { error } = await supa.from("produk").insert({ ...sisa, nama: `${String(sisa.nama).slice(0, 100)} (salinan)`, aktif: false, unggulan: false });
      if (error) kembali(balik, { err: error.message });
      await catat("salin produk", String(sisa.nama));
      segarkan();
      kembali(balik, { ok: "Salinan dibuat dalam keadaan disembunyikan. Silakan ubah namanya." });
    }
    case "hapus": {
      const { data } = await supa.from("produk").select("gambar,nama").in("id", ids);
      const { error } = await supa.from("produk").delete().in("id", ids);
      if (error) kembali(balik, { err: error.message });
      for (const r of data ?? []) await hapusGambar(r.gambar);
      await catat("hapus produk", (data ?? []).map((r) => r.nama).join(", "));
      segarkan();
      kembali(balik, { ok: `${ids.length} produk dihapus.` });
    }
    default:
      kembali(balik, { err: "Aksi tidak dikenal." });
  }
}
