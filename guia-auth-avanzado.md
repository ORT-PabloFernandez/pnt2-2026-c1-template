# Guía paso a paso: Auth avanzado

Esta guía continúa donde terminó `guia-auth.md`. Ya tenés `/register` y `/login` funcionando con `fetch`. Ahora vamos a profesionalizar la app:

1. **Validaciones** del lado del cliente.
2. **Mostrar el usuario logueado** en el `HeaderNew`.
3. **Botón "Cerrar sesión"**.
4. **Proteger rutas** con un hook `useAuth`.
5. **Variables de entorno** (`.env.local`).

> Hacelos en orden: cada paso se apoya en el anterior.

---

## Paso 1 · Validaciones del lado del cliente

**Objetivo:** evitar mandar al backend datos obviamente inválidos (email mal escrito, contraseña corta, etc.).

### 1.1 Validación simple en `/register`

Abrí `src/app/register/page.js` y agregá esta función arriba del componente (afuera, después del `API_URL`):

```js
function validar({ nombre, email, password }) {
  if (nombre.trim().length < 2) {
    return "El nombre debe tener al menos 2 caracteres";
  }
  if (!email.includes("@") || !email.includes(".")) {
    return "El email no es válido";
  }
  if (password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres";
  }
  return null; // todo OK
}
```

### 1.2 Usarla dentro de `handleSubmit`

Antes del `setCargando(true)`:

```js
const errorValidacion = validar({ nombre, email, password });
if (errorValidacion) {
  setError(errorValidacion);
  return; // cortamos: no llamamos al backend
}
```

### 1.3 (Opcional) Lo mismo para `/login`

Podés agregar una validación más simple en `src/app/login/page.js`:

```js
if (!user.trim() || !password.trim()) {
  setError("Completá usuario y contraseña");
  return;
}
```

> **Tip:** los `<input required>` ya impiden enviar el form vacío, pero estas validaciones extra dan **mensajes más claros**.

---

## Paso 2 · Mostrar el usuario logueado en `HeaderNew`

**Objetivo:** que el header diga "Hola, Juan" si hay un usuario logueado, o muestre links a Login/Register si no.

### 2.1 Convertir `HeaderNew` a Client Component

Necesitamos `useEffect` y `useState` para leer el `localStorage`. Abrí `src/app/components/HeaderNew.jsx` y al principio del archivo agregá:

```js
"use client";
import { useEffect, useState } from "react";
```

### 2.2 Leer el token al montar

Adentro del componente `HeaderNew`, antes del `return`:

```js
const [usuario, setUsuario] = useState(null);

useEffect(() => {
  const token = localStorage.getItem("token");
  const nombre = localStorage.getItem("usuario");
  if (token && nombre) {
    setUsuario(nombre);
  }
}, []);
```

> **Importante:** `localStorage` solo existe en el navegador. Por eso lo leemos dentro de `useEffect` (que solo corre en el cliente), no directamente en el render.

### 2.3 Guardar el nombre en `/login`

En `src/app/login/page.js`, dentro del `try`, después de `localStorage.setItem("token", data.token)`:

```js
localStorage.setItem("usuario", data.user?.nombre || data.nombre || user);
```

> Ajustá según lo que devuelva tu API. Mirá la respuesta en DevTools → Network.

### 2.4 Mostrar el saludo en el JSX

Reemplazá el `<img>` del avatar por algo como esto (o agregalo al lado):

```jsx
{usuario ? (
  <span style={{ marginRight: 12 }}>Hola, {usuario}</span>
) : (
  <>
    <Link href="/login" style={{ marginRight: 8 }}>Ingresar</Link>
    <Link href="/register">Registrarme</Link>
  </>
)}
```

---

## Paso 3 · Botón de "Cerrar sesión"

**Objetivo:** poder desloguearse desde el header.

### 3.1 Función `cerrarSesion`

Dentro del componente `HeaderNew`, agregá:

```js
import { useRouter } from "next/navigation";

// dentro del componente:
const router = useRouter();

function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  setUsuario(null);
  router.push("/login");
}
```

### 3.2 Botón en el JSX

Cuando el usuario esté logueado, mostrá el botón:

```jsx
{usuario ? (
  <>
    <span style={{ marginRight: 12 }}>Hola, {usuario}</span>
    <button onClick={cerrarSesion}>Cerrar sesión</button>
  </>
) : (
  <>
    <Link href="/login">Ingresar</Link>
    <Link href="/register">Registrarme</Link>
  </>
)}
```

---

## Paso 4 · Proteger rutas con un hook `useAuth`

**Objetivo:** que algunas páginas (por ejemplo, `/character/[id]`) requieran estar logueado. Si no hay token, te redirige a `/login`.

### 4.1 Crear el hook

Creá el archivo `src/app/hooks/useAuth.js`:

```js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setVerificando(false);
    }
  }, [router]);

  return { verificando };
}
```

### 4.2 Usarlo en una página protegida

El problema es que las páginas con `fetch` (como `/character/[id]/page.js`) son **Server Components** y no pueden usar hooks. La solución es envolver el contenido en un Client Component.

