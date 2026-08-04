# AISA Argentina — Editorial and link audit

Date: 2026-08-02
Repository: `/Users/matinandin/Documents/Coding/AISA Argentina/aisa-web`

## Scope

This is an analysis-only editorial review of the current Astro site. No page or component changes were made as part of the audit.

The review covered:

- Whether each page fulfills its intended purpose and addresses the right audience.
- Pages that are too thin, should be expanded, or could be consolidated.
- Repetition within and across pages.
- Internal routes, fragment links, external links, mail links, and labels whose destinations do not meet the expectation they create.
- Alignment with the site's primary goals:
  1. Inform families and help them contact a professional.
  2. Encourage professionals to complete the AISA association form.

The current source and generated HTML were inspected. The generated-site verifier passed all ten expected routes, including internal route and image checks.

## Executive summary

The overall information architecture is sensible. The main content pages should remain separate, and the previous consolidation of the association journey into `/profesionales/#solicitud` is appropriate.

The homepage is the clear structural weakness. It contains roughly 144 words and only two substantive content blocks after the hero. It identifies the main audiences but does not give visitors enough useful information, establish much institutional trust, or meaningfully preview the deeper pages.

More importantly, both primary conversion journeys fail at their final step:

1. Families are repeatedly sent to a directory containing only fictional professionals and no contact details.
2. Professionals can complete a five-step form that never transmits or stores anything, although the interface says that AISA received the application.

These are launch-blocking trust and product issues rather than minor copy problems.

## Priority findings

### P0 — “Find a professional” does not deliver what it promises

The homepage describes the directory as a curated list of AISA professionals and uses labels such as “Encontrar un profesional” and “Encontrá un profesional” (`src/pages/index.astro`). The family page, navbar, and footer reinforce the same promise.

The destination at `src/pages/buscar-profesional.astro` explicitly states that:

- All six profiles are fictional.
- It contains no contact details.
- It cannot yet connect visitors with a professional.

This also contradicts the professionals page, which promises increased exposure and contact from potential patients.

Recommendation: do not use the prototype as the destination of public “Buscar/Encontrar profesional” calls to action. Until real directory data is available, use an honest AISA-assisted contact path. If this checkout is intended to replace the current public AISA site, publishing the prototype would be a regression because the current site already presents a certified-professional search:

<https://www.aisaargentina.com.ar/profesionales/>

### P0 — The association form produces a false success state

`src/components/MembershipForm.astro` has no form action, API request, or persistence mechanism. Its submit handler calls `preventDefault()`, hides the form panels, and displays:

> Recibimos tu solicitud

It also promises contact within 48 business hours.

Consequences:

- The receipt message is false.
- The response-time promise is unsupported.
- The button “Revisar solicitud” does not show a review step; it jumps directly to the false receipt state.
- The contact page says that the site does not send forms and that AISA has not confirmed a response time, directly contradicting the form.

The form requests DNI, birth date, home address, phone number, and professional information without explaining data handling. It also promises a public professional profile but does not obtain explicit consent to publish contact information. The final checkbox only confirms that the submitted information is correct and may be used to determine membership category.

Before this workflow becomes public, it needs:

- A real submission destination and failure handling.
- An accurate review and confirmation sequence.
- A privacy notice covering purpose, storage, access, retention, and publication.
- Explicit consent for any directory information that will become public.
- A warning not to include identifiable patient information.

The current AISA site instead instructs applicants to download a form and send it with proof of payment by email:

<https://www.aisaargentina.com.ar/como-asociarse/>

### P1 — Internal product notes are exposed as public copy

Several passages speak to the implementation team rather than to visitors:

- “La próxima iteración definirá la fuente de datos…”
- “El correo publicado es el canal funcional de este MVP.”
- “Qué información debe estar vigente,” followed by pending operational definitions.
- The global footer: “Prototipo público · Los contenidos operativos señalados son de muestra.”

These notes weaken institutional credibility and make it hard to tell which information is authoritative. Pending decisions belong in project documentation. Public pages should state the confirmed service or clearly present a temporary user-facing alternative.

### P1 — The certification email is likely invalid

`src/pages/profesionales/certificacion.astro` links to:

`certificación.aisa@gmail.com`

The accented `ó` is not permitted in a standard Gmail username; Gmail usernames use `a-z`, numbers, and periods. The same spelling appears on the current AISA site, but it still needs confirmation. The likely intended address is:

`certificacion.aisa@gmail.com`

Gmail reference: <https://support.google.com/mail/answer/9211434?hl=es>

### P1 — The homepage is too thin and prioritizes the wrong secondary action

The homepage hero correctly prioritizes finding a professional, but its secondary action is “Conocé AISA.” Given the stated goals, the second primary journey should be for professionals who want to associate. Institutional information can appear lower on the page as a trust-building section.

