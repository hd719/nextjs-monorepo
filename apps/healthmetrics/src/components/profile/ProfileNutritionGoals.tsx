import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./ProfileForm.module.css";

interface FormData {
  dailyCalorieGoal: string;
  dailyProteinGoalG: string;
  dailyCarbGoalG: string;
  dailyFatGoalG: string;
}

interface ProfileNutritionGoalsProps {
  formData: FormData;
  onFieldChange: (field: keyof FormData, value: string) => void;
}

export function ProfileNutritionGoals({
  formData,
  onFieldChange,
}: ProfileNutritionGoalsProps) {
  // Calculate macro breakdown
  const proteinCals = formData.dailyProteinGoalG
    ? parseInt(formData.dailyProteinGoalG) * 4
    : 0;
  const carbCals = formData.dailyCarbGoalG
    ? parseInt(formData.dailyCarbGoalG) * 4
    : 0;
  const fatCals = formData.dailyFatGoalG
    ? parseInt(formData.dailyFatGoalG) * 9
    : 0;

  const totalCals = parseInt(formData.dailyCalorieGoal || "2000");

  const proteinPercent = Math.round((proteinCals / totalCals) * 100);
  const carbPercent = Math.round((carbCals / totalCals) * 100);
  const fatPercent = Math.round((fatCals / totalCals) * 100);

  return (
    <Card className={styles.formSection}>
      <h2 className={styles.sectionHeading}>Daily Nutrition Goals</h2>
      <p className={styles.sectionDescription}>
        Set your daily targets for calories and macronutrients. These will be
        shown on your dashboard.
      </p>

      <div className={styles.fieldGrid}>
        <div>
          <Label htmlFor="dailyCalorieGoal">Calories Goal (kcal)</Label>
          <Input
            id="dailyCalorieGoal"
            type="number"
            min="500"
            max="10000"
            required
            value={formData.dailyCalorieGoal}
            onChange={(e) => onFieldChange("dailyCalorieGoal", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="dailyProteinGoalG">Protein Goal (grams)</Label>
          <Input
            id="dailyProteinGoalG"
            type="number"
            min="0"
            max="500"
            required
            value={formData.dailyProteinGoalG}
            onChange={(e) => onFieldChange("dailyProteinGoalG", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="dailyCarbGoalG">Carbs Goal (grams)</Label>
          <Input
            id="dailyCarbGoalG"
            type="number"
            min="0"
            max="1000"
            required
            value={formData.dailyCarbGoalG}
            onChange={(e) => onFieldChange("dailyCarbGoalG", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="dailyFatGoalG">Fat Goal (grams)</Label>
          <Input
            id="dailyFatGoalG"
            type="number"
            min="0"
            max="300"
            required
            value={formData.dailyFatGoalG}
            onChange={(e) => onFieldChange("dailyFatGoalG", e.target.value)}
          />
        </div>
      </div>

      <div className={styles.macroContainer}>
        <p className={styles.macroTitle}>Macro Breakdown:</p>
        <div className={styles.macroList}>
          <div>
            Protein: {proteinCals.toLocaleString()} kcal ({proteinPercent}%)
          </div>
          <div>
            Carbs: {carbCals.toLocaleString()} kcal ({carbPercent}%)
          </div>
          <div>
            Fat: {fatCals.toLocaleString()} kcal ({fatPercent}%)
          </div>
        </div>
      </div>
    </Card>
  );
}
