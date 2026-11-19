import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Password disimpan sebagai hash scrypt + garam acak (bukan teks asli).
export function hashPassword(pw: string) {
  const salt = randomBytes(16);
  return `s1$${salt.toString("hex")}$${scryptSync(pw, salt, 64).toString("hex")}`;
}

export function verifyPassword(pw: string, stored: string) {
  const [v, salt, hash] = stored.split("$");
  if (v !== "s1" || !salt || !hash) return false;
  const got = scryptSync(pw, Buffer.from(salt, "hex"), 64);
  const want = Buffer.from(hash, "hex");
  return got.length === want.length && timingSafeEqual(got, want);
}

// Perbandingan waktu-konstan untuk password dari env (login pertama).
export function samaAman(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}
