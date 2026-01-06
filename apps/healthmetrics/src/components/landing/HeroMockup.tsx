/**
 * HeroMockup Component
 *
 * An animated visual showcase for the landing page hero section.
 * Features:
 * - A "phone frame" displaying an animated dashboard preview
 * - Floating fitness icons that orbit around the mockup
 * - Animated stats (calorie ring, progress bars, counting numbers)
 * - Parallax-like depth with staggered animations
 */

import { useEffect, useState, useRef } from "react";
import {
  Apple,
  Dumbbell,
  Droplets,
  Heart,
  Flame,
  TrendingUp,
  Activity,
} from "lucide-react";

/**
 * AnimatedNumber Component
 *
 * Animates a number from 0 to a target value.
 * Uses requestAnimationFrame for smooth 60fps animation.
 *
 * @param value - The target number to animate to
 * @param duration - How long the animation takes (in ms)
 * @param suffix - Optional suffix like "cal" or "g"
 */
function AnimatedNumber({
  value,
  duration = 2000,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const animationFrame = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Reset and start animation when value changes
    startTime.current = null;

    const animate = (timestamp: number) => {
      // Initialize start time on first frame
      if (!startTime.current) {
        startTime.current = timestamp;
      }

      // Calculate progress (0 to 1)
      const progress = Math.min((timestamp - startTime.current) / duration, 1);

      // Use easeOutQuart for smooth deceleration at the end
      // This makes numbers "settle" naturally rather than stopping abruptly
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      // Update display value
      setDisplayValue(Math.floor(easeOutQuart * value));

      // Continue animation if not complete
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    // Start the animation
    animationFrame.current = requestAnimationFrame(animate);

    // Cleanup: cancel animation if component unmounts
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value, duration]);

  return (
    <span>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

/**
 * CircularProgress Component
 *
 * An SVG-based circular progress ring that animates from 0 to a percentage.
 * Uses stroke-dasharray and stroke-dashoffset for the fill effect.
 *
 * @param percentage - Fill percentage (0-100)
 * @param size - Diameter of the circle in pixels
 * @param strokeWidth - Thickness of the ring
 * @param color - CSS color for the progress fill
 */
function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = "var(--accent)",
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  // Calculate SVG circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // The offset determines how much of the circle is "hidden"
  // At 0% offset = circumference (fully hidden)
  // At 100% offset = 0 (fully visible)
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="hero-mockup-ring">
      {/* Background circle (the grey track) */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      {/* Foreground circle (the colored progress) */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        // These properties create the animation effect:
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        // Rotate -90deg so progress starts from top instead of right
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="hero-mockup-ring-progress"
      />
    </svg>
  );
}

/**
 * FloatingIcon Component
 *
 * A single floating icon with customizable position and animation delay.
 * The delay creates a staggered "wave" effect when multiple icons float.
 *
 * @param icon - Lucide icon component to render
 * @param className - Position class (top-left, top-right, etc.)
 * @param delay - Animation delay in seconds for stagger effect
 */
function FloatingIcon({
  icon: Icon,
  className,
  delay = 0,
}: {
  icon: typeof Apple;
  className: string;
  delay?: number;
}) {
  return (
    <div
      className={`hero-floating-icon ${className}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden="true" // Decorative, hide from screen readers
    >
      <Icon className="hero-floating-icon-svg" />
    </div>
  );
}

/**
 * Main HeroMockup Component
 *
 * Assembles all the pieces:
 * 1. Floating fitness icons around the edges
 * 2. A phone/app frame in the center
 * 3. Animated dashboard content inside the frame
 */
export function HeroMockup() {
  // Track if component is visible (for triggering animations on scroll)
  const [isVisible, setIsVisible] = useState(false);
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use Intersection Observer to detect when mockup enters viewport
    // This ensures animations only play when user can see them
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, stop observing (animation only plays once)
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of element is visible
    );

    if (mockupRef.current) {
      observer.observe(mockupRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="hero-mockup-container" ref={mockupRef}>
      {/* ============================================
          FLOATING ICONS
          These orbit around the central mockup
          Each has a different position and animation delay
          ============================================ */}
      <div className="hero-floating-icons" aria-hidden="true">
        {/* Top left - Apple (nutrition) */}
        <FloatingIcon icon={Apple} className="hero-float-pos-1" delay={0} />

        {/* Top right - Dumbbell (exercise) */}
        <FloatingIcon
          icon={Dumbbell}
          className="hero-float-pos-2"
          delay={0.5}
        />

        {/* Right - Heart (health) */}
        <FloatingIcon icon={Heart} className="hero-float-pos-3" delay={1} />

        {/* Bottom right - Droplets (hydration) */}
        <FloatingIcon
          icon={Droplets}
          className="hero-float-pos-4"
          delay={1.5}
        />

        {/* Bottom left - TrendingUp (progress) */}
        <FloatingIcon
          icon={TrendingUp}
          className="hero-float-pos-5"
          delay={2}
        />

        {/* Left - Flame (calories) */}
        <FloatingIcon icon={Flame} className="hero-float-pos-6" delay={2.5} />
      </div>

      {/* ============================================
          PHONE/APP FRAME
          The main visual container for the dashboard preview
          ============================================ */}
      <div className="hero-mockup-frame">
        {/* Top bar mimicking a mobile app header */}
        <div className="hero-mockup-header">
          <div className="hero-mockup-header-dot" /> {/* Status dot */}
          <span className="hero-mockup-header-title">
            <Activity className="hero-mockup-header-icon" aria-hidden="true" />
            HealthMetrics
          </span>
          <div className="hero-mockup-header-time">9:41</div>
        </div>

        {/* ============================================
            DASHBOARD CONTENT
            Animated stats that show what the app does
            ============================================ */}
        <div className="hero-mockup-content">
          {/* Main calorie ring - the hero stat */}
          <div className="hero-mockup-main-stat">
            <CircularProgress
              percentage={isVisible ? 73 : 0}
              size={140}
              strokeWidth={10}
              color="var(--accent)"
            />
            <div className="hero-mockup-main-stat-inner">
              <div className="hero-mockup-main-stat-value">
                {isVisible ? (
                  <AnimatedNumber value={1847} duration={2500} />
                ) : (
                  0
                )}
              </div>
              <div className="hero-mockup-main-stat-label">calories</div>
            </div>
          </div>

          {/* Macro progress bars */}
          <div className="hero-mockup-macros">
            {/* Protein */}
            <div className="hero-mockup-macro">
              <div className="hero-mockup-macro-header">
                <span>Protein</span>
                <span className="hero-mockup-macro-value">
                  {isVisible ? (
                    <AnimatedNumber value={98} duration={2000} suffix="g" />
                  ) : (
                    "0g"
                  )}
                </span>
              </div>
              <div className="hero-mockup-macro-bar">
                <div
                  className="hero-mockup-macro-fill hero-mockup-macro-fill-protein"
                  style={{ width: isVisible ? "65%" : "0%" }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="hero-mockup-macro">
              <div className="hero-mockup-macro-header">
                <span>Carbs</span>
                <span className="hero-mockup-macro-value">
                  {isVisible ? (
                    <AnimatedNumber value={156} duration={2200} suffix="g" />
                  ) : (
                    "0g"
                  )}
                </span>
              </div>
              <div className="hero-mockup-macro-bar">
                <div
                  className="hero-mockup-macro-fill hero-mockup-macro-fill-carbs"
                  style={{ width: isVisible ? "78%" : "0%" }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="hero-mockup-macro">
              <div className="hero-mockup-macro-header">
                <span>Fat</span>
                <span className="hero-mockup-macro-value">
                  {isVisible ? (
                    <AnimatedNumber value={52} duration={1800} suffix="g" />
                  ) : (
                    "0g"
                  )}
                </span>
              </div>
              <div className="hero-mockup-macro-bar">
                <div
                  className="hero-mockup-macro-fill hero-mockup-macro-fill-fat"
                  style={{ width: isVisible ? "80%" : "0%" }}
                />
              </div>
            </div>
          </div>

          {/* Water intake visualization */}
          <div className="hero-mockup-water">
            <div className="hero-mockup-water-header">
              <Droplets className="hero-mockup-water-icon" aria-hidden="true" />
              <span>Water</span>
              <span className="hero-mockup-water-count">6/8 glasses</span>
            </div>
            <div className="hero-mockup-water-glasses">
              {/* Render 8 glasses, 6 filled */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`hero-mockup-water-glass ${
                    i < 6 ? "hero-mockup-water-glass-filled" : ""
                  }`}
                  style={{
                    // Stagger the fill animation for each glass
                    animationDelay: isVisible ? `${i * 0.15}s` : "0s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          GLOW EFFECT
          Subtle glow behind the mockup for depth
          ============================================ */}
      <div className="hero-mockup-glow" aria-hidden="true" />
    </div>
  );
}
