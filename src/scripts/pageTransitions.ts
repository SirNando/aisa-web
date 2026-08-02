import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import type { TransitionBeforePreparationEvent } from "astro:transitions/client";

gsap.registerPlugin(ScrollToPlugin);

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopNavQuery = window.matchMedia("(min-width: 64rem)");

const routeIndex = (url: URL) => {
  if (url.pathname === "/") return 0;
  if (url.pathname.startsWith("/familias-y-escuelas")) return 1;
  if (url.pathname.startsWith("/buscar-profesional")) return 2;
  if (url.pathname.startsWith("/profesionales")) return 2;
  if (url.pathname.startsWith("/acerca-de")) return 3;
  return null;
};

const activeNavKey = (url: URL) => {
  if (url.pathname === "/") return "home";
  if (url.pathname.startsWith("/familias-y-escuelas")) return "families";
  if (url.pathname.startsWith("/buscar-profesional")) return "professionals";
  if (url.pathname.startsWith("/profesionales")) return "professionals";
  if (url.pathname.startsWith("/acerca-de")) return "aisa";
  return null;
};

const navigationDirection = (
  from: URL,
  to: URL,
  fallbackDirection: string,
) => {
  const fromIndex = routeIndex(from);
  const toIndex = routeIndex(to);

  if (fromIndex !== null && toIndex !== null && fromIndex !== toIndex) {
    return toIndex > fromIndex ? 1 : -1;
  }

  return fallbackDirection === "back" ? -1 : 1;
};

const desktopNavLink = (key: string) =>
  document.querySelector<HTMLAnchorElement>(
    `[data-desktop-nav] [data-nav-key="${key}"]`,
  );

const desktopNavPillTarget = (key: string) => {
  if (key !== "professionals") return desktopNavLink(key);

  const professionalsMenu = document.querySelector<HTMLElement>(
    "[data-nav-professionals]",
  );
  if (!professionalsMenu) return desktopNavLink(key);

  return professionalsMenu.querySelector<HTMLElement>("[data-nav-pill-target]");
};

const activeProfessionalSection = (url: URL) => {
  if (url.pathname.startsWith("/profesionales/formacion-y-cursos")) {
    return "courses";
  }
  if (url.pathname.startsWith("/profesionales/certificacion")) {
    return "certification";
  }
  if (url.pathname === "/profesionales/" && url.hash === "#solicitud") {
    return "membership";
  }
  return null;
};

const professionalSectionLink = (section: string) =>
  document.querySelector<HTMLAnchorElement>(
    `[data-professional-section="${section}"]`,
  );

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
  const link = section ? professionalSectionLink(section) : null;

  if (!pill || !link || !desktopNavQuery.matches) {
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
  if (animate && !reducedMotionQuery.matches) {
    gsap.to(pill, {
      ...properties,
      duration: type === "active" ? 0.42 : 0.22,
      ease: "power3.out",
    });
  } else {
    gsap.set(pill, properties);
  }
};

const placeNavPill = (key: string | null, animate: boolean) => {
  const pill = document.querySelector<HTMLElement>("[data-nav-pill]");
  const target = key ? desktopNavPillTarget(key) : null;
  const nav = pill?.closest<HTMLElement>("[data-desktop-nav]");

  if (!pill || !target || !nav || !desktopNavQuery.matches) {
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
  if (animate && !reducedMotionQuery.matches) {
    gsap.to(pill, {
      ...properties,
      boxShadow: "0 6px 18px rgb(24 50 58 / 0.12)",
      duration: 0.58,
      ease: "power3.inOut",
    });
  } else {
    gsap.set(pill, {
      ...properties,
      scaleX: 1,
      scaleY: 1,
      boxShadow: "0 6px 18px rgb(24 50 58 / 0.12)",
    });
  }
};

const bounceNavHoverPill = (link: HTMLAnchorElement) => {
  const hoverPill = link.querySelector<HTMLElement>("[data-nav-hover-pill]");
  if (!hoverPill || reducedMotionQuery.matches) return;

  gsap.killTweensOf(hoverPill);
  gsap
    .timeline({
      onComplete: () =>
        gsap.set(hoverPill, {
          clearProps: "transform,opacity,visibility,transition",
        }),
    })
    .set(hoverPill, {
      autoAlpha: 1,
      transformOrigin: "center",
      transition: "none",
    })
    .to(hoverPill, {
      scaleX: 1.08,
      scaleY: 1.14,
      duration: 0.14,
      ease: "power2.out",
    })
    .to(hoverPill, {
      scaleX: 0.99,
      scaleY: 0.98,
      duration: 0.14,
      ease: "power2.inOut",
    })
    .to(hoverPill, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.26,
      ease: "elastic.out(1, 0.5)",
    });
};

