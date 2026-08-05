# AISA design-system extension guide

This guide explains how to build new pages and patterns with the current AISA system, then how to extend or modify it without creating parallel styles or motion code.

Read the root [`AGENTS.md`](../AGENTS.md) first for repository-wide product, safety, route, and validation rules.

## 1. Source-of-truth order

When implementing a design, work from the most shared layer to the most specific:

1. Foundation token.
2. Shared layout or utility class.
3. Existing primitive.
4. Existing composed component.
5. Typed component variant.
6. New reusable component.
7. Page-owned markup only when the pattern is genuinely unique.

Search before adding:

```sh
rg "ComponentName|class-name|data-hook|token-name" src
```

If two pages need the same structure or behavior, it should not be implemented twice.

## 2. Foundations

### Tokens

`src/styles/tokens.css` intentionally exposes two parallel token layers:

| Layer | Purpose | Example |
| --- | --- | --- |
| `@theme` | Tailwind v4 utilities | `bg-aisa-sand`, `text-aisa-ink`, `font-aisa-heading` |
| `:root` | Shared raw CSS | `var(--color-sand)`, `var(--font-heading)`, `var(--radius-card)` |

When changing or adding a shared token, update both value-equivalent representations while preserving their deliberately different layer-specific names. For example, `--color-aisa-on-primary` maps to `--color-on-primary`, `--spacing-aisa-section` maps to `--section-space`, and `--font-aisa-heading` maps to `--font-heading`. Do not hard-code the same color, radius, shadow, or type size in several component rules.

Core visual contract:

- Primary action fill: `#4CA751` / `--color-aisa-green`.
- Foreground on primary: `--color-on-primary`.
- Heading font: Newsreader via `--font-heading`.
- Body font: DM Sans via `--font-body`.
- Primary light surfaces: mist, sand, leaf wash, sky wash, and white.
- Decorative play accents: play blue, coral, sun, and sun wash. These colors support illustrations and narrative surfaces; they do not replace AISA green for primary actions.
- Shared corner and elevation: `--radius-card`, `--shadow-card`, and `--shadow-raised`.
- Shared vertical rhythm: `--section-space` and `.section-space`.

Use darker greens for readable text and support states. Do not substitute them for the default primary CTA fill.

### Layout primitives

The main layout classes live near the top of `src/styles/global.css`:

- `.site-container`: centered page-width container.
- `.reading-container`: constrained long-form measure.
- `.section-space`: shared vertical section padding.
- `.surface-card`: neutral elevated surface.
- `.organic-panel`: organic decoration for page-owned panels that are not elevated cards.
- `.button-primary`, `.button-secondary`, `.button-quiet`: canonical controls.
- `.arrow-link`: canonical inline arrow action.

Prefer these classes over page-local width, spacing, button, or elevation rules.

The centralized responsive breakpoints are:

- Narrow/mobile overrides below `48rem`.
- Two-column/tablet behavior from `40rem`.
- Full desktop layout and stack motion from `64rem`.

Add responsive behavior beside the existing centralized media-query blocks unless a component is truly self-contained.

## 3. Component catalog

### Shell and page hero

| Component | Use it for | Important contract |
| --- | --- | --- |
| `src/layouts/BaseLayout.astro` | Every non-redirect public page | Owns metadata, global CSS, shared motion, persistent header, site footer, and Astro transitions. |
| `src/components/PageHero.astro` | The single page hero and `h1` | Accepts CTA pairs, orbit images, layout modes, and `nextTone`. Five visual arrangements are selected per page entry. |

`PageHero` props include:

- Required: `title`, `lead`.
- Optional paired CTAs: `primaryHref`/`primaryLabel` and `secondaryHref`/`secondaryLabel`.
- Media: `orbitImages`, `imageAlt`.
- Playful media: `illustrations`, an optional array of up to three typed object decorations. The first two occupy mobile-visible hero slots; the third is a desktop accent.
- Modes: `compact`, `fullHeight`, `landing`. `fullHeight` and `landing` currently share the same full-height visual class; `landing` additionally emits the reserved `data-landing-hero` hook.
- Boundary: `nextTone="white|mist|sand|leaf|sky"`.

