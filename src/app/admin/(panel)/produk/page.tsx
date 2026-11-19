import Image from "next/image";
import Link from "next/link";
import { PilihSemua, TombolKonfirmasi } from "@/components/AdminKlien";
import Notice from "@/components/Notice";
import { semuaKategori, semuaProduk } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin";
import { rupiah, tanggalID } from "@/lib/config";
import { hargaInfo } from "@/lib/price";
import { aksiProduk } from "../../_actions/produk";

export const dynamic = "force-dynamic";
type SP = Promise<Record<string, string | undefined>>;

export default async function DaftarProduk({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 80);
  const kat = sp.kategori ?? "";
  const status = sp.status ?? "";
  const urut = sp.urut ?? "baru";

  const [semua, { daftar }] = await Promise.all([semuaProduk(), semuaKategori()]);
  const namaKat = new Map(daftar.map((k) => [k.slug, k.nama]));

  let list = semua.filter((p) => {
    if (q && !p.nama.toLowerCase().includes(q)) return false;
    if (kat && p.kategori !== kat) return false;
    const h = hargaInfo(p);
    switch (status) {
      case "tampil": return p.aktif;
      case "sembunyi": return !p.aktif;
      case "diskon": return h.status !== "none";
      case "habis": return p.stok === "habis";
      case "unggulan": return p.unggulan;
      case "tanpa-harga": return p.harga <= 0;
      default: return true;
    }
  });
  if (urut === "nama") list = [...list].sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  if (urut === "murah") list = [...list].sort((a, b) => a.harga - b.harga);
  if (urut === "mahal") list = [...list].sort((a, b) => b.harga - a.harga);

  const qs = new URLSearchParams();
  for (const k of ["q", "kategori", "status", "urut"]) if (sp[k]) qs.set(k, sp[k]!);
  const balik = `/admin/produk${qs.size ? `?${qs}` : ""}`;

  return (
    <>
      <div className="adm-kepala">
        <div><h1>Produk ({list.length}{list.length !== semua.length ? ` dari ${semua.length}` : ""})</h1></div>
        <div className="adm-aksi" style={{ margin: 0 }}>
          <a href="/admin/export" className="adm-tombol">Unduh CSV</a>
          <Link href="/admin/produk/baru" className="adm-tombol utama">+ Tambah produk</Link>
        </div>
      </div>
      <Notice ok={sp.ok} err={sp.err} />

      <form method="get" className="adm-kartu adm-filter" role="search">
        <div><label htmlFor="q">Cari nama</label><input id="q" name="q" type="search" defaultValue={sp.q ?? ""} placeholder="mis. mawar" /></div>
        <div><label htmlFor="kategori">Kategori</label>
          <select id="kategori" name="kategori" defaultValue={kat}><option value="">Semua</option>{daftar.map((k) => <option key={k.slug} value={k.slug}>{k.nama}</option>)}</select></div>
        <div><label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status}>
            <option value="">Semua</option><option value="tampil">Tampil</option><option value="sembunyi">Disembunyikan</option><option value="diskon">Ada diskon</option>
            <option value="habis">Stok habis</option><option value="unggulan">Unggulan</option><option value="tanpa-harga">Belum ada harga</option>
          </select></div>
        <div><label htmlFor="urut">Urutkan</label>
          <select id="urut" name="urut" defaultValue={urut}><option value="baru">Terbaru</option><option value="nama">Nama A-Z</option><option value="murah">Termurah</option><option value="mahal">Termahal</option></select></div>
        <button className="adm-tombol utama">Terapkan</button>
      </form>

      <form action={aksiProduk} className="adm-kartu">
        <input type="hidden" name="balik" value={balik} />
        {list.length > 0 && <PilihSemua nama="ids" />}
        <ul className="adm-daftar">
          {list.map((p) => {
            const h = hargaInfo(p);
            return (
              <li key={p.id} className="adm-baris">
                <input type="checkbox" name="ids" value={p.id} aria-label={`Pilih ${p.nama}`} />
                {p.gambar ? <Image src={p.gambar} alt="" width={64} height={64} sizes="64px" /> : <span />}
                <div>
                  <div className="nama">{p.nama}</div>
                  <div className="bantu" style={{ marginTop: 0 }}>{namaKat.get(p.kategori) ?? <b style={{ color: "#b3261e" }}>Kategori tidak dikenal ({p.kategori})</b>} · {p.harga > 0 ? (h.status === "aktif" ? `${rupiah(h.final)} (asli ${rupiah(h.asli)})` : rupiah(p.harga)) : "Tanya harga"}</div>
                  <div style={{ marginTop: 4 }}>
                    <span className={`lencana-adm ${p.aktif ? "hijau" : "merah"}`}>{p.aktif ? "Tampil" : "Disembunyikan"}</span>
                    {p.unggulan && <span className="lencana-adm kuning">Unggulan</span>}
                    {p.stok === "habis" && <span className="lencana-adm merah">Stok habis</span>}
                    {h.status === "aktif" && <span className="lencana-adm hijau">Diskon {h.persen}%{p.diskon_selesai ? ` s/d ${tanggalID(p.diskon_selesai)}` : ""}</span>}
                    {h.status === "terjadwal" && <span className="lencana-adm kuning">Diskon terjadwal</span>}
                    {h.status === "berakhir" && <span className="lencana-adm">Diskon berakhir</span>}
                  </div>
                </div>
                <div className="tombol-baris">
                  <Link href={`/admin/produk/${p.id}`} className="adm-tombol kecil utama">Ubah</Link>
                  <button name="aksi" value={`${p.aktif ? "sembunyi" : "tampil"}:${p.id}`} className="adm-tombol kecil">{p.aktif ? "Sembunyikan" : "Tampilkan"}</button>
                  <button name="aksi" value={`${p.unggulan ? "biasa" : "unggul"}:${p.id}`} className="adm-tombol kecil">{p.unggulan ? "Lepas unggulan" : "Jadikan unggulan"}</button>
                  <button name="aksi" value={`${p.stok === "habis" ? "ada" : "habis"}:${p.id}`} className="adm-tombol kecil">{p.stok === "habis" ? "Tersedia" : "Stok habis"}</button>
                  <button name="aksi" value={`salin:${p.id}`} className="adm-tombol kecil">Salin</button>
                  <TombolKonfirmasi pesan={`Hapus "${p.nama}" secara permanen?`} name="aksi" value={`hapus:${p.id}`} className="adm-tombol kecil bahaya">Hapus</TombolKonfirmasi>
                </div>
              </li>
            );
          })}
        </ul>
        {list.length === 0 && <p className="bantu">Tidak ada produk yang cocok dengan filter ini.</p>}
        {list.length > 0 && (
          <div className="adm-massal">
            <b>Yang dicentang:</b>
            <button name="aksi" value="m-tampil" className="adm-tombol kecil">Tampilkan</button>
            <button name="aksi" value="m-sembunyi" className="adm-tombol kecil">Sembunyikan</button>
            <button name="aksi" value="m-unggul" className="adm-tombol kecil">Unggulan</button>
            <button name="aksi" value="m-habis" className="adm-tombol kecil">Stok habis</button>
            <button name="aksi" value="m-ada" className="adm-tombol kecil">Tersedia</button>
            <button name="aksi" value="m-hapusdiskon" className="adm-tombol kecil">Hapus diskon</button>
            <TombolKonfirmasi pesan="Hapus semua produk yang dicentang secara permanen?" name="aksi" value="m-hapus" className="adm-tombol kecil bahaya">Hapus</TombolKonfirmasi>
          </div>
        )}
      </form>
    </>
  );
}
