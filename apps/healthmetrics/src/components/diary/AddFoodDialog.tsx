import { useState, useEffect, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  searchFoodItems,
  createDiaryEntry,
  type FoodItemSearchResult,
} from "@/server/diary";
import styles from "./AddFoodDialog.module.css";

export interface AddFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  date: string; // YYYY-MM-DD
  onSuccess: () => void;
}

export function AddFoodDialog({
  open,
  onOpenChange,
  userId,
  date,
  onSuccess,
}: AddFoodDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItemSearchResult | null>(
    null
  );
  const [quantity, setQuantity] = useState("100");
  const [servings, setServings] = useState("1");
  const [mealType, setMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack" | "other"
  >("breakfast");
  const [notes, setNotes] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItemSearchResult[]>(
    []
  );
  const [isSearching, startSearchTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search food items when debounced query changes - using useTransition for automatic pending state
  useEffect(() => {
    if (debouncedQuery.length === 0) {
      setSearchResults([]);
      return;
    }

    startSearchTransition(async () => {
      try {
        const results = await searchFoodItems({
          data: { query: debouncedQuery, limit: 10 },
        });
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      }
    });
  }, [debouncedQuery]);

  const resetForm = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSelectedFood(null);
    setQuantity("100");
    setServings("1");
    setMealType("breakfast");
    setNotes("");
  };

  const handleSelectFood = (food: FoodItemSearchResult) => {
    setSelectedFood(food);
    setQuantity(food.servingSizeG.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFood) {
      alert("Please select a food item");
      return;
    }

    const quantityNum = parseFloat(quantity);
    const servingsNum = parseFloat(servings);

    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (isNaN(servingsNum) || servingsNum <= 0) {
      alert("Please enter valid servings");
      return;
    }

    // Use useTransition for automatic pending state during submission
    startSubmitTransition(async () => {
      try {
        await createDiaryEntry({
          data: {
            userId,
            foodItemId: selectedFood.id,
            date,
            mealType,
            quantityG: quantityNum,
            servings: servingsNum,
            notes: notes.trim() || undefined,
          },
        });
        onSuccess();
        resetForm();
      } catch (error) {
        console.error("Failed to create entry:", error);
        alert("Failed to add food entry. Please try again.");
      }
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // Reset form after dialog close animation
      setTimeout(resetForm, 300);
    }
  };

  // Calculate nutrition for selected quantity
  const calculatedNutrition =
    selectedFood && !isNaN(parseFloat(quantity))
      ? {
          calories: Math.round(
            (selectedFood.caloriesPer100g * parseFloat(quantity)) / 100
          ),
          protein:
            Math.round(
              ((selectedFood.proteinG * parseFloat(quantity)) / 100) * 10
            ) / 10,
          carbs:
            Math.round(
              ((selectedFood.carbsG * parseFloat(quantity)) / 100) * 10
            ) / 10,
          fat:
            Math.round(
              ((selectedFood.fatG * parseFloat(quantity)) / 100) * 10
            ) / 10,
        }
      : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>Add Food to Diary</DialogTitle>
          <DialogDescription>
            Search for a food item and add it to your diary
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Food Search */}
          {!selectedFood && (
            <div className={styles.searchSection}>
              <Label htmlFor="search">Search Food</Label>
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search for food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  autoFocus
                />
              </div>

              {/* Search Results */}
              {searchQuery && (
                <div className={styles.resultsContainer}>
                  {isSearching ? (
                    <div className={styles.resultsLoading}>
                      <Loader2 className={styles.loadingSpinner} />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className={styles.resultsEmpty}>
                      No foods found. Try a different search.
                    </div>
                  ) : (
                    <div className={styles.resultsList}>
                      {searchResults.map((food: FoodItemSearchResult) => (
                        <button
                          key={food.id}
                          type="button"
                          onClick={() => handleSelectFood(food)}
                          className={styles.resultItem}
                        >
                          <div className={styles.resultName}>{food.name}</div>
                          {food.brand && (
                            <div className={styles.resultBrand}>
                              {food.brand}
                            </div>
                          )}
                          <div className={styles.resultNutrition}>
                            Per 100g: {food.caloriesPer100g} cal • P:{" "}
                            {food.proteinG}g • C: {food.carbsG}g • F:{" "}
                            {food.fatG}g
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Selected Food Details */}
          {selectedFood && (
            <>
              <div className={styles.selectedCard}>
                <div className={styles.selectedContent}>
                  <div className={styles.selectedInfo}>
                    <p className={styles.selectedName}>{selectedFood.name}</p>
                    {selectedFood.brand && (
                      <p className={styles.selectedBrand}>
                        {selectedFood.brand}
                      </p>
                    )}
                    <p className={styles.selectedPer100g}>
                      Per 100g: {selectedFood.caloriesPer100g} cal
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFood(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>

              {/* Meal Type */}
              <div className={styles.fieldSection}>
                <Label htmlFor="mealType">Meal</Label>
                <select
                  id="mealType"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className={styles.selectInput}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Quantity */}
              <div className={styles.fieldGrid}>
                <div className={styles.fieldSection}>
                  <Label htmlFor="quantity">Quantity (grams)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.fieldSection}>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    min="0"
                    step="0.5"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                  />
                </div>
              </div>

              {/* Calculated Nutrition */}
              {calculatedNutrition && (
                <div className={styles.nutritionCard}>
                  <p className={styles.nutritionTitle}>
                    Nutrition for this entry:
                  </p>
                  <div className={styles.nutritionGrid}>
                    <div className={styles.nutritionItem}>
                      <p className={styles.nutritionLabel}>Calories</p>
                      <p className={styles.nutritionValue}>
                        {calculatedNutrition.calories}
                      </p>
                    </div>
                    <div className={styles.nutritionItem}>
                      <p className={styles.nutritionLabel}>Protein</p>
                      <p className={styles.nutritionValue}>
                        {calculatedNutrition.protein}g
                      </p>
                    </div>
                    <div className={styles.nutritionItem}>
                      <p className={styles.nutritionLabel}>Carbs</p>
                      <p className={styles.nutritionValue}>
                        {calculatedNutrition.carbs}g
                      </p>
                    </div>
                    <div className={styles.nutritionItem}>
                      <p className={styles.nutritionLabel}>Fat</p>
                      <p className={styles.nutritionValue}>
                        {calculatedNutrition.fat}g
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className={styles.fieldSection}>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="e.g., with olive oil"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedFood || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add to Diary"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
