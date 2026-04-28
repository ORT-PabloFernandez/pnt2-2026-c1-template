# Guía paso a paso: Register y Login

En esta guía vas a completar las páginas `/register` y `/login` para que se conecten a la API de usuarios usando `fetch`.

## API

- **Base URL:** `https://tp2backend-a5aqduchhdfrdffm.brazilsouth-01.azurewebsites.net`
- **Registro:** `POST /api/users/register` → body: `{ nombre, email, password }`
- **Login:** `POST /api/users/login` → body: `{ user, password }`

---

## Estado inicial

Las páginas ya están creadas con la UI lista:

- `src/app/register/page.js`
- `src/app/login/page.js`

Ambas tienen:

- `useState` para cada campo del formulario.
- `useState` para `cargando` y `error`.
- Una función `handleSubmit` con un `TODO` donde hay que implementar el `fetch`.

**Tu trabajo es completar esa función `handleSubmit` en las dos páginas.**

---

## Paso 1 · Definir la URL base como constante

En la parte de arriba de cada archivo (después de los `import`), agregá:

```js
const API_URL = "https://tp2backend-a5aqduchhdfrdffm.brazilsouth-01.azurewebsites.net";
```

> **Tip:** más adelante podés moverla a una variable de entorno (`.env.local`), pero por ahora alcanza con una constante.

---

## Paso 2 · Entender el flujo del `handleSubmit`

Cuando el usuario aprieta "Registrarme" o "Ingresar", la función `handleSubmit` se dispara. Lo que tenemos que hacer adentro es:

1. Avisar que estamos cargando (`setCargando(true)`) y limpiar errores previos (`setError("")`).
2. Hacer el `fetch` a la API con los datos del formulario.
3. Revisar si la respuesta fue exitosa o no.
4. Según el resultado, actualizar los estados (`ok`, `error`) o redireccionar.
5. Al final, `setCargando(false)`.

Siempre envolver todo en `try / catch / finally` para manejar errores de red.

---

## Paso 3 · Implementar el `fetch` en `/register`

Abrí `src/app/register/page.js` y reemplazá el cuerpo de `handleSubmit` por:

```js
async function handleSubmit(e) {
  e.preventDefault();

  setCargando(true);
  setError("");
  setOk(false);

  try {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password }),
    });

    if (!res.ok) {
      // La API devolvió un error (400, 500, etc.)
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "No se pudo registrar el usuario");
    }

    // Todo salió bien
    setOk(true);
    setNombre("");
    setEmail("");
    setPassword("");
  } catch (err) {
    setError(err.message);
  } finally {
    setCargando(false);
  }
}
```

### Explicación línea por línea

- **`method: "POST"`** → el endpoint de registro espera POST.
- **`headers: { "Content-Type": "application/json" }`** → le avisamos al server que le mandamos JSON.
- **`body: JSON.stringify(...)`** → convertimos el objeto JS a un string JSON.
- **`res.ok`** → `true` si el status HTTP es 2xx. Si no, lanzamos un error.
- **`res.json()`** → parsea el cuerpo de la respuesta como JSON.
- **`try / catch / finally`** → `finally` siempre se ejecuta, así siempre apagamos el `cargando`.

---

## Paso 4 · Implementar el `fetch` en `/login`

Abrí `src/app/login/page.js` y reemplazá el cuerpo de `handleSubmit` por:

```js
async function handleSubmit(e) {
  e.preventDefault();

  setCargando(true);
  setError("");

  try {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Usuario o contraseña incorrectos");
    }

    const data = await res.json();
    console.log("Login OK:", data);

    // TODO (Paso 5): guardar el token en localStorage y redireccionar
  } catch (err) {
    setError(err.message);
  } finally {
    setCargando(false);
  }
}
```

---

## Paso 5 · Guardar el token y redireccionar

Si la API devuelve un **token** al hacer login (algo como `{ token: "..." }`), podemos guardarlo en el navegador para recordar que el usuario está logueado.

Al principio del archivo, agregá el import:

```js
import { useRouter } from "next/navigation";
```

Dentro del componente:

```js
const router = useRouter();
```

Y dentro del `try`, después de obtener `data`:

```js
localStorage.setItem("token", data.token);
router.push("/"); // redirecciona al home
```

> **Nota:** `localStorage` solo existe en el navegador. Como `/login` tiene `"use client"`, no hay problema.

---

## Paso 6 · Probar todo

1. Arrancá el server: `pnpm dev`.
2. Entrá a `http://localhost:3000/register`, llená el formulario y probá crear una cuenta.
3. Entrá a `http://localhost:3000/login`, ingresá con ese usuario.
4. Abrí las **DevTools** (F12):
   - En la pestaña **Network** podés ver la request al backend.
   - En la pestaña **Application → Local Storage** podés ver el token guardado.

---

## Pasos opcionales (para más adelante)

- **Validaciones del lado del cliente** antes de hacer el fetch (email con formato válido, password de mínimo 6 caracteres, etc.).
- **Mostrar el usuario logueado** en `HeaderNew` leyendo el token del `localStorage`.
- **Botón de "Cerrar sesión"** que haga `localStorage.removeItem("token")` y redirija a `/login`.
- **Proteger rutas**: crear un hook `useAuth` que, si no hay token, redirija al login.
- **Mover `API_URL` a `.env.local`** como `NEXT_PUBLIC_API_URL` para no hardcodearla.
