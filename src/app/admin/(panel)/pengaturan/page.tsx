import Notice from "@/components/Notice";
import { bacaPengaturan } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin";
import { simpanPengaturan } from "../../_actions/pengaturan";

export const dynamic = "force-dynamic";

export default async function Pengaturan({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const s = await bacaPengaturan();
  return (
    <>
      <div className="adm-kepala"><h1>Pengaturan Toko</h1></div>
      <Notice ok={sp.ok} err={sp.err} />
      <form action={simpanPengaturan} className="adm-kartu adm-form">
        <h2>Banner promo (di atas semua halaman)</h2>
        <label className="cek"><input type="checkbox" name="banner_aktif" defaultChecked={s.banner_aktif} />Tampilkan banner promo</label>
        <label htmlFor="banner_teks">Tulisan banner</label>
        <input id="banner_teks" name="banner_teks" type="text" maxLength={140} defaultValue={s.banner_teks} placeholder="mis. Diskon 10% semua buket sampai Minggu!" />
        <label htmlFor="banner_link">Tautan banner (opsional)</label>
        <input id="banner_link" name="banner_link" type="text" maxLength={300} defaultValue={s.banner_link} placeholder="/promo" />
        <small>Isi /promo untuk membuka halaman promo, atau alamat lengkap berawalan https://</small>

        <h2 style={{ marginTop: 32 }}>Kontak & lokasi</h2>
        <label htmlFor="wa">Nomor WhatsApp (juga untuk telepon)</label>
        <input id="wa" name="wa" type="text" inputMode="tel" required defaultValue={s.wa} />
        <small>Boleh ditulis 0857... atau 62857... Tombol WhatsApp di seluruh situs ikut berubah.</small>
        <label htmlFor="alamat">Alamat lengkap toko</label>
        <input id="alamat" name="alamat" type="text" maxLength={200} defaultValue={s.alamat} placeholder="Jalan, nomor, kelurahan, kecamatan" />
        <small>Penting untuk SEO lokal. Samakan persis dengan alamat di Google Business Profile.</small>
        <label htmlFor="kota">Kota</label>
        <input id="kota" name="kota" type="text" maxLength={60} defaultValue={s.kota} />
        <label htmlFor="area_layanan">Area pengiriman (pisahkan dengan koma)</label>
        <input id="area_layanan" name="area_layanan" type="text" maxLength={200} defaultValue={s.area_layanan} />
        <small>Isi hanya area yang benar-benar dilayani.</small>
        <label htmlFor="maps_url">Tautan Google Maps toko</label>
        <input id="maps_url" name="maps_url" type="url" maxLength={300} defaultValue={s.maps_url} />

        <h2 style={{ marginTop: 32 }}>Jam buka</h2>
        <div className="baris2">
          <div><label htmlFor="hari_buka">Hari</label>
            <select id="hari_buka" name="hari_buka" defaultValue={s.hari_buka}><option value="semua">Setiap hari</option><option value="senin-sabtu">Senin – Sabtu</option><option value="senin-jumat">Senin – Jumat</option></select></div>
          <span />
          <div><label htmlFor="jam_buka_dari">Buka pukul</label><input id="jam_buka_dari" name="jam_buka_dari" type="time" defaultValue={s.jam_buka_dari} /></div>
          <div><label htmlFor="jam_buka_sampai">Tutup pukul</label><input id="jam_buka_sampai" name="jam_buka_sampai" type="time" defaultValue={s.jam_buka_sampai} /></div>
        </div>
        <small>Kosongkan jika tidak ingin menampilkan jam buka. Waktu dihitung WIB.</small>

        <h2 style={{ marginTop: 32 }}>Media sosial (opsional)</h2>
        <label htmlFor="instagram">Instagram</label>
        <input id="instagram" name="instagram" type="url" maxLength={300} defaultValue={s.instagram} placeholder="https://instagram.com/akunanda" />
        <label htmlFor="tiktok">TikTok</label>
        <input id="tiktok" name="tiktok" type="url" maxLength={300} defaultValue={s.tiktok} placeholder="https://tiktok.com/@akunanda" />
        <label htmlFor="facebook">Facebook</label>
        <input id="facebook" name="facebook" type="url" maxLength={300} defaultValue={s.facebook} placeholder="https://facebook.com/halamananda" />

        <div className="adm-aksi"><button className="adm-tombol utama">Simpan pengaturan</button></div>
      </form>
    </>
  );
}
