type CarouselIndicatorsProps = {
  ariaLabel: string;
  labels: string[];
};

export function CarouselIndicators({ ariaLabel, labels }: CarouselIndicatorsProps) {
  return (
    <div
      className="carousel-indicators"
      data-carousel-dots
      aria-label={ariaLabel}
    >
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          className={index === 0 ? "is-active" : undefined}
          aria-current={index === 0 ? "true" : "false"}
        />
      ))}
    </div>
  );
}
