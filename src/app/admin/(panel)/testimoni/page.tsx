import { TombolKonfirmasi } from "@/components/AdminKlien";
import Notice from "@/components/Notice";
import { semuaTestimoni } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin";
import { aksiTestimoni, simpanTestimoni } from "../../_actions/testimoni";

export const dynamic = "force-dynamic";

function Isian({ t }: { t?: { id: number; nama: string; teks: string; bintang: number; aktif: boolean } }) {
  return (
    <>
      <input type="hidden" name="id" value={t?.id ?? ""} />
      <label htmlFor={`n${t?.id ?? 0}`}>Nama pelanggan</label>
      <input id={`n${t?.id ?? 0}`} name="nama" type="text" required maxLength={60} defaultValue={t?.nama} />
      <label htmlFor={`t${t?.id ?? 0}`}>Isi testimoni</label>
      <textarea id={`t${t?.id ?? 0}`} name="teks" required maxLength={400} defaultValue={t?.teks} />
      <label htmlFor={`b${t?.id ?? 0}`}>Bintang</label>
      <select id={`b${t?.id ?? 0}`} name="bintang" defaultValue={String(t?.bintang ?? 5)}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} bintang</option>)}</select>
      <label className="cek"><input type="checkbox" name="aktif" defaultChecked={t ? t.aktif : true} />Tampilkan di situs</label>
      <div className="adm-aksi"><button className="adm-tombol utama">Simpan</button></div>
    </>
  );
}

export default async function Testimoni({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const daftar = await semuaTestimoni();
  return (
    <>
      <div className="adm-kepala"><div><h1>Testimoni ({daftar.length})</h1><p className="bantu">Isi hanya ulasan asli dari pelanggan Anda. Maksimal 6 yang aktif ditampilkan di beranda.</p></div></div>
      <Notice ok={sp.ok} err={sp.err} />
      <form action={simpanTestimoni} className="adm-kartu adm-form"><h2>Tambah testimoni</h2><Isian /></form>
      {daftar.map((t) => (
        <div key={t.id} className="adm-kartu">
          <p><b>{t.nama}</b> · {"★".repeat(t.bintang)} <span className={`lencana-adm ${t.aktif ? "hijau" : "merah"}`}>{t.aktif ? "Tampil" : "Disembunyikan"}</span></p>
          <p>{t.teks}</p>
          <details className="adm-edit"><summary>Ubah</summary><form action={simpanTestimoni} className="adm-form"><Isian t={t} /></form></details>
          <form action={aksiTestimoni} className="adm-aksi">
            <button name="aksi" value={`${t.aktif ? "sembunyi" : "tampil"}:${t.id}`} className="adm-tombol kecil">{t.aktif ? "Sembunyikan" : "Tampilkan"}</button>
            <TombolKonfirmasi pesan="Hapus testimoni ini?" name="aksi" value={`hapus:${t.id}`} className="adm-tombol kecil bahaya">Hapus</TombolKonfirmasi>
          </form>
        </div>
      ))}
    </>
  );
}
