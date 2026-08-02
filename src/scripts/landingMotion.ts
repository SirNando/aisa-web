import { gsap } from "gsap";

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(pointer: fine)");

let cleanupLandingMotion: (() => void) | null = null;

const addListener = <K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
) => {
  target.addEventListener(type, listener as EventListener);
  return () => target.removeEventListener(type, listener as EventListener);
};

const observeOnce = (
  target: Element,
  onEnter: () => void,
  resetElements: HTMLElement[],
) => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      onEnter();
    },
    { threshold: 0.18 },
  );

  observer.observe(target);

  return () => {
    observer.disconnect();
    gsap.killTweensOf(resetElements);
    gsap.set(resetElements, {
      clearProps: "clipPath,opacity,transform,visibility,willChange",
    });
  };
};

const setupHeroMotion = (cleanups: Array<() => void>) => {
  const hero = document.querySelector<HTMLElement>("[data-landing-hero]");
  const stage = hero?.querySelector<HTMLElement>("[data-hero-stage]");
  const floats = hero
    ? Array.from(hero.querySelectorAll<HTMLElement>("[data-hero-float]"))
    : [];

  if (!hero || !stage || floats.length === 0 || reducedMotionQuery.matches) return;

  const breathingTweens = floats.map((float, index) =>
    gsap.to(float, {
      scale: index % 2 === 0 ? 1.018 : 1.012,
      rotation: index % 2 === 0 ? 0.8 : -0.8,
      duration: 3.8 + index * 0.32,
      delay: index * 0.16,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    }),
  );

  const removeBreathing = () => {
    breathingTweens.forEach((tween) => tween.kill());
    gsap.set(floats, { clearProps: "transform,willChange" });
  };
  cleanups.push(removeBreathing);

  if (!finePointerQuery.matches) return;

  const xSetters = floats.map((float) =>
    gsap.quickTo(float, "x", { duration: 0.62, ease: "power3.out" }),
  );
  const ySetters = floats.map((float) =>
    gsap.quickTo(float, "y", { duration: 0.62, ease: "power3.out" }),
  );

  const onPointerMove = (event: PointerEvent) => {
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2);
    const y = (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2);

    floats.forEach((_, index) => {
      const depth = 0.35 + (index % 3) * 0.14;
      xSetters[index]?.(x * 9 * depth);
      ySetters[index]?.(y * 7 * depth);
    });
  };

  const onPointerLeave = () => {
    xSetters.forEach((setX) => setX(0));
    ySetters.forEach((setY) => setY(0));
  };

  cleanups.push(addListener(stage, "pointermove", onPointerMove));
  cleanups.push(addListener(stage, "pointerleave", onPointerLeave));
};

const setupMagneticButtons = (cleanups: Array<() => void>) => {
  if (reducedMotionQuery.matches || !finePointerQuery.matches) return;

  const hero = document.querySelector<HTMLElement>("[data-landing-hero]");
  const buttons = hero
    ? Array.from(hero.querySelectorAll<HTMLAnchorElement>("[data-hero-cta-text]"))
        .map((text) => text.closest<HTMLAnchorElement>("a"))
        .filter((button): button is HTMLAnchorElement => button !== null)
    : [];

  buttons.forEach((button) => {
    const text = button.querySelector<HTMLElement>("[data-hero-cta-text]");
    const xSet = gsap.quickTo(button, "x", { duration: 0.36, ease: "power3.out" });
    const ySet = gsap.quickTo(button, "y", { duration: 0.36, ease: "power3.out" });
    const textXSet = text
      ? gsap.quickTo(text, "x", { duration: 0.32, ease: "power3.out" })
      : null;

    const onPointerMove = (event: PointerEvent) => {
      const bounds = button.getBoundingClientRect();
      const x = (event.clientX - (bounds.left + bounds.width / 2)) / bounds.width;
      const y = (event.clientY - (bounds.top + bounds.height / 2)) / bounds.height;
      xSet(x * 12);
      ySet(y * 9);
      textXSet?.(x * 5);
    };

    const onPointerLeave = () => {
      xSet(0);
      ySet(0);
      textXSet?.(0);
    };

    cleanups.push(addListener(button, "pointermove", onPointerMove));
    cleanups.push(addListener(button, "pointerleave", onPointerLeave));
    cleanups.push(() => {
      gsap.killTweensOf([button, text].filter(Boolean));
      gsap.set([button, text].filter(Boolean), { clearProps: "transform,willChange" });
    });
  });
};

