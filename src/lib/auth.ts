// Sesi admin: cookie bertanda tangan HMAC-SHA256 (Web Crypto: jalan di middleware maupun server).
// Format: "<kedaluwarsa>.<versi-sesi>.<tanda-tangan>"
export const COOKIE = process.env.NODE_ENV === "production" ? "__Host-fuji_admin" : "fuji_admin";
export const SESI_JAM = 12;
const enc = new TextEncoder();

export const secretOk = () => (process.env.ADMIN_SECRET ?? "").length >= 32;

async function sign(msg: string) {
  const k = await crypto.subtle.importKey("raw", enc.encode(process.env.ADMIN_SECRET ?? ""), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
  return Array.from(new Uint8Array(s), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function makeToken(sv: number) {
  const exp = Date.now() + SESI_JAM * 3600e3;
  return `${exp}.${sv}.${await sign(`${exp}.${sv}`)}`;
}

export async function verifyToken(token?: string): Promise<{ sv: number } | null> {
  if (!token || !secretOk()) return null;
  const [exp, sv, sig] = token.split(".");
  if (!exp || !sv || !sig || !/^\d+$/.test(exp) || !/^\d+$/.test(sv) || Number(exp) < Date.now()) return null;
  const good = await sign(`${exp}.${sv}`);
  let diff = good.length ^ sig.length;
  for (let i = 0; i < good.length; i++) diff |= good.charCodeAt(i) ^ (sig.charCodeAt(i) || 0);
  return diff === 0 ? { sv: Number(sv) } : null;
}
