import { logTerbaru } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function Riwayat() {
  await requireAdmin();
  const log = await logTerbaru(100);
  return (
    <>
      <div className="adm-kepala"><h1>Riwayat aktivitas</h1></div>
      <div className="adm-kartu" style={{ overflowX: "auto" }}>
        {log.length === 0 ? <p className="bantu">Belum ada aktivitas tercatat.</p> : (
          <table className="adm-tabel">
            <thead><tr><th>Waktu (WIB)</th><th>Aksi</th><th>Keterangan</th><th>IP</th></tr></thead>
            <tbody>
              {log.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" })}</td>
                  <td>{l.aksi}</td><td>{l.detail}</td><td>{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