const syncNavigation = (animate: boolean) => {
  const currentUrl = new URL(window.location.href);
  const key = activeNavKey(currentUrl);
  const professionalSection = activeProfessionalSection(currentUrl);
  const professionalsMenu = document.querySelector<HTMLElement>(
    "[data-nav-professionals]",
  );

  professionalsMenu?.classList.toggle("is-active", key === "professionals");

  document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]").forEach((link) => {
    const active = link.dataset.navKey === key;
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");

    link.classList.toggle("text-aisa-green-dark", active);
    link.classList.toggle("text-aisa-ink", !active);

    if (link.closest("[data-mobile-menu]")) {
      link.classList.toggle("bg-aisa-leaf-wash", active);
      link.classList.toggle("hover:bg-aisa-mist", !active);
    }
  });

  document
    .querySelectorAll<HTMLAnchorElement>("[data-professional-section]")
    .forEach((link) => {
      const active = link.dataset.professionalSection === professionalSection;
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");

      link.classList.toggle("text-aisa-green-dark", active);
      link.classList.toggle("text-aisa-ink", !active);
    });

  placeNavPill(key, animate);
  placeProfessionalSectionPill(professionalSection, animate, "active");
};

const heroShapes = () =>
  Array.from(document.querySelectorAll<HTMLElement>("[data-hero-shape]")).sort(
    (left, right) =>
      left.getBoundingClientRect().left - right.getBoundingClientRect().left,
  );

let activeFlagTimeline: gsap.core.Timeline | null = null;
let activeStrengthTimeline: gsap.core.Timeline | null = null;

const clearHeroFlagWord = () => {
  activeFlagTimeline?.kill();
  activeFlagTimeline = null;

  const decoratedWord = document.querySelector<HTMLElement>(
    "[data-hero-flag-decorated]",
  );
  if (!decoratedWord) return;

  const title = decoratedWord.closest<HTMLElement>("[data-hero-title]");
  const parent = decoratedWord.parentElement;
  decoratedWord.replaceWith(
    document.createTextNode(decoratedWord.textContent ?? ""),
  );
  parent?.normalize();
  if (title?.dataset.heroFlagAriaLabel === "true") {
    title.removeAttribute("aria-label");
    delete title.dataset.heroFlagAriaLabel;
  }
};

const fadeHeroFlagToNormal = () => {
  const decoratedWord = document.querySelector<HTMLElement>(
    "[data-hero-flag-decorated]",
  );
  if (!decoratedWord) return Promise.resolve();

  activeFlagTimeline?.kill();
  activeFlagTimeline = null;

  return new Promise<void>((resolve) => {
    const finish = () => {
      activeFlagTimeline = null;
      clearHeroFlagWord();
      resolve();
    };

    activeFlagTimeline = gsap
      .timeline({
        onComplete: finish,
        onInterrupt: finish,
      })
      .to(decoratedWord, {
        "--hero-flag-opacity": 0,
        "--hero-flag-glow": 0,
        duration: 0.28,
        ease: "power2.inOut",
      });
  });
};

