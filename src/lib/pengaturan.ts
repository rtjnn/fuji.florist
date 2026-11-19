import type { Pengaturan } from "./types";

export const PENGATURAN_DEFAULT: Pengaturan = {
  wa: "6285722069952",
  alamat: "",
  kota: "Bandung",
  hari_buka: "semua",
  jam_buka_dari: "",
  jam_buka_sampai: "",
  instagram: "",
  tiktok: "",
  facebook: "",
  maps_url: "https://www.google.com/maps?q=-6.7975969022585385,107.57413738843681",
  area_layanan: "Kota Bandung, Cimahi, Bandung Barat",
  banner_aktif: false,
  banner_teks: "",
  banner_link: "",
};

export function gabungPengaturan(raw: unknown): Pengaturan {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = { ...PENGATURAN_DEFAULT };
  for (const k of Object.keys(PENGATURAN_DEFAULT)) {
    if (typeof r[k] === typeof (PENGATURAN_DEFAULT as Record<string, unknown>)[k]) out[k] = r[k];
  }
  return out as Pengaturan;
}

export const teleponLokal = (wa: string) => (wa.startsWith("62") ? `0${wa.slice(2)}` : wa).replace(/(\d{4})(?=\d)/g, "$1-");
export const telHref = (s: Pengaturan) => `tel:+${s.wa}`;
export const waLink = (s: Pengaturan, pesan?: string) =>
  `https://wa.me/${s.wa}?text=${encodeURIComponent(pesan ?? "Halo Fuji Florist, saya dari website dan ingin bertanya tentang bunga.")}`;
export const daftarArea = (s: Pengaturan) => s.area_layanan.split(",").map((x) => x.trim()).filter(Boolean);

const HARI = { semua: "Setiap hari", "senin-sabtu": "Senin – Sabtu", "senin-jumat": "Senin – Jumat" } as const;
export const jamBukaTeks = (s: Pengaturan) =>
  s.jam_buka_dari && s.jam_buka_sampai ? `${HARI[s.hari_buka]}, ${s.jam_buka_dari.replace(":", ".")}–${s.jam_buka_sampai.replace(":", ".")} WIB` : "";

export const adaTautan = (u: string) => /^https:\/\//.test(u);
