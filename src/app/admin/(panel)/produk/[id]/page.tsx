import Link from "next/link";
import { notFound } from "next/navigation";
import { FotoInput } from "@/components/AdminKlien";
import Notice from "@/components/Notice";
import { semuaKategori, semuaProduk } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin";
import { keTanggalWIB, rupiah } from "@/lib/config";
import { hargaInfo } from "@/lib/price";
import { simpanProduk } from "../../../_actions/produk";

export const dynamic = "force-dynamic";

export default async function FormProduk({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const baru = id === "baru";
  const [semua, { daftar }] = await Promise.all([semuaProduk(), semuaKategori()]);
  const p = baru ? null : semua.find((x) => x.id === Number(id));
  if (!baru && !p) notFound();
  const h = p ? hargaInfo(p) : null;

  return (
    <>
      <div className="adm-kepala"><h1>{baru ? "Tambah produk" : "Ubah produk"}</h1><Link href="/admin/produk" className="adm-tombol">← Kembali</Link></div>
      <Notice err={sp.err} ok={sp.ok} />
      <form action={simpanProduk} className="adm-kartu adm-form">
        <input type="hidden" name="id" value={p?.id ?? ""} />

        <label htmlFor="nama">Nama produk</label>
        <input id="nama" name="nama" type="text" required maxLength={120} defaultValue={p?.nama} placeholder="mis. Buket Mawar Merah 20 Tangkai" />

        <label htmlFor="kategori">Kategori</label>
        <select id="kategori" name="kategori" required defaultValue={p?.kategori ?? ""}>
          <option value="" disabled>Pilih kategori</option>
          {daftar.map((k) => <option key={k.slug} value={k.slug}>{k.nama}</option>)}
        </select>

        <label htmlFor="harga">Harga (Rp)</label>
        <input id="harga" name="harga" type="number" inputMode="numeric" min={0} max={100000000} step={1000} defaultValue={p?.harga ?? 0} />
        <small>Isi 0 jika ingin menampilkan “Tanya harga”.</small>

        <label htmlFor="deskripsi">Deskripsi (boleh dikosongkan)</label>
        <textarea id="deskripsi" name="deskripsi" maxLength={1000} defaultValue={p?.deskripsi} placeholder="Ceritakan isi rangkaian, ukuran, warna, dan keunggulannya. Deskripsi yang jelas membantu pembeli dan Google." />

        <label htmlFor="gambar">Foto produk {p?.gambar && "(kosongkan jika tidak diganti)"}</label>
        <FotoInput lama={p?.gambar} wajib={baru} />
        <small>Foto JPG/PNG/WebP. Ukuran besar tidak masalah, otomatis dikecilkan.</small>

        <fieldset style={{ border: "2px solid #ead7de", borderRadius: 14, marginTop: 22, padding: "0.5rem 1rem 1rem" }}>
          <legend style={{ fontWeight: 700, padding: "0 0.5rem" }}>Diskon</legend>
          {h?.status === "aktif" && <p className="adm-notice ok">Diskon sedang aktif: harga tampil {rupiah(h.final)} (hemat {h.persen}%).</p>}
          {h?.status === "terjadwal" && <p className="adm-notice info">Diskon terjadwal, belum mulai.</p>}
          {h?.status === "berakhir" && <p className="adm-notice info">Diskon ini sudah berakhir. Hapus atau atur tanggal baru.</p>}
          <div className="baris2">
            <div>
              <label htmlFor="diskon_tipe">Jenis diskon</label>
              <select id="diskon_tipe" name="diskon_tipe" defaultValue={p?.diskon_tipe ?? "none"}>
                <option value="none">Tidak ada diskon</option>
                <option value="persen">Persen (%)</option>
                <option value="nominal">Potongan harga (Rp)</option>
              </select>
            </div>
            <div>
              <label htmlFor="diskon_nilai">Besar diskon</label>
              <input id="diskon_nilai" name="diskon_nilai" type="number" inputMode="numeric" min={0} defaultValue={p?.diskon_nilai ?? 0} />
              <small>Persen: 1–90. Potongan: nominal rupiah.</small>
            </div>
            <div>
              <label htmlFor="diskon_mulai">Mulai tanggal (opsional)</label>
              <input id="diskon_mulai" name="diskon_mulai" type="date" defaultValue={keTanggalWIB(p?.diskon_mulai ?? null)} />
            </div>
            <div>
              <label htmlFor="diskon_selesai">Sampai tanggal (opsional)</label>
              <input id="diskon_selesai" name="diskon_selesai" type="date" defaultValue={keTanggalWIB(p?.diskon_selesai ?? null)} />
            </div>
          </div>
          <small>Kosongkan tanggal agar diskon berlaku terus. Harga setelah diskon dibulatkan ke ribuan terdekat.</small>
        </fieldset>

        <label htmlFor="stok">Ketersediaan</label>
        <select id="stok" name="stok" defaultValue={p?.stok ?? "tersedia"}><option value="tersedia">Tersedia</option><option value="habis">Stok habis</option></select>

        <label className="cek"><input type="checkbox" name="aktif" defaultChecked={p ? p.aktif : true} />Tampilkan di situs</label>
        <label className="cek"><input type="checkbox" name="unggulan" defaultChecked={p?.unggulan ?? false} />Jadikan produk unggulan (tampil paling depan)</label>

        <div className="adm-aksi">
          <button className="adm-tombol utama">Simpan</button>
          <Link href="/admin/produk" className="adm-tombol">Batal</Link>
        </div>
      </form>
    </>
  );
}
