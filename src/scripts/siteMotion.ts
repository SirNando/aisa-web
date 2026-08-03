import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktop = window.matchMedia("(min-width: 64rem)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

let motionContext: gsap.Context | null = null;
let listenerCleanups: Array<() => void> = [];

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
  motionContext?.revert();
  motionContext = null;
  gsap.killTweensOf(
    "[data-mobile-menu], [data-mobile-menu] a, [data-menu-line], .site-header__shell",
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
  document.querySelectorAll<HTMLElement>(".site-nav__group").forEach((group) => {
    const toggle = group.querySelector<HTMLAnchorElement>(".site-nav__toggle");
    const dropdownLinks = Array.from(
      group.querySelectorAll<HTMLAnchorElement>(".site-nav__dropdown a"),
    );
    if (!toggle) return;

    const dismiss = () => {
      group.classList.add("is-dismissed");
      const active = document.activeElement;
      if (active instanceof HTMLElement && group.contains(active)) active.blur();
    };

    addListener(group, "pointerleave", () => group.classList.remove("is-dismissed"));
    addListener(group, "focusin", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches(":focus-visible")) {
        group.classList.remove("is-dismissed");
      }
    });
    addListener(toggle, "click", dismiss);
    dropdownLinks.forEach((link) => addListener(link, "click", dismiss));
    addListener(group, "keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      toggle.focus();
      group.classList.add("is-dismissed");
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
    const onMove = (event: PointerEvent) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      gsap.to(card, {
        rotationX: y * -3.5,
        rotationY: x * 3.5,
        transformPerspective: 900,
        transformOrigin: "center",
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    const reset = () => gsap.to(card, {
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

const initialize = () => {
  cleanup();
  setupMenu();
  setupDesktopNavigation();
  setupRails();
  setupTiltCards();

  motionContext = gsap.context(() => {
    const hero = document.querySelector<HTMLElement>("[data-page-hero]");
    const heroContent = hero?.querySelector<HTMLElement>("[data-hero-content]");
    const heroShapes = hero ? Array.from(hero.querySelectorAll<HTMLElement>(".page-hero__shape")) : [];
    const headerShell = document.querySelector<HTMLElement>(".site-header__shell");

    if (reducedMotion.matches) {
      gsap.set("[data-reveal], [data-reveal-item], main .surface-card, main section h2", {
        clearProps: "all",
        autoAlpha: 1,
      });
      return;
    }

    if (hero && heroContent) {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(heroContent.children, { autoAlpha: 0, y: 36 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.09,
          clearProps: "transform,opacity,visibility",
        })
        .fromTo(heroShapes, { autoAlpha: 0, scale: 0.78 }, {
          autoAlpha: 1,
          scale: 1,
          duration: 1.1,
          stagger: 0.08,
          ease: "back.out(1.35)",
          clearProps: "opacity,visibility",
        }, 0.08);

      heroShapes.forEach((shape, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        gsap.to(shape, {
          x: direction * (finePointer.matches ? 12 + index * 2 : 6 + index),
          y: direction * (8 + index * 1.5),
          rotation: direction * (1.8 + index * 0.45),
          duration: 5.5 + index * 0.85,
          delay: 0.35 + index * 0.12,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }

    if (headerShell) {
      gsap.fromTo(
        headerShell,
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
    }

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
            autoAlpha: 0.62,
            filter: "saturate(0.75)",
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

document.addEventListener("astro:before-swap", cleanup);
document.addEventListener("astro:page-load", initialize);
reducedMotion.addEventListener("change", initialize);
desktop.addEventListener("change", initialize);