const decorateHeroFlagWord = (animate: boolean) => {
  clearHeroFlagWord();
  if (!animate) return;

  const title = document.querySelector<HTMLElement>("[data-hero-title]");
  const flagWord = title?.dataset.heroFlagWord?.trim();
  if (!title || !flagWord) return;

  const escapedWord = flagWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordPattern = new RegExp(`(^|\\s)(${escapedWord})(?=\\s|$)`, "u");
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode();

  while (textNode) {
    const text = textNode.textContent ?? "";
    const match = wordPattern.exec(text);

    if (match?.index !== undefined) {
      const wordStart = match.index + match[1].length;
      const wordEnd = wordStart + flagWord.length;
      const decoratedWord = document.createElement("span");
      decoratedWord.className = "hero-flag-word";
      decoratedWord.dataset.heroFlagDecorated = "";
      decoratedWord.dataset.flagLabel = flagWord;
      decoratedWord.setAttribute("aria-hidden", "true");
      decoratedWord.textContent = text.slice(wordStart, wordEnd);

      const replacement = document.createDocumentFragment();
      replacement.append(
        document.createTextNode(text.slice(0, wordStart)),
        decoratedWord,
        document.createTextNode(text.slice(wordEnd)),
      );
      textNode.parentNode?.replaceChild(replacement, textNode);
      title.setAttribute("aria-label", title.textContent?.trim() ?? "");
      title.dataset.heroFlagAriaLabel = "true";

      gsap.set(decoratedWord, {
        "--hero-flag-opacity": 0,
        "--hero-flag-position": "0rem",
        "--hero-flag-glow": 0,
      });

      const waveTimeline = gsap
        .timeline({ repeat: -1 })
        .to(
          decoratedWord,
          {
            "--hero-flag-position": "12rem",
            duration: 1.8,
            ease: "none",
          },
          0,
        );

      activeFlagTimeline = gsap
        .timeline({ delay: 0.12 })
        .add(waveTimeline, 0)
        .to(
          decoratedWord,
          {
            "--hero-flag-opacity": 1,
            duration: 0.22,
            ease: "power2.out",
          },
          0,
        )
        .to(
          decoratedWord,
          {
            "--hero-flag-glow": 0.18,
            duration: 0.34,
            ease: "power2.out",
          },
          0.08,
        );

      return;
    }

    textNode = walker.nextNode();
  }
};

const ensureHeroFlagWordAnimation = () => {
  if (
    reducedMotionQuery.matches ||
    document.querySelector("[data-hero-flag-decorated]")
  ) {
    return;
  }
  decorateHeroFlagWord(true);
};

const clearHeroStrengthWord = () => {
  activeStrengthTimeline?.kill();
  activeStrengthTimeline = null;

  const decoratedWord = document.querySelector<HTMLElement>(
    "[data-hero-strength-decorated]",
  );
  if (!decoratedWord) return;

  const title = decoratedWord.closest<HTMLElement>("[data-hero-title]");
  const parent = decoratedWord.parentElement;
  decoratedWord.replaceWith(
    document.createTextNode(decoratedWord.textContent ?? ""),
  );
  parent?.normalize();
  if (title?.dataset.heroStrengthAriaLabel === "true") {
    title.removeAttribute("aria-label");
    delete title.dataset.heroStrengthAriaLabel;
  }
};

