import { useEffect } from "react";

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

    const cleanupFns: Array<() => void> = [];
    const tracks = Array.from(
      document.querySelectorAll<HTMLElement>("[data-carousel-track]")
    );

    tracks.forEach((track) => {
      const indicators = track.nextElementSibling as HTMLElement | null;

      if (!indicators?.hasAttribute("data-carousel-dots")) return;

      const dots = Array.from(
        indicators.querySelectorAll<HTMLButtonElement>("button")
      );
      const cards = Array.from(track.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement
      );

      if (!dots.length || !cards.length) return;

      let ticking = false;

      const update = () => {
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
      };

      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      };

      track.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", update);

      cleanupFns.push(() => {
        track.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", update);
      });

      dots.forEach((dot, index) => {
        const onClick = () => {
          const target = cards[index];
          if (!target) return;
          track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
        };

        dot.addEventListener("click", onClick);
        cleanupFns.push(() => dot.removeEventListener("click", onClick));
      });

      update();
    });

    return () => {
      observer?.disconnect();
      cleanupFns.forEach((fn) => fn());
    };
  }, []);
}
