import Link from "next/link";
import { NAMA } from "@/lib/config";
import { telHref, waLink } from "@/lib/pengaturan";
import type { Pengaturan } from "@/lib/types";
import Ikon from "./Ikon";
import MobileMenu from "./MobileMenu";

const MENU = [
  { href: "/produk", label: "Semua Produk" },
  { href: "/#kategori", label: "Kategori" },
  { href: "/promo", label: "Promo" },
  { href: "/#cara-pesan", label: "Cara Pesan" },
  { href: "/#kontak", label: "Kontak" },
];

export default function Header({ s }: { s: Pengaturan }) {
  return (
    <header className="header">
      <div className="wrap header-isi">
        <Link href="/" className="logo" aria-label={`${NAMA} - Beranda`}>
          <span className="logo-ikon">
            <Ikon n="bunga" size={26} />
          </span>
          <span>
            {NAMA}
            <small>Toko Bunga Bandung</small>
          </span>
        </Link>
        <nav className="nav-desktop" aria-label="Menu utama">
          {MENU.map((x) => (
            <Link key={x.href} href={x.href}>
              {x.label}
            </Link>
          ))}
        </nav>
        <a href={waLink(s)} target="_blank" rel="noopener noreferrer" className="btn btn-wa header-wa">
          <Ikon n="wa" size={22} />
          Chat WhatsApp
        </a>
        <MobileMenu item={MENU} wa={waLink(s)} tel={telHref(s)} />
      </div>
    </header>
  );
}
