import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type {
  TransitionBeforePreparationEvent,
  TransitionBeforeSwapEvent,
} from "astro:transitions/client";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktop = window.matchMedia("(min-width: 64rem)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

let motionContext: gsap.Context | null = null;
let listenerCleanups: Array<() => void> = [];
let navigationResizeObserver: ResizeObserver | null = null;

const addListener = <K extends keyof HTMLElementEventMap>(
  element: HTMLElement | Document | Window,
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
) => {
  element.addEventListener(type, handler as EventListener);
  listenerCleanups.push(() => element.removeEventListener(type, handler as EventListener));
};

const cleanup = () => {
  listenerCleanups.splice(0).forEach((remove) => remove());
  navigationResizeObserver?.disconnect();
  navigationResizeObserver = null;
  motionContext?.revert();
  motionContext = null;
  gsap.killTweensOf(
    "[data-mobile-menu], [data-mobile-menu] a, [data-menu-line]",
  );
};

const activeNavKey = (url: URL) => {
  if (url.pathname === "/") return "home";
  if (url.pathname.startsWith("/familias-y-escuelas")) return "families";
  if (url.pathname.startsWith("/profesionales")) return "professionals";
  if (url.pathname.startsWith("/acerca-de")) return "aisa";
  return null;
};

const activeProfessionalSection = (url: URL) => {
  if (url.pathname.startsWith("/profesionales/formacion-y-cursos")) return "courses";
  if (url.pathname.startsWith("/profesionales/certificacion")) return "certification";
  if (url.pathname === "/profesionales/" && url.hash === "#solicitud") {
    return "membership";
  }
  return null;
};

const scrollToHashTarget = (behavior: ScrollBehavior = "auto") => {
  if (!window.location.hash) return;

  const id = decodeURIComponent(window.location.hash.slice(1));
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
  });
};

const navPillTarget = (key: string) => {
  if (key === "professionals") {
    return document.querySelector<HTMLElement>("[data-nav-professionals] [data-nav-pill-target]");
  }
  return document.querySelector<HTMLElement>(
    `[data-desktop-nav] [data-nav-key="${key}"][data-nav-pill-target]`,
  );
};

const placeNavPill = (key: string | null, animate: boolean) => {
  const pill = document.querySelector<HTMLElement>("[data-nav-pill]");
  const nav = pill?.closest<HTMLElement>("[data-desktop-nav]");
  const target = key ? navPillTarget(key) : null;

  if (!pill || !nav || !target || !desktop.matches) {
    if (pill) gsap.set(pill, { autoAlpha: 0 });
    return;
  }

  const navBounds = nav.getBoundingClientRect();
  const targetBounds = target.getBoundingClientRect();
  const properties = {
    x: targetBounds.left - navBounds.left + nav.scrollLeft,
    y: targetBounds.top - navBounds.top + nav.scrollTop,
    width: targetBounds.width,
    height: targetBounds.height,
    autoAlpha: 1,
  };

  gsap.killTweensOf(pill);
  if (animate && !reducedMotion.matches) {
    gsap.to(pill, {
      ...properties,
      duration: 0.58,
      ease: "power3.inOut",
      overwrite: "auto",
    });
  } else {
    gsap.set(pill, properties);
  }
};

const placeProfessionalSectionPill = (
  section: string | null,
  animate: boolean,
  type: "active" | "hover",
) => {
  const pill = document.querySelector<HTMLElement>(
    type === "active"
      ? "[data-professionals-section-pill]"
      : "[data-professionals-section-hover-pill]",
  );
  const link = section
    ? document.querySelector<HTMLElement>(
        `[data-desktop-nav] [data-professional-section="${section}"]`,
      )
    : null;

  if (!pill || !link || !desktop.matches) {
    if (pill) gsap.set(pill, { autoAlpha: 0 });
    return;
  }

  const properties = {
    x: link.offsetLeft,
    y: link.offsetTop,
    width: link.offsetWidth,
    height: link.offsetHeight,
    autoAlpha: 1,
  };

  gsap.killTweensOf(pill);
  if (animate && !reducedMotion.matches) {
    gsap.to(pill, {
      ...properties,
      duration: type === "active" ? 0.42 : 0.22,
      ease: "power3.out",
      overwrite: "auto",
    });
  } else {
    gsap.set(pill, properties);
  }
};

