import BottomBar from "@/components/BottomBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import PromoBanner from "@/components/PromoBanner";
import { getTampil } from "@/lib/data";
import { bisnisLd, situsLd } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { pengaturan: s, kategori } = await getTampil();
  return (
    <>
      <a href="#isi" className="lewati">Langsung ke isi halaman</a>
      <PromoBanner s={s} />
      <Header s={s} />
      <main id="isi">{children}</main>
      <Footer s={s} kategori={kategori} />
      <BottomBar s={s} />
      <JsonLd data={bisnisLd(s)} />
      <JsonLd data={situsLd()} />
    </>
  );
}
