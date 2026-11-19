import Link from "next/link";
import { TombolKonfirmasi } from "@/components/AdminKlien";
import Notice from "@/components/Notice";
import { semuaKategori, semuaProduk } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin";
import { rupiah, tanggalID } from "@/lib/config";
import { hargaInfo } from "@/lib/price";
import { bersihkanDiskonBerakhir, diskonMassal, hapusDiskonMassal } from "../../_actions/diskon";

export const dynamic = "force-dynamic";

export default async function Diskon({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const [semua, { daftar }] = await Promise.all([semuaProduk(), semuaKategori()]);
  const berdiskon = semua.filter((p) => p.diskon_tipe !== "none" && p.diskon_nilai > 0);
  const status = (p: (typeof semua)[number]) => hargaInfo(p).status;
  const pilihan = (
    <>
      <option value="semua">Semua produk</option>
      {daftar.map((k) => <option key={k.slug} value={k.slug}>Kategori: {k.nama}</option>)}
    </>
  );

  return (
    <>
      <div className="adm-kepala"><div><h1>Diskon</h1><p className="bantu">Pasang diskon sekaligus, atau atur per produk lewat menu Produk &gt; Ubah. Banner promo di bagian atas situs diatur di menu Pengaturan.</p></div></div>
      <Notice ok={sp.ok} err={sp.err} />

      <form action={diskonMassal} className="adm-kartu adm-form">
        <h2>Pasang diskon massal</h2>
        <label htmlFor="cakupan">Untuk produk</label>
        <select id="cakupan" name="cakupan" defaultValue="semua">{pilihan}</select>
        <div className="baris2">
          <div><label htmlFor="persen">Diskon (%)</label><input id="persen" name="persen" type="number" inputMode="numeric" min={1} max={90} required placeholder="mis. 10" /></div>
          <span />
          <div><label htmlFor="mulai">Mulai tanggal (opsional)</label><input id="mulai" name="mulai" type="date" /></div>
          <div><label htmlFor="selesai">Sampai tanggal (opsional)</label><input id="selesai" name="selesai" type="date" /></div>
        </div>
        <label className="cek"><input type="checkbox" name="timpa" />Timpa diskon yang sudah ada pada produk</label>
        <small>Produk tanpa harga otomatis dilewati. Tanpa centang di atas, produk yang sudah berdiskon tidak diubah.</small>
        <div className="adm-aksi"><button className="adm-tombol utama">Pasang diskon</button></div>
      </form>

      <div className="adm-kartu adm-form">
        <h2>Hapus diskon</h2>
        <form action={hapusDiskonMassal}>
          <label htmlFor="cakupan2">Hapus diskon dari</label>
          <select id="cakupan2" name="cakupan" defaultValue="semua">{pilihan}</select>
          <div className="adm-aksi"><TombolKonfirmasi pesan="Hapus diskon dari produk yang dipilih?" className="adm-tombol bahaya">Hapus diskon</TombolKonfirmasi></div>
        </form>
        <form action={bersihkanDiskonBerakhir}>
          <div className="adm-aksi"><button className="adm-tombol">Bersihkan diskon yang sudah berakhir</button></div>
        </form>
      </div>

      <div className="adm-kartu">
        <h2>Produk dengan diskon ({berdiskon.length})</h2>
        {berdiskon.length === 0 ? <p className="bantu">Belum ada produk berdiskon.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table className="adm-tabel">
              <thead><tr><th>Produk</th><th>Diskon</th><th>Harga tampil</th><th>Periode</th><th>Status</th><th /></tr></thead>
              <tbody>
                {berdiskon.map((p) => {
                  const h = hargaInfo(p);
                  const st = status(p);
                  return (
                    <tr key={p.id}>
                      <td>{p.nama}</td>
                      <td>{p.diskon_tipe === "persen" ? `${p.diskon_nilai}%` : rupiah(p.diskon_nilai)}</td>
                      <td>{h.status === "aktif" ? `${rupiah(h.final)} (asli ${rupiah(h.asli)})` : rupiah(p.harga)}</td>
                      <td>{p.diskon_mulai ? tanggalID(p.diskon_mulai) : "sekarang"} – {p.diskon_selesai ? tanggalID(p.diskon_selesai) : "tanpa batas"}</td>
                      <td><span className={`lencana-adm ${st === "aktif" ? "hijau" : st === "terjadwal" ? "kuning" : ""}`}>{st === "aktif" ? "Aktif" : st === "terjadwal" ? "Terjadwal" : "Berakhir"}</span></td>
                      <td><Link href={`/admin/produk/${p.id}`}>Ubah</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
