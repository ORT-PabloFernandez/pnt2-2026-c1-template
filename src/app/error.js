"use client";

export default function Error({ error, reset }) {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24, textAlign: "center" }}>
      <h2 style={{ color: "#ef4444" }}>Ups, algo salió mal</h2>
      <p>{error.message}</p>
      <button
        onClick={() => reset()}
        style={{
          marginTop: 12,
          padding: "8px 16px",
          background: "#2b4bee",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Reintentar
      </button>
    </div>
  );
}
