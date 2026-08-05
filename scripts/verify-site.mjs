import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const dist = new URL("../dist/", import.meta.url);
const rootPath = fileURLToPath(root);

const expectedRoutes = [
  "index.html",
  "familias-y-escuelas/index.html",
  "acerca-de/index.html",
  "profesionales/index.html",
  "buscar-profesional/index.html",
  "profesionales/certificacion/index.html",
  "profesionales/formacion-y-cursos/index.html",
  "asociate/index.html",
  "contacto/index.html",
  "404.html",
];

const failures = [];
const pages = new Map();
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const route of expectedRoutes) {
  try {
    const fileUrl = new URL(route, dist);
    await stat(fileUrl);
    pages.set(route, await readFile(fileUrl, "utf8"));
  } catch {
    failures.push(`Falta la ruta generada: ${route}`);
  }
}

const routeToFile = (href) => {
  const pathname = href.split("#")[0].split("?")[0];
  if (pathname === "/") return "index.html";
  if (pathname.endsWith(".html")) return pathname.slice(1);
  return `${pathname.replace(/^\/|\/$/g, "")}/index.html`;
};

for (const [route, html] of pages) {
  if (route === "asociate/index.html") {
    if (!html.includes("/profesionales/#solicitud")) {
      failures.push("La ruta anterior de asociación no redirige al formulario de profesionales.");
    }
    continue;
  }

  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) failures.push(`${route} tiene ${h1Count} elementos h1.`);

  const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const imageSources = new Map();
  for (const tag of imageTags) {
    // HTML permits an empty attribute to serialize as bare `alt`; Astro uses
    // that valid form for decorative images passed as alt="".
    if (!/\s+alt(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?(?=\s|>)/i.test(tag)) {
      failures.push(`${route} contiene una imagen sin alt.`);
    }
    if (!/\bwidth="\d+"/i.test(tag) || !/\bheight="\d+"/i.test(tag)) {
      failures.push(`${route} contiene una imagen sin dimensiones.`);
    }

    const source = tag.match(/\bsrc="([^"]+)"/i)?.[1];
    if (source) {
      imageSources.set(source, (imageSources.get(source) ?? 0) + 1);
    }
  }
  for (const [source, count] of imageSources) {
    if (count > 1) {
      failures.push(`${route} repite una imagen ${count} veces: ${source}`);
    }
  }

  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((match) => match[1]);
  for (const href of hrefs) {
    if (
      href.startsWith("mailto:") ||
      href.startsWith("https://") ||
      href.startsWith("http://") ||
      href.startsWith("/_astro/")
    ) {
      continue;
    }
    const [hrefPath, hash] = href.split("#", 2);
    const targetRoute = hrefPath ? routeToFile(hrefPath) : route;
    if (hash) {
      const targetHtml = pages.get(targetRoute);
      if (targetHtml && !new RegExp(`\\bid="${escapeRegExp(hash)}"`).test(targetHtml)) {
        failures.push(`${route} apunta a un ancla inexistente: ${href}`);
      }
    }
    if (href.startsWith("/")) {
      if (!expectedRoutes.includes(targetRoute)) failures.push(`${route} enlaza a una ruta inexistente: ${href}`);
    }
  }
}

const contactHtml = pages.get("contacto/index.html") ?? "";
if (!contactHtml.includes("mailto:integracion.sensorialargentina@gmail.com")) {
  failures.push("La página de contacto no contiene el correo oficial.");
}

const wrangler = await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8");
for (const forbidden of ["d1_databases", "kv_namespaces", "r2_buckets", "\"main\""]) {
  if (wrangler.includes(forbidden)) failures.push(`wrangler.jsonc contiene una declaración no permitida: ${forbidden}`);
}

await stat(join(rootPath, "public", "robots.txt"));
await stat(join(rootPath, "public", "og.png"));
for (const cursorAsset of [
  "cursor-default.svg",
  "cursor-pointer.svg",
  "cursor-grab.svg",
  "cursor-grabbing-70.svg",
]) {
  await stat(join(rootPath, "public", "cursors", cursorAsset));
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Verificación completa: ${expectedRoutes.length} rutas, enlaces internos, imágenes y configuración estática.`);
}
