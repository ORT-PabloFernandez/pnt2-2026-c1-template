import Link from "next/link";
import Buscador from "./components/Buscador";

async function getCharacters(page) {
  const res = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("No se pudieron obtener los personajes");
  }

  return res.json();
}

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;

  const data = await getCharacters(page);
  const characters = data.results;
  const totalPages = data.info.pages;

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Personajes</h1>

      {/* Buscador + listado (componente cliente) */}
      <Buscador personajes={characters} />

      {/* Paginación */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
        {page > 1 && (
          <Link href={`/?page=${page - 1}`} style={{ color: "#2b4bee" }}>
            ← Anterior
          </Link>
        )}
        <span>Página {page} de {totalPages}</span>
        {page < totalPages && (
          <Link href={`/?page=${page + 1}`} style={{ color: "#2b4bee" }}>
            Siguiente →
          </Link>
        )}
      </div>
    </section>
  );
}
