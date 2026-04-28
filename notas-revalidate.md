# ¿Qué hace `next: { revalidate: 60 }`?

Es una opción **propia de Next.js** (no del `fetch` estándar) que le dice cómo cachear la respuesta.

## En palabras simples

> "Guardá el resultado de este fetch durante **60 segundos**. Si alguien vuelve a pedir la misma página dentro de ese tiempo, devolvele el resultado guardado. Pasados los 60 segundos, volvé a pedirle a la API datos frescos."

## ¿Por qué sirve?

Sin esa línea, podrían pasar dos cosas:

1. **Cacheo eterno**: Next.js cachea por defecto y nunca refresca → si la API cambia, vos seguís viendo lo viejo.
2. **Sin caché**: cada visita le pega a la API → más lento y consume más recursos.

`revalidate: 60` es el punto medio: **rápido** (la mayoría de las veces sirve de caché) pero **se actualiza solo** cada 60 segundos.

## Ejemplo del ciclo

| Tiempo | Acción | Qué pasa |
|---|---|---|
| `0s` | Usuario A entra a `/` | Next pide a la API y guarda la respuesta |
| `15s` | Usuario B entra a `/` | Next devuelve el cache (no llama a la API) |
| `45s` | Usuario C entra a `/` | Next devuelve el cache |
| `61s` | Usuario D entra a `/` | Cache vencido → Next pide de nuevo a la API y refresca |
| `70s` | Usuario E entra a `/` | Devuelve el cache nuevo |

## Esto se llama ISR

**ISR = Incremental Static Regeneration** ("regeneración estática incremental"). Es una característica famosa de Next.js: combina lo mejor de un sitio estático (rápido) con datos que se mantienen actualizados sin tener que hacer build de nuevo.

## Otras opciones que podrías usar

```js
// Siempre traer datos frescos (sin caché)
fetch(url, { cache: "no-store" });

// Cachear para siempre (hasta el próximo build)
fetch(url, { cache: "force-cache" });

// ISR cada N segundos (la que estamos usando)
fetch(url, { next: { revalidate: 60 } });
```

Para Rick & Morty, donde los datos casi nunca cambian, podrías usar `force-cache` tranquilamente. Usamos `revalidate: 60` porque es lo más realista para una app real.
