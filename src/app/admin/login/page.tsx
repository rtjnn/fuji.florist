"use client";

import { useActionState } from "react";
import { login } from "../_actions/auth";

export default function Login() {
  const [pesan, aksi, proses] = useActionState(login, "");
  return (
    <main className="adm-login">
      <form action={aksi}>
        <h1>Masuk Admin</h1>
        <p className="bantu">Fuji Florist — khusus pengelola toko.</p>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" maxLength={200} />
        {pesan && <p role="alert" className="adm-notice err" style={{ marginTop: 14 }}>{pesan}</p>}
        <div className="adm-aksi">
          <button className="adm-tombol utama" style={{ width: "100%" }} disabled={proses}>{proses ? "Memeriksa..." : "Masuk"}</button>
        </div>
      </form>
    </main>
  );
}
