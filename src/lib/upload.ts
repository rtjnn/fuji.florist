import { randomUUID } from "node:crypto";
import { db } from "./db";

const BUCKET = "produk";
const MAKS = 4.4 * 1024 * 1024; // di bawah batas isi permintaan Vercel (4,5 MB)

// Periksa isi file (bukan sekadar ekstensi/MIME): JPEG, PNG, atau WebP.
function formatGambarValid(b: Buffer) {
  const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG";
  const webp = b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP";
  return jpeg || png || webp;
}

export async function unggahGambar(file: File): Promise<string> {
  if (!db) throw new Error("Supabase belum diatur.");
  if (file.size > MAKS) throw new Error("Foto terlalu besar (maksimal sekitar 4 MB).");
  const buf = Buffer.from(await file.arrayBuffer());
  if (!formatGambarValid(buf)) throw new Error("File harus berupa foto JPG, PNG, atau WebP.");

  // Dikecilkan ke maks. 1400 px dan diubah ke WebP; data lokasi (EXIF) ikut terhapus.
  let out: Buffer;
  try {
    const { default: sharp } = await import("sharp");
    out = await sharp(buf, { limitInputPixels: 60_000_000 })
      .rotate()
      .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new Error("Foto tidak bisa diproses. Coba pilih foto lain.");
  }

  const nama = `${randomUUID()}.webp`;
  const { error } = await db.storage.from(BUCKET).upload(nama, out, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw new Error(`Gagal mengunggah foto: ${error.message}`);
  return db.storage.from(BUCKET).getPublicUrl(nama).data.publicUrl;
}

// Hapus file dari penyimpanan hanya jika memang milik kita dan tidak dipakai baris lain.
export async function hapusGambar(url: string) {
  if (!db || !url) return;
  const nama = url.match(/\/storage\/v1\/object\/public\/produk\/([\w.-]+)$/)?.[1];
  if (!nama) return;
  const [a, b] = await Promise.all([
    db.from("produk").select("id", { count: "exact", head: true }).eq("gambar", url),
    db.from("kategori").select("slug", { count: "exact", head: true }).eq("gambar", url),
  ]);
  if ((a.count ?? 0) + (b.count ?? 0) > 0) return;
  await db.storage.from(BUCKET).remove([nama]);
}
