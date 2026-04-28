# Solución del Punto 5

## Resumen de archivos

| Archivo | Qué hace |
|---|---|
| `src/app/components/Buscador.js` | **Buscador** (Client Component con `useState`) |
| `src/app/page.js` | **Paginación** + integra el Buscador |
| `src/app/loading.js` | **Estado cargando** |
| `src/app/error.js` | **Manejo de errores** |
| `src/app/character/[id]/page.js` | **Metadata dinámica** |

---

## 1) Buscador — `Buscador.js`

```jsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function Buscador({ personajes }) {
  const [texto, setTexto] = useState("");

  const filtrados = personajes.filter((p) =>
    p.name.toLowerCase().includes(texto.toLowerCase())
  );

  return (
    <>
      <input
        type="text"
        placeholder="Buscar personaje..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          marginBottom: 16,
          border: "1px solid #e2e8f0",
          borderRadius: 8,
        }}
      />

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {filtrados.map((c) => (
          <li
            key={c.id}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Link
              href={`/character/${c.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img src={c.image} alt={c.name} style={{ width: "100%", display: "block" }} />
              <div style={{ padding: 12 }}>
                <h3 style={{ margin: "0 0 4px" }}>{c.name}</h3>
                <small style={{ color: "#64748b" }}>
                  {c.species} · {c.status}
                </small>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
```

**Conceptos clave:**

- **`"use client"`** al principio: necesario para usar `useState` y eventos como `onChange`. Sin esto, sería Server Component y no puede tener interactividad.
- El componente recibe los personajes ya cargados desde `page.js` por **props** (`personajes`).
- `useState("")` guarda lo que el usuario escribe.
- `personajes.filter(...)` se ejecuta **en cada render**: cada vez que cambia `texto`, se vuelve a calcular `filtrados`.
- Importante: el filtro solo busca **dentro de la página actual** (los 20 personajes que trajo la API). Si querés buscar en los 800, habría que pedirle a la API con `?name=...`.

---

## 2) Paginación — `page.js`

```jsx
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
```

**Conceptos clave:**

- Next.js le pasa a la página un objeto **`searchParams`** con todo lo que viene en la URL después del `?`.
- En Next 15+/16, `searchParams` es **asíncrono**, por eso hay que hacer `await searchParams`.
- Se construye la URL de la API con `?page=${page}`.
- Los botones **Anterior / Siguiente** son simples `<Link>` que cambian la URL a `/?page=N`. Como Next re-ejecuta la página al cambiar la URL, vuelve a hacer fetch automáticamente.
- `data.info.pages` viene de la API y dice cuántas páginas hay en total (42).

---

## 3) Estado cargando — `loading.js`

```jsx
export default function Loading() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24, textAlign: "center" }}>
      <p style={{ fontSize: 18, color: "#64748b" }}>Cargando...</p>
    </div>
  );
}
```

**Conceptos clave:**

- Es una **convención de Next.js**: si en una carpeta hay un archivo llamado `loading.js`, Next lo muestra automáticamente mientras la página correspondiente está esperando datos del `fetch`.
- No hay que hacer nada para "activarlo": Next lo conecta solo.
- Como está en `src/app/loading.js`, aplica a toda la app.

---

## 4) Manejo de errores — `error.js`

```jsx
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
```

**Conceptos clave:**

- Igual que `loading.js`, es una **convención**: si tu page tira un `throw new Error(...)`, Next muestra este componente.
- **Tiene que ser Client Component** (`"use client"`), porque recibe la función `reset()` para reintentar.
- Recibe dos props automáticas:
  - `error`: el objeto del error (con `.message`).
  - `reset`: función que reintenta el render.

---

## 5) Metadata dinámica — `character/[id]/page.js`

```jsx
// Metadata dinámica: el título del navegador es el nombre del personaje
export async function generateMetadata({ params }) {
  const { id } = await params;
  const character = await getCharacter(id);
  return { title: character.name };
}
```

**Conceptos clave:**

- En el layout, `metadata` es estático (siempre el mismo título). Para que dependa de la URL, se exporta una función **`generateMetadata`**.
- Recibe los mismos `params` que la página.
- Lo que devuelve sobreescribe el `<title>` del navegador. Acá se ve el nombre del personaje en la pestaña.
- El `fetch` está cacheado por Next, así que no hace dos llamadas (una para metadata + otra para la página): comparte la misma respuesta.