const syncNavigation = (animate: boolean, url = new URL(window.location.href)) => {
  const key = activeNavKey(url);
  const section = activeProfessionalSection(url);
  const professionalsGroup = document.querySelector<HTMLElement>("[data-nav-professionals]");
  const pill = document.querySelector<HTMLElement>("[data-nav-pill]");

  professionalsGroup?.classList.toggle("is-active", key === "professionals");

  document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]").forEach((link) => {
    if (link.dataset.navKey === key) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  document.querySelectorAll<HTMLAnchorElement>("[data-professional-section]").forEach((link) => {
    if (link.dataset.professionalSection === section) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.querySelectorAll<HTMLAnchorElement>("[data-nav-action]").forEach((link) => {
    const action = link.dataset.navAction;
    const active =
      (action === "contact" && url.pathname.startsWith("/contacto")) ||
      (action === "search" && url.pathname.startsWith("/buscar-profesional"));
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  placeNavPill(key, animate && pill?.dataset.navPillReady === "true");
  placeProfessionalSectionPill(section, animate, "active");
  if (pill) pill.dataset.navPillReady = "true";
};

const setupNavigationState = () => {
  const nav = document.querySelector<HTMLElement>("[data-desktop-nav]");
  const pill = document.querySelector<HTMLElement>("[data-nav-pill]");
  syncNavigation(pill?.dataset.navPillReady === "true");

  if (nav && "ResizeObserver" in window) {
    navigationResizeObserver = new ResizeObserver(() => syncNavigation(false));
    navigationResizeObserver.observe(nav);
    nav.querySelectorAll<HTMLElement>("[data-nav-pill-target]").forEach((target) =>
      navigationResizeObserver?.observe(target),
    );
  }

  document.fonts?.ready.then(() => syncNavigation(false));
};

const setupHeaderPresence = () => {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const shell = header?.querySelector<HTMLElement>(".site-header__shell");
  if (!header || !shell || header.dataset.motionReady === "true") return;

  header.dataset.motionReady = "true";
  if (reducedMotion.matches) {
    gsap.set(shell, { clearProps: "all", autoAlpha: 1 });
    return;
  }

  gsap.fromTo(
    shell,
    { autoAlpha: 0, y: -16, scale: 0.985 },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.58,
      ease: "power3.out",
      clearProps: "transform,opacity,visibility",
    },
  );
};

const setupMenu = () => {
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const menu = document.querySelector<HTMLElement>("[data-mobile-menu]");
  if (!toggle || !menu) return;

  const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>("a"));
  const topLine = toggle.querySelector<SVGPathElement>("[data-menu-line='top']");
  const middleLine = toggle.querySelector<SVGPathElement>("[data-menu-line='middle']");
  const bottomLine = toggle.querySelector<SVGPathElement>("[data-menu-line='bottom']");
  const iconLines = [topLine, middleLine, bottomLine].filter(
    (line): line is SVGPathElement => line !== null,
  );
  const menuTargets = [menu, ...links, ...iconLines];

  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Abrir menú");
  menu.hidden = true;
  gsap.set(menuTargets, { clearProps: "all" });

  const setOpen = (open: boolean, returnFocus = false) => {
    gsap.killTweensOf(menuTargets);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");

    if (reducedMotion.matches) {
      menu.hidden = !open;
      if (topLine && middleLine && bottomLine) {
        gsap.set(topLine, { y: open ? 5 : 0, rotation: open ? 45 : 0, transformOrigin: "50% 50%" });
        gsap.set(middleLine, { autoAlpha: open ? 0 : 1, scaleX: open ? 0 : 1, transformOrigin: "50% 50%" });
        gsap.set(bottomLine, { y: open ? -5 : 0, rotation: open ? -45 : 0, transformOrigin: "50% 50%" });
      }
      if (!open && returnFocus) toggle.focus();
      return;
    }

    if (topLine && middleLine && bottomLine) {
      const iconMotion = { duration: 0.28, ease: "power2.out", overwrite: "auto" as const };
      gsap.to(topLine, {
        y: open ? 5 : 0,
        rotation: open ? 45 : 0,
        transformOrigin: "50% 50%",
        ...iconMotion,
      });
      gsap.to(middleLine, {
        autoAlpha: open ? 0 : 1,
        scaleX: open ? 0 : 1,
        transformOrigin: "50% 50%",
        ...iconMotion,
      });
      gsap.to(bottomLine, {
        y: open ? -5 : 0,
        rotation: open ? -45 : 0,
        transformOrigin: "50% 50%",
        ...iconMotion,
      });
    }

    if (open) {
      menu.hidden = false;
      gsap
        .timeline()
        .fromTo(
          menu,
          { autoAlpha: 0, y: -12, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.32, ease: "power3.out" },
        )
        .fromTo(
          links,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.22, stagger: 0.025, ease: "power2.out" },
          "-=0.2",
        );
    } else {
      gsap.to(menu, {
        autoAlpha: 0,
        y: -8,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          menu.hidden = true;
          gsap.set([menu, ...links], { clearProps: "all" });
          if (returnFocus) toggle.focus();
        },
      });
    }
  };

  addListener(toggle, "click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  links.forEach((link) => addListener(link, "click", () => setOpen(false)));
  addListener(document, "keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false, true);
    }
  });
};

