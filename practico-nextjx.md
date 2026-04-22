# Práctico: Mi primera app en Next.js

## Introducción

En este práctico vas a construir una pequeña aplicación web que lista y muestra el detalle de los **personajes de Rick and Morty**, la famosa serie animada creada por **Justin Roiland** y **Dan Harmon** (Adult Swim, 2013).

La serie sigue las aventuras de **Rick Sanchez**, un científico cínico y genial, y su nieto **Morty Smith**, un adolescente nervioso y de buen corazón, mientras viajan entre dimensiones, planetas y realidades alternativas. A su alrededor orbita el resto de la familia Smith —**Beth**, **Jerry** y **Summer**— y cientos de personajes secundarios: versiones alternativas de Rick, alienígenas, robots, monstruos y hasta pepinillos (sí, *Pickle Rick*).

Para el práctico nos vamos a apoyar en la [Rick and Morty API](https://rickandmortyapi.com/), un servicio público y gratuito que expone **más de 800 personajes** de la serie, con datos como nombre, especie, estado (vivo/muerto/desconocido), género, planeta de origen, ubicación actual y una imagen. Es ideal para practicar **listado + detalle** porque ofrece tanto un endpoint para traer todos los personajes como otro para traer uno por ID.

## Objetivos

Al finalizar este práctico vas a poder:

1. **Crear** una aplicación Next.js desde cero (App Router).
2. **Reutilizar** los componentes `HeaderNew` y `FooterNew` del proyecto de referencia (`next-init`).
3. **Consumir** una API pública y mostrar un **listado** de elementos.
4. **Implementar** una **página de detalle** con ruta dinámica.
5. **Entender** cómo Next.js hace *fetching* en Server Components.

---

## Stack y requisitos

- **Node.js** 20 o superior
- **pnpm** (recomendado) o npm/yarn
- Editor de código (VS Code, WebStorm, etc.)
- Conexión a internet (para consumir la API)

> Si no tenés `pnpm`, instalalo con: `npm install -g pnpm`

---

## API pública a utilizar

Vamos a usar la **Rick and Morty API**, que es gratuita y no requiere autenticación.

- **Listado (getAll)**: `GET https://rickandmortyapi.com/api/character`
- **Detalle (getById)**: `GET https://rickandmortyapi.com/api/character/:id`

Ejemplo de respuesta del listado (recortada):

```json
{
  "info": { "count": 826, "pages": 42, "next": "...", "prev": null },
  "results": [
    {
      "id": 1,
      "name": "Rick Sanchez",
      "status": "Alive",
      "species": "Human",
      "image": "https://rickandmortyapi.com/api/character/avatar/1.jpeg"
    }
  ]
}
```

---

## Punto 1 · Crear la aplicación desde cero

Abrí una terminal y ejecutá:

```bash
pnpm create next-app@latest mi-app
```

Cuando te pregunte, respondé:

- **TypeScript?** → *No* (usamos JavaScript)
- **ESLint?** → *Sí*
- **Tailwind CSS?** → *Sí*
- **`src/` directory?** → *Sí*
- **App Router?** → *Sí*
- **Turbopack?** → *Sí*
- **Import alias (`@/*`)?** → *Sí* (dejar el valor por defecto)

Luego entrá al proyecto y arrancá el servidor de desarrollo:

```bash
cd mi-app
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador y verificá que se vea la página inicial.

> **Entregable 1:** Captura de pantalla de la app corriendo en `localhost:3000`.

---

## Punto 2 · Reutilizar `HeaderNew` y `FooterNew`

En el proyecto `next-init` (el que te compartimos de referencia) existen los componentes:

- `src/components/HeaderNew.js` + `src/components/HeaderNew.module.css`
- `src/components/FooterNew.js` + `src/components/FooterNew.module.css`

### 2.1 Copiar los archivos

Copiá **los 4 archivos** a tu proyecto nuevo, manteniendo la misma ruta:

```
mi-app/
└── src/
    └── components/
        ├── HeaderNew.js
        ├── HeaderNew.module.css
        ├── FooterNew.js
        └── FooterNew.module.css
```

### 2.2 Montar los componentes en el layout global

Abrí `src/app/layout.js` y reemplazá su contenido por:

```jsx
import "./globals.css";
import HeaderNew from "./components/HeaderNew";
import FooterNew from "./components/FooterNew";

export const metadata = {
  title: "Rick & Morty App",
  description: "Listado y detalle de personajes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Íconos usados por HeaderNew/FooterNew */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <HeaderNew />
        <main style={{ flex: 1 }}>{children}</main>
        <FooterNew />
      </body>
    </html>
  );
}
```

> ⚠️ **Importante:** el `<link>` a Material Symbols **debe ir en `<head>`**, no como `@import` dentro de `globals.css`, porque los `@import` de CSS tienen que estar antes de cualquier otra regla y eso te dará un error de parseo.

### 2.3 Verificar

Recargá `localhost:3000`. Deberías ver:

- El **Header** arriba (logo “HubConnect”, navegación y avatar).
- El **Footer** abajo (copyright y enlaces).

> **Entregable 2:** Captura de pantalla mostrando Header + Footer renderizados.

---

## Punto 3 · Listado de personajes (`/`)

Vamos a reemplazar la home por un listado que consume la API.

### 3.1 Crear la página

Sobrescribí `src/app/page.js` con:

```jsx
import Link from "next/link";

