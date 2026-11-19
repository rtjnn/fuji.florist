"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Ikon from "./Ikon";

export default function MobileMenu({ item, wa, tel }: { item: { href: string; label: string }[]; wa: string; tel: string }) {
  const [buka, setBuka] = useState(false);
  const path = usePathname();
  useEffect(() => setBuka(false), [path]);
  useEffect(() => {
    if (!buka) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setBuka(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [buka]);

  return (
    <div className="menu-seluler">
      <button type="button" className="btn btn-ghost btn-menu" aria-expanded={buka} aria-controls="panel-menu" onClick={() => setBuka(!buka)}>
        <Ikon n={buka ? "tutup" : "menu"} />
        {buka ? "Tutup" : "Menu"}
      </button>
      {buka && (
        <nav id="panel-menu" className="menu-panel" aria-label="Menu utama">
          {item.map((x) => (
            <Link key={x.href} href={x.href} onClick={() => setBuka(false)}>
              {x.label}
              <Ikon n="panah" size={20} />
            </Link>
          ))}
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-blok">
            <Ikon n="wa" size={22} />
            Chat WhatsApp
          </a>
          <a href={tel} className="btn btn-ghost btn-blok">
            <Ikon n="telepon" size={22} />
            Telepon Kami
          </a>
        </nav>
      )}
    </div>
  );
}
