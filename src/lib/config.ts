export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://fujiflorist.online").replace(/\/$/, "");
export const NAMA = "Fuji Florist";
export const TAG = "katalog"; // tag cache; dipanggil ulang setiap admin menyimpan perubahan
export const GEO = { lat: -6.7975969022585385, lng: 107.57413738843681 };

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export const rupiah = (n: number) => `Rp ${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

export const mutlak = (url: string) => (url.startsWith("http") ? url : `${SITE}${url.startsWith("/") ? "" : "/"}${url}`);

export const tanggalID = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

// Tanggal (YYYY-MM-DD) <-> waktu WIB (UTC+7) untuk jadwal diskon
export const awalHariWIB = (d: string) => new Date(`${d}T00:00:00+07:00`).toISOString();
export const akhirHariWIB = (d: string) => new Date(`${d}T23:59:59+07:00`).toISOString();
export const keTanggalWIB = (iso: string | null) => (iso ? new Date(Date.parse(iso) + 7 * 3600e3).toISOString().slice(0, 10) : "");