const setupDesktopNavigation = () => {
  document.querySelectorAll<HTMLElement>("[data-nav-professionals]").forEach((group) => {
    const toggle = group.querySelector<HTMLAnchorElement>(".site-nav__toggle");
    const dropdownLinks = Array.from(
      group.querySelectorAll<HTMLAnchorElement>("[data-professionals-menu-link]"),
    );
    if (!toggle) return;

    const setExpanded = (expanded: boolean) => {
      toggle.setAttribute("aria-expanded", String(expanded));
    };

    const dismiss = () => {
      group.classList.add("is-dismissed");
      setExpanded(false);
      const active = document.activeElement;
      if (active instanceof HTMLElement && group.contains(active)) active.blur();
    };

    setExpanded(false);
    addListener(group, "pointerenter", () => {
      group.classList.remove("is-dismissed");
      setExpanded(true);
    });
    addListener(group, "pointerleave", () => {
      group.classList.remove("is-dismissed");
      setExpanded(group.matches(":has(:focus-visible)"));
      placeProfessionalSectionPill(null, true, "hover");
    });
    addListener(group, "focusin", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches(":focus-visible")) {
        group.classList.remove("is-dismissed");
        setExpanded(true);
      }
    });
    addListener(group, "focusout", (event) => {
      const nextTarget = event.relatedTarget;
      if (!(nextTarget instanceof Node) || !group.contains(nextTarget)) {
        setExpanded(group.matches(":hover"));
      }
    });
    addListener(toggle, "click", dismiss);
    dropdownLinks.forEach((link) => {
      const showHoverPill = () =>
        placeProfessionalSectionPill(link.dataset.professionalSection ?? null, true, "hover");
      addListener(link, "pointerenter", showHoverPill);
      addListener(link, "focusin", showHoverPill);
      addListener(link, "click", dismiss);
    });
    addListener(group, "keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      toggle.focus();
      group.classList.add("is-dismissed");
      setExpanded(false);
    });
  });
};

const setupRails = () => {
  document.querySelectorAll<HTMLElement>("[data-card-rail]").forEach((rail) => {
    const viewport = rail.querySelector<HTMLElement>("[data-rail-viewport]");
    const previous = rail.querySelector<HTMLButtonElement>("[data-rail-prev]");
    const next = rail.querySelector<HTMLButtonElement>("[data-rail-next]");
    if (!viewport || !previous || !next) return;

    const move = (direction: -1 | 1) => {
      const distance = Math.min(viewport.clientWidth * 0.82, 460);
      if (reducedMotion.matches) {
        viewport.scrollBy({ left: distance * direction, behavior: "auto" });
        return;
      }
      gsap.to(viewport, {
        scrollTo: { x: viewport.scrollLeft + distance * direction, autoKill: false },
        duration: 0.65,
        ease: "power3.inOut",
      });
    };

    addListener(previous, "click", () => move(-1));
    addListener(next, "click", () => move(1));
  });
};