async function getCharacters() {
  const res = await fetch("https://rickandmortyapi.com/api/character", {
    // Refrescar cada 60s en el server (opcional)
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("No se pudieron obtener los personajes");
  }

  return res.json();
}

export default async function HomePage() {
  const data = await getCharacters();
  const characters = data.results;

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Personajes</h1>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {characters.map((c) => (
          <li
            key={c.id}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Link href={`/character/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <img
                src={c.image}
                alt={c.name}
                style={{ width: "100%", display: "block" }}
              />
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
    </section>
  );
}
```

### 3.2 Conceptos clave

- `export default async function` → en el **App Router**, los componentes de página pueden ser **async** (Server Components). Eso permite hacer `await fetch(...)` directamente.
- `next: { revalidate: 60 }` → Next cachea el fetch en el servidor y lo vuelve a pedir cada 60 segundos (ISR).
- `<Link href={\`/character/${c.id}\`}>` → navegación del lado cliente hacia la página de detalle.

> **Entregable 3:** Captura del listado de personajes funcionando.

---

## Punto 4 · Página de detalle (`/character/[id]`)

### 4.1 Crear la ruta dinámica

Creá el archivo `src/app/character/[id]/page.js`:

```jsx
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
```

### 4.2 Conceptos clave

- `app/character/[id]/page.js` → las carpetas entre corchetes **definen rutas dinámicas**. El valor del segmento llega por `params`.
- En Next.js 15+/16, `params` es **asíncrono**, por eso hacés `const { id } = await params;`.
- El fetch se ejecuta **en el servidor**: el navegador nunca ve la URL ni la respuesta cruda.

> **Entregable 4:** Captura de la página de detalle de al menos un personaje.

---

## Punto 5 · Mejoras opcionales (para quien quiera ir más lejos)

Elegí **al menos una** de estas mejoras:

1. **Buscador** en la home: un `<input>` que filtre la lista por nombre. Pista: convertilo en *Client Component* con `"use client"` y `useState`.
2. **Paginación**: usar `?page=2` de la API y botones “Anterior / Siguiente”.
3. **Estado “cargando”**: crear un archivo `loading.js` en la carpeta de la página para mostrar un esqueleto mientras carga.
4. **Manejo de errores**: crear un archivo `error.js` que muestre un mensaje amigable si la API falla.
5. **Metadata dinámica**: exportar `generateMetadata` en la página de detalle para que el `<title>` del navegador sea el nombre del personaje.

---

## Estructura final esperada

```
mi-app/
├── public/
├── src/
│   ├── app/
│   │   ├── character/
│   │   │   └── [id]/
│   │   │       └── page.js
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   └── components/
│       ├── FooterNew.js
│       ├── FooterNew.module.css
│       ├── HeaderNew.js
│       └── HeaderNew.module.css
├── package.json
└── next.config.mjs
```

---