const animateHeroStrengthWord = () => {
  clearHeroStrengthWord();
  if (reducedMotionQuery.matches) return;

  const title = document.querySelector<HTMLElement>("[data-hero-title]");
  const strengthWord = title?.dataset.heroStrengthWord?.trim();
  if (!title || !strengthWord) return;

  const accessibleTitle = title.textContent?.trim() ?? "";
  const escapedWord = strengthWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordPattern = new RegExp(
    `(^|\\s)(${escapedWord})(?=\\s|[.,!?;:]|$)`,
    "u",
  );
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode();

  while (textNode) {
    const text = textNode.textContent ?? "";
    const match = wordPattern.exec(text);

    if (match?.index !== undefined) {
      const wordStart = match.index + match[1].length;
      const wordEnd = wordStart + strengthWord.length;
      const decoratedWord = document.createElement("span");
      decoratedWord.className = "hero-strength-word";
      decoratedWord.dataset.heroStrengthDecorated = "";
      decoratedWord.setAttribute("aria-hidden", "true");

      const chars = Array.from(text.slice(wordStart, wordEnd)).map((char) => {
        const span = document.createElement("span");
        span.className = "hero-strength-char";
        span.textContent = char;
        return span;
      });
      decoratedWord.append(...chars);

      const replacement = document.createDocumentFragment();
      replacement.append(
        document.createTextNode(text.slice(0, wordStart)),
        decoratedWord,
        document.createTextNode(text.slice(wordEnd)),
      );
      textNode.parentNode?.replaceChild(replacement, textNode);
      title.setAttribute("aria-label", accessibleTitle);
      title.dataset.heroStrengthAriaLabel = "true";

      gsap.set(chars, { fontWeight: 800, scaleX: 1, scaleY: 1 });
      activeStrengthTimeline = gsap
        .timeline({
          delay: 0.12,
          onComplete: () => {
            gsap.set([decoratedWord, ...chars], {
              clearProps: "transform,fontWeight,willChange",
            });
            activeStrengthTimeline = null;
          },
        })
        .to(
          decoratedWord,
          {
            scaleX: 1.08,
            scaleY: 1.04,
            duration: 0.22,
            ease: "back.out(2.2)",
          },
          0,
        )
        .to(
          chars,
          {
            fontWeight: 900,
            scaleX: 1.12,
            scaleY: 1.045,
            duration: 0.2,
            stagger: 0.045,
            ease: "back.out(2.8)",
          },
          0.02,
        )
        .to(
          chars,
          {
            fontWeight: 800,
            scaleX: 1,
            scaleY: 1,
            duration: 0.48,
            stagger: 0.035,
            ease: "elastic.out(1, 0.34)",
          },
          0.22,
        )
        .to(
          decoratedWord,
          {
            scaleX: 1,
            scaleY: 1,
            duration: 0.52,
            ease: "elastic.out(1, 0.34)",
          },
          0.2,
        );

      return;
    }

    textNode = walker.nextNode();
  }
};

const heroTextBlocks = () => {
  clearHeroFlagWord();
  clearHeroStrengthWord();
  return [
    document.querySelector<HTMLElement>("[data-hero-eyebrow]"),
    document.querySelector<HTMLElement>("[data-hero-title]"),
    document.querySelector<HTMLElement>("[data-hero-lead]"),
    document.querySelector<HTMLElement>("[data-flip-id='hero-actions']"),
  ].filter((element): element is HTMLElement => element !== null);
};

let currentDirection = 1;
let initialAnimationPlayed = false;
let activeTimeline: gsap.core.Timeline | null = null;
let heroVisualTimeline: gsap.core.Timeline | null = null;
let heroInputTimeline: gsap.core.Timeline | null = null;
let removeHeroInputListeners: (() => void) | null = null;
let restoreHeroScrollBehavior: (() => void) | null = null;
let transitionHeroForNavigation: (() => Promise<void>) | null = null;
let shouldFadeFlagForNavigation = false;

const syncHeroVisualToScroll = () => {
  const hero = document.querySelector<HTMLElement>("[data-page-hero]");
  if (!hero || !heroVisualTimeline || heroInputTimeline) return;
  const progress = gsap.utils.clamp(
    0,
    1,
    window.scrollY / Math.max(hero.offsetHeight, 1),
  );
  if (Math.abs(heroVisualTimeline.progress() - progress) < 0.0001) {
    heroVisualTimeline.progress(progress === 1 ? 0.9999 : 0.0001);
  }
  heroVisualTimeline.progress(progress);
};

const clearHeroScroll = () => {
  const content = document.querySelector<HTMLElement>("[data-hero-content]");
  const scrollContent = document.querySelector<HTMLElement>(
    "[data-hero-scroll-content]",
  );
  const curve = document.querySelector<SVGElement>(".orbit-hero__curve");
  const shapes = heroShapes();

  removeHeroInputListeners?.();
  removeHeroInputListeners = null;
  transitionHeroForNavigation = null;
  heroInputTimeline?.kill();
  heroInputTimeline = null;
  restoreHeroScrollBehavior?.();
  restoreHeroScrollBehavior = null;
  heroVisualTimeline?.kill();
  heroVisualTimeline = null;

  gsap.set([content, scrollContent, curve, ...shapes].filter(Boolean), {
    clearProps: "transform,opacity,visibility,borderRadius,transformOrigin",
  });
};