Import hero media through `astro:assets`. The first orbit image can carry meaningful `imageAlt`; repeated decorative instances remain empty-alt. Position the five hero variants with top/right/bottom/left and size properties, never with `transform`, because GSAP owns transform-based reveal, drift, idle motion, and parallax.

### Headings and actions

| Component | Use it for | Important contract |
| --- | --- | --- |
| `design-system/SectionHeading.astro` | Standard section heading and optional supporting copy | Supports left/center alignment and `h2`/`h3`. It already has reveal motion. |
| `design-system/ArrowLink.astro` | Text action with circular arrow | Use `external` for a new tab and its safe `rel`. |
| `src/components/Callout.astro` | Prominent CTA band | Tones: `sky`, `leaf`, `sand`, `green`, `dark`. Prefer light or brand-green tones. |

Do not add eyebrow text to `SectionHeading`, `PageHero`, cards, or callouts.

The global cursor layer in `src/styles/global.css` uses the supplied cursor
assets only for fine-pointer hover devices: the default cursor is global, the
pointer cursor covers links, buttons, and clickable cards, and the grab cursor
covers the horizontally scrollable resource rail and the draggable directory
map; active drag states use `cursor-grabbing-70.svg`. Keep touch and
coarse-pointer behavior native, and extend the shared selector rather than
adding page-local cursors.

### Organic shapes

| Component or class | Use it for | Important contract |
| --- | --- | --- |
| `design-system/OrganicShapes.astro` | Multi-shape decorative clusters inside composed components | Variants: `cluster`, `orbit`, `trail`; tones: `leaf`, `sky`, `sand`, `inverse`. Always remains `aria-hidden`. |
| `design-system/PlayfulObject.astro` | Original inline-SVG objects that extend the shape language into recognizable scenes | Kinds: `kite`, `tree`, `blocks`, `train`, `cloud`, `book-pencil`, `elephant-tree`, `balloon-plane`, and `puzzle`; tones and motion are narrow typed unions. The outer layer may own shared parallax while the inner artwork owns ambient CSS motion. Always remains `aria-hidden`. |
| `design-system/ToyPhotoFrame.astro` | Astro-optimized editorial photography presented as two overlapping toy-like panels | Requires meaningful `alt` plus a distinct `secondarySrc`; supports portrait, landscape, and square compositions, shared tones, focal-position presets, and the existing scroll-parallax hooks. |
| `.organic-panel` | Page-owned informational panels that need the shared shape language without card elevation | Keeps decoration behind content and clips it to the panel surface. |

Every normal `main section.section-space` receives five decorative shapes at runtime. Layouts `1` through `5` are shuffled in cycles so adjacent sections do not repeat the same arrangement, and a new order is selected on each direct load or Astro navigation. A section may provide its own direct `data-section-shapes` layer when a semantic decorative field such as the stacked story's clouds should replace those generated shapes. The shapes use separate parallax and idle wrappers so shared GSAP motion never competes for one transform. Repeated card-like components also receive one of five `data-organic-pattern-layout` arrangements, shuffled independently within each parent group; a complete set is used before a layout repeats, and adjacent cards never share the same arrangement. `SectionHeading`, shared card surfaces, `InfoCard`, rail cards, directory cards, callouts, the directory map, the membership form, and the footer also inherit or compose the same system. Reuse these treatments instead of adding page-local circles or blobs. Keep shapes decorative, pointer-transparent, behind readable content, and clipped by the nearest safe paint boundary.

### Cards

