import Image from "next/image";
import Link from "next/link";
import { TombolKonfirmasi } from "@/components/AdminKlien";
import Notice from "@/components/Notice";
import { semuaKategori, semuaProduk } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin";
import { aksiKategori } from "../../_actions/kategori";

export const dynamic = "force-dynamic";

export default async function DaftarKategori({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const [{ daftar, tabelAda }, produk] = await Promise.all([semuaKategori(), semuaProduk()]);
  const hitung = (slug: string) => produk.filter((p) => p.kategori === slug).length;
  return (
    <>
      <div className="adm-kepala"><h1>Kategori ({daftar.length})</h1>{tabelAda && <Link href="/admin/kategori/baru" className="adm-tombol utama">+ Tambah kategori</Link>}</div>
      <Notice ok={sp.ok} err={sp.err} />
      {!tabelAda && <p className="adm-notice info">Tabel kategori belum ada di database. Jalankan supabase.sql dulu agar kategori bisa diubah.</p>}
      <form action={aksiKategori} className="adm-kartu">
        <ul className="adm-daftar">
          {daftar.map((k) => (
            <li key={k.slug} className="adm-baris" style={{ gridTemplateColumns: "64px 1fr" }}>
              {k.gambar ? <Image src={k.gambar} alt="" width={64} height={64} sizes="64px" /> : <span />}
              <div>
                <div className="nama">{k.nama}</div>
                <div className="bantu" style={{ marginTop: 0 }}>/kategori/{k.slug} · {hitung(k.slug)} produk · urutan {k.urutan}</div>
                <span className={`lencana-adm ${k.aktif ? "hijau" : "merah"}`}>{k.aktif ? "Tampil" : "Disembunyikan"}</span>
              </div>
              {tabelAda && (
                <div className="tombol-baris" style={{ gridColumn: "1 / -1" }}>
                  <Link href={`/admin/kategori/${k.slug}`} className="adm-tombol kecil utama">Ubah</Link>
                  <button name="aksi" value={`${k.aktif ? "sembunyi" : "tampil"}:${k.slug}`} className="adm-tombol kecil">{k.aktif ? "Sembunyikan" : "Tampilkan"}</button>
                  <TombolKonfirmasi pesan={`Hapus kategori "${k.nama}"?`} name="aksi" value={`hapus:${k.slug}`} className="adm-tombol kecil bahaya">Hapus</TombolKonfirmasi>
                </div>
              )}
            </li>
          ))}
        </ul>
      </form>
      <p className="bantu">Kategori tanpa produk tampil tidak muncul di situs publik. Isi deskripsi kategori dengan baik, teks itu tampil di halaman kategori dan membantu Google.</p>
    </>
  );
}