const initializeHeroScroll = () => {
  clearHeroScroll();
  if (reducedMotionQuery.matches) return;

  const hero = document.querySelector<HTMLElement>("[data-page-hero]");
  const scrollContent = document.querySelector<HTMLElement>(
    "[data-hero-scroll-content]",
  );
  const scrollSnapLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-hero-scroll-snap]"),
  );
  const curve = document.querySelector<SVGElement>(".orbit-hero__curve");
  const shapes = heroShapes();

  if (!hero || !scrollContent) return;

  heroVisualTimeline = gsap
    .timeline({
      paused: true,
      defaults: { ease: "none" },
    })
    .to(
      scrollContent,
      {
        scale: 0.78,
        duration: 1,
      },
      0,
    );

  if (shapes.length > 0) {
    heroVisualTimeline.to(
      shapes,
      {
        scale: 0.68,
        duration: 0.9,
        stagger: 0.018,
      },
      0,
    );
  }

  if (curve) {
    heroVisualTimeline.to(
      curve,
      {
        scaleY: 1.08,
        transformOrigin: "50% 0%",
        duration: 1,
      },
      0,
    );
  }

  const boundary = () => hero.offsetHeight;
  const syncVisualState = () => syncHeroVisualToScroll();

  const transitionTo = (showContent: boolean, force = false) => {
    if (!heroVisualTimeline) return Promise.resolve();
    if (heroInputTimeline) {
      if (!force) return Promise.resolve();
      heroInputTimeline.kill();
      heroInputTimeline = null;
      restoreHeroScrollBehavior?.();
    }

    const targetProgress = showContent ? 1 : 0;
    const targetY = showContent ? boundary() : 0;
    if (
      Math.abs(heroVisualTimeline.progress() - targetProgress) < 0.0001 &&
      Math.abs(window.scrollY - targetY) < 1
    ) {
      return Promise.resolve();
    }

    const duration = 0.9;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    restoreHeroScrollBehavior = () => {
      root.style.scrollBehavior = previousScrollBehavior;
      restoreHeroScrollBehavior = null;
    };
    return new Promise<void>((resolve) => {
      heroInputTimeline = gsap
        .timeline({
          defaults: { duration, ease: "power3.inOut" },
          onComplete: () => {
            heroInputTimeline = null;
            heroVisualTimeline?.progress(targetProgress);
            restoreHeroScrollBehavior?.();
            resolve();
          },
          onInterrupt: () => {
            heroInputTimeline = null;
            restoreHeroScrollBehavior?.();
            resolve();
          },
        })
        .to(heroVisualTimeline!, { progress: targetProgress }, 0)
        .to(
          window,
          {
            scrollTo: {
              y: targetY,
              autoKill: false,
            },
          },
          0,
        );
    });
  };

  transitionHeroForNavigation = () => transitionTo(false, true);

  const onScrollSnapClick = (event: MouseEvent) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const link = event.currentTarget;
    if (!(link instanceof HTMLAnchorElement) || !link.hash) return;

    event.preventDefault();
    void transitionTo(true, true).then(() => {
      if (window.location.hash !== link.hash) {
        window.history.pushState(null, "", link.hash);
      }
    });
  };

  const shouldMoveToContent = (delta: number) =>
    delta > 0 && window.scrollY < boundary() - 1;
  const shouldMoveToHero = (delta: number) =>
    delta < 0 &&
    (window.scrollY <= boundary() + 2 ||
      window.scrollY + delta <= boundary());

  const onWheel = (event: WheelEvent) => {
    if (heroInputTimeline) {
      event.preventDefault();
      return;
    }

    if (shouldMoveToContent(event.deltaY)) {
      event.preventDefault();
      transitionTo(true);
    } else if (shouldMoveToHero(event.deltaY)) {
      event.preventDefault();
      transitionTo(false);
    }
  };

  let touchStartY: number | null = null;
  const onTouchStart = (event: TouchEvent) => {
    touchStartY = event.touches[0]?.clientY ?? null;
  };
  const onTouchMove = (event: TouchEvent) => {
    const currentY = event.touches[0]?.clientY;
    if (heroInputTimeline) {
      event.preventDefault();
      return;
    }
    if (touchStartY === null || currentY === undefined) return;

    const delta = touchStartY - currentY;
    if (Math.abs(delta) < 2) return;
    touchStartY = currentY;

    if (shouldMoveToContent(delta)) {
      event.preventDefault();
      transitionTo(true);
    } else if (shouldMoveToHero(delta)) {
      event.preventDefault();
      transitionTo(false);
    }
  };
  const onTouchEnd = () => {
    touchStartY = null;
  };

  const scrollingKeys = new Set([
    "ArrowDown",
    "ArrowUp",
    "PageDown",
    "PageUp",
    " ",
    "Home",
    "End",
  ]);
  const onKeyDown = (event: KeyboardEvent) => {
    if (!scrollingKeys.has(event.key)) return;
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        ["BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(target.tagName))
    ) {
      return;
    }

    if (heroInputTimeline) {
      event.preventDefault();
      return;
    }

    const delta =
      event.key === "ArrowUp" ||
      event.key === "PageUp" ||
      event.key === "Home" ||
      (event.key === " " && event.shiftKey)
        ? -1
        : 1;

    if (shouldMoveToContent(delta)) {
      event.preventDefault();
      transitionTo(true);
    } else if (shouldMoveToHero(delta)) {
      event.preventDefault();
      transitionTo(false);
    }
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("scroll", syncVisualState, { passive: true });
  document.addEventListener("keydown", onKeyDown);
  scrollSnapLinks.forEach((link) => link.addEventListener("click", onScrollSnapClick));

  removeHeroInputListeners = () => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("scroll", syncVisualState);
    document.removeEventListener("keydown", onKeyDown);
    scrollSnapLinks.forEach((link) => link.removeEventListener("click", onScrollSnapClick));
  };

  syncVisualState();
};

