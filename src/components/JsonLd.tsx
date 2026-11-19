// Data terstruktur untuk Google. Tanda "<" di-escape agar tidak bisa menutup tag <script>.
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
