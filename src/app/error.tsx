"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="wrap" style={{ minHeight: "70vh", display: "grid", alignContent: "center", gap: 16, padding: "48px 0", textAlign: "center", justifyItems: "center" }}>
      <h1>Maaf, ada gangguan</h1>
      <p style={{ maxWidth: "32rem", color: "var(--muted)" }}>Halaman belum bisa ditampilkan. Silakan coba lagi sebentar lagi.</p>
      <button type="button" className="btn btn-primer" onClick={() => reset()}>Coba Lagi</button>
    </main>
  );
}
