import { rupiah } from "@/lib/config";
import { hargaInfo } from "@/lib/price";
import type { Produk } from "@/lib/types";

export default function Harga({ p, besar = false }: { p: Produk; besar?: boolean }) {
  const h = hargaInfo(p);
  const kelas = besar ? "harga harga-besar" : "harga";
  if (p.harga <= 0) return <p className={`${kelas} harga-tanya`}>Tanya harga via WhatsApp</p>;
  if (h.status === "aktif")
    return (
      <p className={kelas}>
        <span className="harga-now">{rupiah(h.final)}</span>{" "}
        <s className="harga-old">
          <span className="sr">Harga asli </span>
          {rupiah(h.asli)}
        </s>
      </p>
    );
  return (
    <p className={kelas}>
      <span className="harga-now">{rupiah(p.harga)}</span>
    </p>
  );
}
