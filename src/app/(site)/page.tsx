import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Ikon from "@/components/Ikon";
import JsonLd from "@/components/JsonLd";
import ProdukCard from "@/components/ProdukCard";
import { getTampil } from "@/lib/data";
import { daftarArea, jamBukaTeks, teleponLokal, telHref, waLink } from "@/lib/pengaturan";
import { hargaInfo } from "@/lib/price";
import { FAQ, faqLd } from "@/lib/seo";
import { GEO } from "@/lib/config";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Toko Bunga Bandung – Fuji Florist | Papan Bunga & Buket" },
  description: "Fuji Florist toko bunga Bandung: papan bunga, buket, standing flower & parcel. Pesan mudah lewat WhatsApp, pengiriman cepat, tulisan bisa custom.",
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "Toko Bunga Bandung – Fuji Florist", description: "Papan bunga, buket, standing flower & parcel di Bandung. Pesan lewat WhatsApp." },
};

const LANGKAH = [
  ["Pilih bunga", "Pilih produk yang Anda suka, lalu tekan tombol hijau “Pesan”. Anda langsung tersambung ke WhatsApp kami."],
  ["Kirim detail", "Sebutkan tanggal, alamat tujuan, dan tulisan kartu atau papan ucapan jika perlu."],
  ["Bayar & terima", "Bayar lewat transfer (BCA, Mandiri, BNI), QRIS, atau COD. Bunga diantar sesuai jadwal yang disepakati."],
];