The homepage currently offers audience cards and then repeats the directory call to action. It does not provide useful previews of:

- What Integración Sensorial is.
- When a family might consult.
- What a professional evaluation involves.
- How the professional search works.
- The course → certification → association pathway.
- Why AISA is a trustworthy source.
- How to contact AISA when the directory cannot answer the visitor's need.

## Recommended homepage structure

1. **Hero with two primary journeys**
   - “Encontrar un profesional.”
   - “Soy profesional / Asociarme.”
   - Move “Conocé AISA” into a lower trust section.

2. **What Integración Sensorial is and when consultation may help**
   - Answer one practical question in a short paragraph.
   - Link to the relevant section of `/familias-y-escuelas/`.

3. **How to find professional support**
   - Show the real search mechanism when available.
   - Until then, present an honest assisted-contact route rather than a fictional directory.

4. **Professional pathway**
   - Formarse → certificar → asociarse.
   - Link each step directly to the relevant page or section.

5. **Why trust AISA**
   - Brief institutional purpose, national network, standards, and leadership.
   - Link to `/acerca-de/`.

6. **Contact fallback**
   - Clear options for families, schools, professionals, and general inquiries.

Each homepage slice should answer one useful question before linking deeper. It should not merely duplicate a destination page's headline.

## Page-by-page assessment

### Homepage — `src/pages/index.astro`

Status: expand substantially.

Strengths:

- Identifies the core audiences.
- Provides direct routes to family and professional content.
- Gives “find a professional” visual priority.

Problems:

- Too little substantive content.
- Secondary hero action does not prioritize professional conversion.
- “Conocer los cursos” links to `/profesionales/`, not directly to `/profesionales/formacion-y-cursos/`.
- Claims that the directory is a curated list of AISA professionals even though the destination is fictional.
- Claims that members' profiles and contact information are promoted even though the directory contains no contact details.
- “Certificaciones avaladas a nivel nacional” may imply governmental or statutory accreditation. “Cursos avalados por AISA” is more precise.

### Families and schools — `src/pages/familias-y-escuelas.astro`

Status: keep separate; improve audience balance and clinical review.

Strengths:

- The most substantial and educational page on the site.
- Strong progression from explanation to signs, evaluation, and next steps.
- Repeatedly states that signs do not replace professional evaluation.

Problems:

- The title promises families and schools, but most detailed content addresses parents and children.
- Schools receive one card but no dedicated practical section.
- Health teams receive one especially thin card.
- “Preparar una conversación” and “Ordenar el siguiente paso” both link to the same generic `#proximos-pasos` callout, which does not provide the distinct content those labels promise.
- The “Nadie conoce a tu niño…” message is repeated almost verbatim later on the same page.
- The instruction “Si recibe un diagnóstico de desorden de procesamiento sensorial…” conflicts with the page's non-diagnostic framing. A clinician should review this wording. The American Academy of Pediatrics notes that there is no universally accepted diagnostic framework and generally cautions against using sensory processing disorder as a standalone diagnosis:
  <https://publications.aap.org/pediatrics/article/129/6/1186/32067/Sensory-Integration-Therapies-for-Children-With>
- The attribution to *Sensational Kids* says “ORT”; confirm whether it should be “OTR” and add edition/page or a clinical review date.

Recommendation: either add meaningful school- and health-specific sections or narrow the page promise to families. Do not split it into additional pages yet.

### Professionals hub — `src/pages/profesionales/index.astro`

Status: keep the consolidated page; repair the conversion workflow.

Strengths:

- Correctly brings courses, certification, and association into one journey.
- The three-card structure is easy to understand.
- Keeping the form at `/profesionales/#solicitud` is appropriate.

Problems:

- Hero benefits depend on a directory that is not real.
- “Qué información debe estar vigente” is an internal readiness checklist, not public guidance.
- The form appears before visitors receive clear information about eligibility, benefits, costs, required documents, privacy, or what happens after submission.
- The association form does not submit.

Recommendation: replace the internal checklist with a practical “before you start” section containing eligibility, benefits, fees, documentation, processing steps, privacy, and response expectations.

### Certification — `src/pages/profesionales/certificacion.astro`

Status: keep separate; clarify terminology and stages.

Strengths:

- Comprehensive requirements and process.
- Useful separation between standards and application steps.

Problems:

- Typo: “Si hiciste lo cursos” should be “Si hiciste los cursos.”
- The introduction says the hours are required, while individual level cards call them “mínimas sugeridas.”
- The page presents four levels as though each may be certified separately, but costs and outcomes only discuss levels 3 and 4.
- Explain whether levels 1–3 form the first accreditation stage and level 4 represents complete certification.
- “Dar de alta tu usuario” implies account creation, although the association form does not create an account and the login control is a placeholder.
- The certification email needs confirmation.