| Component | Use it for | Important contract |
| --- | --- | --- |
| `design-system/CardGrid.astro` | Responsive grid container | One column, then two, then three at shared breakpoints. |
| `design-system/InfoCard.astro` | Non-linked information card | Tones: `white`, `sky`, `leaf`, `sand`, `dark`; organic decoration is built in. |
| `src/components/JourneyCard.astro` | Linked navigation/information card | Tones: `white`, `sky`, `leaf`, `sand`, `dark`; `featured` enables the idle attention treatment. |
| `design-system/CardRail.astro` | Horizontal resource carousel | Receives an item array and wires shared previous/next controls. Cards are fully clickable. |
| `design-system/StackedCards.astro` | Multi-step narrative revealed as a playful sticky deck | CSS creates sticky overlap and slight whole-card rotation; desktop GSAP shifts and scales outgoing motion wrappers without changing opacity. A dedicated cloud field rises behind the deck. The current homepage uses three items. |

`JourneyCard` and rail cards use one real `ArrowLink` plus `.stretched-card-link` to cover the card. Preserve that semantic pattern:

- Do not nest another link or button inside the card.
- Do not add `onclick` navigation to the article.
- Keep the native link focus ring and the full-card `:focus-within` outline.
- On `JourneyCard`, keep pointer tilt on `[data-tilt-surface]`; the outer card owns hover/focus lift. Rail cards use lift without tilt hooks.

The `featured` treatment should remain visually useful when reduced motion disables its breathing animation.

### Feature components

- `MembershipForm.astro` is the reusable association journey and must not be duplicated.
- `ProfessionalDirectory.astro` owns filtering, location state, and directory composition.
- `design-system/LocationMap.astro` is directory-specific despite its folder. Do not use it as a generic map abstraction without first separating its professional-data assumptions.

## 4. Building a page

Use this sequence:

1. Define accurate page metadata through `BaseLayout`.
2. Add one `PageHero` and choose a `nextTone` matching the next section.
3. Divide content into `.section-space` sections.
4. Wrap normal-width content in `.site-container`; use `.reading-container` for prose.
5. Choose `SectionHeading`, `CardGrid`, `JourneyCard`, `StackedCards`, `CardRail`, or `Callout` according to the information hierarchy.
6. Use existing tones and tokens before introducing a variant.
7. Add existing reveal/parallax hooks only when they clarify the reading sequence.
8. Check mobile composition before increasing desktop density or motion.

Keep content arrays in the page when they only feed one component instance. Move data to `src/data/` when it has multiple consumers or non-trivial logic.

## 5. Extending a component

Extend an existing component when the new variation is semantic, reusable, and compatible with its role.

1. Find all consumers with `rg`.
2. Add a typed prop with an explicit default.
3. Prefer a narrow union for visual variants.
4. Render a stable modifier class or `data-*` hook.
5. Add shared styling to the component's existing block in `global.css`.
6. Add motion to `siteMotion.ts` only if CSS cannot express it appropriately.
7. Preserve the default output for existing callers.
8. Verify every caller at mobile and desktop widths.

Create a new component when the structure has a distinct semantic purpose and a clear current or near-term second use. Put content-neutral primitives in `src/components/design-system/`; put branded compositions and domain-aware patterns in `src/components/`.

Avoid abstracting a one-off section until its stable reusable boundary is clear.

## 6. Modifying shared styling

`global.css` is organized by commented system blocks. Keep shared component rules in the matching block and follow the existing BEM-like naming:

```text
.component
.component__element
.component--modifier
```

Modification rules:

- Use design tokens instead of new component-local hex values.
- Reuse shared spacing, radii, and shadows.
- Keep responsive overrides in the centralized breakpoint blocks.
- Keep reduced-motion fallbacks in the existing reduced-motion block.
- Provide hover and keyboard-focus equivalents.
- Check `documentElement.scrollWidth - clientWidth` after decorative or transformed layout changes.
- Avoid `overflow: hidden` on ancestors of sticky content. Use `overflow: clip` for paint containment.

### Sticky stacked-story contract

The stacked story has three separate responsibilities:

1. `.stack-card { position: sticky; }` creates the physical overlap.
2. Each `--stack-index` offsets the visible top edge.
3. `.stack-card__surface` owns the small static paper-like angle.
4. `siteMotion.ts` shifts and scales `.stack-card__motion` on outgoing desktop cards without changing their opacity, filter, or color.