const setupTiltCards = () => {
  if (!finePointer.matches || reducedMotion.matches) return;

  document.querySelectorAll<HTMLElement>("[data-tilt-card]").forEach((card) => {
    const surface = card.querySelector<HTMLElement>("[data-tilt-surface]") ?? card;
    const onMove = (event: PointerEvent) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      gsap.to(surface, {
        rotationX: y * -3.5,
        rotationY: x * 3.5,
        transformPerspective: 900,
        transformOrigin: "center",
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    const reset = () => gsap.to(surface, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.55,
      ease: "power3.out",
      overwrite: "auto",
    });

    addListener(card, "pointermove", onMove as (event: Event) => void);
    addListener(card, "pointerleave", reset);
  });
};

const clampMotion = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

const sectionShapeModifiers = ["one", "two", "three", "four", "five"] as const;
const sectionShapeDepths = [-0.28, 0.2, -0.16, 0.24, -0.12] as const;

const shuffledOrganicLayouts = () => {
  const layouts = [1, 2, 3, 4, 5];
  for (let index = layouts.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [layouts[index], layouts[swapIndex]] = [layouts[swapIndex], layouts[index]];
  }
  return layouts;
};

const setupSectionShapes = () => {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("main section.section-space"),
  );
  let layoutPool: number[] = [];
  let previousLayout: number | null = null;

  sections.forEach((section) => {
    const existingShapes = section.querySelector<HTMLElement>(":scope > [data-section-shapes]");
    if (existingShapes) {
      previousLayout = Number(section.dataset.sectionShapeLayout ?? previousLayout);
      return;
    }

    if (layoutPool.length === 0) {
      layoutPool = shuffledOrganicLayouts();
      if (layoutPool[0] === previousLayout) {
        const differentIndex = layoutPool.findIndex((layout) => layout !== previousLayout);
        if (differentIndex > 0) {
          [layoutPool[0], layoutPool[differentIndex]] = [
            layoutPool[differentIndex],
            layoutPool[0],
          ];
        }
      }
    }

    const layout = layoutPool.shift() ?? 1;
    previousLayout = layout;
    section.dataset.sectionShapeLayout = String(layout);

    const decoration = document.createElement("div");
    decoration.className = "section-shapes";
    decoration.dataset.sectionShapes = "";
    decoration.setAttribute("aria-hidden", "true");

    sectionShapeModifiers.forEach((modifier, index) => {
      const shape = document.createElement("span");
      const parallaxLayer = document.createElement("span");
      const idleLayer = document.createElement("span");
      const artwork = document.createElement("span");

      shape.className = `section-shape section-shape--${modifier}`;
      parallaxLayer.className = "section-shape__parallax";
      parallaxLayer.dataset.sectionShapeParallax = "";
      parallaxLayer.dataset.depth = String(sectionShapeDepths[index]);
      idleLayer.className = "section-shape__idle";
      idleLayer.dataset.sectionShapeIdle = "";
      artwork.className = "section-shape__art";

      idleLayer.append(artwork);
      parallaxLayer.append(idleLayer);
      shape.append(parallaxLayer);
      decoration.append(shape);
    });

    section.prepend(decoration);
  });
};

const repeatedOrganicPatternSelector = [
  ".journey-card",
  ".info-card",
  ".surface-card",
  ".resource-card",
  ".directory-card",
  ".organic-panel",
].join(", ");

const setupRepeatedOrganicPatterns = () => {
  const main = document.querySelector<HTMLElement>("main");
  if (!main) return;

  const groups = new Map<HTMLElement, HTMLElement[]>();

  main
    .querySelectorAll<HTMLElement>(repeatedOrganicPatternSelector)
    .forEach((element) => {
      const parent = element.parentElement;
      if (!parent) return;

      const siblings = groups.get(parent) ?? [];
      siblings.push(element);
      groups.set(parent, siblings);
    });

  groups.forEach((elements) => {
    let layoutPool: number[] = [];
    let previousLayout: number | null = null;

    elements.forEach((element) => {
      const existingLayout = Number(element.dataset.organicPatternLayout);
      if (existingLayout >= 1 && existingLayout <= 5) {
        previousLayout = existingLayout;
        layoutPool = [];
        return;
      }

      if (layoutPool.length === 0) {
        layoutPool = shuffledOrganicLayouts();
        if (layoutPool[0] === previousLayout) {
          const differentIndex = layoutPool.findIndex(
            (layout) => layout !== previousLayout,
          );
          if (differentIndex > 0) {
            [layoutPool[0], layoutPool[differentIndex]] = [
              layoutPool[differentIndex],
              layoutPool[0],
            ];
          }
        }
      }

      const layout = layoutPool.shift() ?? 1;
      previousLayout = layout;
      element.dataset.organicPatternLayout = String(layout);
    });
  });
};

