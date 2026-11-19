"use server";

import { angka, catat, centang, guard, kembali, pesanError, segarkan, teks } from "@/lib/admin";
import { slugify } from "@/lib/config";
import { hapusGambar, unggahGambar } from "@/lib/upload";

export async function simpanKategori(fd: FormData) {
  const supa = await guard();
  const slugLama = teks(fd, "slug_lama", 60);
  const baru = !slugLama;
  const nama = teks(fd, "nama", 80);
  const balik = baru ? "/admin/kategori/baru" : `/admin/kategori/${slugLama}`;
  if (!nama) kembali(balik, { err: "Nama kategori wajib diisi." });

  const slug = baru ? slugify(teks(fd, "slug", 60) || nama) : slugLama;
  if (!slug) kembali(balik, { err: "Alamat (slug) tidak valid." });
  const { data: ada } = await supa.from("kategori").select("slug,gambar").eq("slug", slug).maybeSingle();
  if (baru && ada) kembali(balik, { err: "Kategori dengan alamat itu sudah ada." });
  if (!baru && !ada) kembali("/admin/kategori", { err: "Kategori tidak ditemukan." });

  const lama = ada?.gambar ?? "";
  let gambar = lama;
  const f = fd.get("gambar");
  if (f instanceof File && f.size > 0) {
    try {
      gambar = await unggahGambar(f);
    } catch (e) {
      kembali(balik, { err: pesanError(e) });
    }
  }

  const row = { slug, nama, deskripsi: teks(fd, "deskripsi", 500), gambar, urutan: angka(fd, "urutan", 0, 999), aktif: centang(fd, "aktif") };
  const { error } = await supa.from("kategori").upsert(row);
  if (error) kembali(balik, { err: `Gagal menyimpan: ${error.message}` });
  if (lama && lama !== gambar) await hapusGambar(lama);
  await catat(baru ? "tambah kategori" : "ubah kategori", nama);
  segarkan();
  kembali("/admin/kategori", { ok: `Kategori "${nama}" tersimpan.` });
}

export async function aksiKategori(fd: FormData) {
  const supa = await guard();
  const [op, slug] = String(fd.get("aksi") ?? "").split(":");
  if (!slug) kembali("/admin/kategori", { err: "Aksi tidak valid." });

  if (op === "tampil" || op === "sembunyi") {
    const { error } = await supa.from("kategori").update({ aktif: op === "tampil" }).eq("slug", slug);
    if (error) kembali("/admin/kategori", { err: error.message });
    await catat(`kategori: ${op}`, slug);
    segarkan();
    kembali("/admin/kategori", { ok: op === "tampil" ? "Kategori ditampilkan." : "Kategori disembunyikan." });
  }
  if (op === "hapus") {
    const { count } = await supa.from("produk").select("id", { count: "exact", head: true }).eq("kategori", slug);
    if ((count ?? 0) > 0) kembali("/admin/kategori", { err: `Kategori masih dipakai ${count} produk. Pindahkan atau hapus produknya dulu.` });
    const { data } = await supa.from("kategori").select("gambar").eq("slug", slug).maybeSingle();
    const { error } = await supa.from("kategori").delete().eq("slug", slug);
    if (error) kembali("/admin/kategori", { err: error.message });
    if (data?.gambar) await hapusGambar(data.gambar);
    await catat("hapus kategori", slug);
    segarkan();
    kembali("/admin/kategori", { ok: "Kategori dihapus." });
  }
  kembali("/admin/kategori", { err: "Aksi tidak dikenal." });
}