const stopActiveTimeline = () => {
  activeTimeline?.kill();
  activeTimeline = null;
};

const timelineFinished = (timeline: gsap.core.Timeline) =>
  new Promise<void>((resolve) => {
    timeline.eventCallback("onComplete", resolve);
    timeline.eventCallback("onInterrupt", resolve);
  });

const clearHeroAnimationStyles = (elements: HTMLElement[]) => {
  if (elements.length === 0) return;
  gsap.set(elements, {
    clearProps: "transform,opacity,visibility,willChange",
  });
};

const animateInitialHero = () => {
  if (reducedMotionQuery.matches) {
    decorateHeroFlagWord(false);
    clearHeroStrengthWord();
    syncNavigation(false);
    return;
  }

  stopActiveTimeline();
  const hero = document.querySelector<HTMLElement>("[data-page-hero]");
  const shapes = heroShapes();
  const textBlocks = heroTextBlocks();
  const animatedElements = [...shapes, ...textBlocks];
  const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  activeTimeline = timeline;

  gsap.set(animatedElements, {
    willChange: "transform,opacity",
    force3D: true,
  });

  if (hero && shapes.length > 0) {
    const heroBounds = hero.getBoundingClientRect();
    const centerX = heroBounds.left + heroBounds.width / 2;
    const centerY = heroBounds.top + heroBounds.height / 2;

    shapes.forEach((shape) => {
      const bounds = shape.getBoundingClientRect();
      gsap.set(shape, {
        x: centerX - (bounds.left + bounds.width / 2),
        y: centerY - (bounds.top + bounds.height / 2),
        scale: 0.18,
        autoAlpha: 0,
        force3D: true,
      });
    });

    timeline.to(
      shapes,
      {
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.72,
        stagger: 0.035,
        force3D: true,
      },
      0,
    );
  }

  if (textBlocks.length > 0) {
    timeline.fromTo(
      textBlocks,
      { y: 18, autoAlpha: 0, force3D: true },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.46,
        stagger: 0.055,
        force3D: true,
      },
      0.23,
    );
  }

  timeline.eventCallback("onComplete", () => {
    decorateHeroFlagWord(true);
    animateHeroStrengthWord();
    clearHeroAnimationStyles(animatedElements);
    activeTimeline = null;
    syncHeroVisualToScroll();
  });
};

