import { telHref, waLink } from "@/lib/pengaturan";
import type { Pengaturan } from "@/lib/types";
import Ikon from "./Ikon";

// Tombol tetap di bawah layar HP: pesan dan telepon selalu satu sentuhan.
export default function BottomBar({ s }: { s: Pengaturan }) {
  return (
    <div className="bar-bawah">
      <a href={waLink(s)} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
        <Ikon n="wa" size={22} />
        Chat WhatsApp
      </a>
      <a href={telHref(s)} className="btn btn-ghost" aria-label="Telepon Fuji Florist">
        <Ikon n="telepon" size={22} />
        Telepon
      </a>
    </div>
  );
}