const setupSectionShapeMotion = () => {
  document.querySelectorAll<HTMLElement>("[data-section-shapes]").forEach(
    (decoration, sectionIndex) => {
      const section = decoration.closest<HTMLElement>("section");
      if (!section) return;

      decoration
        .querySelectorAll<HTMLElement>("[data-section-shape-parallax]")
        .forEach((layer) => {
          const depth = Number(layer.dataset.depth ?? 0.15);
          gsap.fromTo(
            layer,
            { yPercent: depth * -42 },
            {
              yPercent: depth * 42,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.9,
              },
            },
          );
        });

      decoration
        .querySelectorAll<HTMLElement>("[data-section-shape-idle]")
        .forEach((layer, shapeIndex) => {
          const direction = (sectionIndex + shapeIndex) % 2 === 0 ? 1 : -1;
          const travel = desktop.matches ? 5 + shapeIndex * 1.2 : 3 + shapeIndex * 0.7;
          gsap.to(layer, {
            x: direction * travel,
            y: direction * travel * 0.7,
            rotation: direction * (1.4 + shapeIndex * 0.35),
            duration: 6.8 + shapeIndex * 0.85 + (sectionIndex % 3) * 0.4,
            delay: shapeIndex * 0.12,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            scrollTrigger: {
              trigger: section,
              start: "top 110%",
              end: "bottom -10%",
              toggleActions: "play pause resume pause",
            },
          });
        });
    },
  );
};

