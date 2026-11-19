export default function Notice({ ok, err }: { ok?: string; err?: string }) {
  if (err) return <p role="alert" className="adm-notice err">{err.slice(0, 300)}</p>;
  if (ok) return <p role="status" className="adm-notice ok">{ok.slice(0, 300)}</p>;
  return null;
}
