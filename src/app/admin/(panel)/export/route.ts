import { requireAdmin } from "@/lib/admin";
import { semuaKategori, semuaProduk } from "@/lib/admin-data";
import { hargaInfo } from "@/lib/price";

export const dynamic = "force-dynamic";

// Sel yang diawali = + - @ diberi tanda ' agar tidak dieksekusi sebagai rumus di Excel/Sheets.
const sel = (v: string | number | boolean) => {
  let t = String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
};

export async function GET() {
  await requireAdmin();
  const [produk, { daftar }] = await Promise.all([semuaProduk(), semuaKategori()]);
  const nama = new Map(daftar.map((k) => [k.slug, k.nama]));
  const kepala = ["id", "nama", "kategori", "harga", "harga_tampil", "diskon", "tampil", "unggulan", "stok", "foto"];
  const baris = produk.map((p) => {
    const h = hargaInfo(p);
    return [p.id, p.nama, nama.get(p.kategori) ?? p.kategori, p.harga, h.final, h.status, p.aktif ? "ya" : "tidak", p.unggulan ? "ya" : "tidak", p.stok, p.gambar].map(sel).join(",");
  });
  const csv = `\uFEFF${kepala.join(",")}\r\n${baris.join("\r\n")}\r\n`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="produk-fuji-florist-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