const setupHeroMotion = (hero: HTMLElement, heroContent: HTMLElement) => {
  const revealLayers = Array.from(
    hero.querySelectorAll<HTMLElement>("[data-hero-reveal]"),
  ).filter((layer) => layer.getClientRects().length > 0);
  const idleLayers = Array.from(
    hero.querySelectorAll<HTMLElement>("[data-hero-idle]"),
  ).filter((layer) => layer.getClientRects().length > 0);

  gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .fromTo(
      heroContent.children,
      { autoAlpha: 0, y: 36 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.09,
        clearProps: "transform,opacity,visibility",
      },
    )
    .fromTo(
      revealLayers,
      { autoAlpha: 0, scale: 0.72 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 1.05,
        stagger: 0.055,
        ease: "back.out(1.3)",
        clearProps: "transform,opacity,visibility",
      },
      0.06,
    );

  idleLayers.forEach((layer, index) => {
    const direction = index % 2 === 0 ? 1 : -1;
    const travel = desktop.matches ? 8 + index * 0.7 : 4 + index * 0.35;
    gsap.to(layer, {
      x: direction * travel,
      y: direction * (travel * 0.72),
      rotation: direction * (1.2 + index * 0.22),
      duration: 5.4 + index * 0.68,
      delay: 0.28 + index * 0.09,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });

  if (!finePointer.matches) return;

  const driftLayers = Array.from(
    hero.querySelectorAll<HTMLElement>("[data-hero-drift]"),
  ).filter((layer) => layer.getClientRects().length > 0);
  const xSetters = driftLayers.map((layer) =>
    gsap.quickTo(layer, "x", { duration: 0.72, ease: "power3.out" }),
  );
  const ySetters = driftLayers.map((layer) =>
    gsap.quickTo(layer, "y", { duration: 0.72, ease: "power3.out" }),
  );
  const rotationSetters = driftLayers.map((layer) =>
    gsap.quickTo(layer, "rotation", { duration: 0.8, ease: "power3.out" }),
  );

  let lastX: number | null = null;
  let lastY: number | null = null;
  let smoothedX = 0;
  let smoothedY = 0;
  let settleCall: gsap.core.Tween | null = null;

  const settle = () => {
    smoothedX = 0;
    smoothedY = 0;
    lastX = null;
    lastY = null;
    driftLayers.forEach((_, index) => {
      xSetters[index]?.(0);
      ySetters[index]?.(0);
      rotationSetters[index]?.(0);
    });
  };

  const scheduleSettle = () => {
    settleCall?.kill();
    settleCall = gsap.delayedCall(0.12, settle);
  };

  const onPointerEnter = (event: PointerEvent) => {
    lastX = event.clientX;
    lastY = event.clientY;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (lastX === null || lastY === null) {
      lastX = event.clientX;
      lastY = event.clientY;
      return;
    }

    const deltaX = clampMotion((event.clientX - lastX) * 1.15, -10, 10);
    const deltaY = clampMotion((event.clientY - lastY) * 1.15, -8, 8);
    lastX = event.clientX;
    lastY = event.clientY;
    smoothedX = smoothedX * 0.54 + deltaX * 0.46;
    smoothedY = smoothedY * 0.54 + deltaY * 0.46;

    driftLayers.forEach((layer, index) => {
      const depth = Number(layer.dataset.depth ?? 0.5);
      xSetters[index]?.(smoothedX * depth);
      ySetters[index]?.(smoothedY * depth);
      rotationSetters[index]?.(smoothedX * depth * 0.045);
    });
    scheduleSettle();
  };

  addListener(hero, "pointerenter", onPointerEnter as (event: Event) => void);
  addListener(hero, "pointermove", onPointerMove as (event: Event) => void);
  addListener(hero, "pointerleave", settle);
  listenerCleanups.push(() => settleCall?.kill());
};

const initialize = () => {
  cleanup();
  setupSectionShapes();
  setupRepeatedOrganicPatterns();
  setupMenu();
  setupDesktopNavigation();
  setupNavigationState();
  setupHeaderPresence();
  setupRails();
  setupTiltCards();

  motionContext = gsap.context(() => {
    const hero = document.querySelector<HTMLElement>("[data-page-hero]");
    const heroContent = hero?.querySelector<HTMLElement>("[data-hero-content]");

    if (reducedMotion.matches) {
      gsap.set("[data-reveal], [data-reveal-item], main .surface-card, main section h2, [data-hero-reveal], [data-hero-idle], [data-hero-drift], [data-section-shape-parallax], [data-section-shape-idle]", {
        clearProps: "all",
        autoAlpha: 1,
      });
      return;
    }

    if (hero && heroContent) {
      setupHeroMotion(hero, heroContent);
    }

    setupSectionShapeMotion();

    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(
      "[data-reveal], main .surface-card, main section h2:not(.page-hero__title)",
    ));
    const uniqueRevealTargets = [...new Set(revealTargets)].filter(
      (element) => !element.closest("[data-page-hero]") && !element.closest("[hidden]"),
    );

    uniqueRevealTargets.forEach((element) => {
      gsap.fromTo(element, { autoAlpha: 0, y: 28 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility,willChange",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true,
        },
      });
    });

    document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
      const items = Array.from(group.querySelectorAll<HTMLElement>("[data-reveal-item]"));
      if (items.length === 0) return;
      gsap.fromTo(items, { autoAlpha: 0, y: 34 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.68,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility,willChange",
        scrollTrigger: {
          trigger: group,
          start: "top 84%",
          once: true,
        },
      });
    });

    document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((element) => {
      if (element.getClientRects().length === 0) return;
      const amount = Number(element.dataset.parallax ?? 0.1);
      gsap.to(element, {
        yPercent: amount * 120,
        ease: "none",
        scrollTrigger: {
          trigger: element.closest("section") ?? element,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.7,
        },
      });
    });

    document.querySelectorAll<HTMLElement>("[data-parallax-media]").forEach((frame) => {
      const media = frame.querySelector<HTMLElement>("img, iframe");
      if (!media) return;
      gsap.fromTo(media, { scale: 1.06, yPercent: -2.5 }, {
        scale: 1.06,
        yPercent: 2.5,
        ease: "none",
        scrollTrigger: {
          trigger: frame,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      });
    });

    if (desktop.matches) {
      document.querySelectorAll<HTMLElement>("[data-card-stack]").forEach((stack) => {
        const cards = Array.from(stack.querySelectorAll<HTMLElement>("[data-stack-card]"));
        cards.slice(0, -1).forEach((card, index) => {
          const nextCard = cards[index + 1];
          gsap.to(card, {
            scale: 0.92 + index * 0.02,
            ease: "none",
            scrollTrigger: {
              trigger: nextCard,
              start: "top 76%",
              end: "top 16%",
              scrub: 0.65,
            },
          });
        });
      });
    }

    const footer = document.querySelector<HTMLElement>("[data-site-footer]");
    if (footer && desktop.matches) {
      gsap.fromTo(footer.querySelectorAll("[data-reveal], [data-reveal-item]"), { y: 30 }, {
        y: -12,
        ease: "none",
        scrollTrigger: {
          trigger: footer,
          start: "top bottom",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });
    }
  }, document.body);

  requestAnimationFrame(() => ScrollTrigger.refresh());
};

