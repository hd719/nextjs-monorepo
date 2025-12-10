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

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-accent" />
              </div>
              <span className="text-xl font-bold">HealthMetrics</span>
            </Link>

            <div className="flex items-center gap-3">
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

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Track Your Health.
              <br />
              <span className="text-accent">Reach Your Goals.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Monitor your nutrition, log workouts, and track progress with
              simple, powerful tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">View Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
                Everything you need in one place
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto">
                      <Apple className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle>Nutrition</CardTitle>
                      <CardDescription className="mt-2">
                        Track meals and monitor your daily calorie and macro
                        intake
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto">
                      <Dumbbell className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle>Exercise</CardTitle>
                      <CardDescription className="mt-2">
                        Log workouts and track your activity levels over time
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto">
                      <TrendingUp className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle>Progress</CardTitle>
                      <CardDescription className="mt-2">
                        Visualize your journey with charts and insights
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Ready to get started?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of users tracking their health journey.
              </p>
              <Button size="lg" asChild>
                <Link to="/signup">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>© 2025 HealthMetrics</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
