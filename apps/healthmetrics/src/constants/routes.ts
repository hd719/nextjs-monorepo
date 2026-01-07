export const ROUTES = {
  // Public routes
  HOME: "/",
  LANDING: "/",

  // Auth routes
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },

  // Onboarding
  ONBOARDING: "/onboarding",

  // Protected routes
  DASHBOARD: "/dashboard",
  DIARY: "/diary",
  EXERCISE: "/exercise",
  FASTING: "/fasting",
  SLEEP: "/sleep",
  ACHIEVEMENTS: "/achievements",
  PROGRESS: "/progress",
  PROFILE: "/profile",
} as const;

export function buildDiaryRoute(date?: string) {
  if (date) {
    return { to: ROUTES.DIARY, search: { date } } as const;
  }
  return { to: ROUTES.DIARY } as const;
}