const resetPersistentMenus = () => {
  const mobileToggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const mobileMenu = document.querySelector<HTMLElement>("[data-mobile-menu]");
  const mobileLinks = mobileMenu
    ? Array.from(mobileMenu.querySelectorAll<HTMLAnchorElement>("a"))
    : [];
  const topLine = mobileToggle?.querySelector<SVGPathElement>("[data-menu-line='top']");
  const middleLine = mobileToggle?.querySelector<SVGPathElement>("[data-menu-line='middle']");
  const bottomLine = mobileToggle?.querySelector<SVGPathElement>("[data-menu-line='bottom']");
  const iconLines = [topLine, middleLine, bottomLine].filter(
    (line): line is SVGPathElement => line !== null && line !== undefined,
  );

  if (mobileToggle && mobileMenu) {
    gsap.killTweensOf([mobileMenu, ...mobileLinks, ...iconLines]);
    mobileToggle.setAttribute("aria-expanded", "false");
    mobileToggle.setAttribute("aria-label", "Abrir menú");
    mobileMenu.hidden = true;
    gsap.set([mobileMenu, ...mobileLinks], { clearProps: "all" });
    if (topLine && middleLine && bottomLine) {
      gsap.set(topLine, { y: 0, rotation: 0, clearProps: "transform" });
      gsap.set(middleLine, { autoAlpha: 1, scaleX: 1, clearProps: "transform,opacity,visibility" });
      gsap.set(bottomLine, { y: 0, rotation: 0, clearProps: "transform" });
    }
  }

  const professionalsGroup = document.querySelector<HTMLElement>("[data-nav-professionals]");
  const activeElement = document.activeElement;
  const shouldDismiss =
    professionalsGroup?.matches(":hover") ||
    (activeElement instanceof Node && professionalsGroup?.contains(activeElement));
  professionalsGroup?.classList.toggle("is-dismissed", Boolean(shouldDismiss));
  if (activeElement instanceof HTMLElement && professionalsGroup?.contains(activeElement)) {
    activeElement.blur();
  }
  placeProfessionalSectionPill(null, false, "hover");
};

const handleBeforePreparation = (event: TransitionBeforePreparationEvent) => {
  resetPersistentMenus();
  const destination = event.to;
  placeNavPill(activeNavKey(destination), true);
  placeProfessionalSectionPill(activeProfessionalSection(destination), true, "active");
};

const handleBeforeSwap = (event: TransitionBeforeSwapEvent) => {
  event.newDocument.documentElement.dataset.heroLayout = String(
    Math.floor(Math.random() * 5) + 1,
  );
  cleanup();
};

document.addEventListener("astro:before-swap", handleBeforeSwap as EventListener);
document.addEventListener("astro:page-load", () => {
  initialize();
  scrollToHashTarget();
});
document.addEventListener(
  "astro:before-preparation",
  handleBeforePreparation as EventListener,
);
window.addEventListener("hashchange", () => {
  syncNavigation(true);
  scrollToHashTarget("smooth");
});
reducedMotion.addEventListener("change", initialize);
desktop.addEventListener("change", initialize);
finePointer.addEventListener("change", initialize);