const setupJourneyCards = (cleanups: Array<() => void>) => {
  const grid = document.querySelector<HTMLElement>("[data-landing-journeys]");
  const cards = grid
    ? Array.from(grid.querySelectorAll<HTMLElement>("[data-journey-card]"))
    : [];

  if (!grid || cards.length === 0) return;

  if (!reducedMotionQuery.matches) {
    const startingRotations = [-2.2, 0, 2.2];
    gsap.set(cards, {
      autoAlpha: 0,
      y: 34,
      rotate: (index) => startingRotations[index % startingRotations.length],
      willChange: "transform,opacity",
    });

    cleanups.push(
      observeOnce(
        grid,
        () => {
          gsap.to(cards, {
            autoAlpha: 1,
            y: 0,
            rotate: 0,
            duration: 0.72,
            stagger: 0.12,
            ease: "back.out(1.35)",
            clearProps: "willChange",
          });
        },
        cards,
      ),
    );
  }

  if (!finePointerQuery.matches || reducedMotionQuery.matches) return;

  cards.forEach((card) => {
    const resetCard = () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        y: 0,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
      card.style.setProperty("--journey-spot-opacity", "0");
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const normalizedX = x / bounds.width - 0.5;
      const normalizedY = y / bounds.height - 0.5;

      card.style.setProperty("--journey-spot-x", `${x}px`);
      card.style.setProperty("--journey-spot-y", `${y}px`);
      card.style.setProperty("--journey-spot-opacity", "1");
      gsap.to(card, {
        rotationX: normalizedY * -5,
        rotationY: normalizedX * 5,
        scale: 1.012,
        duration: 0.34,
        transformPerspective: 900,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const onPointerLeave = () => resetCard();
    const onFocusIn = () => {
      card.style.setProperty("--journey-spot-x", "50%");
      card.style.setProperty("--journey-spot-y", "50%");
      card.style.setProperty("--journey-spot-opacity", "1");
      gsap.to(card, {
        y: -3,
        scale: 1.008,
        duration: 0.28,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    const onFocusOut = (event: FocusEvent) => {
      if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return;
      resetCard();
    };

    cleanups.push(addListener(card, "pointermove", onPointerMove));
    cleanups.push(addListener(card, "pointerleave", onPointerLeave));
    cleanups.push(addListener(card, "focusin", onFocusIn));
    cleanups.push(addListener(card, "focusout", onFocusOut));
    cleanups.push(() => {
      gsap.killTweensOf(card);
      gsap.set(card, { clearProps: "transform,willChange" });
      card.style.removeProperty("--journey-spot-x");
      card.style.removeProperty("--journey-spot-y");
      card.style.removeProperty("--journey-spot-opacity");
    });
  });
};

const setupCallout = (cleanups: Array<() => void>) => {
  const callout = document.querySelector<HTMLElement>('[data-motion="landing-callout"]');
  if (!callout || reducedMotionQuery.matches) return;

  const content = Array.from(callout.querySelectorAll<HTMLElement>("h2, p, a"));
  gsap.set(callout, {
    autoAlpha: 0,
    y: 24,
    clipPath: "inset(0 0 100% 0 round 2rem)",
    willChange: "clip-path,transform,opacity",
  });
  gsap.set(content, { autoAlpha: 0, y: 16, willChange: "transform,opacity" });

  cleanups.push(
    observeOnce(
      callout,
      () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .to(callout, {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0 0 0% 0 round 2rem)",
            duration: 0.72,
          })
          .to(
            content,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.42,
              stagger: 0.06,
              clearProps: "willChange",
            },
            "-=0.34",
          )
          .set(callout, { clearProps: "clipPath,willChange" });
      },
      [callout, ...content],
    ),
  );
};

const setupFooter = (cleanups: Array<() => void>) => {
  const footer = document.querySelector<HTMLElement>("#aisa");
  const container = footer?.querySelector<HTMLElement>(":scope > .site-container");
  const columns = container ? Array.from(container.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  ) : [];

  if (!footer || !container || columns.length === 0 || reducedMotionQuery.matches) return;

  gsap.set(columns, { autoAlpha: 0, y: 24, willChange: "transform,opacity" });
  cleanups.push(
    observeOnce(
      footer,
      () => {
        gsap.to(columns, {
          autoAlpha: 1,
          y: 0,
          duration: 0.56,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "willChange",
        });
      },
      columns,
    ),
  );

  if (!finePointerQuery.matches) return;

  footer.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
    const onPointerEnter = () => {
      gsap.to(link, { x: 4, duration: 0.22, ease: "power2.out", overwrite: "auto" });
    };
    const onPointerLeave = () => {
      gsap.to(link, { x: 0, duration: 0.28, ease: "power2.out", overwrite: "auto" });
    };

    cleanups.push(addListener(link, "pointerenter", onPointerEnter));
    cleanups.push(addListener(link, "pointerleave", onPointerLeave));
    cleanups.push(() => {
      gsap.killTweensOf(link);
      gsap.set(link, { clearProps: "transform" });
    });
  });
};

const initialize = () => {
  cleanupLandingMotion?.();

  const cleanups: Array<() => void> = [];
  const landingPage = document.querySelector("[data-landing-hero]");
  if (!landingPage) {
    cleanupLandingMotion = null;
    return;
  }

  setupHeroMotion(cleanups);
  setupMagneticButtons(cleanups);
  setupJourneyCards(cleanups);
  setupCallout(cleanups);
  setupFooter(cleanups);

  cleanupLandingMotion = () => {
    cleanups.splice(0).forEach((cleanup) => cleanup());
  };
};

document.addEventListener("astro:before-swap", () => cleanupLandingMotion?.());
document.addEventListener("astro:page-load", initialize);
reducedMotionQuery.addEventListener("change", initialize);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  initialize();
}
