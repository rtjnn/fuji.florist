import type { Produk } from "./types";

export type HargaInfo = {
  asli: number;
  final: number;
  persen: number;
  hemat: number;
  status: "none" | "aktif" | "terjadwal" | "berakhir";
};

// Harga setelah diskon dibulatkan ke ribuan terdekat agar rapi.
export function hargaInfo(p: Pick<Produk, "harga" | "diskon_tipe" | "diskon_nilai" | "diskon_mulai" | "diskon_selesai">, now = Date.now()): HargaInfo {
  const asli = p.harga;
  const tanpa = (status: HargaInfo["status"]): HargaInfo => ({ asli, final: asli, persen: 0, hemat: 0, status });
  if (p.diskon_tipe === "none" || p.diskon_nilai <= 0 || asli <= 0) return tanpa("none");

  const mulai = p.diskon_mulai ? Date.parse(p.diskon_mulai) : -Infinity;
  const selesai = p.diskon_selesai ? Date.parse(p.diskon_selesai) : Infinity;
  if (now < mulai) return tanpa("terjadwal");
  if (now > selesai) return tanpa("berakhir");

  const potong = p.diskon_tipe === "persen" ? (asli * Math.min(p.diskon_nilai, 95)) / 100 : Math.min(p.diskon_nilai, asli);
  let final = Math.round((asli - potong) / 1000) * 1000;
  if (asli >= 1000) final = Math.max(final, 1000);
  if (final >= asli) return tanpa("none");
  return { asli, final, persen: Math.round((1 - final / asli) * 100), hemat: asli - final, status: "aktif" };
}
