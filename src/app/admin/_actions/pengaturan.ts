"use server";

import { catat, centang, guard, kembali, segarkan, teks, urlAman } from "@/lib/admin";
import { PENGATURAN_DEFAULT } from "@/lib/pengaturan";
import type { HariBuka, Pengaturan } from "@/lib/types";

const BALIK = "/admin/pengaturan";

function normalisasiWA(v: string) {
  const d = v.replace(/\D/g, "");
  if (d.startsWith("62")) return d;
  if (d.startsWith("0")) return `62${d.slice(1)}`;
  if (d.startsWith("8")) return `62${d}`;
  return d;
}

export async function simpanPengaturan(fd: FormData) {
  const supa = await guard();
  const wa = normalisasiWA(teks(fd, "wa", 30));
  if (!/^62\d{8,13}$/.test(wa)) kembali(BALIK, { err: "Nomor WhatsApp tidak valid. Contoh: 0857 2206 9952" });

  const dari = teks(fd, "jam_buka_dari", 5);
  const sampai = teks(fd, "jam_buka_sampai", 5);
  const jamOk = (j: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(j);
  if ((dari || sampai) && !(jamOk(dari) && jamOk(sampai))) kembali(BALIK, { err: "Isi jam buka dan jam tutup dengan lengkap." });

  const tautan = (k: string, label: string) => {
    const v = teks(fd, k, 300);
    const aman = urlAman(v);
    if (v && !aman) kembali(BALIK, { err: `Tautan ${label} harus diawali https://` });
    return aman;
  };
  const bannerLinkRaw = teks(fd, "banner_link", 300);
  const bannerLink = bannerLinkRaw.startsWith("/") && !bannerLinkRaw.startsWith("//") ? bannerLinkRaw : urlAman(bannerLinkRaw);
  if (bannerLinkRaw && !bannerLink) kembali(BALIK, { err: "Tautan banner harus diawali / (halaman situs) atau https://" });

  const hari = teks(fd, "hari_buka", 12);
  const data: Pengaturan = {
    wa,
    alamat: teks(fd, "alamat", 200),
    kota: teks(fd, "kota", 60) || "Bandung",
    hari_buka: (["semua", "senin-sabtu", "senin-jumat"].includes(hari) ? hari : "semua") as HariBuka,
    jam_buka_dari: dari,
    jam_buka_sampai: sampai,
    instagram: tautan("instagram", "Instagram"),
    tiktok: tautan("tiktok", "TikTok"),
    facebook: tautan("facebook", "Facebook"),
    maps_url: tautan("maps_url", "Google Maps") || PENGATURAN_DEFAULT.maps_url,
    area_layanan: teks(fd, "area_layanan", 200) || PENGATURAN_DEFAULT.area_layanan,
    banner_aktif: centang(fd, "banner_aktif"),
    banner_teks: teks(fd, "banner_teks", 140),
    banner_link: bannerLink,
  };
  if (data.banner_aktif && !data.banner_teks) kembali(BALIK, { err: "Isi tulisan banner promo dulu, atau matikan banner." });

  const { error } = await supa.from("pengaturan").upsert({ id: 1, data });
  if (error) kembali(BALIK, { err: `Gagal menyimpan: ${error.message}` });
  await catat("ubah pengaturan");
  segarkan();
  kembali(BALIK, { ok: "Pengaturan tersimpan." });
}