On desktop, the trailing hold space is generated by `.stacked-story__cards::after`. It must remain a real grid row, not container padding. Sticky positioning excludes the container's padding from the usable holding boundary; converting that tail to padding makes the completed stack scroll away before the next section arrives.

Do not add `overflow: hidden` or `overflow: auto` to `.stacked-story` or its layout ancestors. Do not restore `autoAlpha`, grayscale, or saturation tweens to the stack.

## 7. Extending motion

All shared motion lives in `src/scripts/siteMotion.ts`. Current public hooks include:

- `data-reveal`.
- `data-reveal-group` with `data-reveal-item`.
- `data-tilt-card` with `data-tilt-surface`.
- `data-parallax`.
- `data-parallax-media`.
- `data-card-rail`, `data-rail-viewport`, `data-rail-prev`, `data-rail-next`.
- `data-card-stack` with `data-stack-card`.
- `data-stack-card-motion`, the transform layer inside each sticky stack card.
- `data-page-hero`, required `data-hero-content`, `data-hero-reveal`, `data-hero-idle`, and `data-hero-drift` with numeric `data-depth`.
- `data-section-shapes`, with generated `data-section-shape-parallax`, `data-section-shape-idle`, and numeric `data-depth` layers.
- `data-parallax-media`, used by `ToyPhotoFrame` viewports so image drift stays separate from panel rotation.

Treat these hooks as an API shared by markup and TypeScript. Renaming one requires updating both sides.

For new motion:

1. Decide whether CSS transition/keyframes are sufficient.
2. If GSAP is needed, initialize it inside the existing `gsap.context` or setup lifecycle.
3. Register manual listeners through the existing cleanup helper.
4. Guard motion with the existing reduced-motion, desktop, and fine-pointer media queries.
5. Ensure Astro `ClientRouter` swaps do not duplicate listeners or leave inline styles behind.
6. Let one layer own each transform. Add inner wrappers when two effects need independent transforms.
7. Never make essential content depend on animation completion.

The header persists between pages. Navigation-pill state is prepared before a swap, while page-specific motion is cleaned up and reinitialized on `astro:page-load`.

## 8. Accessibility, content, and media

- Keep exactly one `h1` per generated non-redirect page.
- Maintain heading order; use `SectionHeading.level` when an `h3` is appropriate.
- Preserve semantic links and buttons rather than recreating them with ARIA roles.
- Keep all controls keyboard reachable with visible focus.
- Ensure pointer-hover behavior has a touch/mobile alternative.
- Use `Image` from `astro:assets` for content images and supply meaningful or intentionally empty alt text.
- Preserve sufficient text and UI contrast, especially on `#4CA751`.
- Keep public copy factual and neutral; do not invent operational claims or fake completion states.
- Do not use motion, color, or hover as the sole carrier of meaning.

## 9. Route and navigation changes

When adding a page or changing a destination:

1. Update the relevant header/footer links.
2. Update `activeNavKey` or professional-section mapping in `siteMotion.ts` when applicable.
3. Preserve destination IDs used by deep links.
4. Update `expectedRoutes` in `scripts/verify-site.mjs`.
5. Review sitemap exclusions in `astro.config.mjs`.
6. Build and inspect generated HTML and sitemap output.

`/asociate/` is a deliberate compatibility redirect to `/profesionales/#solicitud`; do not replace the shared association form or expose the redirect in the sitemap.

## 10. Extension checklist

Before delivery, confirm:

- Existing consumers were enumerated.
- No shared style, token, or animation was duplicated locally.
- Typed APIs remain compatible.
- The next hero surface matches its curve.
- Full-card links still have one semantic anchor and visible focus.
- Sticky ancestors and tail geometry remain valid.
- Mobile, desktop, touch, keyboard, and reduced-motion behavior were considered.
- Hero layouts `1` through `5` were each exercised at mobile and desktop widths instead of relying on one random page load.
- Direct load and Astro navigation both work.
- The complete validation gate passes:

```sh
npm run check
npm test
npm run build
npm run verify:site
git diff --check
```