**Opción simple:** convertir la página de detalle en Client Component y mover el `fetch` adentro con `useEffect`. Pero eso es bastante refactor.

**Opción recomendada (más limpia):** crear un Client Component "guardia":

Creá `src/app/components/GuardiaAuth.js`:

```js
"use client";

import { useAuth } from "../hooks/useAuth";

export default function GuardiaAuth({ children }) {
  const { verificando } = useAuth();

  if (verificando) {
    return <p style={{ textAlign: "center", padding: 24 }}>Verificando sesión...</p>;
  }

  return children;
}
```

Y en cualquier página protegida, envolvé el contenido:

```jsx
import GuardiaAuth from "@/app/components/GuardiaAuth";

export default async function CharacterDetailPage({ params }) {
  const { id } = await params;
  const character = await getCharacter(id);

  return (
    <GuardiaAuth>
      <section>
        {/* ...todo el contenido de la página... */}
      </section>
    </GuardiaAuth>
  );
}
```

### 4.3 Ejemplo: proteger la home (`/`)

La home (`src/app/page.js`) es un **Server Component** porque hace `await getCharacters()`. La buena noticia: un Server Component **puede importar y usar** un Client Component (como `GuardiaAuth`). Solo hay que envolver el contenido.

Agregá el import arriba:

```js
import GuardiaAuth from "./components/GuardiaAuth";
```

Y envolvé el `<section>` que retorna la página:

```jsx
return (
  <GuardiaAuth>
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Personajes</h1>

      <Buscador personajes={characters} />

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
        {/* ...paginación... */}
      </div>
    </section>
  </GuardiaAuth>
);
```

#### ¿Cómo funciona el flujo?

1. El usuario entra a `/`.
2. **El server igual hace el `fetch`** a Rick & Morty y arma el HTML del listado (esto pasa **antes** de que el navegador ejecute nada).
3. El HTML llega al navegador.
4. Se monta `GuardiaAuth` en el cliente y dispara `useAuth`.
5. `useAuth` mira `localStorage`:
   - Si **hay token** → muestra el `children` (el listado).
   - Si **no hay token** → redirige a `/login`.

### 4.4 Limitaciones de esta protección

Esto se llama **protección client-side**. Tiene dos problemas que conviene conocer:

1. **El fetch a la API se ejecuta igual**, aunque después redirijas. No estás evitando consumir la API: solo estás escondiendo la UI.
2. **El HTML viaja al navegador igual**. Un usuario avanzado podría ver los datos un instante (o desactivando JS).

Para protección **real** habría que usar:

- **Middleware de Next.js** (`middleware.js` en la raíz) que mira la cookie y redirige antes de renderizar la página.
- **Cookies httpOnly** en lugar de `localStorage` (las cookies sí viajan al server).

Para una app educativa, `GuardiaAuth` está perfecto: enseña los conceptos de hooks, redirects y estado de auth sin meterse con cookies + middleware.

---

## Paso 5 · Variables de entorno (`.env.local`)

**Objetivo:** sacar la URL de la API del código y ponerla en un archivo de configuración. Así, si cambia la URL en producción, no tenés que tocar el código.

### 5.1 Crear `.env.local`

En la **raíz del proyecto** (al lado de `package.json`), creá un archivo llamado `.env.local`:

```
NEXT_PUBLIC_API_URL=https://tp2backend-a5aqduchhdfrdffm.brazilsouth-01.azurewebsites.net
```

> ⚠️ El prefijo **`NEXT_PUBLIC_`** es **obligatorio** para que la variable esté disponible en el navegador. Sin ese prefijo, solo se puede leer en el server.

### 5.2 Usarla en el código

En `src/app/register/page.js` y `src/app/login/page.js`, reemplazá:

```js
const API_URL = "https://tp2backend-a5aqduchhdfrdffm.brazilsouth-01.azurewebsites.net";
```

por:

```js
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

### 5.3 Reiniciar el dev server

Las variables de entorno se leen **al arrancar**. Después de crear o modificar `.env.local`:

```bash
# Cortar con Ctrl+C y volver a arrancar
pnpm dev
```

### 5.4 Agregar `.env.local` al `.gitignore`

Verificá que `.env.local` esté en `.gitignore` (Next.js lo agrega por defecto al crear la app, pero conviene chequear). Esto evita subir credenciales al repositorio.

---

## Resumen final

Después de completar esta guía vas a tener:

- Formularios con **validaciones** antes del fetch.
- Header que **detecta si hay sesión** y saluda al usuario.
- **Botón de logout** que limpia el storage y redirige.
- Hook `useAuth` + componente `GuardiaAuth` para **proteger páginas**.
- URL de la API en **variable de entorno**.

## Próximos desafíos (si querés seguir)

- Persistir la sesión con **cookies** (más seguras que `localStorage`).
- Agregar **refresh tokens**.
- Hacer un **interceptor** que agregue automáticamente el token a todas las requests.
- Implementar el patrón de **Context** de React para compartir el usuario logueado entre todos los componentes sin leer `localStorage` en cada uno.