### Formation and courses — `src/pages/profesionales/formacion-y-cursos.astro`

Status: keep separate; it is a dense catalog rather than a thin page.

Strengths:

- Clear course organization by level.
- Direct provider contact links.
- Good handoff into certification requirements and process.

Problems:

- Grammar: “Estos cursos… son válidas” should be “son válidos.”
- The same Actualizaciones Terapéuticas course title appears at levels 2 and 3. Clarify whether one course satisfies both levels or whether this is accidental duplication.
- The two closing cards—“Certificá tu formación” and “Conocé cómo certificarla”—are very similar. Distinguish eligibility/requirements from the application process more explicitly.
- This important professional page is excluded from the sitemap without a `noindex` directive. The reason for excluding it should be confirmed.

### About AISA — `src/pages/acerca-de.astro`

Status: fulfills its purpose; keep separate.

Strengths:

- Strong institutional credibility page.
- Appropriate mission, leadership, and honorary-member content.
- Current board period is clearly identified.

Problems:

- The mission, objective, and four pillars restate the same concepts: dissemination, formation, knowledge, and quality.
- The objective card could introduce the pillars more directly, or the pillars could replace the redundant objective summary.

### Contact — `src/pages/contacto.astro`

Status: appropriately concise; keep separate.

Strengths:

- Clear topic routing.
- Helpful prefilled email subjects.
- Good warning not to send clinical records or personal documents without instructions.

Problems:

- “Canal funcional de este MVP” is internal product language.
- It says AISA has not confirmed a response time, while the association form promises 48 business hours.
- “Este sitio no almacena datos ni envía formularios” is technically consistent with the current implementation but contradicts the association form's claimed receipt state.

### Professional search — `src/pages/buscar-profesional.astro`

Status: does not fulfill its public purpose.

The page is a useful UI prototype, but it should not be a prominent public conversion destination. Keep it internal/demo-only until real authorized data and contact behavior exist, or temporarily repurpose the route as an honest AISA-assisted contact page.

The route is correctly marked `noindex`, but that does not resolve the visitor-expectation problem created by linking to it from nearly every public page.

### 404 and legacy association route

Status: appropriate utility routes.

- `src/pages/404.astro` provides useful recovery paths.
- `src/pages/asociate.astro` correctly redirects to `/profesionales/#solicitud`.
- The legacy association route is correctly excluded from the sitemap.

## Repetition inventory

### Repetition that should be reduced

- “Nadie conoce a tu niño…” and its supporting message repeat within the family page.
- About AISA repeats its four institutional commitments in the mission/objective block and again in the pillars.
- The two certification cards at the bottom of the courses page have nearly identical framing.
- The same provider/course title appears at levels 2 and 3 without explanation.

### Repetition that is acceptable but currently amplifies broken journeys

- “Buscar/Encontrar profesional” appears across the hero, navbar, homepage, family page, and footer.
- “Asociate/Quiero asociarme” appears across the homepage, About page, professional hub, certification page, navbar, and footer.

Repeated conversion calls are appropriate. The problem is that they repeatedly send visitors into workflows that do not currently work.

## Link and technical audit

### Confirmed working

- All declared internal routes resolve.
- All same-page and cross-page fragment targets resolve.
- `/asociate/` redirects to `/profesionales/#solicitud`.
- The Actualizaciones Terapéuticas link redirects from HTTP to HTTPS and returns a successful response.
- Instagram, YouTube, and Facebook endpoints respond.
- The generated-site verifier passed ten expected routes.

### Problems or caveats

- “Conocer los cursos” on the homepage links to the professional hub rather than directly to the courses page.
- Several labels promise a real professional search but lead to a fictional prototype.
- “Preparar una conversación” and “Ordenar el siguiente paso” imply distinct sections but share a generic destination.
- “Revisar solicitud” does not show a review screen.
- The accented Gmail certification address is likely invalid.
- Actual mailbox delivery was not tested because doing so would require sending email.
- `/profesionales/formacion-y-cursos/` is excluded from the sitemap even though it is a core public professional page.

The disabled “Iniciar sesión” navbar control was intentionally excluded from this audit, as requested.

## Suggested implementation order for a follow-up task

1. Decide the truthful temporary behavior for “Buscar profesional.”
2. Connect the association form to a real submission workflow or remove the false receipt state.
3. Confirm the certification email and association operating process with AISA.
4. Replace public MVP/backlog language with audience-ready content.
5. Expand and restructure the homepage around the two primary journeys.
6. Clarify professional certification stages, form prerequisites, and privacy.
7. Strengthen the school and health-team portions of the family page.
8. Make the smaller repetition, grammar, and link-label corrections.
9. Re-run `npm run check`, `npm test`, `npm run build`, and `npm run verify:site`, then inspect the rendered homepage, family journey, directory fallback, and association form end to end.
