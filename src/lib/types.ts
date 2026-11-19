export type DiskonTipe = "none" | "persen" | "nominal";
export type Stok = "tersedia" | "habis";

export type Produk = {
  id: number;
  nama: string;
  kategori: string; // slug kategori
  deskripsi: string;
  harga: number; // 0 = "Tanya harga"
  gambar: string;
  diskon_tipe: DiskonTipe;
  diskon_nilai: number;
  diskon_mulai: string | null; // ISO
  diskon_selesai: string | null; // ISO
  aktif: boolean;
  unggulan: boolean;
  stok: Stok;
  created_at: string;
  updated_at: string;
};

export type Kategori = {
  slug: string;
  nama: string;
  deskripsi: string;
  gambar: string;
  urutan: number;
  aktif: boolean;
};

export type Testimoni = { id: number; nama: string; teks: string; bintang: number; aktif: boolean; created_at: string };

export type HariBuka = "semua" | "senin-sabtu" | "senin-jumat";

export type Pengaturan = {
  wa: string; // format 62xxxxxxxxxx
  alamat: string;
  kota: string;
  hari_buka: HariBuka;
  jam_buka_dari: string; // HH:MM
  jam_buka_sampai: string; // HH:MM
  instagram: string;
  tiktok: string;
  facebook: string;
  maps_url: string;
  area_layanan: string; // dipisah koma
  banner_aktif: boolean;
  banner_teks: string;
  banner_link: string;
};
