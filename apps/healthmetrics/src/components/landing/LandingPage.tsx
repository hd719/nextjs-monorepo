import { Link } from "@tanstack/react-router";
import { Activity, Apple, Dumbbell, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInner}>
            <Link to="/" className={styles.logoLink}>
              <div className={styles.logoIcon}>
                <Activity className={styles.logoIconSvg} />
              </div>
              <span className={styles.logoText}>HealthMetrics</span>
            </Link>

            <div className={styles.headerActions}>
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Track Your Health.
              <br />
              <span className={styles.heroAccent}>Reach Your Goals.</span>
            </h1>
            <p className={styles.heroDescription}>
              Monitor your nutrition, log workouts, and track progress with
              simple, powerful tools.
            </p>
            <div className={styles.heroActions}>
              <Button size="lg" asChild>
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">View Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <div className={styles.featuresSectionContent}>
            <div className={styles.featuresSectionInner}>
              <h2 className={styles.featuresTitle}>
                Everything you need in one place
              </h2>
              <div className={styles.featuresGrid}>
                <Card>
                  <CardHeader className={styles.featureCardHeader}>
                    <div className={styles.featureIcon}>
                      <Apple className={styles.featureIconSvg} />
                    </div>
                    <div>
                      <CardTitle>Nutrition</CardTitle>
                      <CardDescription className={styles.featureDescription}>
                        Track meals and monitor your daily calorie and macro
                        intake
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className={styles.featureCardHeader}>
                    <div className={styles.featureIcon}>
                      <Dumbbell className={styles.featureIconSvg} />
                    </div>
                    <div>
                      <CardTitle>Exercise</CardTitle>
                      <CardDescription className={styles.featureDescription}>
                        Log workouts and track your activity levels over time
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className={styles.featureCardHeader}>
                    <div className={styles.featureIcon}>
                      <TrendingUp className={styles.featureIconSvg} />
                    </div>
                    <div>
                      <CardTitle>Progress</CardTitle>
                      <CardDescription className={styles.featureDescription}>
                        Visualize your journey with charts and insights
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaSectionContent}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to get started?</h2>
              <p className={styles.ctaDescription}>
                Join thousands of users tracking their health journey.
              </p>
              <Button size="lg" asChild>
                <Link to="/signup">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerInner}>
            <div className={styles.footerBranding}>
              <Activity className={styles.footerIcon} />
              <span>© 2025 HealthMetrics</span>
            </div>
            <div className={styles.footerLinks}>
              <a href="#" className={styles.footerLink}>
                About
              </a>
              <a href="#" className={styles.footerLink}>
                Privacy
              </a>
              <a href="#" className={styles.footerLink}>
                Terms
              </a>
              <a href="#" className={styles.footerLink}>
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
