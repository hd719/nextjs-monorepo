# Health Formulas & Calculations

This document explains the scientifically-backed formulas used in HealthMetrics for calculating nutrition goals, calorie expenditure, and other health metrics.

---

## Table of Contents

1. [BMR Calculation (Mifflin-St Jeor Equation)](#1-bmr-calculation-mifflin-st-jeor-equation)
2. [TDEE Calculation (Activity Multipliers)](#2-tdee-calculation-activity-multipliers)
3. [Daily Calorie Goals](#3-daily-calorie-goals)
4. [Macronutrient Distribution](#4-macronutrient-distribution)
5. [Exercise Calorie Burn (MET Formula)](#5-exercise-calorie-burn-met-formula)
6. [Strength Training Duration Estimation](#6-strength-training-duration-estimation)
7. [Unit Conversions](#7-unit-conversions)

---

## 1. BMR Calculation (Mifflin-St Jeor Equation)

**What it measures:** Basal Metabolic Rate (BMR) - the number of calories your body burns at complete rest to maintain basic life functions.

**Why this formula:** The Mifflin-St Jeor equation is considered the most accurate for estimating BMR, validated by the Academy of Nutrition and Dietetics.

### Formula (Metric)

```
Male:   BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) + 5
Female: BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) − 161
Other:  BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) − 78
```

### Formula (Imperial - Direct)

To use pounds and inches directly without converting:

```
Male:   BMR = (4.536 × weight in lbs) + (15.88 × height in inches) − (5 × age) + 5
Female: BMR = (4.536 × weight in lbs) + (15.88 × height in inches) − (5 × age) − 161
Other:  BMR = (4.536 × weight in lbs) + (15.88 × height in inches) − (5 × age) − 78
```

> **How we derived this:**
>
> - 10 × 0.453592 = 4.536 (converts the kg coefficient to work with lbs)
> - 6.25 × 2.54 = 15.88 (converts the cm coefficient to work with inches)

The "other" gender option uses the average of male and female adjustments: `(5 + (-161)) / 2 = -78`

### Implementation

```typescript
// src/utils/nutrition-calculator.ts
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female" | "other"
): number {
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (gender === "male") return Math.round(baseBMR + 5);
  if (gender === "female") return Math.round(baseBMR - 161);
  return Math.round(baseBMR - 78); // Average for "other"
}
```

### Example (Metric)

A 30-year-old male, 180cm tall, weighing 80kg:

```
BMR = (10 × 80) + (6.25 × 180) − (5 × 30) + 5
    = 800 + 1125 - 150 + 5
    = 1780 calories/day
```

### Example (Imperial - Direct)

A 30-year-old male, 5'11" (71 inches) tall, weighing 176 lbs:

```
BMR = (4.536 × 176) + (15.88 × 71) − (5 × 30) + 5
    = 798 + 1127 - 150 + 5
    = 1780 calories/day
```

No unit conversion needed!

---

## 2. TDEE Calculation (Activity Multipliers)

**What it measures:** Total Daily Energy Expenditure (TDEE) - the total calories burned per day including activity.

### Formula

```
TDEE = BMR × Activity Multiplier
```

### Activity Multipliers

| Activity Level | Multiplier | Description |
|----------------|------------|-------------|
| Sedentary | 1.2 | Little or no exercise, desk job |
| Lightly Active | 1.375 | Light exercise 1-3 days/week |
| Moderately Active | 1.55 | Moderate exercise 3-5 days/week |
| Very Active | 1.725 | Hard exercise 6-7 days/week |
| Extremely Active | 1.9 | Very hard exercise, physical job, or training 2x/day |

### Implementation

```typescript
// src/constants/onboarding.ts
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

// src/utils/nutrition-calculator.ts
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return Math.round(bmr * multiplier);
}
```

### Example

Using BMR of 1780 (from the 176 lbs / 80kg male above) for a moderately active person:

```
TDEE = 1780 × 1.55 = 2759 calories/day
```

This means a 176 lb moderately active male burns ~2759 calories per day.

---

## 3. Daily Calorie Goals

**Purpose:** Adjust TDEE based on user's fitness goal to create a caloric surplus or deficit.

### Calorie Adjustments by Goal

| Goal | Adjustment | Rationale |
|------|------------|-----------|
| Lose Weight | -500 cal | ~1 lb fat loss per week (3500 cal = 1 lb) |
| Build Muscle | +300 cal | Surplus needed for muscle synthesis |
| Maintain Weight | 0 cal | Eat at maintenance |
| Improve Fitness | +100 cal | Slight surplus for performance |
| Eat Healthier | 0 cal | Focus on quality, not quantity |

### Implementation

```typescript
// src/constants/onboarding.ts
export const GOAL_CALORIE_ADJUSTMENTS = {
  lose_weight: -500,
  build_muscle: 300,
  maintain_weight: 0,
  improve_fitness: 100,
  eat_healthier: 0,
};

// src/utils/nutrition-calculator.ts
export function calculateCalorieGoal(tdee: number, goalType: GoalType): number {
  const adjustment = GOAL_CALORIE_ADJUSTMENTS[goalType];
  // Minimum 1200 calories for safety
  return Math.max(1200, Math.round(tdee + adjustment));
}
```

### Safety Floor

A minimum of **1200 calories** is enforced to prevent unhealthy restriction.

---

## 4. Macronutrient Distribution

**Purpose:** Distribute calories across protein, carbohydrates, and fat based on fitness goals.

### Macro Ratios by Goal

| Goal | Protein | Carbs | Fat | Notes |
|------|---------|-------|-----|-------|
| Lose Weight | 40% | 30% | 30% | High protein preserves muscle during deficit |
| Build Muscle | 30% | 45% | 25% | Higher carbs fuel workouts |
| Maintain Weight | 25% | 50% | 25% | Balanced distribution |
| Improve Fitness | 25% | 55% | 20% | Carb-focused for performance |
| Eat Healthier | 25% | 50% | 25% | Balanced, whole-food focus |

### Calorie-to-Gram Conversion

| Macronutrient | Calories per gram |
|---------------|-------------------|
| Protein | 4 cal/g |
| Carbohydrates | 4 cal/g |
| Fat | 9 cal/g |

### Implementation

```typescript
// src/utils/nutrition-calculator.ts
export function calculateMacros(
  calorieGoal: number,
  goalType: GoalType
): { protein: number; carbs: number; fat: number } {
  const ratios = GOAL_MACRO_RATIOS[goalType];

  return {
    protein: Math.round((calorieGoal * ratios.protein) / 4),
    carbs: Math.round((calorieGoal * ratios.carbs) / 4),
    fat: Math.round((calorieGoal * ratios.fat) / 9),
  };
}
```

### Example

For a 2000 calorie goal with "lose weight" (40/30/30):

```
Protein: (2000 × 0.40) / 4 = 200g
Carbs:   (2000 × 0.30) / 4 = 150g
Fat:     (2000 × 0.30) / 9 = 67g
```

---

## 5. Exercise Calorie Burn (MET Formula)

**What it measures:** Calories burned during physical activity using the Metabolic Equivalent of Task (MET) system.

### Formula (Metric)

```
Calories = MET × weight (kg) × duration (hours)
```

### Formula (Imperial - Direct)

To use pounds directly without converting:

```
Calories = MET × weight (lbs) × 0.4536 × duration (hours)
```

Or simplified:

```
Calories = MET × weight (lbs) × duration (minutes) / 132.3
```

### What is MET?

MET (Metabolic Equivalent of Task) represents the energy cost of activities:

- 1 MET = resting metabolic rate (sitting quietly)
- 3 MET = 3x the energy of resting
- 10 MET = 10x the energy of resting

### Common MET Values

| Activity | MET Value |
|----------|-----------|
| Walking (3 mph) | 3.5 |
| Jogging | 7.0 |
| Running (6 mph) | 9.8 |
| Cycling (moderate) | 6.8 |
| Swimming | 7.0 |
| Weight Training | 3.5 |
| HIIT | 8.0 |
| Yoga | 2.5 |

### Implementation

```typescript
// src/utils/exercise-helpers.ts
export function calculateCalories(
  metValue: number,
  weightLbs: number,
  durationMinutes: number
): number | null {
  if (!weightLbs || weightLbs <= 0) return null;

  const weightKg = weightLbs * 0.453592;
  const durationHours = durationMinutes / 60;

  return Math.round(metValue * weightKg * durationHours);
}
```

### Example (Using Pounds Directly)

Running (9.8 MET) for 30 minutes at 180 lbs:

```
Calories = 9.8 × 180 × 30 / 132.3
         = 52920 / 132.3
         = 400 calories
```

No unit conversion needed!

### Quick Reference (30 minutes of activity)

| Activity | MET | 140 lbs | 160 lbs | 180 lbs | 200 lbs |
|----------|-----|---------|---------|---------|---------|
| Walking (3 mph) | 3.5 | 111 cal | 127 cal | 143 cal | 159 cal |
| Jogging | 7.0 | 222 cal | 254 cal | 286 cal | 318 cal |
| Running (6 mph) | 9.8 | 311 cal | 356 cal | 400 cal | 445 cal |
| Cycling | 6.8 | 216 cal | 247 cal | 278 cal | 309 cal |
| Swimming | 7.0 | 222 cal | 254 cal | 286 cal | 318 cal |
| Weight Training | 3.5 | 111 cal | 127 cal | 143 cal | 159 cal |
| HIIT | 8.0 | 254 cal | 291 cal | 327 cal | 363 cal |
| Yoga | 2.5 | 79 cal | 91 cal | 102 cal | 113 cal |

---

## 6. Strength Training Duration Estimation

**Purpose:** Auto-estimate workout duration for strength training based on sets and reps.

### Formula

```
Total Time = (sets × reps × 3 seconds) + ((sets - 1) × 60 seconds)
```

- **3 seconds per rep**: Average time for controlled rep execution
- **60 seconds rest**: Standard rest between sets

### Implementation

```typescript
// src/utils/exercise-helpers.ts
export function estimateStrengthDuration(sets: number, reps: number): number {
  const workTimeSeconds = sets * reps * 3;
  const restTimeSeconds = (sets - 1) * 60;
  const totalSeconds = workTimeSeconds + restTimeSeconds;

  return Math.ceil(totalSeconds / 60); // Convert to minutes
}
```

### Example

4 sets of 10 reps:

```
Work time = 4 × 10 × 3 = 120 seconds
Rest time = (4 - 1) × 60 = 180 seconds
Total = 300 seconds = 5 minutes
```

---

## 7. Unit Conversions

### Weight

```typescript
// Pounds to Kilograms
export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

// Kilograms to Pounds
export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}
```

### Height

```typescript
// Feet/Inches to Centimeters
export function ftInToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

// Centimeters to Feet/Inches
export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  return {
    feet: Math.floor(totalInches / 12),
    inches: Math.round(totalInches % 12),
  };
}
```

### Water

```
1 glass = 8 oz = 240 ml
```

---

## References

1. **Mifflin-St Jeor Equation**: Mifflin MD, et al. "A new predictive equation for resting energy expenditure in healthy individuals." Am J Clin Nutr. 1990.

2. **Activity Multipliers**: Based on Harris-Benedict activity factors, validated by numerous studies.

3. **MET Values**: Compendium of Physical Activities, Arizona State University.

4. **Macro Ratios**: Based on guidelines from the Academy of Nutrition and Dietetics and sports nutrition research.

---

## Files

| File | Purpose |
|------|---------|
| `src/utils/nutrition-calculator.ts` | BMR, TDEE, calorie, and macro calculations |
| `src/utils/exercise-helpers.ts` | Exercise calorie burn and duration estimates |
| `src/constants/onboarding.ts` | Activity multipliers, goal adjustments, macro ratios |
| `src/hooks/useGoalCalculation.ts` | React hook for goal calculation |