const animatePageOut = (direction: number) => {
  if (reducedMotionQuery.matches) {
    return { finished: Promise.resolve(), restore: () => undefined };
  }

  stopActiveTimeline();
  const shapes = heroShapes();
  const textBlocks = heroTextBlocks();
  const animatedElements = [...shapes, ...textBlocks];
  const orderedShapes = direction > 0 ? shapes : [...shapes].reverse();
  const timeline = gsap.timeline({ defaults: { ease: "power2.inOut" } });
  activeTimeline = timeline;

  gsap.set(animatedElements, {
    willChange: "transform,opacity",
    force3D: true,
  });

  if (orderedShapes.length > 0) {
    timeline.to(
      orderedShapes,
      {
        x: () => direction * Math.min(window.innerWidth * 0.22, 320),
        scale: 0.92,
        autoAlpha: 0,
        duration: 0.36,
        stagger: 0.018,
        force3D: true,
      },
      0,
    );
  }
  if (textBlocks.length > 0) {
    timeline.to(
      textBlocks,
      {
        x: direction * 22,
        y: -6,
        autoAlpha: 0,
        duration: 0.26,
        stagger: 0.02,
        force3D: true,
      },
      0.02,
    );
  }

  const restore = () => {
    timeline.kill();
    decorateHeroFlagWord(!reducedMotionQuery.matches);
    animateHeroStrengthWord();
    clearHeroAnimationStyles(animatedElements);
    activeTimeline = null;
  };

  return { finished: timelineFinished(timeline), restore };
};

const animatePageIn = (direction: number) => {
  stopActiveTimeline();
  const shapes = heroShapes();
  const textBlocks = heroTextBlocks();
  const animatedElements = [...shapes, ...textBlocks];

  if (reducedMotionQuery.matches) {
    clearHeroAnimationStyles(animatedElements);
    decorateHeroFlagWord(false);
    clearHeroStrengthWord();
    syncNavigation(false);
    return;
  }

  const orderedShapes = direction > 0 ? shapes : [...shapes].reverse();
  const travel = Math.min(window.innerWidth * 0.22, 320);
  const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  activeTimeline = timeline;

  gsap.set(animatedElements, {
    willChange: "transform,opacity",
    force3D: true,
  });

  if (orderedShapes.length > 0) {
    gsap.set(orderedShapes, {
      x: -direction * travel,
      scale: 0.92,
      autoAlpha: 0,
      force3D: true,
    });

    timeline.to(
      orderedShapes,
      {
        x: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.46,
        stagger: 0.018,
        force3D: true,
      },
      0,
    );
  }
  if (textBlocks.length > 0) {
    gsap.set(textBlocks, {
      x: -direction * 22,
      y: 8,
      autoAlpha: 0,
      force3D: true,
    });

    timeline.to(
      textBlocks,
      {
        x: 0,
        y: 0,
        autoAlpha: 1,
        duration: 0.38,
        stagger: 0.045,
        force3D: true,
      },
      0.08,
    );
  }

  timeline.eventCallback("onComplete", () => {
    decorateHeroFlagWord(true);
    animateHeroStrengthWord();
    clearHeroAnimationStyles(animatedElements);
    activeTimeline = null;
    syncHeroVisualToScroll();
  });
};

