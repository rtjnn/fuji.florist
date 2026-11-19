import Link from "next/link";
import { AdminNav } from "@/components/AdminKlien";
import { requireAdmin } from "@/lib/admin";
import { logout } from "../_actions/auth";

const MENU = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/produk", label: "Produk" },
  { href: "/admin/diskon", label: "Diskon" },
  { href: "/admin/kategori", label: "Kategori" },
  { href: "/admin/testimoni", label: "Testimoni" },
  { href: "/admin/pengaturan", label: "Pengaturan" },
  { href: "/admin/keamanan", label: "Keamanan" },
  { href: "/admin/log", label: "Riwayat" },
];

export default async function Panel({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <header className="adm-top">
        <div className="adm-top-isi">
          <Link href="/admin" className="adm-logo">Admin Fuji Florist</Link>
          <Link href="/" target="_blank" className="adm-tombol kecil">Lihat situs</Link>
          <form action={logout}><button className="adm-tombol kecil">Keluar</button></form>
          <AdminNav item={MENU} />
        </div>
      </header>
      <div className="adm-main">{children}</div>
    </>
  );
}
