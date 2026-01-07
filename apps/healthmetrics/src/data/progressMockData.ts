import type {
  CalorieEntry,
  ProgressData,
  DateRange,
  WeightEntry,
  ExerciseEntry,
} from "@/types/progress";

// Re-export types for backward compatibility
export type { DateRange } from "@/types/progress";

/**
 * Generate dates going back N days from today
 */
function generateDates(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
}

/**
 * Generate realistic weight progression
 * Starts at startWeight and trends toward goalWeight with natural fluctuation
 */
function generateWeightHistory(
  startWeight: number,
  currentWeight: number,
  days: number
): WeightEntry[] {
  const dates = generateDates(days);
  const entries: WeightEntry[] = [];
  const totalChange = currentWeight - startWeight;
  const dailyChange = totalChange / days;

  dates.forEach((date, i) => {
    // Add natural fluctuation (±0.5 lbs)
    const fluctuation = (Math.random() - 0.5) * 1;
    const baseWeight = startWeight + dailyChange * i;
    const weight = Math.round((baseWeight + fluctuation) * 10) / 10;

    entries.push({
      date,
      weight,
      note: i % 7 === 0 ? "Weekly weigh-in" : undefined,
    });
  });

  // Ensure last entry matches current weight
  if (entries.length > 0) {
    entries[entries.length - 1].weight = currentWeight;
  }

  return entries;
}

/**
 * Generate realistic calorie data
 */
function generateCalorieHistory(goal: number, days: number): CalorieEntry[] {
  const dates = generateDates(days);

  return dates.map((date, i) => {
    // Weekends tend to have higher calories
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Base consumption varies ±20% from goal
    const baseMultiplier = 0.85 + Math.random() * 0.3;
    const weekendBoost = isWeekend ? 0.1 : 0;

    const consumed = Math.round(goal * (baseMultiplier + weekendBoost));
    const burned = i % 2 === 0 ? Math.round(200 + Math.random() * 300) : 0;

    return {
      date,
      consumed,
      goal,
      burned,
    };
  });
}

/**
 * Generate exercise heatmap data (12 weeks)
 */
function generateExerciseHistory(): ExerciseEntry[] {
  const entries: ExerciseEntry[] = [];
  const dates = generateDates(365); // Full year
  const types: ExerciseEntry["type"][] = [
    "cardio",
    "strength",
    "flexibility",
    "sports",
  ];

  dates.forEach((date) => {
    const dayOfWeek = new Date(date).getDay();

    // Higher exercise probability on certain days
    const exerciseProbability =
      dayOfWeek === 0 // Sunday - rest day
        ? 0.1
        : dayOfWeek === 6 // Saturday - active day
          ? 0.8
          : dayOfWeek === 3 // Wednesday - mid-week workout
            ? 0.7
            : 0.5;

    if (Math.random() < exerciseProbability) {
      const intensity = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
      const type = types[Math.floor(Math.random() * types.length)];
      const baseDuration =
        type === "cardio" ? 30 : type === "strength" ? 45 : 20;
      const duration = baseDuration + Math.floor(Math.random() * 30);
      const caloriesPerMinute = intensity * 8;

      entries.push({
        date,
        type,
        duration,
        calories: Math.round(duration * caloriesPerMinute),
        intensity,
      });
    }
  });

  return entries;
}

// ============================================================================
// Mock Data
// ============================================================================

const GOAL_CALORIES = 2000;
const START_WEIGHT = 160;
const CURRENT_WEIGHT = 145.8;
const GOAL_WEIGHT = 145;

