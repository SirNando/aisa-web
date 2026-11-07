// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // scripts/build.mjs sets PUBLIC_SITE_URL from wrangler.jsonc per environment.
  site: process.env.PUBLIC_SITE_URL ?? "https://www.aisaargentina.com.ar",
  output: "static",
  integrations: [
    sitemap({
      filter: (page) =>
        !page.endsWith("/asociate/") &&
        !page.endsWith("/gracias-por-asociarte/") &&
        !page.endsWith("/verificar-certificado/") &&
        !page.endsWith("/buscar-profesional/") &&
        !page.endsWith("/profesionales/formacion-y-cursos/"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
