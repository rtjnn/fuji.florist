"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

export function AdminNav({ item }: { item: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Menu admin">
      {item.map((x) => {
        const aktif = x.href === "/admin" ? path === "/admin" : path.startsWith(x.href);
        return <Link key={x.href} href={x.href} aria-current={aktif ? "page" : undefined}>{x.label}</Link>;
      })}
    </nav>
  );
}

// Tombol submit yang meminta konfirmasi dulu (untuk hapus).
export function TombolKonfirmasi({ pesan, children, ...rest }: { pesan: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} onClick={(e) => { if (!confirm(pesan)) e.preventDefault(); }}>
      {children}
    </button>
  );
}

export function PilihSemua({ nama }: { nama: string }) {
  return (
    <label className="cek" style={{ margin: 0 }}>
      <input type="checkbox" onChange={(e) => document.querySelectorAll<HTMLInputElement>(`input[name="${nama}"]`).forEach((c) => (c.checked = e.target.checked))} />
      Pilih semua
    </label>
  );
}

// Foto dikecilkan di browser (maks. 1400 px) sebelum dikirim, jadi foto HP besar pun aman.
export function FotoInput({ lama, wajib }: { lama?: string; wajib?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [pratinjau, setPratinjau] = useState(lama ?? "");
  const [info, setInfo] = useState("");

  async function pilih(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPratinjau(URL.createObjectURL(f));
    try {
      const bmp = await createImageBitmap(f, { imageOrientation: "from-image" });
      const skala = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas");
      c.width = Math.round(bmp.width * skala);
      c.height = Math.round(bmp.height * skala);
      c.getContext("2d")?.drawImage(bmp, 0, 0, c.width, c.height);
      const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.85));
      if (!blob || !ref.current) return;
      const baru = new File([blob], "foto.jpg", { type: "image/jpeg" });
      const dt = new DataTransfer();
      dt.items.add(baru);
      ref.current.files = dt.files;
      setPratinjau(URL.createObjectURL(baru));
      setInfo(`Foto siap diunggah (${Math.round(baru.size / 1024)} KB).`);
    } catch {
      /* file asli tetap dipakai; server yang memeriksa */
    }
  }

  return (
    <div>
      {pratinjau && /* eslint-disable-next-line @next/next/no-img-element */ <img src={pratinjau} alt="Pratinjau foto" className="adm-foto-pratinjau" />}
      <input ref={ref} id="gambar" name="gambar" type="file" accept="image/jpeg,image/png,image/webp" required={wajib} onChange={pilih} />
      {info && <small>{info}</small>}
    </div>
  );
}
