import Link from "next/link";
import { notFound } from "next/navigation";
import { FotoInput } from "@/components/AdminKlien";
import Notice from "@/components/Notice";
import { semuaKategori } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin";
import { simpanKategori } from "../../../_actions/kategori";

export const dynamic = "force-dynamic";

export default async function FormKategori({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const { slug } = await params;
  const sp = await searchParams;
  const baru = slug === "baru";
  const { daftar } = await semuaKategori();
  const k = baru ? null : daftar.find((x) => x.slug === slug);
  if (!baru && !k) notFound();

  return (
    <>
      <div className="adm-kepala"><h1>{baru ? "Tambah kategori" : "Ubah kategori"}</h1><Link href="/admin/kategori" className="adm-tombol">← Kembali</Link></div>
      <Notice err={sp.err} ok={sp.ok} />
      <form action={simpanKategori} className="adm-kartu adm-form">
        <input type="hidden" name="slug_lama" value={k?.slug ?? ""} />
        <label htmlFor="nama">Nama kategori</label>
        <input id="nama" name="nama" type="text" required maxLength={80} defaultValue={k?.nama} placeholder="mis. Papan Bunga Syukuran" />
        {baru ? (
          <>
            <label htmlFor="slug">Alamat halaman (opsional)</label>
            <input id="slug" name="slug" type="text" maxLength={60} placeholder="otomatis dari nama, mis. papan-bunga-syukuran" />
            <small>Tidak bisa diubah setelah dibuat.</small>
          </>
        ) : <small>Alamat halaman: /kategori/{k?.slug}</small>}
        <label htmlFor="deskripsi">Deskripsi (tampil di halaman kategori)</label>
        <textarea id="deskripsi" name="deskripsi" maxLength={500} defaultValue={k?.deskripsi} placeholder="2–3 kalimat tentang kategori ini. Sebutkan kata seperti 'Bandung' secara wajar." />
        <label htmlFor="gambar">Gambar kategori {k?.gambar && "(kosongkan jika tidak diganti)"}</label>
        <FotoInput lama={k?.gambar} wajib={baru} />
        <label htmlFor="urutan">Urutan tampil (angka kecil tampil lebih dulu)</label>
        <input id="urutan" name="urutan" type="number" min={0} max={999} defaultValue={k?.urutan ?? 50} />
        <label className="cek"><input type="checkbox" name="aktif" defaultChecked={k ? k.aktif : true} />Tampilkan di situs</label>
        <div className="adm-aksi"><button className="adm-tombol utama">Simpan</button><Link href="/admin/kategori" className="adm-tombol">Batal</Link></div>
      </form>
    </>
  );
}