export default async function Home() {
  const { produk, kategori, semuaKategori, testimoni, pengaturan: s } = await getTampil();
  const namaKat = new Map(semuaKategori.map((k) => [k.slug, k.nama]));
  const promo = produk.filter((p) => hargaInfo(p).status === "aktif").slice(0, 4);
  const pilihan = produk.slice(0, 8);
  const area = daftarArea(s);
  const jam = jamBukaTeks(s);
  const faq = FAQ(s);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="kecil-atas">Fuji Florist</span>
            <h1>Toko Bunga di Bandung untuk Setiap Momen Anda</h1>
            <p className="lead">Papan bunga, buket, standing flower, dan parcel. Pesan cukup lewat WhatsApp, kami bantu sampai bunga tiba di tujuan.</p>
            <div className="hero-aksi">
              <a href={waLink(s)} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-besar">
                <Ikon n="wa" size={26} />
                Pesan via WhatsApp
              </a>
              <Link href="/produk" className="btn btn-ghost btn-besar">Lihat Semua Produk</Link>
            </div>
            <p className="hero-catatan">Berpengalaman 10+ tahun · Tulisan bisa custom · Pengiriman cepat area Bandung</p>
          </div>
          <div className="hero-foto">
            <Image src="/img/hero/hero.webp" alt="Taman bunga warna-warni dengan latar pegunungan Bandung dan papan bunga ucapan" fill priority sizes="(max-width:960px) 100vw, 580px" />
          </div>
        </div>
      </section>

      <section className="seksi" aria-label="Keunggulan Fuji Florist">
        <div className="wrap">
          <ul className="nilai">
            {[
              ["jam", "Berpengalaman 10+ tahun", "Melayani pesanan bunga di Bandung dari tahun ke tahun."],
              ["kirim", "Pengiriman cepat", "Diantar ke area Bandung sesuai jadwal yang disepakati."],
              ["pena", "Tulisan bisa custom", "Ucapan dan nama pengirim disesuaikan keinginan Anda."],
              ["kartu", "Bayar dengan mudah", "Transfer BCA, Mandiri, BNI, QRIS, atau COD."],
            ].map(([ik, judul, isi]) => (
              <li key={judul}>
                <span className="ikon-bulat"><Ikon n={ik} size={24} /></span>
                <div><strong>{judul}</strong><span>{isi}</span></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="kategori" className="seksi seksi-sand">
        <div className="wrap">
          <div className="seksi-kepala">
            <h2>Pilih Bunga Sesuai Kebutuhan</h2>
            <p>Sentuh gambar untuk melihat pilihan di kategori tersebut.</p>
          </div>
          <div className="ubin-grid">
            {kategori.map((k) => (
              <Link key={k.slug} href={`/kategori/${k.slug}`} className="ubin">
                {k.gambar && <Image src={k.gambar} alt="" fill sizes="(max-width:640px) 50vw, (max-width:1040px) 33vw, 280px" />}
                <span>{k.nama}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {promo.length > 0 && (
        <section className="seksi seksi-blush" aria-labelledby="h-promo">
          <div className="wrap">
            <div className="seksi-kepala">
              <span className="kecil-atas">Hemat</span>
              <h2 id="h-promo">Promo Spesial</h2>
            </div>
            <ul className="grid-produk">
              {promo.map((p) => (
                <li key={p.id}><ProdukCard p={p} s={s} kategori={namaKat.get(p.kategori)} /></li>
              ))}
            </ul>
            <p style={{ marginTop: 28 }}><Link href="/promo" className="btn btn-primer">Lihat Semua Promo</Link></p>
          </div>
        </section>
      )}

      <section className="seksi" aria-labelledby="h-produk">
        <div className="wrap">
          <div className="seksi-kepala">
            <h2 id="h-produk">Produk Pilihan</h2>
            <p>Tekan tombol hijau “Pesan” di bawah produk, dan Anda langsung terhubung dengan kami lewat WhatsApp.</p>
          </div>
          <ul className="grid-produk">
            {pilihan.map((p, i) => (
              <li key={p.id}><ProdukCard p={p} s={s} kategori={namaKat.get(p.kategori)} prioritas={i < 2} /></li>
            ))}
          </ul>
          <p style={{ marginTop: 28 }}><Link href="/produk" className="btn btn-primer btn-besar">Lihat Semua Produk ({produk.length})</Link></p>
        </div>
      </section>

      <section id="cara-pesan" className="seksi seksi-sand">
        <div className="wrap">
          <div className="seksi-kepala"><h2>Cara Memesan, Mudah dalam 3 Langkah</h2></div>
          <ol className="langkah">
            {LANGKAH.map(([j, i]) => (
              <li key={j}><h3>{j}</h3><p>{i}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="seksi">
        <div className="wrap artikel">
          <h2>Toko Bunga Bandung yang Siap Membantu Setiap Momen</h2>
          <p>
            Fuji Florist adalah toko bunga di Bandung yang melayani berbagai kebutuhan: papan bunga untuk pernikahan, ulang tahun, grand opening, dan duka cita; buket bunga dan hand bouquet; standing flower; bunga meja; hingga parcel bunga dan parcel buah.
          </p>
          <p>
            Anda tidak perlu repot datang ke toko. Pilih produk di website ini, kirim detailnya lewat WhatsApp, dan kami bantu menyiapkan rangkaian serta mengantarnya ke alamat tujuan{area.length ? ` di ${area.join(", ")}` : ""}.
          </p>
          <h3>Bunga untuk setiap momen</h3>
          <ul>
            {kategori.map((k) => (
              <li key={k.slug}><Link href={`/kategori/${k.slug}`}>{k.nama} Bandung</Link></li>
            ))}
          </ul>
        </div>
      </section>

      {testimoni.length > 0 && (
        <section className="seksi seksi-blush" aria-labelledby="h-testi">
          <div className="wrap">
            <div className="seksi-kepala"><h2 id="h-testi">Kata Pelanggan Kami</h2></div>
            <ul className="testi">
              {testimoni.slice(0, 6).map((t) => (
                <li key={t.id}>
                  <div className="bintang" role="img" aria-label={`${t.bintang} dari 5 bintang`}>
                    {Array.from({ length: t.bintang }, (_, i) => <Ikon key={i} n="bintang" size={20} />)}
                  </div>
                  <p>“{t.teks}”</p>
                  <cite>{t.nama}</cite>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section id="kontak" className="seksi">
        <div className="wrap lokasi">
          <div>
            <h2>Lokasi & Kontak</h2>
            <ul className="info-kontak">
              <li><Ikon n="wa" size={22} /><span>WhatsApp / telepon: <strong>{teleponLokal(s.wa)}</strong></span></li>
              {s.alamat && <li><Ikon n="lokasi" size={22} /><span>{s.alamat}</span></li>}
              {jam && <li><Ikon n="jam" size={22} /><span>{jam}</span></li>}
              {area.length > 0 && <li><Ikon n="kirim" size={22} /><span>Melayani pengiriman ke: {area.join(", ")}</span></li>}
            </ul>
            <div className="hero-aksi">
              <a href={waLink(s)} target="_blank" rel="noopener noreferrer" className="btn btn-wa"><Ikon n="wa" size={22} />Chat WhatsApp</a>
              <a href={telHref(s)} className="btn btn-ghost"><Ikon n="telepon" size={22} />Telepon</a>
              <a href={s.maps_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><Ikon n="lokasi" size={22} />Buka Google Maps</a>
            </div>
          </div>
          <div className="peta">
            <iframe
              title="Peta lokasi Fuji Florist"
              src={`https://maps.google.com/maps?q=${GEO.lat},${GEO.lng}&z=15&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </div>
      </section>

      <section id="faq" className="seksi seksi-sand">
        <div className="wrap">
          <div className="seksi-kepala"><h2>Pertanyaan yang Sering Ditanyakan</h2></div>
          <div className="faq">
            {faq.map((f) => (
              <details key={f.t}>
                <summary>{f.t}<Ikon n="bawah" size={24} /></summary>
                <p>{f.j}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="seksi cta">
        <div className="wrap">
          <h2>Butuh Bunga Hari Ini?</h2>
          <p>Ceritakan kebutuhan Anda lewat WhatsApp. Kami bantu pilihkan rangkaian yang paling pas.</p>
          <a href={waLink(s)} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-besar"><Ikon n="wa" size={26} />Chat WhatsApp Sekarang</a>
        </div>
      </section>

      <JsonLd data={faqLd(faq)} />
    </>
  );
}
