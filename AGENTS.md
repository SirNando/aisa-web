# AISA Argentina repository guide

These instructions apply to the entire repository.

Before changing UI, layout, responsive behavior, colors, reusable components, or motion, read [the design-system extension guide](docs/design-system-extension-guide.md). It is the detailed source of truth for extending the system. This file is the shorter operating contract for building with it.

## Project contract

- This is a static Astro site using typed `.astro` components, Tailwind CSS v4 tokens, shared CSS, and GSAP.
- Public content is Spanish for Argentina (`es-AR`). Keep wording neutral and preserve user-approved copy unless the task explicitly changes it.
- Do not add eyebrow or kicker labels above headings.
- Keep typography restrained. Use the shared type scale instead of adding oversized page-local headings.
- The primary AISA action color is exactly `#4CA751`. Use `--color-on-primary` for readable content on that fill. Darker greens are support/text colors, not default CTA or section fills.
- Prefer light surfaces. Do not reintroduce a nearly black footer or stacked-story section.
- Do not add demo, MVP, placeholder, or warning notices to public pages unless explicitly requested.
- Do not add page-local animation systems, duplicate component stylesheets, or a second set of design tokens.
- Never run a live deployment unless the user explicitly requests it. `npm run deploy` is a live Cloudflare operation.

## Start every change safely

1. Inspect `git status --short --branch` and preserve unrelated work.
2. Find every consumer of a shared component, class, token, or `data-*` hook before changing its contract.
3. Reuse an existing primitive or composed pattern before creating a new one.
4. Keep component props typed, defaults explicit, and variants expressed as narrow unions.
5. Test direct loads and Astro client-side navigation when a change touches shared navigation or motion.

## Build with the design system

Use this order of preference:

1. Existing token in `src/styles/tokens.css`.
2. Existing layout or utility class in `src/styles/global.css`.
3. Existing primitive in `src/components/design-system/`.
4. Existing composed AISA component in `src/components/`.
5. A typed extension of an existing component.
6. A new reusable component only when the pattern has a clear current or near-term second use.

The homepage at `src/pages/index.astro` is the fullest composition example.

### Repository map

- `src/layouts/BaseLayout.astro`: metadata, `ClientRouter`, persistent header, footer, global CSS, and shared motion entrypoint.
- `src/styles/tokens.css`: paired Tailwind `@theme` tokens and raw `:root` CSS variables.
- `src/styles/global.css`: layout primitives, component modifiers, responsive rules, and reduced-motion fallbacks.
- `src/scripts/siteMotion.ts`: shared GSAP lifecycle, navigation state, reveals, parallax, tilt, rails, stack scaling, and cleanup.
- `src/components/design-system/`: content-neutral primitives such as `ArrowLink`, `SectionHeading`, `CardGrid`, `CardRail`, and `StackedCards`.
- `src/components/`: reusable AISA compositions such as `PageHero`, `JourneyCard`, and `Callout`, plus feature components.
- `src/pages/`: route composition and page-owned content.
- `src/lib/` and `src/data/`: reusable logic and structured data.
- `tests/`: Vitest coverage for pure logic.
- `scripts/verify-site.mjs`: generated-route, link, image, and static-configuration checks.

### Preferred page composition

New pages should normally use `BaseLayout`, one `PageHero`, shared section spacing, and existing section/card components:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import PageHero from "../components/PageHero.astro";
import JourneyCard from "../components/JourneyCard.astro";
import CardGrid from "../components/design-system/CardGrid.astro";
import SectionHeading from "../components/design-system/SectionHeading.astro";
import heroImage from "../assets/hero-terapia.jpg";
import spaceImage from "../assets/espacio-terapeutico.jpg";
---

<BaseLayout title="Título" description="Descripción específica de la página.">
  <PageHero
    title="Título principal"
    lead="Introducción clara y breve."
    orbitImages={[heroImage, spaceImage]}
    nextTone="white"
  />

  <section class="section-space bg-white">
    <div class="site-container">
      <SectionHeading title="Título de sección" body="Texto de apoyo." />
      <CardGrid>
        <JourneyCard
          title="Primer recorrido"
          body="Información útil para comenzar."
          href="/familias-y-escuelas/"
          linkText="Empezar"
          tone="leaf"
        />
        <JourneyCard
          title="Segundo recorrido"
          body="Una alternativa para otra necesidad."
          href="/profesionales/"
          linkText="Explorar"
          tone="white"
        />
        <JourneyCard
          title="Tercer recorrido"
          body="Un próximo paso claramente identificado."
          href="/acerca-de/"
          linkText="Continuar"
          tone="sky"
        />
      </CardGrid>
    </div>
  </section>
</BaseLayout>
```

`PageHero.nextTone` must match the immediately following surface so the curved hero boundary is seamless.

## Shared interaction rules

- Treat `data-*` attributes consumed by `siteMotion.ts` as public component API.
- Add shared motion to `siteMotion.ts`, initialize it through the existing `astro:page-load` lifecycle, and register event cleanup through the existing helper.
- Preserve `prefers-reduced-motion`, pointer, and viewport guards.
- Keep layout positioning separate from GSAP transforms. Hero variants use positional CSS; tilt uses an inner surface; outer cards own hover lift.
- Never use opacity, grayscale, or saturation changes to indicate the outgoing card in the stacked story.
- Leave sticky-stack ancestors at `overflow: visible` by default. When paint containment is required, use `overflow: clip`; never use `hidden` or `auto` on those ancestors.
- The stacked story's desktop tail is a generated grid row. Do not convert it back to container padding: sticky elements cannot use that padding as part of their holding boundary.
- Fully clickable cards use one native anchor with `stretched-card-link`. Do not add nested anchors, article-level click handlers, `role="link"`, or duplicate tab stops.
- The header is persistent across Astro transitions. Preserve `transition:persist="site-header"` and update the navigation-state mappings when adding routes.

## Route and content contracts

- Keep `/asociate/` as legacy compatibility redirecting to `/profesionales/#solicitud`.
- Reuse `MembershipForm.astro`; do not duplicate the association form.
- Preserve IDs used by navigation and CTA destinations.
- Route additions require updating `expectedRoutes` in `scripts/verify-site.mjs`.
- Review the sitemap filter in `astro.config.mjs` when adding or changing public routes.
- Do not treat a redirect as automatic sitemap exclusion; inspect the generated sitemap.

## Required validation

Run the complete gate after site changes:

```sh
npm run check
npm test
npm run build
npm run verify:site
git diff --check
```

`verify:site` reads `dist`, so it must follow a current build.

Additionally:

- Route changes: inspect generated HTML, anchors, and sitemap output.
- Interaction changes: test keyboard focus, reduced motion, touch/mobile, desktop, direct load, and Astro navigation.
- Responsive visual changes: check at least one narrow mobile viewport and one desktop viewport, including horizontal overflow.
- Shared component changes: verify every consumer, not just the page that prompted the change.
- Cloudflare configuration changes: use `npm run cf:dry-run`; do not deploy without explicit authorization.

In the handoff, report changed files, validation evidence, and any visual verification that could not be completed.
