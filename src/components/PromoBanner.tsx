import Link from "next/link";
import type { Pengaturan } from "@/lib/types";

export default function PromoBanner({ s }: { s: Pengaturan }) {
  if (!s.banner_aktif || !s.banner_teks) return null;
  const isi = <span>{s.banner_teks}</span>;
  const dalam = s.banner_link.startsWith("/");
  return (
    <div className="banner" role="region" aria-label="Promo">
      <div className="wrap">
        {!s.banner_link ? isi : dalam ? <Link href={s.banner_link}>{isi}</Link> : <a href={s.banner_link} target="_blank" rel="noopener noreferrer">{isi}</a>}
      </div>
    </div>
  );
}
