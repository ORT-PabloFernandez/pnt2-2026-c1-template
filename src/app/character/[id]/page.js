import Link from "next/link";

async function getCharacter(id) {
  const res = await fetch(`https://rickandmortyapi.com/api/character/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Personaje no encontrado");
  }

  return res.json();
}

// Metadata dinámica: el título del navegador es el nombre del personaje
export async function generateMetadata({ params }) {
  const { id } = await params;
  const character = await getCharacter(id);
  return { title: character.name };
}

export default async function CharacterDetailPage({ params }) {
  const { id } = await params;
  const character = await getCharacter(id);

  return (
    <section style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      <Link href="/" style={{ color: "#2b4bee" }}>← Volver al listado</Link>

      <article
        style={{
          marginTop: 16,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <img
          src={character.image}
          alt={character.name}
          style={{ width: 200, height: 200, borderRadius: "50%", objectFit: "cover" }}
        />
        <h2>{character.name}</h2>
        <p><strong>Estado:</strong> {character.status}</p>
        <p><strong>Especie:</strong> {character.species}</p>
        <p><strong>Género:</strong> {character.gender}</p>
        <p><strong>Origen:</strong> {character.origin?.name}</p>
        <p><strong>Ubicación:</strong> {character.location?.name}</p>
      </article>
    </section>
  );
}