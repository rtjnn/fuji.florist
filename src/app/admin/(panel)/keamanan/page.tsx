import Notice from "@/components/Notice";
import { bacaAdmin, requireAdmin } from "@/lib/admin";
import { secretOk } from "@/lib/auth";
import { db } from "@/lib/db";
import { gantiPassword, keluarSemuaPerangkat } from "../../_actions/keamanan";

export const dynamic = "force-dynamic";

export default async function Keamanan({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const { hash } = await bacaAdmin();
  return (
    <>
      <div className="adm-kepala"><h1>Keamanan</h1></div>
      <Notice ok={sp.ok} err={sp.err} />
      {!hash && db && <p className="adm-notice info">Anda masih memakai password awal dari pengaturan server. Segera ganti dengan password baru di bawah.</p>}
      {!secretOk() && <p className="adm-notice err">ADMIN_SECRET belum aman (minimal 32 karakter acak).</p>}
      <form action={gantiPassword} className="adm-kartu adm-form">
        <h2>Ganti password</h2>
        <label htmlFor="lama">Password saat ini</label>
        <input id="lama" name="lama" type="password" required autoComplete="current-password" maxLength={200} />
        <label htmlFor="baru">Password baru</label>
        <input id="baru" name="baru" type="password" required minLength={10} autoComplete="new-password" maxLength={200} />
        <small>Minimal 10 karakter. Kalimat panjang yang mudah diingat lebih aman daripada kata pendek, mis. “kucingku-suka-bunga-mawar-2026”.</small>
        <label htmlFor="ulang">Ulangi password baru</label>
        <input id="ulang" name="ulang" type="password" required minLength={10} autoComplete="new-password" maxLength={200} />
        <div className="adm-aksi"><button className="adm-tombol utama">Ganti password</button></div>
      </form>
      <form action={keluarSemuaPerangkat} className="adm-kartu adm-form">
        <h2>Keluar dari semua perangkat</h2>
        <p className="bantu">Gunakan jika Anda pernah login di komputer umum atau HP yang hilang.</p>
        <div className="adm-aksi"><button className="adm-tombol bahaya">Keluar dari semua perangkat</button></div>
      </form>
      <div className="adm-kartu">
        <h2>Perlindungan yang aktif</h2>
        <ul>
          <li>Login dibatasi: 5 kali salah, lalu dikunci 15 menit.</li>
          <li>Password disimpan sebagai hash (tidak bisa dibaca kembali).</li>
          <li>Sesi login habis otomatis setelah 12 jam.</li>
          <li>Foto yang diunggah diperiksa isinya dan data lokasinya dihapus.</li>
          <li>Semua perubahan dicatat di menu Riwayat.</li>
        </ul>
      </div>
    </>
  );
}