export const mockProgressData: ProgressData = {
  // Summary stats for hero card
  summary: {
    weightChange: -4.2,
    avgDailyCalories: 1847,
    goalAdherencePercent: 82,
    currentStreak: 18,
    periodDays: 30,
  },

  // Weight history (6 months = ~180 days)
  weightHistory: generateWeightHistory(START_WEIGHT, CURRENT_WEIGHT, 180),
  weightGoal: GOAL_WEIGHT,
  startWeight: START_WEIGHT,

  // Calorie history (30 days)
  calorieHistory: generateCalorieHistory(GOAL_CALORIES, 30),

  // Macro averages
  macroAverages: {
    protein: { current: 98, goal: 150 },
    carbs: { current: 156, goal: 200 },
    fat: { current: 52, goal: 65 },
  },

  // Sleep data
  sleepData: {
    avgHours: 7.2,
    goalHours: 8,
    quality: 78,
    weeklyData: [
      { day: "Mon", hours: 7.5 },
      { day: "Tue", hours: 6.8 },
      { day: "Wed", hours: 7.2 },
      { day: "Thu", hours: 8.1 },
      { day: "Fri", hours: 6.5 },
      { day: "Sat", hours: 8.5 },
      { day: "Sun", hours: 7.0 },
    ],
  },

  // Exercise data
  exerciseHistory: generateExerciseHistory(),
  exerciseSummary: {
    workoutsThisMonth: 18,
    hoursThisMonth: 12.5,
    caloriesBurnedThisWeek: 2847,
  },

  // Week comparison
  comparison: {
    thisWeek: {
      avgCalories: 1847,
      totalCalories: 12929,
      avgProtein: 98,
      proteinGoalPercent: 65,
      workouts: 4,
      exerciseDuration: 2.5,
      exerciseCalories: 1247,
      weightChange: -1.2,
    },
    lastWeek: {
      avgCalories: 1923,
      totalCalories: 13461,
      avgProtein: 89,
      proteinGoalPercent: 59,
      workouts: 3,
      exerciseDuration: 1.8,
      exerciseCalories: 892,
      weightChange: -0.8,
    },
  },

  // Streaks
  streaks: {
    logging: { current: 18, best: 45 },
    water: { current: 12, best: 30 },
    exercise: { current: 5, best: 14 },
  },

  // Achievements
  achievements: [
    {
      id: "first-10lbs",
      title: "First 10 lbs Lost",
      icon: "trophy",
      earnedAt: "2025-11-15",
    },
    {
      id: "7day-protein",
      title: "7-Day Protein Goal",
      icon: "target",
      earnedAt: "2025-12-20",
    },
    {
      id: "30day-streak",
      title: "30-Day Logging Streak",
      icon: "star",
      earnedAt: "2025-10-30",
    },
    {
      id: "100-workouts",
      title: "100 Workouts Logged",
      icon: "dumbbell",
      earnedAt: "2025-12-01",
    },
  ],

  // Upcoming milestones
  milestones: [
    { title: "20-Day Logging Streak", progress: 18, target: 20 },
    { title: "Halfway to Goal Weight", progress: 14.2, target: 15 },
    { title: "100 Workouts Completed", progress: 73, target: 100 },
    { title: "30-Day Exercise Streak", progress: 8, target: 30 },
  ],

  // AI Insights
  insights: [
    {
      type: "positive",
      icon: "trending-up",
      title: "Protein Increase",
      message:
        "Your protein intake has increased 15% this month. This may be helping with your weight loss progress!",
    },
    {
      type: "warning",
      icon: "alert-triangle",
      title: "Weekend Calories",
      message:
        "You tend to exceed your calorie goal on weekends. Consider planning lighter meals for Saturday dinner.",
    },
    {
      type: "opportunity",
      icon: "zap",
      title: "Exercise Opportunity",
      message:
        "Adding one more workout day could increase your weekly calorie burn by ~400 calories.",
    },
  ],
};

/**
 * Mock data for the dashboard progress widget.
 * Provides summary data for Sleep, Weight, Steps, and Achievements.
 */
export const dashboardProgressData = {
  sleep: {
    avgHours: 7.2,
    goalHours: 8,
    percentOfGoal: 90,
    weeklyData: [7.5, 6.8, 7.2, 8.1, 6.5, 8.5, 7.0],
    trend: "up" as const,
    bestNight: "Saturday (8.5h)",
  },
  weight: {
    current: 172.4,
    change: -1.2,
    trend: "down" as const,
    weeklyData: [174.2, 173.8, 173.5, 173.1, 172.8, 172.6, 172.4],
    goalWeight: 165,
    progressPercent: 45,
  },
  steps: {
    today: 8234,
    goal: 10000,
    percentOfGoal: 82,
    weeklyAvg: 9120,
    bestDay: "Wednesday (12,450)",
  },
  achievements: {
    // Note: Icons are added in the component since they're React components
    recentTitles: ["7-Day Streak", "10K Steps", "Sleep Goal Hit"],
    recentDates: ["Today", "Yesterday", "2 days ago"],
    totalEarned: 24,
    nextUp: "14-Day Streak (2 days away)",
  },
};

/**
 * Filter data by date range
 */
export function filterByDateRange<T extends { date: string }>(
  data: T[],
  range: DateRange
): T[] {
  if (range === "all") return data;

  const days = parseInt(range.replace("d", ""));
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];

  return data.filter((item) => item.date >= cutoffStr);
}
