// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://www.aisaargentina.com.ar",
  output: "static",
  integrations: [
    sitemap({
      filter: (page) =>
        !page.endsWith("/asociate/") &&
        !page.endsWith("/buscar-profesional/") &&
        !page.endsWith("/profesionales/formacion-y-cursos/"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
