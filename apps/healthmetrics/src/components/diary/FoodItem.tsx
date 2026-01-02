import type { FoodItem as FoodItemType } from "@/types/nutrition";
import styles from "./FoodItem.module.css";

export interface FoodItemProps {
  food: FoodItemType;
}

export function FoodItem({ food }: FoodItemProps) {
  return (
    <div className={styles.item}>
      <div className={styles.content}>
        <div className={styles.details}>
          <span className={styles.name}>{food.name}</span>
          <span className={styles.quantity}>({food.quantity})</span>
        </div>
      </div>
      <div className={styles.calories}>
        {food.calories} <span className={styles.caloriesUnit}>cal</span>
      </div>
    </div>
  );
}
