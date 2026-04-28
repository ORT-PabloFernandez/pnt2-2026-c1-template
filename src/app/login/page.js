"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  // Estados para manejar el resultado del fetch
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    // TODO implementar el fetch a /api/users/login
    console.log({ user, password });
  }

  return (
    <section style={estilos.section}>
      <h1 style={{ marginBottom: 16 }}>Iniciar sesión</h1>

      <form onSubmit={handleSubmit} style={estilos.form}>
        <label style={estilos.label}>
          Usuario
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
            style={estilos.input}
          />
        </label>

        <label style={estilos.label}>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={estilos.input}
          />
        </label>

        <button type="submit" disabled={cargando} style={estilos.boton}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

        {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      </form>

      <p style={{ marginTop: 16, textAlign: "center" }}>
        ¿No tenés cuenta?{" "}
        <Link href="/register" style={{ color: "#2b4bee" }}>
          Registrarme
        </Link>
      </p>
    </section>
  );
}

const estilos = {
  section: {
    maxWidth: 420,
    margin: "0 auto",
    padding: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 24,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 14,
    color: "#334155",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    fontSize: 16,
  },
  boton: {
    marginTop: 8,
    padding: "10px 16px",
    background: "#2b4bee",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer",
  },
};
