export type UserProfile = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  heightCm: number | null;
  currentWeightLbs: number | null;
  targetWeightLbs: number | null;
  activityLevel: string | null;
  goalType: string | null;
  dailyCalorieGoal: number | null;
  dailyProteinGoalG: number | null;
  dailyCarbGoalG: number | null;
  dailyFatGoalG: number | null;
  dailyWaterGoal: number;
  dailyStepGoal: number;
  unitsPreference: string;
  timezone: string;
  isAdmin: boolean;
  createdAt: string; // ISO string for serialization
  updatedAt: string; // ISO string for serialization
  defaultFastingProtocolId: string | null;
  fastingGoalPerWeek: number | null;
};
