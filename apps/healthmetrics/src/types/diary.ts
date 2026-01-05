export type DiaryEntryWithFood = {
  id: string;
  userId: string;
  date: Date;
  mealType: string;
  quantityG: number;
  servings: number;
  notes: string | null;
  createdAt: Date;
  foodItem: {
    id: string;
    name: string;
    brand: string | null;
    caloriesPer100g: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number | null;
    sugarG: number | null;
    servingSizeG: number;
    servingSizeUnit: string | null;
  };
  // Computed nutrition for this entry
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  entryCount: number;
};

export type FoodItemSearchResult = {
  id: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number | null;
  servingSizeG: number;
  servingSizeUnit: string | null;
  verified: boolean;
};