document.addEventListener(
  "click",
  (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest<HTMLAnchorElement>(
      "[data-nav-link], [data-nav-target-link]",
    );
    if (!link) return;

    const key = link.dataset.navKey ?? null;
    const currentUrl = new URL(window.location.href);
    const professionalsMenu = document.querySelector<HTMLElement>(
      "[data-nav-professionals]",
    );
    if (!professionalsMenu?.classList.contains("is-active")) {
      document.dispatchEvent(new Event("professionals-menu-close"));
    }

    const targetUrl = new URL(link.href, currentUrl);
    const isCurrentLocation =
      currentUrl.pathname === targetUrl.pathname &&
      currentUrl.search === targetUrl.search &&
      currentUrl.hash === targetUrl.hash;

    document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]").forEach((item) => {
      if (item.dataset.navKey === key) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    const professionalSection = link.dataset.professionalSection ?? null;
    if (professionalSection) {
      placeProfessionalSectionPill(professionalSection, true, "active");
    }
    placeNavPill(key, true);
    bounceNavHoverPill(link);

    if (isCurrentLocation) {
      event.preventDefault();
      event.stopPropagation();
      if (key === "home") {
        const returnToHero = transitionHeroForNavigation;
        if (returnToHero) {
          void returnToHero().then(ensureHeroFlagWordAnimation);
        } else {
          ensureHeroFlagWordAnimation();
        }
      }
      return;
    }

    shouldFadeFlagForNavigation = Boolean(
      document.querySelector("[data-hero-flag-decorated]"),
    );
  },
  true,
);

document.addEventListener("pointerover", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const link = target?.closest<HTMLAnchorElement>("[data-professional-section]");
  if (link) {
    placeProfessionalSectionPill(
      link.dataset.professionalSection ?? null,
      true,
      "hover",
    );
  }
});

document.addEventListener("pointerout", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const link = target?.closest<HTMLAnchorElement>("[data-professional-section]");
  const nextTarget = event.relatedTarget;

  if (link && nextTarget instanceof Node && link.contains(nextTarget)) return;
  if (link) placeProfessionalSectionPill(null, false, "hover");
});

document.addEventListener("professionals-menu-change", (event) => {
  const key = activeNavKey(new URL(window.location.href));
  if (key === "professionals") placeNavPill(key, true);
  const menuChange = event as CustomEvent<{ open?: boolean }>;
  if (!menuChange.detail?.open) {
    placeProfessionalSectionPill(null, false, "hover");
  }
});

const scrollImmediatelyToHero = () => {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousScrollBehavior;
};

document.addEventListener("astro:before-preparation", (rawEvent) => {
  const event = rawEvent as TransitionBeforePreparationEvent;
  currentDirection = navigationDirection(event.from, event.to, event.direction);
  const outgoingHero = document.querySelector<HTMLElement>("[data-page-hero]");
  const shouldReturnToHero = outgoingHero !== null && window.scrollY > 1;
  const returnToHero = transitionHeroForNavigation;
  const shouldFadeFlag = shouldFadeFlagForNavigation;
  shouldFadeFlagForNavigation = false;
  const originalLoader = event.loader;

  event.loader = async () => {
    if (shouldReturnToHero) {
      if (returnToHero) await returnToHero();
      else scrollImmediatelyToHero();
    }

    if (shouldFadeFlag) await fadeHeroFlagToNormal();

    clearHeroScroll();
    const outgoing = animatePageOut(currentDirection);
    const [loadResult] = await Promise.allSettled([
      originalLoader(),
      outgoing.finished,
    ]);

    if (loadResult.status === "rejected") {
      if (!event.signal.aborted) {
        outgoing.restore();
        initializeHeroScroll();
      }
      throw loadResult.reason;
    }
  };
});

document.addEventListener("astro:after-swap", () => {
  animatePageIn(currentDirection);
});

document.addEventListener("astro:page-load", () => {
  syncNavigation(false);
  requestAnimationFrame(() => {
    initializeHeroScroll();
  });
});

window.addEventListener("hashchange", () => syncNavigation(true));
window.addEventListener("popstate", () => syncNavigation(true));
window.addEventListener("resize", () => syncNavigation(false), { passive: true });
reducedMotionQuery.addEventListener("change", () => {
  initializeHeroScroll();
  if (reducedMotionQuery.matches) {
    clearHeroFlagWord();
    clearHeroStrengthWord();
  }
});

const initialize = () => {
  syncNavigation(false);
  initializeHeroScroll();
  if (initialAnimationPlayed) return;
  initialAnimationPlayed = true;
  animateInitialHero();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  initialize();
}
