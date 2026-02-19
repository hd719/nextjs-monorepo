import { useEffect } from "react";

const MOBILE_CAROUSEL_QUERY = "(max-width: 768px)";

function updateCarouselDots(
  track: HTMLElement,
  cards: HTMLElement[],
  dots: HTMLButtonElement[]
) {
  const scrollLeft = track.scrollLeft;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const distance = Math.abs(card.offsetLeft - scrollLeft);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  dots.forEach((dot, index) => {
    const isActive = index === closestIndex;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function setupCarouselTrack(track: HTMLElement): () => void {
  const indicators = track.nextElementSibling as HTMLElement | null;
  if (!indicators?.hasAttribute("data-carousel-dots")) return () => {};

  const dots = Array.from(indicators.querySelectorAll<HTMLButtonElement>("button"));
  const cards = Array.from(track.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement
  );

  if (!dots.length || cards.length <= 1) return () => {};

  const isScrollable = track.scrollWidth - track.clientWidth > 4;
  if (!isScrollable) {
    dots.forEach((dot, index) => {
      const isActive = index === 0;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
    return () => {};
  }

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateCarouselDots(track, cards, dots);
      ticking = false;
    });
  };

  const onResize = () => updateCarouselDots(track, cards, dots);

  track.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  const removeDotListeners = dots.map((dot, index) => {
    const onClick = () => {
      const target = cards[index];
      if (!target) return;
      track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    };

    dot.addEventListener("click", onClick);
    return () => dot.removeEventListener("click", onClick);
  });

  updateCarouselDots(track, cards, dots);

  return () => {
    track.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    removeDotListeners.forEach((remove) => remove());
  };
}

export function useLandingInteractions() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    let observer: IntersectionObserver | null = null;

    if (elements.length) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      elements.forEach((element) => observer?.observe(element));
    }

    const tracks = Array.from(
      document.querySelectorAll<HTMLElement>("[data-carousel-track]")
    );
    const media = window.matchMedia(MOBILE_CAROUSEL_QUERY);

    let carouselCleanupFns: Array<() => void> = [];

    const setupCarousels = () => {
      carouselCleanupFns.forEach((cleanup) => cleanup());
      carouselCleanupFns = [];

      if (!media.matches) return;

      tracks.forEach((track) => {
        carouselCleanupFns.push(setupCarouselTrack(track));
      });
    };

    const onMediaChange = () => {
      setupCarousels();
    };

    setupCarousels();
    media.addEventListener("change", onMediaChange);

    return () => {
      media.removeEventListener("change", onMediaChange);
      observer?.disconnect();
      carouselCleanupFns.forEach((cleanup) => cleanup());
    };
  }, []);
}
