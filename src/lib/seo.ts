import { GEO, mutlak, NAMA, SITE } from "./config";
import { daftarArea, teleponLokal } from "./pengaturan";
import { hargaInfo } from "./price";
import type { Kategori, Pengaturan, Produk } from "./types";

export const deskripsiProduk = (p: Produk, k?: Kategori) =>
  p.deskripsi.trim() ||
  `${p.nama}${k ? ` (${k.nama})` : ""} dari ${NAMA}, toko bunga di Bandung. Pesan mudah lewat WhatsApp: kami bantu atur tanggal, alamat tujuan, dan kartu ucapan.`;

export const slugProduk = (p: Pick<Produk, "id" | "nama">, slugify: (s: string) => string) => `${slugify(p.nama) || "produk"}-${p.id}`;

const HARI_ID = {
  semua: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  "senin-sabtu": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "senin-jumat": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
} as const;

export function bisnisLd(s: Pengaturan) {
  const sama = [s.instagram, s.tiktok, s.facebook].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Florist",
    "@id": `${SITE}/#florist`,
    name: NAMA,
    alternateName: "Fuji Florist Bandung",
    url: SITE,
    image: mutlak("/og-banner.jpg"),
    logo: mutlak("/logo.png"),
    description: "Toko bunga di Bandung: papan bunga, buket, standing flower, bunga meja, dan parcel. Pesan lewat WhatsApp.",
    telephone: `+${s.wa}`,
    address: {
      "@type": "PostalAddress",
      ...(s.alamat ? { streetAddress: s.alamat } : {}),
      addressLocality: s.kota || "Bandung",
      addressRegion: "Jawa Barat",
      addressCountry: "ID",
    },
    geo: { "@type": "GeoCoordinates", latitude: GEO.lat, longitude: GEO.lng },
    hasMap: s.maps_url,
    areaServed: daftarArea(s).map((nama) => ({ "@type": "City", name: nama })),
    ...(s.jam_buka_dari && s.jam_buka_sampai
      ? { openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: HARI_ID[s.hari_buka], opens: s.jam_buka_dari, closes: s.jam_buka_sampai }] }
      : {}),
    ...(sama.length ? { sameAs: sama } : {}),
    contactPoint: [{ "@type": "ContactPoint", telephone: `+${s.wa}`, contactType: "customer service", areaServed: "ID", availableLanguage: "id" }],
  };
}

export const situsLd = () => ({ "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: NAMA, inLanguage: "id-ID", publisher: { "@id": `${SITE}/#florist` } });

export const remahLd = (item: { nama: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: item.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.nama, item: mutlak(x.url) })),
});

export const faqLd = (faq: { t: string; j: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.t, acceptedAnswer: { "@type": "Answer", text: f.j } })),
});

export const daftarLd = (nama: string, url: string, item: { nama: string; url: string; gambar: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: nama,
  url: mutlak(url),
  mainEntity: {
    "@type": "ItemList",
    itemListElement: item.slice(0, 30).map((x, i) => ({ "@type": "ListItem", position: i + 1, url: mutlak(x.url), name: x.nama, image: mutlak(x.gambar) })),
  },
});

export function produkLd(p: Produk, k: Kategori | undefined, url: string) {
  const h = hargaInfo(p);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nama,
    image: [mutlak(p.gambar)],
    description: deskripsiProduk(p, k),
    sku: String(p.id),
    ...(k ? { category: k.nama } : {}),
    brand: { "@type": "Brand", name: NAMA },
    ...(p.harga > 0
      ? {
          offers: {
            "@type": "Offer",
            url: mutlak(url),
            priceCurrency: "IDR",
            price: h.final,
            availability: p.stok === "habis" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@id": `${SITE}/#florist` },
            ...(h.status === "aktif" && p.diskon_selesai ? { priceValidUntil: p.diskon_selesai.slice(0, 10) } : {}),
          },
        }
      : {}),
  };
}

export const FAQ = (s: Pengaturan) => {
  const area = daftarArea(s).join(", ");
  return [
    { t: "Bagaimana cara memesan bunga di Fuji Florist?", j: "Pilih produk di website, tekan tombol Pesan via WhatsApp, lalu kirim tanggal, alamat tujuan, dan kartu ucapan. Kami akan mengonfirmasi harga dan detail pesanan Anda lewat WhatsApp." },
    { t: "Apakah Fuji Florist melayani pengiriman bunga di Bandung?", j: `Ya, kami melayani pengiriman bunga ke area ${area || "Bandung dan sekitarnya"}. Ongkos kirim menyesuaikan lokasi tujuan dan akan kami informasikan saat Anda memesan lewat WhatsApp.` },
    { t: "Metode pembayaran apa saja yang tersedia?", j: "Pembayaran bisa lewat transfer bank (BCA, Mandiri, BNI), QRIS, atau COD sesuai kesepakatan saat pemesanan." },
    { t: "Bisakah tulisan di papan bunga dibuat sesuai keinginan?", j: "Bisa. Papan bunga untuk ulang tahun, pernikahan, duka cita, grand opening, dan lainnya dapat dibuat dengan tulisan custom. Kirimkan teks ucapan dan nama pengirim lewat WhatsApp." },
    { t: "Untuk pesanan mendadak, apakah masih bisa dilayani?", j: "Hubungi kami lewat WhatsApp secepatnya. Kami akan mengecek ketersediaan bunga dan waktu pengerjaan untuk pesanan Anda." },
    { t: "Apakah harga di website sudah pasti?", j: `Harga yang tampil adalah harga acuan dan dapat menyesuaikan ketersediaan bunga serta permintaan khusus. Produk berlabel “Tanya harga” bisa langsung ditanyakan lewat WhatsApp ${teleponLokal(s.wa)}.` },
  ];
};
